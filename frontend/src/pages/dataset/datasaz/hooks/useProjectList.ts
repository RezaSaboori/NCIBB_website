/*useProjectList.ts*/
import { useState, useEffect } from "react";
import { fetchProjects, DatasazProject } from "../api/projectsApi";

export const useProjectList = () => {
  const [projects, setProjects] = useState<DatasazProject[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchProjects()
      .then(setProjects)
      .finally(() => setLoading(false));
  }, []);

  return { projects, loading };
};