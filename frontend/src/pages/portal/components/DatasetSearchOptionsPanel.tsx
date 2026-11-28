import { AnimatePresence, motion, useIsPresent, type Variants } from "framer-motion";
import { useId, useLayoutEffect, useRef, type RefObject } from "react";

import {
  type DatasetSearchMode,
  type ManualSearchOptions,
  type SmartDatasetSort,
} from "../datasetSearchOptions";

import { DatasetManualOptions } from "./DatasetManualOptions";
import { DatasetSortControl } from "./DatasetSortControl";

import { DropdownInput } from "@/components/ui/inputs";
import { motionSettle } from "@/components/ui/motion/motionPresets";
import { useReducedMotionPreference } from "@/components/ui/motion/useReducedMotionPreference";

const surfaceMotion: Variants = {
  initial: { opacity: 0, scaleX: 0.93, scaleY: 0.9, y: -6 },
  enter: {
    opacity: 1,
    scaleX: 1,
    scaleY: 1,
    y: 0,
    transition: {
      ...motionSettle,
      opacity: { duration: 0.105, ease: "easeOut" },
    },
  },
  // A dismissal during opening must not move the surface away from the trigger.
  exit: (_custom, current) => ({
    opacity: 0,
    scaleX: Math.min(Number(current.scaleX ?? 1), 0.97),
    scaleY: Math.min(Number(current.scaleY ?? 1), 0.95),
    y: Math.min(Number(current.y ?? 0), -4),
    transition: {
      delay: 0.02,
      duration: 0.125,
      ease: "easeOut",
      opacity: { delay: 0.035, duration: 0.08, ease: "easeOut" },
    },
  }),
};

const controlsMotion: Variants = {
  initial: { opacity: 0, scale: 0.99, filter: "blur(1.5px) brightness(1.08)" },
  enter: (_custom, current) => ({
    opacity: 1,
    scale: 1,
    filter: "blur(0px) brightness(1)",
    transition: {
      delay: Number(current.opacity ?? 0) > 0 ? 0 : 0.035,
      duration: 0.115,
      ease: "easeOut",
    },
    transitionEnd: { filter: "none" },
  }),
  exit: {
    opacity: 0,
    filter: "blur(1px) brightness(1)",
    transition: { duration: 0.075, ease: "easeOut" },
  },
};

const modes = [
  { value: "smart", label: "هوشمند" },
  { value: "manual", label: "دستی" },
] as const;

export interface DatasetSearchOptionsPanelProps {
  mode: DatasetSearchMode;
  onModeChange: (mode: DatasetSearchMode) => void;
  manual: ManualSearchOptions;
  onManualChange: (manual: ManualSearchOptions) => void;
  smartSort: SmartDatasetSort;
  onSmartSortChange: (sort: SmartDatasetSort) => void;
  tags: string[];
}

export function DatasetSearchOptionsPanel({
  mode,
  onModeChange,
  manual,
  onManualChange,
  smartSort,
  onSmartSortChange,
  tags,
  triggerRef,
}: DatasetSearchOptionsPanelProps & { triggerRef: RefObject<HTMLElement> }) {
  const id = useId();
  const reduceMotion = useReducedMotionPreference();
  const isPresent = useIsPresent();
  const fieldsRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const dialog = fieldsRef.current?.closest<HTMLElement>("[role=dialog]");

    if (!dialog || isPresent) return;
    // Retain the exit visually, including portaled dropdowns, while releasing focus.
    if (dialog.contains(document.activeElement)) {
      triggerRef.current?.focus({ preventScroll: true });
    }
    dialog.inert = true;

    return () => {
      dialog.inert = false;
    };
  }, [isPresent, triggerRef]);

  return (
    <>
      <motion.div
        animate="enter"
        aria-hidden="true"
        className="glass dataset-options__material"
        exit="exit"
        initial="initial"
        variants={reduceMotion ? undefined : surfaceMotion}
      />
      <div ref={fieldsRef} className="dataset-options__fields custom-scrollbar" dir="rtl">
        <motion.div
          animate="enter"
          className="dataset-options__controls"
          exit="exit"
          initial="initial"
          variants={reduceMotion ? undefined : controlsMotion}
        >
          <div className="dataset-sort dataset-options__method">
            <label htmlFor={`${id}-mode`}>روش جستجو</label>
            <DropdownInput
              aria-label="روش جستجو"
              dir="rtl"
              id={`${id}-mode`}
              options={modes}
              value={mode}
              onChange={(value) =>
                onModeChange(value === "manual" ? "manual" : "smart")
              }
            />
          </div>
          <AnimatePresence initial={false}>
            {mode === "manual" && (
              <DatasetManualOptions
                manual={manual}
                reduceMotion={reduceMotion}
                tags={tags}
                onManualChange={onManualChange}
              />
            )}
          </AnimatePresence>
          {mode === "smart" ? (
            <DatasetSortControl
              smart
              value={smartSort}
              onChange={onSmartSortChange}
            />
          ) : (
            <DatasetSortControl
              value={manual.sort}
              onChange={(sort) => onManualChange({ ...manual, sort })}
            />
          )}
        </motion.div>
      </div>
    </>
  );
}
