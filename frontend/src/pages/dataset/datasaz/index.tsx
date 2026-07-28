import React, { useState, useCallback } from "react";
import { useDatasazSteps } from "./hooks/useDatasazSteps";
import { DatasazStepTabs } from "./components/DatasazStepTabs";
import { Step1Initiation } from "./components/Step1Initiation";
import { Step2Definition } from "./components/Step2Definition";
import { Step3Processing } from "./components/Step3Processing";
import { Step4Output } from "./components/Step4Output";
import { DefinitionCounters } from "./components/step2/DefinitionCounters";
import "./styles.css";

export const DatasazMode: React.FC = () => {
  const { activeStep, goToStep } = useDatasazSteps();

  const [inclusionCount, setInclusionCount] = useState(0);
  const [exclusionCount, setExclusionCount] = useState(0);

  const handleStartProcessing = useCallback(() => {
    // TODO: trigger Step 3 navigation when wired
  }, []);

  const renderStep = () => {
    switch (activeStep) {
      case 1:
        return <Step1Initiation />;
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