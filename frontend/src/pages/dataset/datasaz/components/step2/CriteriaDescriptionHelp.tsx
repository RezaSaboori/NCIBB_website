/* CriteriaDescriptionHelp.tsx
 * Anchored field description shared by all criteria window variants.
 * HeroUI positions the portal from the actual trigger coordinates.
 */
import React, { useId, useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@heroui/react";
import { QuestionIcon } from "./icons/Step2Icons";
import "./criteriaDescriptionHelp.css";

interface CriteriaDescriptionHelpProps {
  label: string;
  description?: string | null;
  onOpen?: () => void;
}

export const CriteriaDescriptionHelp: React.FC<CriteriaDescriptionHelpProps> = ({
  label,
  description,
  onOpen,
}) => {
  const descriptionId = useId();
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) onOpen?.();
  };

  return (
    <Popover
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      placement="bottom-end"
      shouldFlip={false}
      offset={8}
      shouldBlockScroll={false}
      shouldCloseOnScroll={false}
      triggerScaleOnOpen={false}
      disableAnimation
      shadow="none"
      classNames={{
        base: "s2-criteria-description-frame",
        content: "glass-transparent s2-criteria-description",
      }}
    >
      <PopoverTrigger>
        <button
          className="teal-glass dz-icon-btn s2-icon-btn"
          aria-label={`Show description for ${label}`}
          type="button"
        >
          <QuestionIcon className="dz-icon-btn__icon dz-icon-btn__icon--question" />
        </button>
      </PopoverTrigger>

      <PopoverContent aria-describedby={descriptionId}>
        {(titleProps) => (
          <>
            <div className="s2-criteria-description__header">
              <h3
                {...titleProps}
                className="s2-criteria-description__title"
                dir="auto"
              >
                {label}
              </h3>
              <button
                className="glass-transparent dz-icon-btn s2-criteria-description__close"
                aria-label="Close description"
                onClick={() => setIsOpen(false)}
                type="button"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>

            <div className="s2-criteria-description__body">
              {/* Preserve graph paragraph breaks while rendering plain text. */}
              <p
                id={descriptionId}
                className="s2-criteria-description__text"
                dir="auto"
              >
                {description?.trim() || "No description is available for this field."}
              </p>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
};