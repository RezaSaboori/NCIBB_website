import React, { useState, useCallback } from "react";
import { useDatasazSteps } from "./hooks/useDatasazSteps";
import { useActiveProject } from "./hooks/useActiveProject";
import { DatasazStepTabs } from "./components/DatasazStepTabs";
import { Step1Initiation } from "./components/Step1Initiation";
import { Step2Definition } from "./components/Step2Definition";
import { Step3Processing } from "./components/Step3Processing";
import { Step4Output } from "./components/Step4Output";
import { DefinitionCounters } from "./components/step2/DefinitionCounters";
import "./styles.css";

export const DatasazMode: React.FC = () => {
  const { activeStep, goToStep, nextStep } = useDatasazSteps();
  const { activeProject, saving, initProject, persistStep } = useActiveProject();

  // When a project is restored from URL, sync the UI to its saved step
  React.useEffect(() => {
    if (activeProject?.current_step) {
      goToStep(activeProject.current_step);
    }
  }, [activeProject?.id]); // only re-sync when project identity changes

  const [inclusionCount, setInclusionCount] = useState(0);
  const [exclusionCount, setExclusionCount] = useState(0);

  const handleProjectInit = useCallback(
    async (name: string, estimatedCount?: number) => {
      const project = await initProject(name, estimatedCount);
      if (project) nextStep();
    },
    [initProject, nextStep]
  );

  const handleStartProcessing = useCallback(async () => {
    // step2_definition is assembled by CriteriaPanel; placeholder for now
    await persistStep(2, { definition: {} });
    nextStep();
  }, [persistStep, nextStep]);

  const renderStep = () => {
    switch (activeStep) {
      case 1:
        return (
          <Step1Initiation
            onProjectInit={handleProjectInit}
            existingProject={activeProject}
            onLoadExistingProject={(project) => {
              setActiveProject(project);
              goToStep(project.current_step ?? 1);
            }}
          />
        );
      case 2:
        return (
          <Step2Definition
            onInclusionCountChange={setInclusionCount}
            onExclusionCountChange={setExclusionCount}
          />
        );
      case 3:
        return <Step3Processing />;
      case 4:
        return <Step4Output />;
    }
  };

  return (
    <div className="datasaz-mode-wrapper">
      <DatasazStepTabs activeStep={activeStep} onStepChange={goToStep} />
      {saving && <div className="dz-saving-indicator">در حال ذخیره...</div>}
      {activeStep === 2 && (
        <DefinitionCounters
          inclusionCount={inclusionCount}
          exclusionCount={exclusionCount}
          errorCount={0}
          onStartProcessing={handleStartProcessing}
        />
      )}
      {renderStep()}
    </div>
  );
};