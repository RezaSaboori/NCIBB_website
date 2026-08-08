/*Step2Definition.tsx*/
import React from "react";
import { StepPanel } from "./StepPanel";
import { CriteriaPanel } from "./step2/CriteriaPanel";
import type { SerializedCriteriaItem, Step2DefinitionPayload } from "../types";

interface Step2DefinitionProps {
  onInclusionCountChange: (n: number) => void;
  onExclusionCountChange: (n: number) => void;
  initialDefinition?: Step2DefinitionPayload;
  onDefinitionChange: (type: "inclusion" | "exclusion", def: SerializedCriteriaItem[]) => void;
}

export const Step2Definition: React.FC<Step2DefinitionProps> = ({
  onInclusionCountChange,
  onExclusionCountChange,
  initialDefinition,
  onDefinitionChange,
}) => {
  return (
    <StepPanel>
      <div className="s2-criteria-row">
        <CriteriaPanel
          type="inclusion"
          onCountChange={onInclusionCountChange}
          initialDefinition={initialDefinition?.inclusion}
          onDefinitionChange={(def) => onDefinitionChange("inclusion", def)}
        />
        <CriteriaPanel
          type="exclusion"
          onCountChange={onExclusionCountChange}
          initialDefinition={initialDefinition?.exclusion}
          onDefinitionChange={(def) => onDefinitionChange("exclusion", def)}
        />
      </div>
    </StepPanel>
  );
};