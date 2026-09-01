"""
Datayab multi-agent search pipeline (LangGraph StateGraph).

Flow:
  analyze_query -> [out of domain? -> END]
                -> retrieve -> verify -> [no results and retries left? -> refine -> retrieve]
                                       -> END
"""

import logging
from typing import TypedDict

import httpx
from django.conf import settings
from langgraph.graph import END, StateGraph

from .agents import run_analyst, run_refiner, run_verifier
from .services import (
    _build_where,
    _get_collection,
    _metadata_to_database,
    embed_texts,
)

logger = logging.getLogger(__name__)

_MAX_RETRIES = 1


class DatayabState(TypedDict, total=False):
    user_query: str
    top_k: int
    retries: int
    intent: dict
    where: dict | None
    candidates: list[dict]
    results: list[dict]
    trace: dict


def analyze_query(state: DatayabState) -> dict:
    intent, raw = run_analyst(state["user_query"])
    state["trace"]["intent"] = intent
    state["trace"]["llm_raw"] = raw
    logger.info("Datayab analyst intent: %s", intent)
    return {"intent": intent, "where": _build_where(intent)}


def retrieve(state: DatayabState) -> dict:
    collection = _get_collection()
    count = collection.count()
    if count == 0:
        raise RuntimeError("Datayab index is empty. Run: python manage.py embed_databases")

    state["trace"]["candidates"] = []  # reset when looping back from refine
    vector = embed_texts([state["intent"]["search_query"]])[0]
    res = collection.query(
        query_embeddings=[vector],
        n_results=min(state["top_k"], count),
        where=state["where"],
        include=["metadatas", "distances"],
    )
    max_distance = settings.DATAYAB_MAX_DISTANCE
    candidates = []
    for meta, distance in zip(res["metadatas"][0], res["distances"][0]):
        within = distance <= max_distance
        candidates.append(
            {"metadata": meta, "distance": round(distance, 4), "within_threshold": within}
        )
        logger.info(
            "Datayab candidate: distance=%.4f %s | %s",
            distance,
            "IN RANGE" if within else "TOO FAR",
            meta.get("name", ""),
        )
    return {"candidates": candidates}


def verify(state: DatayabState) -> dict:
    within = [c for c in state["candidates"] if c["within_threshold"]]
    verdicts, raw = run_verifier(state["user_query"], within)
    state["trace"]["verify_raw"] = raw

    kept = []
    queue = list(verdicts)
    for c in state["candidates"]:
        entry = {
            "name": c["metadata"].get("name", ""),
            "distance": c["distance"],
            "kept": c["within_threshold"],
            "verified": None,
            "reason": None,
        }
        if c["within_threshold"]:
            verdict = queue.pop(0)
            entry["verified"] = verdict["relevant"]
            entry["reason"] = verdict["reason"]
            if verdict["relevant"] is not False:  # None = verifier failed open
                kept.append(c["metadata"])
        state["trace"]["candidates"].append(entry)

    results = [_metadata_to_database(m) for m in kept]
    logger.info("Datayab verify: %d/%d in-range candidates confirmed", len(results), len(within))
    return {"results": results}


def refine_query(state: DatayabState) -> dict:
    new_query, raw = run_refiner(state["user_query"], state["intent"]["search_query"])
    state["trace"]["refined_query"] = new_query
    state["trace"]["refine_raw"] = raw
    logger.info("Datayab refine: retrying with '%s'", new_query)
    # Broaden: new query text, filters dropped
    intent = {
        **state["intent"],
        "search_query": new_query,
        "data_types": [],
        "year_min": None,
        "year_max": None,
    }
    return {"intent": intent, "where": None, "retries": state.get("retries", 0) + 1}


def _route_after_analysis(state: DatayabState):
    return "retrieve" if state["intent"].get("in_domain", True) else END


def _route_after_verify(state: DatayabState):
    if not state.get("results") and state.get("retries", 0) < _MAX_RETRIES:
        return "refine"
    return END


def _build_graph():
    builder = StateGraph(DatayabState)
    builder.add_node("analyze", analyze_query)
    builder.add_node("retrieve", retrieve)
    builder.add_node("verify", verify)
    builder.add_node("refine", refine_query)
    builder.set_entry_point("analyze")
    builder.add_conditional_edges(
        "analyze", _route_after_analysis, {"retrieve": "retrieve", END: END}
    )
    builder.add_edge("retrieve", "verify")
    builder.add_conditional_edges(
        "verify", _route_after_verify, {"refine": "refine", END: END}
    )
    builder.add_edge("refine", "retrieve")
    return builder.compile()


_graph = _build_graph()


def run_datayab_search(user_query: str, top_k: int | None = None) -> dict:
    trace = {
        "user_query": user_query,
        "llm_raw": None,
        "intent": None,
        "where": None,
        "verify_raw": None,
        "candidates": [],
        "kept_count": 0,
        "max_distance": settings.DATAYAB_MAX_DISTANCE,
        "retries": 0,
    }
    final = _graph.invoke(
        {
            "user_query": user_query,
            "top_k": top_k or settings.DATAYAB_TOP_K,
            "retries": 0,
            "results": [],
            "trace": trace,
        }
    )
    results = final.get("results", [])
    trace["where"] = final.get("where")
    trace["kept_count"] = len(results)
    trace["retries"] = final.get("retries", 0)
    return {"results": results, "trace": trace}


def _node_status_event(node: str, update: dict) -> dict | None:
    """Map a finished graph node to a user-facing progress event."""
    if node == "analyze":
        intent = update.get("intent", {})
        return {
            "type": "status",
            "step": "analyze",
            "search_query": intent.get("search_query"),
            "in_domain": intent.get("in_domain", True),
            "data_types": intent.get("data_types", []),
        }
    if node == "retrieve":
        candidates = update.get("candidates", [])
        return {
            "type": "status",
            "step": "retrieve",
            "candidates": len(candidates),
            "in_range": sum(1 for c in candidates if c["within_threshold"]),
        }
    if node == "verify":
        return {
            "type": "status",
            "step": "verify",
            "confirmed": len(update.get("results", [])),
        }
    if node == "refine":
        return {
            "type": "status",
            "step": "refine",
            "search_query": update.get("intent", {}).get("search_query"),
        }
    return None


def stream_datayab_search(user_query: str, top_k: int | None = None):
    """Yield SSE-ready event dicts as the agent graph progresses."""
    trace = {
        "user_query": user_query,
        "llm_raw": None,
        "intent": None,
        "where": None,
        "verify_raw": None,
        "candidates": [],
        "kept_count": 0,
        "max_distance": settings.DATAYAB_MAX_DISTANCE,
        "retries": 0,
    }
    initial = {
        "user_query": user_query,
        "top_k": top_k or settings.DATAYAB_TOP_K,
        "retries": 0,
        "results": [],
        "trace": trace,
    }
    results: list[dict] = []
    try:
        for chunk in _graph.stream(initial, stream_mode="updates"):
            for node, update in chunk.items():
                if "results" in update:
                    results = update["results"]
                if "where" in update:
                    trace["where"] = update["where"]
                if "retries" in update:
                    trace["retries"] = update["retries"]
                event = _node_status_event(node, update)
                if event:
                    yield event
    except httpx.TimeoutException:
        yield {"type": "error", "detail": "Ollama service timed out."}
        return
    except httpx.RequestError:
        yield {"type": "error", "detail": "Ollama service unreachable."}
        return
    except RuntimeError as exc:
        yield {"type": "error", "detail": str(exc)}
        return

    trace["kept_count"] = len(results)
    yield {"type": "result", "results": results, "count": len(results), "trace": trace}