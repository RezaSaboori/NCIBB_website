import React from "react";
import { createPortal } from "react-dom";

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
  return createPortal(
    <div className="dz-modal-overlay" onClick={onCancel}>
      <div
        className="glass dz-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dz-modal-title"
        dir="ltr"
      >
        {/* Header */}
        <div className="dz-modal__header">
          <span id="dz-modal-title" className="dz-modal__title">
            Confirm Delete
          </span>
          <button
            className="glass dz-modal__close-btn"
            aria-label="Close"
            onClick={onCancel}
            type="button"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="dz-modal__body">
          <p className="dz-modal__message">
            Are you sure you want to delete{" "}
            <strong className="dz-modal__item-name">{itemLabel}</strong>?
          </p>
        </div>

        {/* Footer */}
        <div className="dz-modal__footer">
          <button
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
    </div>,
    document.body
  );
};