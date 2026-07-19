import { useState } from "react";
import type { DatasazStep } from "../types";

export const useDatasazSteps = () => {
  const [activeStep, setActiveStep] = useState<DatasazStep>(1);

  const goToStep = (step: DatasazStep) => setActiveStep(step);
  const nextStep = () =>
    setActiveStep((prev) => (prev < 4 ? ((prev + 1) as DatasazStep) : prev));
  const prevStep = () =>
    setActiveStep((prev) => (prev > 1 ? ((prev - 1) as DatasazStep) : prev));

  return { activeStep, goToStep, nextStep, prevStep };
};