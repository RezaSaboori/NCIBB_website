/*Step1Initiation.tsx*/
import React, { useState } from "react";
import { StepPanel } from "./StepPanel";
import { TaahodCard } from "./step1/TaahodCard";
import { ProjectInfoCard } from "./step1/ProjectInfoCard";

type BtnState = "idle" | "loading" | "done";

interface Step1InitiationProps {
  onProjectInit: (name: string, estimatedCount?: number) => Promise<void> | void;
}

export const Step1Initiation: React.FC<Step1InitiationProps> = ({
  onProjectInit,
}) => {
  const [projectName, setProjectName] = useState("");
  const [estimatedCount, setEstimatedCount] = useState("");
  const [btnState, setBtnState] = useState<BtnState>("idle");

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
        />
      </div>
      <button
        className={`s1-create-btn blue-glass s1-create-btn--${btnState}`}
        type="button"
        onClick={handleConfirm}
        disabled={!projectName.trim() || btnState !== "idle"}
        aria-busy={btnState === "loading"}
        aria-label={btnLabel}
      >
        <span className="s1-create-btn__icon">
          {btnState === "loading" && (
            <span className="s1-create-btn__spinner" aria-hidden="true" />
          )}
          {btnState === "done" && (
            <svg className="s1-create-btn__check" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
          {btnState === "idle" && (
            <svg className="s1-create-btn__plus" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          )}
        </span>
        <span className="s1-create-btn__label">{btnLabel}</span>
      </button>
    </StepPanel>
  );
};