import React, { useEffect, useState } from "react";
import { fetchProjects, DatasazProject, deleteProject } from "../../pages/dataset/datasaz/api/projectsApi";

export const UserProjectsList: React.FC = () => {
  const [projects, setProjects] = useState<DatasazProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects()
      .then(setProjects)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    await deleteProject(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  if (loading) return <div>در حال بارگذاری...</div>;
  if (!projects.length) return <div>هنوز پروژه‌ای ایجاد نشده است.</div>;

  return (
    <ul className="user-projects-list">
      {projects.map((p) => (
        <li key={p.id} className="user-projects-list__item">
          <span className="user-projects-list__name">{p.name}</span>
          <span className="user-projects-list__step">مرحله {p.current_step}</span>
          <span className="user-projects-list__status">{p.status}</span>
          <button onClick={() => handleDelete(p.id)}>حذف</button>
        </li>
      ))}
    </ul>
  );
};