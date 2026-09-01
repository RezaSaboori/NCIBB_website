import api from "./api"
import { DatabaseInfo } from "../types/database"

export interface DatayabCandidateTrace {
  name: string
  distance: number
  kept: boolean
  verified: boolean | null
}

export interface DatayabTrace {
  user_query: string
  llm_raw: string | null
  intent: {
    search_query: string
    data_types: string[]
    year_min: number | null
    year_max: number | null
    in_domain: boolean
  }
  where: Record<string, unknown> | null
  candidates: DatayabCandidateTrace[]
  kept_count: number
  max_distance: number
}

interface DatayabSearchResponse {
  results: DatabaseInfo[]
  count: number
  trace: DatayabTrace
}

export const searchDatayab = async (
  query: string
): Promise<DatayabSearchResponse> => {
  const response = await api.post<DatayabSearchResponse>("/datayab/search/", {
    query,
  })
  return response.data
}