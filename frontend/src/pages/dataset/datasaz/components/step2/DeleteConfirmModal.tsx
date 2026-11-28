import React, { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { CloseButton } from "@/components/ui/iconButtons";

interface DeleteConfirmModalProps {
  itemLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  itemLabel,
  onConfirm,
  onCancel,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const opener = document.activeElement;
    dialog.showModal();
    cancelRef.current?.focus();
    return () => {
      dialog.close();
      if (opener instanceof HTMLElement && opener.isConnected) {
        opener.focus({ preventScroll: true });
      }
    };
  }, []);

  return createPortal(
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- Backdrop clicks supplement Escape and the visible Cancel button.
    <dialog
      ref={dialogRef}
      className="dz-modal-overlay"
      aria-labelledby={titleId}
      onClick={(event) => { if (event.target === event.currentTarget) onCancel(); }}
      onCancel={(event) => { event.preventDefault(); onCancel(); }}
    >
      <div className="glass dz-modal" dir="ltr" lang="en">
        {/* Header */}
        <div className="dz-modal__header">
          <h2 id={titleId} className="dz-modal__title">
            Confirm Delete
          </h2>
          <CloseButton
            size="var(--control-height-compact)"
            aria-label="Close"
            onClick={onCancel}
          />
        </div>

        {/* Body */}
        <div className="dz-modal__body">
          <p className="dz-modal__message">
            Are you sure you want to delete{" "}
            <bdi className="dz-modal__item-name">{itemLabel}</bdi>?
          </p>
        </div>

        {/* Footer */}
        <div className="dz-modal__footer">
          <button
            ref={cancelRef}
            className="glass dz-modal__btn dz-modal__btn--cancel"
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
          <button
            className="red-glass dz-modal__btn dz-modal__btn--delete"
            onClick={onConfirm}
            type="button"
          >
            Delete
          </button>
        </div>
      </div>
    </dialog>,
    document.body
  );
};
