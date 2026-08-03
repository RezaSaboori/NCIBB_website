import React from "react";
import { createPortal } from "react-dom";
import type { UserProject } from "../../../types/profile.types";

interface ProjectDeleteConfirmModalProps {
  project: UserProject;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ProjectDeleteConfirmModal: React.FC<ProjectDeleteConfirmModalProps> = ({
  project,
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
        aria-labelledby="profile-modal-title"
      >
        {/* Header */}
        <div className="dz-modal__header">
          <span id="profile-modal-title" className="dz-modal__title">
            تأیید حذف
          </span>
          <button
            className="glass dz-modal__close-btn"
            aria-label="بستن"
            onClick={onCancel}
            type="button"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="dz-modal__body">
          <p className="dz-modal__message" dir="rtl" style={{ textAlign: "right" }}>
            آیا از حذف پروژه{" "}
            <strong className="dz-modal__item-name">«{project.name}»</strong>{" "}
            مطمئن هستید؟
          </p>
        </div>

        {/* Footer */}
        <div className="dz-modal__footer">
          <button
            className="glass dz-modal__btn dz-modal__btn--cancel"
            onClick={onCancel}
            type="button"
          >
            لغو
          </button>
          <button
            className="red-glass dz-modal__btn dz-modal__btn--delete"
            onClick={onConfirm}
            type="button"
          >
            حذف
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};