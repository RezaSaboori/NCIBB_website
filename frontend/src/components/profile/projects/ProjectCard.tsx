import React from "react";
import type { UserProject } from "../../../types/profile.types";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import "./projects.css";

interface ProjectCardProps {
  project: UserProject;
  onDelete: (project: UserProject) => void;
  onOpen: (project: UserProject) => void;
}

const formatPersianDate = (dateString?: string) => {
  if (!dateString) return "—";
  try {
    return new Date(dateString).toLocaleDateString("fa-IR");
  } catch {
    return "—";
  }
};

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onDelete,
  onOpen,
}) => {
  return (
    <GlassCard size="sm" className="project-card"
      heading={<h3 className="project-card__title">{project.name}</h3>}
      footer={<>
        <GlassButton className="project-card__action-btn" variant="flat" onPress={() => onDelete(project)}>حذف</GlassButton>
        <GlassButton className="project-card__action-btn" color="primary" onPress={() => onOpen(project)}>باز کردن</GlassButton>
      </>}>
      <div className="project-card__dates">
        <div className="glass project-card__date-item">
          <span className="project-card__date-label">تاریخ ایجاد پروژه:</span>
          <span className="project-card__date-value">
            {formatPersianDate(project.createdAt)}
          </span>
        </div>
        <div className="glass project-card__date-item">
          <span className="project-card__date-label">تاریخ آخرین تغییر:</span>
          <span className="project-card__date-value">
            {formatPersianDate(project.updatedAt)}
          </span>
        </div>
      </div>
      <span className="project-card__stage">{project.stageLabel}</span>
      <span className="project-card__status">{project.statusLabel}</span>
    </GlassCard>
  );
};
