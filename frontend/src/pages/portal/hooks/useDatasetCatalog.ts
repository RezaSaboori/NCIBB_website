import type { DatabaseInfo } from "@/types/database";

import { useEffect, useState } from "react";

import { getDatabases } from "@/dataset_services/databaseCatalog";

type DatasetCatalog =
  | { phase: "loading" }
  | { phase: "ready"; data: DatabaseInfo[] }
  | { phase: "error" };

export function useDatasetCatalog() {
  const [catalog, setCatalog] = useState<DatasetCatalog>({ phase: "loading" });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    void getDatabases(controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setCatalog({ phase: "ready", data });
      },
      () => {
        if (!controller.signal.aborted) setCatalog({ phase: "error" });
      },
    );

    return () => controller.abort();
  }, [version]);

  const reload = () => {
    setCatalog({ phase: "loading" });
    setVersion((current) => current + 1);
  };

  return { catalog, reload };
}
