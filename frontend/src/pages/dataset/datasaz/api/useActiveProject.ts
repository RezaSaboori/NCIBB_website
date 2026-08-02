import { useState, useCallback } from "react";
import {
  DatasazProject,
  createProject,
  saveStep,
} from "../api/projectsApi";

export const useActiveProject = () => {
  const [activeProject, setActiveProject] = useState<DatasazProject | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return { activeProject, saving, error, initProject, persistStep };
};