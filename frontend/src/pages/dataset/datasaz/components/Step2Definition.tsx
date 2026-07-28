/*Step2Definition.tsx*/
import React from "react";
import { StepPanel } from "./StepPanel";
import { CriteriaPanel } from "./step2/CriteriaPanel";

interface Step2DefinitionProps {
  onInclusionCountChange: (n: number) => void;
  onExclusionCountChange: (n: number) => void;
}

export const Step2Definition: React.FC<Step2DefinitionProps> = ({
  onInclusionCountChange,
  onExclusionCountChange,
}) => {
  return (
    <StepPanel>
      <div className="s2-criteria-row">
        <CriteriaPanel type="inclusion" onCountChange={onInclusionCountChange} />
        <CriteriaPanel type="exclusion" onCountChange={onExclusionCountChange} />
      </div>
    </StepPanel>
  );
};