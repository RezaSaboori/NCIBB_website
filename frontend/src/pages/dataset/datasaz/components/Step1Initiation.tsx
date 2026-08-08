/*Step1Initiation.tsx*/
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { StepPanel } from "./StepPanel";
import { TaahodCard } from "./step1/TaahodCard";
import { ProjectInfoCard } from "./step1/ProjectInfoCard";
import { useProjectList } from "../hooks/useProjectList";
import type { DatasazProject } from "../api/projectsApi";
import type { RootState } from "../../../../store/store";

type BtnState = "idle" | "loading" | "done";
type ProjectMode = "new" | "existing";

interface Step1InitiationProps {
  onProjectInit: (name: string, estimatedCount?: number) => Promise<void> | void;
  existingProject?: DatasazProject | null;
  onLoadExistingProject?: (project: DatasazProject) => void;
}

export const Step1Initiation: React.FC<Step1InitiationProps> = ({
  onProjectInit,
  existingProject,
  onLoadExistingProject,
}) => {
  const initialMode: ProjectMode = existingProject ? "existing" : "new";
  const [mode, setMode] = useState<ProjectMode>(initialMode);

  const [projectName, setProjectName] = useState(existingProject?.name ?? "");
  const [estimatedCount, setEstimatedCount] = useState(
    existingProject?.estimated_count != null ? String(existingProject.estimated_count) : ""
  );
  const [btnState, setBtnState] = useState<BtnState>(existingProject ? "done" : "idle");

  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const { projects } = useProjectList(isAuthenticated);
  const showModeToggle = isAuthenticated && projects.length > 0;

  // Re-sync when an existing project loads asynchronously (e.g. from URL param)
  useEffect(() => {
    if (existingProject) {
      setMode("existing");
      setProjectName(existingProject.name);
      setEstimatedCount(
        existingProject.estimated_count != null ? String(existingProject.estimated_count) : ""
      );
      setBtnState("done");
    }
  }, [existingProject?.id]);

  // Reset fields when mode changes
  const handleModeChange = (next: ProjectMode) => {
    setMode(next);
    setProjectName("");
    setEstimatedCount("");
    setBtnState("idle");
  };

  const handleSelectExistingProject = (selectedName: string) => {
    const found = projects.find((p) => p.name === selectedName);
    if (!found) return;
    setProjectName(found.name);
    setEstimatedCount(found.estimated_count != null ? String(found.estimated_count) : "");
    setBtnState("done");
    onLoadExistingProject?.(found);
  };

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

  const projectNames = projects.map((p) => p.name);

  return (
    <StepPanel>
      <div className="s1-two-col-grid">
        <TaahodCard />
        <ProjectInfoCard
          showModeToggle={showModeToggle}
          mode={mode}
          onModeChange={handleModeChange}
          projectName={projectName}
          estimatedCount={estimatedCount}
          onProjectNameChange={setProjectName}
          onEstimatedCountChange={setEstimatedCount}
          btnState={btnState}
          btnLabel={btnLabel}
          onConfirm={handleConfirm}
          projectOptions={projectNames}
          selectedProjectName={mode === "existing" ? projectName : ""}
          onSelectExistingProject={handleSelectExistingProject}
        />
      </div>
    </StepPanel>
  );
};