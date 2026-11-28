import type { ReactNode } from "react";

import "@/components/ui/GlassButton.css";

interface CriteriaWindowButtonProps {
  children: ReactNode;
  surface: "blue-glass" | "red-glass" | "opal-glass" | "glass";
  onClick?: () => void;
}

export function CriteriaWindowButton({
  children,
  surface,
  onClick,
}: CriteriaWindowButtonProps) {
  return (
    <button className={`ui-control-button ${surface} s2-criteria-window__btn`} type="button" onClick={onClick}>
      {children}
    </button>
  );
}
