import type { ReactElement } from "react";
import type { Variants } from "framer-motion";

import { Popover, PopoverContent, PopoverTrigger } from "@heroui/react";
import { useRef } from "react";

import {
  DatasetSearchOptionsPanel,
  type DatasetSearchOptionsPanelProps,
} from "./DatasetSearchOptionsPanel";

import { fadeMotion } from "@/components/ui/motion/motionPresets";
import { useReducedMotionPreference } from "@/components/ui/motion/useReducedMotionPreference";

// Leave the positioning wrapper steady while the material and controls animate.
const anchoredPosition: Variants = { enter: {}, exit: {}, initial: {} };

interface DatasetSearchOptionsProps extends DatasetSearchOptionsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactElement;
}

export function DatasetSearchOptions({
  open,
  onOpenChange,
  trigger,
  ...panelProps
}: DatasetSearchOptionsProps) {
  const triggerRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotionPreference();

  return (
    <Popover
      isNonModal
      classNames={{
        base: "dataset-options",
        content: "dataset-options__surface",
      }}
      dialogProps={{ "aria-label": "تنظیمات جستجو" }}
      isOpen={open}
      motionProps={{
        variants: reduceMotion ? fadeMotion : anchoredPosition,
        initial: reduceMotion ? "exit" : "initial",
      }}
      offset={8}
      placement="bottom-end"
      shouldBlockScroll={false}
      shouldCloseOnScroll={false}
      shouldFlip={false}
      triggerRef={triggerRef}
      onOpenChange={onOpenChange}
    >
      <PopoverTrigger>{trigger}</PopoverTrigger>
      <PopoverContent>
        <DatasetSearchOptionsPanel {...panelProps} triggerRef={triggerRef} />
      </PopoverContent>
    </Popover>
  );
}
