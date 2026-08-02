/*Step1Initiation.tsx*/
import React, { useState } from "react";
import { StepPanel } from "./StepPanel";
import { TaahodCard } from "./step1/TaahodCard";
import { ProjectInfoCard } from "./step1/ProjectInfoCard";

interface Step1InitiationProps {
  onProjectInit: (name: string, estimatedCount?: number) => void;
}

export const Step1Initiation: React.FC<Step1InitiationProps> = ({
  onProjectInit,
}) => {
  const [projectName, setProjectName] = useState("");
  const [estimatedCount, setEstimatedCount] = useState("");

  const handleConfirm = () => {
    if (!projectName.trim()) return;
    onProjectInit(projectName.trim(), estimatedCount ? Number(estimatedCount) : undefined);
  };

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
      <button
        className="s1-create-btn"
        type="button"
        onClick={handleConfirm}
        disabled={!projectName.trim()}
      >
        ایجاد پروژه
      </button>
    </StepPanel>
  );
};