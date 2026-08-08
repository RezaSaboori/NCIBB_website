import React, { useState, useCallback } from "react";
import { useDatasazSteps } from "./hooks/useDatasazSteps";
import type { DatasazStep, SerializedCriteriaItem, Step2DefinitionPayload } from "./types";
import { useActiveProject } from "./hooks/useActiveProject";
import { useDebouncedCallback } from "./hooks/useDebouncedCallback";
import { useDelayedFlag } from "./hooks/useDelayedFlag";
import { DatasazStepTabs } from "./components/DatasazStepTabs";
import { SaveSpinner } from "./components/SaveSpinner";
import { Step1Initiation } from "./components/Step1Initiation";
import { Step2Definition } from "./components/Step2Definition";
import { Step3Processing } from "./components/Step3Processing";
import { Step4Output } from "./components/Step4Output";
import { DefinitionCounters } from "./components/step2/DefinitionCounters";
import "./styles.css";

export const DatasazMode: React.FC = () => {
  const { activeStep, goToStep, nextStep } = useDatasazSteps();
  const { activeProject, setActiveProject, saving, initProject, persistStep } = useActiveProject();

  // Show the tab-bar spinner only when a save takes longer than 2s
  const showSaveSpinner = useDelayedFlag(saving, 2000);

  // Block navigation beyond step 1 until a project is created or chosen
  const handleStepChange = useCallback(
    (step: DatasazStep) => {
      if (!activeProject && step !== 1) return;
      goToStep(step);
    },
    [activeProject, goToStep]
  );

  // When a project is restored from URL, sync the UI to its saved step
  React.useEffect(() => {
    if (activeProject?.current_step) {
      goToStep(activeProject.current_step);
    }
  }, [activeProject?.id]); // only re-sync when project identity changes

  const [inclusionCount, setInclusionCount] = useState(0);
  const [exclusionCount, setExclusionCount] = useState(0);

  // Latest step-2 definition, kept in a ref so it can be persisted synchronously
  const definitionRef = React.useRef<Step2DefinitionPayload>({ inclusion: [], exclusion: [] });

  // Seed the ref from the restored project so editing one panel never wipes the other
  React.useEffect(() => {
    const def = activeProject?.step2_definition as Partial<Step2DefinitionPayload> | undefined;
    if (def) {
      definitionRef.current = {
        inclusion: def.inclusion ?? [],
        exclusion: def.exclusion ?? [],
      };
    }
  }, [activeProject?.id]);

  const persistDefinition = useCallback(
    (definition: Step2DefinitionPayload) => {
      persistStep(2, { definition });
    },
    [persistStep]
  );

  const { debounced: persistDefinitionDebounced, cancel: cancelDefinitionSave } =
    useDebouncedCallback(persistDefinition, 800);

  const handleDefinitionChange = useCallback(
    (type: "inclusion" | "exclusion", def: SerializedCriteriaItem[]) => {
      definitionRef.current = { ...definitionRef.current, [type]: def };
      persistDefinitionDebounced(definitionRef.current);
    },
    [persistDefinitionDebounced]
  );

  const handleProjectInit = useCallback(
    async (name: string, estimatedCount?: number) => {
      const project = await initProject(name, estimatedCount);
      if (project) nextStep();
    },
    [initProject, nextStep]
  );

  const handleStartProcessing = useCallback(async () => {
    // Cancel any pending debounced save and persist the latest definition now
    cancelDefinitionSave();
    await persistStep(2, { definition: definitionRef.current });
    nextStep();
  }, [cancelDefinitionSave, persistStep, nextStep]);

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
            key={activeProject?.id ?? "no-project"}
            initialDefinition={activeProject?.step2_definition as Step2DefinitionPayload | undefined}
            onDefinitionChange={handleDefinitionChange}
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
      <div className="datasaz-tabs-row">
        <DatasazStepTabs
          activeStep={activeStep}
          onStepChange={handleStepChange}
          isStepDisabled={(step) => !activeProject && step !== 1}
        />
        {showSaveSpinner && (
          <div className="datasaz-save-spinner-container glass">
            <SaveSpinner />
          </div>
        )}
      </div>
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