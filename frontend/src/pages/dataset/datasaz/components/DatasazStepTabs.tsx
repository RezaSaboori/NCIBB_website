import React, { useRef, useEffect, useState } from "react";
import type { DatasazStep, DatasazStepConfig } from "../types";
import "../styles.css";

const STEPS: DatasazStepConfig[] = [
  { id: 1, label: "۱. آغاز" },
  { id: 2, label: "۲. تعریف" },
  { id: 3, label: "۳. پردازش" },
  { id: 4, label: "۴. خروجی" },
];

interface DatasazStepTabsProps {
  activeStep: DatasazStep;
  onStepChange: (step: DatasazStep) => void;
  isStepDisabled?: (step: DatasazStep) => boolean;
}

export const DatasazStepTabs: React.FC<DatasazStepTabsProps> = ({
  activeStep,
  onStepChange,
  isStepDisabled,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0 });

  useEffect(() => {
    const activeIndex = activeStep - 1;
    const activeTab = tabRefs.current[activeIndex];
    const container = containerRef.current;
    if (!activeTab || !container) return;

    const containerRect = container.getBoundingClientRect();
    const tabRect = activeTab.getBoundingClientRect();

    setIndicatorStyle({
      width: tabRect.width,
      left: tabRect.left - containerRect.left,
    });
  }, [activeStep]);

  return (
    <div
      ref={containerRef}
      className="datasaz-step-tabs"
      style={
        {
          "--indicator-width": `${indicatorStyle.width}px`,
          "--indicator-left": `${indicatorStyle.left}px`,
        } as React.CSSProperties
      }
    >
      {STEPS.map((step, index) => {
        const disabled = isStepDisabled?.(step.id) ?? false;
        return (
          <button
            key={step.id}
            ref={(el) => (tabRefs.current[index] = el)}
            className={`datasaz-step-tab ${activeStep === step.id ? "active" : ""}`}
            onClick={() => onStepChange(step.id)}
            disabled={disabled}
            aria-disabled={disabled}
          >
            {step.label}
          </button>
        );
      })}
    </div>
  );
};