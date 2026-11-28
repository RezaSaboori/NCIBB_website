/* CriteriaButton.tsx */
import React from "react";
import "./step2.css";
import { DeleteButton } from "@/components/ui/iconButtons";
import { GlassIconButton } from "@/components/ui/iconButtons/GlassIconButton";
import { ScrollText } from "@/components/ui/motion/ScrollText";
import { CriteriaDescriptionHelp } from "./CriteriaDescriptionHelp";
import { CriteriaPreview, type CriteriaPreviewProps } from "./CriteriaPreview";

interface CriteriaButtonProps {
  label: string;
  isSelected?: boolean;
  isExpanded?: boolean;
  isAdvanced?: boolean;
  getPreview: () => CriteriaPreviewProps;
  onSelect: () => void;
  onDelete: () => void;
  onExpand: () => void;
}

export const CriteriaButton: React.FC<CriteriaButtonProps> = ({
  label,
  isSelected = false,
  isExpanded = false,
  isAdvanced = false,
  getPreview,
  onSelect,
  onDelete,
  onExpand,
}) => {
  return (
    <div
      className={`${isAdvanced ? "opal-glass" : "glass"} dz-criteria-tab s2-criteria-tab${isSelected ? " s2-criteria-tab--selected" : ""}${isAdvanced ? " s2-criteria-tab--advanced" : ""}`}
    >
      <button className="s2-criteria-tab__select ui-scroll-text-trigger" type="button" onClick={onSelect} aria-expanded={isSelected}>
        <ScrollText className="dz-criteria-tab__title" text={label} />
      </button>
      <div className="s2-criteria-tab__actions" aria-hidden={!isSelected}>
        <CriteriaDescriptionHelp
          label={label}
          disabled={!isSelected}
          renderPreview={() => <CriteriaPreview {...getPreview()} />}
        />
        <GlassIconButton
          action={isExpanded ? "minimize" : "expand"}
          size="var(--s2-criteria-action-target)"
          className="s2-criteria-icon"
          inset
          aria-label={`${isExpanded ? "Minimize" : "Expand"} ${label}`}
          onClick={onExpand}
          disabled={!isSelected}
        />
        <DeleteButton
          size="var(--s2-criteria-action-target)"
          className="s2-criteria-icon"
          inset
          aria-label={`Delete ${label}`}
          onClick={onDelete}
          disabled={!isSelected}
        />
      </div>
    </div>
  );
};
