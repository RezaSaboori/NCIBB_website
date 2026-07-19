/*StepPanel.tsx*/
import React from "react";

interface StepPanelProps {
  children: React.ReactNode;
}

export const StepPanel: React.FC<StepPanelProps> = ({ children }) => {
  return <div className="datasaz-step-panel">{children}</div>;
};