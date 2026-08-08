import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  DatasazProject,
  createProject,
  saveStep,
  fetchProjectById,
} from "../api/projectsApi";

export const useActiveProject = () => {
  const [activeProject, setActiveProject] = useState<DatasazProject | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();

  // On mount: if ?project=<id> is present, load that project and restore its step
  useEffect(() => {
    const projectId = searchParams.get("project");
    if (!projectId) return;
    (async () => {
      try {
        const project = await fetchProjectById(Number(projectId));
        setActiveProject(project);
      } catch {
        setError("خطا در بارگذاری پروژه");
      }
    })();
  }, []); // intentionally runs once on mount

  const initProject = useCallback(
    async (name: string, estimatedCount?: number) => {
      setSaving(true);
      setError(null);
      try {
        const project = await createProject({
          name,
          estimated_count: estimatedCount,
        });
        setActiveProject(project);
        return project;
      } catch {
        setError("خطا در ایجاد پروژه");
        return null;
      } finally {
        setSaving(false);
      }
    },
    []
  );

  const persistStep = useCallback(
    async (step: 1 | 2 | 3 | 4, data: Record<string, unknown>) => {
      if (!activeProject) return null;
      setSaving(true);
      setError(null);
      try {
        const updated = await saveStep(activeProject.id, step, data);
        setActiveProject(updated);
        return updated;
      } catch {
        setError("خطا در ذخیره مرحله");
        return null;
      } finally {
        setSaving(false);
      }
    },
    [activeProject]
  );

  return { activeProject, setActiveProject, saving, error, initProject, persistStep };
};