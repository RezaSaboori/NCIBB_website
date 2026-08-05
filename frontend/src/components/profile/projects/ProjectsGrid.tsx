import React, { useEffect, useState } from "react";
import type { UserProject } from "../../../types/profile.types";
import {
  fetchAllUserProjects,
  deleteUserProject,
} from "./profileProjectsApi";
import { ProjectCard } from "./ProjectCard";
import { ProjectDeleteConfirmModal } from "./ProjectDeleteConfirmModal";
import { useNavigate } from "react-router-dom";
import "./projects.css";

export const ProjectsGrid: React.FC = () => {
  const [projects, setProjects] = useState<UserProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<UserProject | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllUserProjects()
      .then(setProjects)
      .catch(() => setError("خطا در بارگذاری پروژه‌ها"))
      .finally(() => setLoading(false));
  }, []);

  const handleDeleteConfirm = async () => {
    if (!pendingDelete) return;
    await deleteUserProject(pendingDelete.serviceName, pendingDelete.id);
    setProjects((prev) => prev.filter((p) => p.id !== pendingDelete.id || p.serviceName !== pendingDelete.serviceName));
    setPendingDelete(null);
  };

  const handleOpen = (project: UserProject) => {
    navigate(project.openUrl);
  };

  if (loading) return <div className="project-grid__loading">در حال بارگذاری...</div>;
  if (error) return <div className="project-grid__error">{error}</div>;
  if (!projects.length)
    return <div className="project-grid__empty">هنوز پروژه‌ای ایجاد نشده است.</div>;

  return (
    <>
      <div className="project-grid">
        {projects.map((p) => (
          <ProjectCard
            key={`${p.serviceName}-${p.id}`}
            project={p}
            onDelete={setPendingDelete}
            onOpen={handleOpen}
          />
        ))}
      </div>

      {pendingDelete && (
        <ProjectDeleteConfirmModal
          project={pendingDelete}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </>
  );
};