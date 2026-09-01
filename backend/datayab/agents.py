"""
LLM agents for the Datayab multi-agent pipeline.

Each agent is a LangChain chain: ChatPromptTemplate | ChatOllama (JSON mode)
| JsonOutputParser. Agents fail soft — the pipeline degrades gracefully
instead of erroring the request.
"""

import json
import logging

from django.conf import settings
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_ollama import ChatOllama

from .services import VALID_DATA_TYPES

logger = logging.getLogger(__name__)

_ANALYST_PROMPT = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """You are the query-analysis agent of a biomedical dataset catalog search engine.
The catalog holds English metadata describing public biomedical and physiological datasets.

Rewrite the user's request (Persian/Farsi or English) into a concise English semantic search query and extract structured filters.

Rules:
- "search_query": English only, one or two natural sentences naming the clinical/scientific topic and the kind of data needed. No keyword lists.
- "data_types": subset of ["image", "text", "sequence", "omics", "table", "signal"]. Fill it ONLY when the user explicitly mentions a data modality (e.g. "ECG signals", "CT images", "genomic data"); otherwise return []. ECG/EEG/PPG/pressure waveforms are "signal"; CT/X-ray/MRI/photos are "image"; video/motion capture are "sequence".
- "year_min" / "year_max": integer bounds on the dataset release year, or null if unspecified.
- "in_domain": true only if the user is looking for a biomedical, clinical, physiological, or health-related research dataset; false for unrelated topics (e.g. movies, finance, sports).
Respond with JSON only, no prose.""",
        ),
        ("human", "{query}"),
    ]
)

_VERIFIER_PROMPT = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """You are the verification agent of a biomedical dataset catalog. You decide which retrieved candidates genuinely match the user's request.

For EVERY candidate output:
- "n": the candidate number
- "relevant": true only if the dataset's actual content directly serves the user's stated need. Sharing a modality or an organ system is NOT enough — the dataset must have been collected for a compatible purpose.
- "reason": one short sentence justifying the verdict.

Example: for the request "databases about heart failure", a dataset of ECG/PPG signals collected to benchmark respiratory-rate estimation is NOT relevant, even though it contains cardiac signals.

Return JSON: {{"verdicts": [{{"n": 1, "relevant": true, "reason": "..."}}]}}
Respond with JSON only, no prose.""",
        ),
        ("human", "User request: {query}\n\nCandidate datasets:\n{candidates}"),
    ]
)

_REFINER_PROMPT = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """You are the query-refinement agent of a biomedical dataset catalog. A first retrieval attempt produced no relevant datasets.
Broaden the search query: drop overly specific constraints, add synonyms and closely related clinical terms, keep it in English.
Return JSON: {{"search_query": "<broader English query>"}}
Respond with JSON only, no prose.""",
        ),
        ("human", "Original user request: {query}\nPrevious search query: {previous}"),
    ]
)


def _llm(model: str) -> ChatOllama:
    return ChatOllama(
        base_url=settings.OLLAMA_BASE_URL,
        model=model,
        temperature=0,
        format="json",
    )


def run_analyst(user_query: str) -> tuple[dict, str | None]:
    """Translate + extract filters + domain gate. Falls back to the raw query."""
    fallback = {
        "search_query": user_query,
        "data_types": [],
        "year_min": None,
        "year_max": None,
        "in_domain": True,
    }
    chain = _ANALYST_PROMPT | _llm(settings.DATAYAB_ANALYST_MODEL) | JsonOutputParser()
    try:
        parsed = chain.invoke({"query": user_query})
    except Exception:
        logger.exception("Datayab analyst agent failed; using raw query")
        return fallback, None

    intent = {
        "search_query": str(parsed.get("search_query") or user_query),
        "data_types": [t for t in parsed.get("data_types") or [] if t in VALID_DATA_TYPES],
        "year_min": parsed.get("year_min") if isinstance(parsed.get("year_min"), int) else None,
        "year_max": parsed.get("year_max") if isinstance(parsed.get("year_max"), int) else None,
        "in_domain": bool(parsed.get("in_domain", True)),
    }
    return intent, json.dumps(parsed, ensure_ascii=False)


def run_verifier(user_query: str, candidates: list[dict]) -> tuple[list[dict], str | None]:
    """One verdict per candidate, aligned by position. relevant=None marks fail-open."""
    if not candidates:
        return [], None
    numbered = "\n".join(
        f"{i + 1}. {c['metadata'].get('name', '')} — {c['metadata'].get('short_description', '')}"
        for i, c in enumerate(candidates)
    )
    chain = _VERIFIER_PROMPT | _llm(settings.DATAYAB_VERIFIER_MODEL) | JsonOutputParser()
    try:
        parsed = chain.invoke({"query": user_query, "candidates": numbered})
    except Exception:
        logger.exception("Datayab verifier agent failed; keeping distance-filtered candidates")
        return [{"relevant": None, "reason": None} for _ in candidates], None

    raw = json.dumps(parsed, ensure_ascii=False)
    by_number = {v.get("n"): v for v in parsed.get("verdicts", []) if isinstance(v, dict)}
    verdicts = []
    for i in range(len(candidates)):
        verdict = by_number.get(i + 1) or {}
        relevant = verdict.get("relevant")
        verdicts.append(
            {
                "relevant": relevant if isinstance(relevant, bool) else None,
                "reason": verdict.get("reason"),
            }
        )
    return verdicts, raw


def run_refiner(user_query: str, previous_query: str) -> tuple[str, str | None]:
    """Broaden the search query after an empty verification round."""
    chain = _REFINER_PROMPT | _llm(settings.DATAYAB_ANALYST_MODEL) | JsonOutputParser()
    try:
        parsed = chain.invoke({"query": user_query, "previous": previous_query})
    except Exception:
        logger.exception("Datayab refiner agent failed; retrying with dropped filters")
        return previous_query, None
    return str(parsed.get("search_query") or previous_query), json.dumps(
        parsed, ensure_ascii=False
    )