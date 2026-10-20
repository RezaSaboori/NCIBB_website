/* CriteriaDescriptionHelp.tsx
 * Shared field-description trigger for simple, advanced, and mini criteria windows.
 * Native dialog uses the top layer, so scroll containers cannot clip the glass.
 */
import React, { useId, useRef } from "react";
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
  const id = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const dialogId = `${id}-dialog`;
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;

  const openDescription = () => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    dialog.showModal();
    onOpen?.();
  };

  const closeDescription = () => dialogRef.current?.close();

  const handleBackdropClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    const dialog = event.currentTarget;
    if (event.target !== dialog) return;

    // Backdrop clicks target the dialog too; preserve clicks on its own padding.
    const bounds = dialog.getBoundingClientRect();
    if (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    ) {
      dialog.close();
    }
  };

  return (
    <>
      <button
        className="teal-glass dz-icon-btn s2-icon-btn"
        aria-label={`Show description for ${label}`}
        aria-haspopup="dialog"
        aria-controls={dialogId}
        onClick={openDescription}
        type="button"
      >
        <QuestionIcon className="dz-icon-btn__icon dz-icon-btn__icon--question" />
      </button>

      <dialog
        ref={dialogRef}
        id={dialogId}
        className="glass-transparent s2-criteria-description"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onClick={handleBackdropClick}
      >
        <div className="s2-criteria-description__header">
          <h3 id={titleId} className="s2-criteria-description__title" dir="auto">
            {label}
          </h3>
          <button
            className="glass-transparent dz-icon-btn s2-criteria-description__close"
            aria-label="Close description"
            onClick={closeDescription}
            type="button"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <div className="s2-criteria-description__body">
          {/* Render graph text as plain text, preserving its paragraph breaks. */}
          <p id={descriptionId} className="s2-criteria-description__text" dir="auto">
            {description?.trim() || "No description is available for this field."}
          </p>
        </div>
      </dialog>
    </>
  );
};