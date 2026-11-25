/*DefinitionCounters.tsx*/
import React from "react";
import { toPersianDigits } from "../../../utils/formatters";

interface DefinitionCountersProps {
  inclusionCount: number;
  exclusionCount: number;
  errorCount: number;
  onStartProcessing: () => void;
  isStarting: boolean;
  isSaving: boolean;
  processError: string;
}

export const DefinitionCounters: React.FC<DefinitionCountersProps> = ({
  inclusionCount,
  exclusionCount,
  errorCount,
  onStartProcessing,
  isStarting,
  isSaving,
  processError,
}) => {
  return (
    <div className="s2-counters-bar">
      <div className="glass-transparent s2-counter-tab s2-counter-tab--inclusion">
        <span className="s2-counter-tab__value">{toPersianDigits(inclusionCount)}</span>
        <span className="s2-counter-tab__label">معیار ورود</span>
      </div>
      <div className="glass-transparent s2-counter-tab s2-counter-tab--exclusion">
        <span className="s2-counter-tab__value">{toPersianDigits(exclusionCount)}</span>
        <span className="s2-counter-tab__label">معیار خروج</span>
      </div>
      <div className="orange-glass s2-counter-tab s2-counter-tab--errors">
        <span className="s2-counter-tab__value">{toPersianDigits(errorCount)}</span>
        <span className="s2-counter-tab__label">خطا</span>
      </div>
      <button
        type="button"
        className="blue-glass s2-counter-tab s2-counter-tab--start"
        onClick={onStartProcessing}
        disabled={isStarting || isSaving}
        aria-busy={isStarting}
      >
        <span className="s2-counter-tab__label">{isStarting ? "در حال آماده‌سازی…" : "شروع پردازش"}</span>
      </button>
      {processError && <p className="s2-process-error" role="alert">{processError}</p>}
    </div>
  );
};
