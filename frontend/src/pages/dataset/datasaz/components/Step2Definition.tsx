/*Step2Definition.tsx*/
import React, { useState, useCallback } from "react";
import { StepPanel } from "./StepPanel";
import { CriteriaPanel } from "./step2/CriteriaPanel";
import { DefinitionCounters } from "./step2/DefinitionCounters";

export const Step2Definition: React.FC = () => {
  const [inclusionCount, setInclusionCount] = useState(0);
  const [exclusionCount, setExclusionCount] = useState(0);

  const handleInclusionCountChange = useCallback((n: number) => {
    setInclusionCount(n);
  }, []);

  const handleExclusionCountChange = useCallback((n: number) => {
    setExclusionCount(n);
  }, []);

  const handleStartProcessing = useCallback(() => {
    // TODO: trigger Step 3 navigation when wired
  }, []);

  return (
    <StepPanel>
      <DefinitionCounters
        inclusionCount={inclusionCount}
        exclusionCount={exclusionCount}
        errorCount={0}
        onStartProcessing={handleStartProcessing}
      />
      <div className="s2-criteria-row">
        <CriteriaPanel type="inclusion" onCountChange={handleInclusionCountChange} />
        <CriteriaPanel type="exclusion" onCountChange={handleExclusionCountChange} />
      </div>
    </StepPanel>
  );
};