/*StepPanel.tsx*/
import React from "react";

interface StepPanelProps {
  children: React.ReactNode;
}

export const StepPanel: React.FC<StepPanelProps> = ({ children }) => {
  return <div className="glass datasaz-step-panel">{children}</div>;
};