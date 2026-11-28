/* CriteriaDescriptionHelp.tsx
 * Anchored field description shared by all criteria window variants.
 * HeroUI positions the portal from the actual trigger coordinates.
 */
import React, { useEffect, useId, useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@heroui/react";
import { CloseButton, QuestionButton } from "@/components/ui/iconButtons";
import "./criteriaDescriptionHelp.css";

interface CriteriaDescriptionHelpProps {
  label: string;
  description?: string | null;
  onOpen?: () => void;
  disabled?: boolean;
  renderPreview?: () => React.ReactNode;
}

export const CriteriaDescriptionHelp: React.FC<CriteriaDescriptionHelpProps> = ({
  label,
  description,
  onOpen,
  disabled = false,
  renderPreview,
}) => {
  const descriptionId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const title = renderPreview ? "Criteria details" : "Description";

  useEffect(() => {
    if (disabled) setIsOpen(false);
  }, [disabled]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) onOpen?.();
  };

  return (
    <Popover
      isOpen={isOpen && !disabled}
      onOpenChange={handleOpenChange}
      placement="bottom-end"
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
        <QuestionButton
          size="var(--s2-criteria-action-target)"
          className="s2-criteria-icon"
          inset
          disabled={disabled}
          aria-label={`Show ${renderPreview ? "rules" : "description"} for ${label}`}
        />
      </PopoverTrigger>

      <PopoverContent
        dir="ltr"
        lang="en"
        aria-describedby={renderPreview ? undefined : descriptionId}
        data-criteria-preview={renderPreview ? "" : undefined}
      >
        {(titleProps) => (
          <>
            <div className="s2-criteria-description__header">
              <h3
                {...titleProps}
                className="s2-criteria-description__title"
                dir="ltr"
              >
                {renderPreview ? label : title}
              </h3>
              <CloseButton
                size="var(--s2-criteria-action-target)"
                className="s2-criteria-icon"
                inset
                aria-label={`Close ${title.toLowerCase()}`}
                onClick={() => setIsOpen(false)}
              />
            </div>

            <div className="s2-criteria-description__body">
              {renderPreview ? renderPreview() : (
                <p id={descriptionId} className="s2-criteria-description__text">
                  {description?.trim() || "No description is available for this field."}
                </p>
              )}
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
};
