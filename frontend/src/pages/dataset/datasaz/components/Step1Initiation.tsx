/*Step1Initiation.tsx*/
import React, { useState, useEffect } from "react";
import { StepPanel } from "./StepPanel";
import { TaahodCard } from "./step1/TaahodCard";
import { ProjectInfoCard } from "./step1/ProjectInfoCard";
import type { DatasazProject } from "../types";

type BtnState = "idle" | "loading" | "done";

interface Step1InitiationProps {
  onProjectInit: (name: string, estimatedCount?: number) => Promise<void> | void;
  existingProject?: DatasazProject | null;
}

export const Step1Initiation: React.FC<Step1InitiationProps> = ({
  onProjectInit,
  existingProject,
}) => {
  const [projectName, setProjectName] = useState(existingProject?.name ?? "");
  const [estimatedCount, setEstimatedCount] = useState(
    existingProject?.estimated_count != null ? String(existingProject.estimated_count) : ""
  );
  const [btnState, setBtnState] = useState<BtnState>(existingProject ? "done" : "idle");

  // Keep inputs in sync if the project loads asynchronously after mount
  useEffect(() => {
    if (existingProject) {
      setProjectName(existingProject.name);
      setEstimatedCount(
        existingProject.estimated_count != null ? String(existingProject.estimated_count) : ""
      );
      setBtnState("done");
    }
  }, [existingProject?.id]);

  const handleConfirm = async () => {
    if (!projectName.trim() || btnState !== "idle") return;

    setBtnState("loading");
    try {
      await onProjectInit(
        projectName.trim(),
        estimatedCount ? Number(estimatedCount) : undefined
      );
      setBtnState("done");
    } catch {
      setBtnState("idle");
    }
  };

  const btnLabel =
    btnState === "loading" ? "در حال ایجاد"
    : btnState === "done"  ? "ایجاد شد"
    : "ایجاد پروژه";

  return (
    <StepPanel>
      <div className="s1-two-col-grid">
        <TaahodCard />
        <ProjectInfoCard
          projectName={projectName}
          estimatedCount={estimatedCount}
          onProjectNameChange={setProjectName}
          onEstimatedCountChange={setEstimatedCount}
          btnState={btnState}
          btnLabel={btnLabel}
          onConfirm={handleConfirm}
        />
      </div>
    </StepPanel>
  );
};