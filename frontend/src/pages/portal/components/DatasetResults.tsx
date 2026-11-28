import type { DatabaseInfo } from "@/types/database";
import type { SmartDatasetSort } from "../datasetSearchOptions";

import { useLayoutEffect, useMemo, useRef } from "react";

import { DatasetSortControl } from "./DatasetSortControl";

import { DataCard } from "@/components/DataCard";
import { GlassButton } from "@/components/ui/GlassButton";

const comparators: Record<
  Exclude<SmartDatasetSort, "شباهت">,
  (a: DatabaseInfo, b: DatabaseInfo) => number
> = {
  امتیاز: (a, b) => b.rating - a.rating,
  الفبا: (a, b) => a.name.localeCompare(b.name),
  سال: (a, b) => b.year - a.year,
  حجم: (a, b) => b.fileSizeKB - a.fileSizeKB,
};

export function DatasetResults({
  data,
  error,
  loading,
  pending,
  sort,
  variables,
  onReload,
  onSmartSortChange,
}: {
  data?: DatabaseInfo[];
  error: boolean;
  loading: boolean;
  pending: boolean;
  sort: SmartDatasetSort;
  variables?: string[];
  onReload: () => void;
  onSmartSortChange?: (sort: SmartDatasetSort) => void;
}) {
  const gridRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (gridRef.current) gridRef.current.inert = pending;
  }, [pending]);

  const datasets = useMemo(() => {
    if (!data) return data;
    const selected = new Set(variables);
    const filtered = selected.size
      ? data.filter((dataset) =>
          dataset.datasetVariables.some((variable) => selected.has(variable)),
        )
      : data;

    return sort === "شباهت" ? filtered : [...filtered].sort(comparators[sort]);
  }, [data, sort, variables]);

  return (
    <section
      aria-busy={pending || loading}
      aria-label="دیتاست‌ها"
      className="page-container dataset-results"
    >
      <div
        ref={gridRef}
        className="dataset-results__grid"
        data-pending={pending}
      >
        {onSmartSortChange && (
          <div className="dataset-results__sort">
            <DatasetSortControl
              smart
              value={sort}
              onChange={onSmartSortChange}
            />
          </div>
        )}
        {loading && (
          <p className="dataset-results__message" role="status">
            در حال بارگیری فهرست دیتاست‌ها…
          </p>
        )}
        {error && (
          <div className="dataset-results__message">
            <p role="alert">فهرست دیتاست‌ها بارگیری نشد.</p>
            <GlassButton size="sm" onPress={onReload}>
              تلاش دوباره
            </GlassButton>
          </div>
        )}
        {datasets?.length === 0 && (
          <p className="dataset-results__message" role="status">
            دیتاستی مطابق با جستجو یا فیلترها یافت نشد.
          </p>
        )}
        {datasets?.map((dataset) => (
          <DataCard key={dataset.name} database={dataset} />
        ))}
      </div>
    </section>
  );
}
