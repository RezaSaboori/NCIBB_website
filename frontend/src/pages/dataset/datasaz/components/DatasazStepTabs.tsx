import React, { useLayoutEffect, useRef } from "react";
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
  const viewportRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const rail = railRef.current;
    const activeTab = activeTabRef.current;
    if (!viewport || !rail || !activeTab) return;

    const alignActiveStep = () => {
      const railRect = rail.getBoundingClientRect();
      const tabRect = activeTab.getBoundingClientRect();
      const viewportRect = viewport.getBoundingClientRect();

      rail.style.setProperty("--active-indicator-width", `${tabRect.width}px`);
      rail.style.setProperty("--active-indicator-left", `${tabRect.left - railRect.left}px`);
      rail.style.setProperty("--active-indicator-opacity", "1");

      if (tabRect.left < viewportRect.left) {
        viewport.scrollLeft += tabRect.left - viewportRect.left;
      } else if (tabRect.right > viewportRect.right) {
        viewport.scrollLeft += tabRect.right - viewportRect.right;
      }
    };

    alignActiveStep();
    const observer = new ResizeObserver(alignActiveStep);
    observer.observe(viewport);
    observer.observe(rail);
    for (const tab of rail.children) observer.observe(tab);
    return () => observer.disconnect();
  }, [activeStep]);

  return (
    <nav ref={viewportRef} className="datasaz-step-viewport glass-navigation glass-transparent glass-transparent--scroll" aria-label="مراحل داده‌ساز">
      <div ref={railRef} className="datasaz-step-tabs glass-navigation__indicator">
        {STEPS.map((step) => {
          const current = activeStep === step.id;
          return (
            <button
              key={step.id}
              ref={current ? activeTabRef : undefined}
              className="datasaz-step-tab glass-navigation__item"
              type="button"
              onClick={() => onStepChange(step.id)}
              disabled={isStepDisabled?.(step.id)}
              aria-current={current ? "step" : undefined}
            >
              {step.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
