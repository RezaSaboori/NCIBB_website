import { useState } from "react";
import type { DatasazStep } from "../types";

export const useDatasazSteps = () => {
  const [activeStep, setActiveStep] = useState<DatasazStep>(1);

    // Accepts any number (e.g. current_step from the API) and clamps it to a valid step
  const goToStep = (step: number) =>
    setActiveStep(Math.min(4, Math.max(1, Math.round(step))) as DatasazStep);
  const nextStep = () =>
    setActiveStep((prev) => (prev < 4 ? ((prev + 1) as DatasazStep) : prev));
  const prevStep = () =>
    setActiveStep((prev) => (prev > 1 ? ((prev - 1) as DatasazStep) : prev));

  return { activeStep, goToStep, nextStep, prevStep };
};