// Aggregates projects from all services into the generic UserProject shape.
// Add new service adapters here as the platform grows.

import {
  fetchProjects as fetchDatasazProjects,
  DatasazProject,
} from "../../../pages/dataset/datasaz/api/projectsApi";
import type { UserProject } from "../../../types/profile.types";

const STEP_LABELS: Record<number, string> = {
  1: "مرحله ۱ - آغاز",
  2: "مرحله ۲ - تعریف",
  3: "مرحله ۳ - پردازش",
  4: "مرحله ۴ - خروجی",
};

function mapDatasazProject(p: DatasazProject): UserProject {
  return {
    id: p.id,
    name: p.name,
    serviceName: "datasaz",
    serviceLabel: "داده‌ساز",
    stageLabel: STEP_LABELS[p.current_step] ?? `مرحله ${p.current_step}`,
    statusLabel: p.status,
    openUrl: `/datasaz?project=${p.id}`,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  };
}

export async function fetchAllUserProjects(): Promise<UserProject[]> {
  // Fan-out: add more service calls here (Promise.allSettled keeps partial failures safe)
  const results = await Promise.allSettled([fetchDatasazProjects()]);

  const projects: UserProject[] = [];

  results.forEach((result) => {
    if (result.status === "fulfilled") {
      result.value.forEach((p: DatasazProject) => {
        projects.push(mapDatasazProject(p));
      });
    }
  });

  return projects;
}

export async function deleteUserProject(
  serviceName: string,
  id: number
): Promise<void> {
  if (serviceName === "datasaz") {
    const { deleteProject } = await import(
      "../../../pages/dataset/datasaz/api/projectsApi"
    );
    await deleteProject(id);
  }
  // Add other service deletions here
}