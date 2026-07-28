/*DefinitionCounters.tsx*/
import React from "react";

interface DefinitionCountersProps {
  inclusionCount: number;
  exclusionCount: number;
  errorCount: number;
  onStartProcessing: () => void;
}

export const DefinitionCounters: React.FC<DefinitionCountersProps> = ({
  inclusionCount,
  exclusionCount,
  errorCount,
  onStartProcessing,
}) => {
  return (
    <div className="s2-counters-bar" dir="ltr">
      <div className="orange-glass s2-counter-tab s2-counter-tab--errors">
        <span className="s2-counter-tab__value">{errorCount}</span>
        <span className="s2-counter-tab__label">Errors</span>
      </div>
      <div className="glass s2-counter-tab s2-counter-tab--inclusion">
        <span className="s2-counter-tab__value">{inclusionCount}</span>
        <span className="s2-counter-tab__label">Inclusion</span>
      </div>

      <div className="glass s2-counter-tab s2-counter-tab--exclusion">
        <span className="s2-counter-tab__value">{exclusionCount}</span>
        <span className="s2-counter-tab__label">Exclusion</span>
      </div>
      <button
        className="blue-glass s2-counter-tab s2-counter-tab--start"
        onClick={onStartProcessing}
        aria-label="Start Processing"
      >
        <span className="s2-counter-tab__label">Start Processing</span>
      </button>
    </div>
  );
};