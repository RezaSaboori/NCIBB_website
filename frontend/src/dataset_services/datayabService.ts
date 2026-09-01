import { DatabaseInfo } from "../types/database"

export interface DatayabCandidateTrace {
  name: string
  distance: number
  kept: boolean
  verified: boolean | null
  reason: string | null
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
  } | null
  where: Record<string, unknown> | null
  verify_raw: string | null
  refined_query?: string
  candidates: DatayabCandidateTrace[]
  kept_count: number
  max_distance: number
  retries: number
}

export interface DatayabSearchResponse {
  results: DatabaseInfo[]
  count: number
  trace: DatayabTrace
}

interface DatayabStatusEvent {
  type: "status"
  step: "analyze" | "retrieve" | "verify" | "refine"
  search_query?: string
  in_domain?: boolean
  data_types?: string[]
  candidates?: number
  in_range?: number
  confirmed?: number
  content?: string
}

const datayabStatusMessage = (event: DatayabStatusEvent): string => {
  switch (event.step) {
    case "analyze":
      return event.in_domain
        ? `تحلیل درخواست: «${event.search_query}»`
        : "درخواست خارج از حوزه داده‌های زیست‌پزشکی است"
    case "retrieve":
      return `بازیابی از پایگاه برداری: ${event.in_range} داده نامزد از ${event.candidates}`
    case "verify":
      return `ارزیابی ارتباط داده‌ها: ${event.confirmed} داده تأیید شد`
    case "refine":
      return `نتیجه کافی نبود؛ بازنویسی پرس‌وجو: «${event.search_query}»`
    default:
      return "در حال پردازش ..."
  }
}

const postSearch = (query: string, withAuth: boolean) => {
  const headers: Record<string, string> = { "Content-Type": "application/json" }
  const token = localStorage.getItem("access_token")
  if (withAuth && token) headers["Authorization"] = `Bearer ${token}`
  return fetch("/api/datayab/search/", {
    method: "POST",
    headers,
    body: JSON.stringify({ query }),
  })
}

export const searchDatayabStream = async (
  query: string,
  onStatus: (message: string, content?: string) => void
): Promise<DatayabSearchResponse> => {
  // Public endpoint: an expired JWT 401s before AllowAny runs, so retry anonymously.
  let response = await postSearch(query, true)
  if (response.status === 401) {
    response = await postSearch(query, false)
  }
  if (!response.ok || !response.body) {
    throw new Error(`Datayab search failed with status ${response.status}`)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""
  let payload: DatayabSearchResponse | null = null

  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const events = buffer.split("\n\n")
    buffer = events.pop() ?? ""
    for (const event of events) {
      const line = event.trim()
      if (!line.startsWith("data:")) continue
      const data = JSON.parse(line.slice(5))
      if (data.type === "status") {
        onStatus(datayabStatusMessage(data), data.content)
      } else if (data.type === "result") {
        payload = { results: data.results, count: data.count, trace: data.trace }
      } else if (data.type === "error") {
        throw new Error(data.detail)
      }
    }
  }

  if (!payload) {
    throw new Error("Datayab search returned no result")
  }
  return payload
}