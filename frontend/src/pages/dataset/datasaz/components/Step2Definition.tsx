/*Step2Definition.tsx*/
import React from "react";
import { StepPanel } from "./StepPanel";
import { CriteriaPanel } from "./step2/CriteriaPanel";

export const Step2Definition: React.FC = () => {
  return (
    <StepPanel>
      <div className="s2-criteria-row">
        <CriteriaPanel type="inclusion" />
        <CriteriaPanel type="exclusion" />
      </div>
    </StepPanel>
  );
};