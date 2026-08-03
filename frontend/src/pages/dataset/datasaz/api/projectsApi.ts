import api from "../../../../dataset_services/api";

const BASE = "/datasaz/projects/";

export interface DatasazProjectPayload {
  name: string;
  estimated_count?: number;
}

export interface DatasazProject {
  id: number;
  name: string;
  estimated_count: number | null;
  current_step: number;
  status: string;
  step2_definition: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const fetchProjects = (): Promise<DatasazProject[]> =>
  api.get(BASE).then((r) => r.data);

export const createProject = (
  payload: DatasazProjectPayload
): Promise<DatasazProject> =>
  api.post(BASE, payload).then((r) => r.data);

export const updateProject = (
  id: number,
  payload: Partial<DatasazProjectPayload>
): Promise<DatasazProject> =>
  api.patch(`${BASE}${id}/`, payload).then((r) => r.data);

export const deleteProject = (id: number): Promise<void> =>
  api.delete(`${BASE}${id}/`).then(() => undefined);

export const saveStep = (
  id: number,
  step: 1 | 2 | 3 | 4,
  data: Record<string, unknown>
): Promise<DatasazProject> =>
  api.patch(`${BASE}${id}/step/`, { step, data }).then((r) => r.data);

export const fetchProjectById = (id: number): Promise<DatasazProject> =>
  api.get(`${BASE}${id}/`).then((r) => r.data);