import api from "./api"
import { DatabaseInfo } from "../types/database"

interface DatayabSearchResponse {
  results: DatabaseInfo[]
  count: number
}

export const searchDatayab = async (query: string): Promise<DatabaseInfo[]> => {
  const response = await api.post<DatayabSearchResponse>("/datayab/search/", {
    query,
  })
  return response.data.results
}