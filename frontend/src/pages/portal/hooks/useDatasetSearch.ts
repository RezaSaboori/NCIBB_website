import type { DatabaseInfo } from "@/types/database";

import { useEffect, useRef, useState } from "react";

import {
  defaultManualOptions,
  type DatasetSearchMode,
} from "../datasetSearchOptions";

import { searchInCsv } from "@/components/Search";
import { searchDatayabStream } from "@/dataset_services/datayabService";

export const initialProgressLabel = "در حال پردازش…";

export type DatasetSearchState =
  | { phase: "idle"; results?: DatabaseInfo[] }
  | {
      phase: "pending";
      label: string;
      detail?: string;
      results?: DatabaseInfo[];
    }
  | { phase: "ready"; results: DatabaseInfo[] }
  | {
      phase: "error";
      message: string;
      invalid?: boolean;
      results?: DatabaseInfo[];
    };

function waitForPendingPaint() {
  return new Promise<void>((resolve) => {
    // Give Manual search a chance to paint its acknowledgment before filtering.
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(finish);
    });
    const timeout = window.setTimeout(finish, 70);

    function finish() {
      cancelAnimationFrame(frame);
      clearTimeout(timeout);
      resolve();
    }
  });
}

export function useDatasetSearch(catalog?: readonly DatabaseInfo[]) {
  const [mode, setMode] = useState<DatasetSearchMode>("smart");
  const [query, setQuery] = useState("");
  const [state, setState] = useState<DatasetSearchState>({ phase: "idle" });
  const [manual, setManual] = useState(defaultManualOptions);
  const activeRequest = useRef<AbortController>();

  useEffect(() => () => activeRequest.current?.abort(), []);

  const clearResults = () => {
    activeRequest.current?.abort();
    activeRequest.current = undefined;
    setState({ phase: "idle" });
  };

  const selectMode = (nextMode: DatasetSearchMode) => {
    if (nextMode === mode) return;
    clearResults();
    setMode(nextMode);
  };

  const changeQuery = (value: string) => {
    setQuery(value);
    if (state.phase === "error")
      setState({ phase: "idle", results: state.results });
  };

  const reset = () => {
    clearResults();
    setQuery("");
  };

  const submit = async () => {
    const trimmedQuery = query.trim();

    if (
      !trimmedQuery ||
      activeRequest.current ||
      (mode === "manual" && !catalog)
    )
      return;
    if (mode === "smart" && Array.from(trimmedQuery).length > 500) {
      setState({
        phase: "error",
        invalid: true,
        results: state.results,
        message: "عبارت جستجوی هوشمند می‌تواند حداکثر ۵۰۰ نویسه داشته باشد.",
      });

      return;
    }

    const controller = new AbortController();
    const previousResults = state.results;

    activeRequest.current = controller;
    setState({
      phase: "pending",
      label: initialProgressLabel,
      results: previousResults,
    });

    try {
      let results: DatabaseInfo[];

      if (mode === "smart") {
        const response = await searchDatayabStream(
          trimmedQuery,
          (label, detail) => {
            if (!controller.signal.aborted)
              setState({
                phase: "pending",
                label,
                detail,
                results: previousResults,
              });
          },
          controller.signal,
        );

        results = response.results;
      } else {
        await waitForPendingPaint();
        if (controller.signal.aborted) return;
        results = searchInCsv(catalog ?? [], trimmedQuery, manual.subject);
      }
      if (!controller.signal.aborted) setState({ phase: "ready", results });
    } catch {
      if (!controller.signal.aborted) {
        setState({
          phase: "error",
          results: previousResults,
          message: "جستجو انجام نشد. دوباره تلاش کنید.",
        });
      }
    } finally {
      if (activeRequest.current === controller)
        activeRequest.current = undefined;
    }
  };

  return {
    mode,
    selectMode,
    query,
    changeQuery,
    manual,
    setManual,
    state,
    submit,
    reset,
    clearResults,
  };
}
