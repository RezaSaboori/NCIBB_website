import { motion, useIsPresent, type Variants } from "framer-motion";
import { useId, useLayoutEffect, useRef } from "react";

import { searchSubjects, type ManualSearchOptions } from "../datasetSearchOptions";

import { DropdownInput } from "@/components/ui/inputs";

const ease = [0.2, 0.8, 0.2, 1] as const;

const sizeMotion: Variants = {
  collapsed: { height: 0 },
  expanded: { height: "auto", transition: { duration: 0.2, ease } },
  exit: { height: 0, transition: { delay: 0.02, duration: 0.145, ease } },
};

const fieldsMotion: Variants = {
  collapsed: { opacity: 0, filter: "blur(1.5px)" },
  expanded: {
    opacity: 1,
    filter: "blur(0px)",
    transition: { delay: 0.04, duration: 0.12, ease },
    transitionEnd: { filter: "none" },
  },
  exit: {
    opacity: 0,
    filter: "blur(1px)",
    transition: { duration: 0.075, ease: "easeOut" },
  },
};

interface DatasetManualOptionsProps {
  manual: ManualSearchOptions;
  onManualChange: (manual: ManualSearchOptions) => void;
  reduceMotion: boolean;
  tags: string[];
}

export function DatasetManualOptions({
  manual,
  onManualChange,
  reduceMotion,
  tags,
}: DatasetManualOptionsProps) {
  const id = useId();
  const frameRef = useRef<HTMLDivElement>(null);
  const isPresent = useIsPresent();

  useLayoutEffect(() => {
    if (frameRef.current) frameRef.current.inert = !isPresent;
  }, [isPresent]);

  return (
    <motion.div
      ref={frameRef}
      animate="expanded"
      className="dataset-options__manual-frame"
      exit="exit"
      initial="collapsed"
      variants={reduceMotion ? undefined : sizeMotion}
    >
      <motion.div
        className="dataset-options__manual-fields"
        variants={reduceMotion ? undefined : fieldsMotion}
      >
        <div className="dataset-sort">
          <label htmlFor={`${id}-subject`}>موضوع جستجو</label>
          <DropdownInput
            aria-label="موضوع جستجو"
            dir="rtl"
            id={`${id}-subject`}
            options={searchSubjects}
            value={manual.subject}
            onChange={(value) =>
              onManualChange({ ...manual, subject: value as ManualSearchOptions["subject"] })
            }
          />
        </div>
        <div className="dataset-sort">
          <label htmlFor={`${id}-variables`}>فیلتر متغیرها</label>
          <DropdownInput
            multiple
            searchable
            aria-label="فیلتر متغیرها"
            dir="rtl"
            id={`${id}-variables`}
            options={tags}
            placeholder="همهٔ متغیرها"
            value={manual.variables}
            onChange={(variables) => onManualChange({ ...manual, variables })}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
