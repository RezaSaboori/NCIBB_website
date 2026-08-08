/*useProjectList.ts*/
import { useState, useEffect } from "react";
import { fetchProjects, DatasazProject } from "../api/projectsApi";

export const useProjectList = (isAuthenticated?: boolean) => {
  const [projects, setProjects] = useState<DatasazProject[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated === false) return;
    setLoading(true);
    fetchProjects()
      .then(setProjects)
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  return { projects, loading };
};