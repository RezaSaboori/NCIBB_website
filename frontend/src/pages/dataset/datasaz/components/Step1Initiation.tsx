/*Step1Initiation.tsx*/
import React, { useState } from "react";
import { StepPanel } from "./StepPanel";
import { TaahodCard } from "./step1/TaahodCard";
import { ProjectInfoCard } from "./step1/ProjectInfoCard";

export const Step1Initiation: React.FC = () => {
  const [projectName, setProjectName] = useState("");
  const [estimatedCount, setEstimatedCount] = useState("");

  return (
    <StepPanel>
      <div className="s1-two-col-grid">
        <TaahodCard />
        <ProjectInfoCard
          projectName={projectName}
          estimatedCount={estimatedCount}
          onProjectNameChange={setProjectName}
          onEstimatedCountChange={setEstimatedCount}
        />
      </div>
    </StepPanel>
  );
};