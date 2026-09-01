"""
Datayab RAG service.

Technique: record-level semantic embedding + self-query retrieval.
- Ingestion: each row of databases_infos.csv is rendered into an enriched
  text document, embedded via Ollama, and upserted into a persistent
  ChromaDB collection. All DataCard fields are stored as metadata so search
  results are render-ready.
- Search: the LLM rewrites the (Persian/English) user request into an
  English semantic query plus structured metadata filters, the query is
  embedded, and ChromaDB returns the closest records above a distance
  threshold.
"""

import csv
import json
import logging

import chromadb
import httpx
from chromadb.config import Settings
from django.conf import settings

logger = logging.getLogger(__name__)

VALID_DATA_TYPES = ("image", "text", "sequence", "omics", "table", "signal")

_COLLECTION_NAME = "databases"
_EMBED_BATCH_SIZE = 16
_EMBED_TIMEOUT = 120.0
_GENERATE_TIMEOUT = 180.0

_QUERY_REWRITE_PROMPT = """You are a query-understanding component for a biomedical dataset catalog search engine.

The catalog contains English metadata describing public biomedical and physiological datasets.

Rewrite the user's request (Persian/Farsi or English) into a concise English semantic search query, and extract optional structured filters.

Rules:
- "search_query": English only, one or two natural sentences naming the data modality and the clinical/scientific topic. No keyword lists.
- "data_types": subset of ["image", "text", "sequence", "omics", "table", "signal"], or [] if unspecified. ECG/EEG/PPG/pressure waveforms are "signal"; CT/X-ray/MRI/photos are "image"; video/motion capture are "sequence".
- "year_min" / "year_max": integer bounds on the dataset release year, or null if unspecified.
- "in_domain": true only if the user is looking for a biomedical, clinical, physiological, or health-related research dataset; false for unrelated topics (e.g. movies, finance, sports, general web data).
- Respond with JSON only, no prose.

User request: {query}"""

_VERIFY_PROMPT = """You are a strict relevance filter for a biomedical dataset catalog.

User request: {query}

Candidate datasets:
{candidates}

Return JSON: {{"relevant": [<candidate numbers>]}} listing only the candidates whose data can directly serve the user's stated need.
- Judge against the user's original request, not against the rewritten query.
- If none are relevant, or the request is unrelated to biomedical/physiological research data, return an empty list.
- Respond with JSON only, no prose."""


def _ollama_base() -> str:
    return settings.OLLAMA_BASE_URL.rstrip("/")


def _get_collection():
    client = chromadb.PersistentClient(
        path=settings.DATAYAB_CHROMA_PATH,
        settings=Settings(anonymized_telemetry=False),
    )
    return client.get_or_create_collection(
        name=_COLLECTION_NAME, metadata={"hnsw:space": "cosine"}
    )


def embed_texts(texts: list[str]) -> list[list[float]]:
    """Embed texts via Ollama /api/embed (batched input supported)."""
    vectors: list[list[float]] = []
    with httpx.Client(timeout=_EMBED_TIMEOUT) as client:
        for start in range(0, len(texts), _EMBED_BATCH_SIZE):
            batch = texts[start : start + _EMBED_BATCH_SIZE]
            resp = client.post(
                f"{_ollama_base()}/api/embed",
                json={"model": settings.OLLAMA_EMBED_MODEL, "input": batch},
            )
            resp.raise_for_status()
            vectors.extend(resp.json()["embeddings"])
    return vectors


def generate_json(prompt: str) -> tuple[dict, str]:
    """Run the LLM in JSON mode; return (parsed JSON, raw response text)."""
    payload = {
        "model": settings.OLLAMA_LLM_MODEL,
        "prompt": prompt,
        "stream": False,
        "format": "json",
        "options": {"temperature": 0},
    }
    with httpx.Client(timeout=_GENERATE_TIMEOUT) as client:
        resp = client.post(f"{_ollama_base()}/api/generate", json=payload)
        resp.raise_for_status()
    raw = resp.json()["response"]
    return json.loads(raw), raw


def _split_variables(value: str) -> list[str]:
    """Split Dataset Variables on ','/';' outside parentheses (mirrors the frontend parser)."""
    if not value:
        return []
    result, last, depth = [], 0, 0
    for i, ch in enumerate(value):
        if ch == "(":
            depth += 1
        elif ch == ")":
            depth -= 1
        if ch in ",;" and depth == 0:
            result.append(value[last:i].strip())
            last = i + 1
    result.append(value[last:].strip())
    return [v for v in result if v]


def _to_int(value: str) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return 0


def _to_float(value: str) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return 0.0


def parse_databases_csv(csv_path: str) -> list[dict]:
    """Parse databases_infos.csv into DatabaseInfo-shaped dicts (same rules as the frontend parser)."""
    rows = []
    with open(csv_path, newline="", encoding="utf-8") as fh:
        for raw in csv.DictReader(fh):
            data_types = [
                t
                for t in (s.strip().lower() for s in (raw.get("Data Type") or "").split(","))
                if t in VALID_DATA_TYPES
            ]
            rows.append(
                {
                    "name": (raw.get("Name") or "").strip(),
                    "shortDescription": (raw.get("Short Description") or "").strip(),
                    "year": _to_int(raw.get("Year") or ""),
                    "reference": (raw.get("reference") or "").strip(),
                    "fileSize": (raw.get("File Size") or "").strip(),
                    "fileSizeKB": _to_float(raw.get("File Size (KB)") or ""),
                    "datasetVariables": _split_variables(raw.get("Dataset Variables") or ""),
                    "dataTypes": data_types,
                    "topics": [
                        t for t in (s.strip() for s in (raw.get("Topics") or "").split(",")) if t
                    ],
                    "description": (raw.get("Description") or "").strip(),
                    "rating": _to_int(raw.get("Score") or ""),
                }
            )
    return [r for r in rows if r["name"]]


def build_document(row: dict) -> str:
    """Enriched per-record text that gets embedded."""
    parts = [
        f"Dataset name: {row['name']}",
        f"Summary: {row['shortDescription']}",
        f"Description: {row['description']}",
    ]
    if row["datasetVariables"]:
        parts.append(f"Variables: {', '.join(row['datasetVariables'])}")
    if row["dataTypes"]:
        parts.append(f"Data types: {', '.join(row['dataTypes'])}")
    if row["topics"]:
        parts.append(f"Topics: {', '.join(row['topics'])}")
    if row["year"]:
        parts.append(f"Year: {row['year']}")
    return "\n".join(parts)


def _row_to_metadata(row: dict) -> dict:
    """Chroma metadata values must be primitives; lists are stored as '||'-joined strings."""
    meta = {
        "name": row["name"],
        "short_description": row["shortDescription"],
        "year": row["year"],
        "reference": row["reference"],
        "file_size": row["fileSize"],
        "file_size_kb": row["fileSizeKB"],
        "dataset_variables": "||".join(row["datasetVariables"]),
        "data_types": "||".join(row["dataTypes"]),
        "topics": "||".join(row["topics"]),
        "description": row["description"],
        "rating": row["rating"],
    }
    for dt in VALID_DATA_TYPES:
        meta[f"dt_{dt}"] = dt in row["dataTypes"]
    return meta


def _metadata_to_database(meta: dict) -> dict:
    return {
        "name": meta.get("name", ""),
        "shortDescription": meta.get("short_description", ""),
        "year": meta.get("year", 0),
        "reference": meta.get("reference", ""),
        "fileSize": meta.get("file_size", ""),
        "fileSizeKB": meta.get("file_size_kb", 0.0),
        "datasetVariables": [v for v in meta.get("dataset_variables", "").split("||") if v],
        "dataTypes": [t for t in meta.get("data_types", "").split("||") if t],
        "topics": [t for t in meta.get("topics", "").split("||") if t],
        "description": meta.get("description", ""),
        "rating": meta.get("rating", 0),
    }


def ingest_databases() -> int:
    """Re-embed the whole CSV into ChromaDB. Idempotent: wipes previous rows first."""
    rows = parse_databases_csv(settings.DATAYAB_CSV_PATH)
    if not rows:
        raise RuntimeError(f"No rows parsed from {settings.DATAYAB_CSV_PATH}")

    collection = _get_collection()
    existing = collection.get()
    if existing["ids"]:
        collection.delete(ids=existing["ids"])

    for start in range(0, len(rows), _EMBED_BATCH_SIZE):
        batch = rows[start : start + _EMBED_BATCH_SIZE]
        documents = [build_document(r) for r in batch]
        vectors = embed_texts(documents)
        collection.upsert(
            ids=[f"db-{start + i}" for i in range(len(batch))],
            embeddings=vectors,
            documents=documents,
            metadatas=[_row_to_metadata(r) for r in batch],
        )
        logger.info("Datayab ingest: embedded %d/%d records", start + len(batch), len(rows))
    return len(rows)


def rewrite_query(user_query: str) -> tuple[dict, str | None]:
    """LLM self-query step: English search query + structured filters. Falls back to raw query."""
    fallback = {
        "search_query": user_query,
        "data_types": [],
        "year_min": None,
        "year_max": None,
        "in_domain": True,
    }
    try:
        parsed, raw = generate_json(_QUERY_REWRITE_PROMPT.format(query=user_query))
    except (httpx.HTTPError, ValueError, KeyError):
        logger.exception("Datayab query rewrite failed; using raw query")
        return fallback, None

    intent = {
        "search_query": str(parsed.get("search_query") or user_query),
        "data_types": [t for t in parsed.get("data_types") or [] if t in VALID_DATA_TYPES],
        "year_min": parsed.get("year_min") if isinstance(parsed.get("year_min"), int) else None,
        "year_max": parsed.get("year_max") if isinstance(parsed.get("year_max"), int) else None,
        "in_domain": bool(parsed.get("in_domain", True)),
    }
    logger.info("Datayab query intent: %s", intent)
    return intent, raw


def _build_where(intent: dict):
    clauses = []
    types = intent["data_types"]
    if len(types) == 1:
        clauses.append({f"dt_{types[0]}": True})
    elif types:
        clauses.append({"$or": [{f"dt_{t}": True} for t in types]})
    if intent["year_min"] is not None:
        clauses.append({"year": {"$gte": intent["year_min"]}})
    if intent["year_max"] is not None:
        clauses.append({"year": {"$lte": intent["year_max"]}})
    if not clauses:
        return None
    if len(clauses) == 1:
        return clauses[0]
    return {"$and": clauses}


def verify_candidates(user_query: str, candidates: list[dict]) -> list[dict] | None:
    """LLM relevance check over retrieved candidates.

    Returns the confirmed subset, an empty list when nothing is relevant,
    or None when the check itself failed (caller then fails open).
    """
    if not candidates:
        return []
    numbered = "\n".join(
        f"{i + 1}. {m.get('name', '')} — {m.get('short_description', '')}"
        for i, m in enumerate(candidates)
    )
    try:
        parsed, raw = generate_json(
            _VERIFY_PROMPT.format(query=user_query, candidates=numbered)
        )
    except (httpx.HTTPError, ValueError, KeyError):
        logger.exception("Datayab verification failed; keeping distance-filtered results")
        return None

    logger.info("Datayab verify raw response: %s", raw)
    indices = parsed.get("relevant") or []
    picked = [
        candidates[idx - 1]
        for idx in indices
        if isinstance(idx, int) and 1 <= idx <= len(candidates)
    ]
    logger.info("Datayab verify: %d/%d candidates confirmed", len(picked), len(candidates))
    return picked


def search_databases(user_query: str, top_k: int | None = None) -> dict:
    top_k = top_k or settings.DATAYAB_TOP_K
    collection = _get_collection()
    count = collection.count()
    if count == 0:
        raise RuntimeError("Datayab index is empty. Run: python manage.py embed_databases")

    intent, llm_raw = rewrite_query(user_query)
    where = _build_where(intent)
    max_distance = settings.DATAYAB_MAX_DISTANCE
    trace = {
        "user_query": user_query,
        "llm_raw": llm_raw,
        "intent": intent,
        "where": where,
        "candidates": [],
        "kept_count": 0,
        "max_distance": max_distance,
    }

    if not intent["in_domain"]:
        logger.info("Datayab: request flagged out-of-domain; returning no results")
        return {"results": [], "trace": trace}

    logger.info("Datayab Chroma where filter: %s", where)
    vector = embed_texts([intent["search_query"]])[0]
    res = collection.query(
        query_embeddings=[vector],
        n_results=min(top_k, count),
        where=where,
        include=["metadatas", "distances"],
    )

    kept_metas = []
    for meta, distance in zip(res["metadatas"][0], res["distances"][0]):
        within = distance <= max_distance
        trace["candidates"].append(
            {
                "name": meta.get("name", ""),
                "distance": round(distance, 4),
                "kept": within,
                "verified": None,
            }
        )
        logger.info(
            "Datayab candidate: distance=%.4f %s | %s",
            distance,
            "KEPT" if within else "DROPPED",
            meta.get("name", ""),
        )
        if within:
            kept_metas.append(meta)

    verified_metas = verify_candidates(user_query, kept_metas)
    if verified_metas is not None:
        verified_names = {m.get("name") for m in verified_metas}
        for entry in trace["candidates"]:
            if entry["kept"]:
                entry["verified"] = entry["name"] in verified_names
        kept_metas = verified_metas

    results = [_metadata_to_database(m) for m in kept_metas]
    trace["kept_count"] = len(results)
    logger.info(
        "Datayab search: %d/%d candidates kept (threshold %.2f)",
        len(results),
        len(res["distances"][0]),
        max_distance,
    )
    return {"results": results, "trace": trace}