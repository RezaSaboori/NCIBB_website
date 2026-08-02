import axios from "axios";

const BASE = "/api/datasaz/projects/";

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
  axios.get(BASE).then((r) => r.data);

export const createProject = (
  payload: DatasazProjectPayload
): Promise<DatasazProject> =>
  axios.post(BASE, payload).then((r) => r.data);

export const updateProject = (
  id: number,
  payload: Partial<DatasazProjectPayload>
): Promise<DatasazProject> =>
  axios.patch(`${BASE}${id}/`, payload).then((r) => r.data);

export const deleteProject = (id: number): Promise<void> =>
  axios.delete(`${BASE}${id}/`).then(() => undefined);

export const saveStep = (
  id: number,
  step: 1 | 2 | 3 | 4,
  data: Record<string, unknown>
): Promise<DatasazProject> =>
  axios.patch(`${BASE}${id}/step/`, { step, data }).then((r) => r.data);