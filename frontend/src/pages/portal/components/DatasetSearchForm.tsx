import type {
  DatasetSearchMode,
  ManualSearchOptions,
  SmartDatasetSort,
} from "../datasetSearchOptions";
import type { DatasetSearchState } from "../hooks/useDatasetSearch";

import { AnimatePresence } from "framer-motion";
import {
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";

import { DatasetProcessingPill } from "./DatasetProcessingPill";
import { DatasetSearchOptions } from "./DatasetSearchOptions";

import { SearchIcon } from "@/components/icons";
import { GlassButton } from "@/components/ui/GlassButton";
import { SearchInput } from "@/components/ui/inputs";
import { MotionSwap } from "@/components/ui/motion/MotionSwap";

interface DatasetSearchFormProps {
  mode: DatasetSearchMode;
  onModeChange: (mode: DatasetSearchMode) => void;
  query: string;
  onQueryChange: (value: string) => void;
  manual: ManualSearchOptions;
  onManualChange: (options: ManualSearchOptions) => void;
  smartSort: SmartDatasetSort;
  onSmartSortChange: (sort: SmartDatasetSort) => void;
  tags: string[];
  state: DatasetSearchState;
  catalogReady: boolean;
  onSubmit: () => Promise<void>;
  onReset: () => void;
}

export function DatasetSearchForm({
  mode,
  onModeChange,
  query,
  onQueryChange,
  manual,
  onManualChange,
  smartSort,
  onSmartSortChange,
  tags,
  state,
  catalogReady,
  onSubmit,
  onReset,
}: DatasetSearchFormProps) {
  const [optionsOpen, setOptionsOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const searchShellRef = useRef<HTMLSpanElement>(null);
  const errorId = useId();
  const pending = state.phase === "pending";
  const ready = state.phase === "ready";
  const showReset = ready || (pending && state.results !== undefined);
  const manualMode = mode === "manual";
  const canSearch =
    Boolean(query.trim()) && !pending && (!manualMode || catalogReady);
  const label = manualMode ? "جستجوی دستی دیتاست" : "جستجوی هوشمند دیتاست";
  const placeholder = manualMode
    ? "کلیدواژه‌های دیتاست را وارد کنید"
    : "دیتاست مورد نیازتان را توصیف کنید";

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSearch) return;
    setOptionsOpen(false);
    void onSubmit();
  };

  const onQueryKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      event.key !== "Enter" ||
      event.shiftKey ||
      event.nativeEvent.isComposing ||
      event.keyCode === 229
    )
      return;
    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  };

  const handleReset = () => {
    onReset();
    textareaRef.current?.focus({ preventScroll: true });
  };

  return (
    <form aria-label={label} className="dataset-search" onSubmit={submit}>
      <div className="dataset-search__controls">
        <SearchInput
          multiline
          ariaLabel={label}
          className="dataset-search__input ui-input-shell--persian"
          icon={
            <GlassButton
              isIconOnly
              inset
              aria-busy={pending}
              aria-disabled={!canSearch}
              aria-label={pending ? "در حال جستجو" : "جستجو"}
              className="dataset-search__submit"
              type="submit"
            >
              <MotionSwap value={pending ? "pending" : "search"}>
                {pending ? (
                  <span
                    aria-hidden="true"
                    className="dataset-search__spinner"
                  />
                ) : (
                  <SearchIcon />
                )}
              </MotionSwap>
            </GlassButton>
          }
          placeholder={placeholder}
          shellRef={searchShellRef}
          textareaProps={{
            dir: "auto",
            inputMode: "search",
            enterKeyHint: "search",
            readOnly: pending,
            onKeyDown: onQueryKeyDown,
            "aria-invalid": state.phase === "error" && state.invalid,
            "aria-describedby": state.phase === "error" ? errorId : undefined,
          }}
          textareaRef={textareaRef}
          value={query}
          onChange={onQueryChange}
        />
        <DatasetSearchOptions
          manual={manual}
          mode={mode}
          open={optionsOpen}
          smartSort={smartSort}
          tags={tags}
          trigger={
            <GlassButton
              isIconOnly
              aria-disabled={pending}
              aria-haspopup={showReset ? false : "dialog"}
              aria-label={showReset ? "بازنشانی جستجو" : "تنظیمات جستجو"}
              className="dataset-search__options-button"
              type="button"
              onClick={ready ? handleReset : undefined}
            >
              <MotionSwap value={showReset ? "reset" : "options"}>
                {showReset ? (
                  <svg
                    aria-hidden="true"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.65 6.35A7.96 7.96 0 0 0 12 4a8 8 0 1 0 7.73 10h-2.08A6 6 0 1 1 12 6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35Z" />
                  </svg>
                ) : (
                  <svg
                    aria-hidden="true"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="1.75"
                    viewBox="0 0 24 24"
                  >
                    <path d="M4 6h5m4 0h7M4 12h9m4 0h3M4 18h2m4 0h10M9 4v4m8 2v4M6 16v4" />
                  </svg>
                )}
              </MotionSwap>
            </GlassButton>
          }
          onManualChange={onManualChange}
          onModeChange={onModeChange}
          onOpenChange={(open) => {
            if (!open || (!pending && !ready)) setOptionsOpen(open);
          }}
          onSmartSortChange={onSmartSortChange}
        />
      </div>
      <AnimatePresence initial={false}>
        {pending && !manualMode && (
          <DatasetProcessingPill
            detail={state.detail}
            label={state.label}
            searchShellRef={searchShellRef}
          />
        )}
      </AnimatePresence>
      <span className="sr-only" role="status">
        {pending ? state.label : ready ? "جستجو کامل شد." : ""}
      </span>
      {state.phase === "error" && (
        <p
          className="dataset-search__error ui-fade-in"
          id={errorId}
          role="alert"
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
