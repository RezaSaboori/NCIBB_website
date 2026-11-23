import axios, { type InternalAxiosRequestConfig } from "axios"
import { store } from "../store/store"
import { logoutSuccess } from "../store/authSlice"
import { getUserIdFromAccessToken } from "../utils/authToken"

const api = axios.create({ baseURL: "/api", headers: { "Content-Type": "application/json" } })
const unauthenticated = new Set(["/auth/login/", "/auth/register/", "/auth/email-verification/confirm/"])

api.interceptors.request.use((config) => {
  const access = localStorage.getItem("access_token")
  if (access && !unauthenticated.has(config.url || "")) {
    config.headers.set("Authorization", `Bearer ${access}`)
  }
  return config
})

let pendingRefresh: Promise<string> | undefined

export function refreshSession() {
  if (pendingRefresh) return pendingRefresh
  const refresh = localStorage.getItem("refresh_token")
  if (!refresh) return Promise.reject(new Error("Missing refresh token"))

  pendingRefresh = axios.post<{ access: string; refresh?: string }>("/api/auth/token/refresh/", { refresh })
    .then(({ data }) => {
      if (localStorage.getItem("refresh_token") !== refresh) throw new Error("Session changed")
      localStorage.setItem("access_token", data.access)
      if (data.refresh) localStorage.setItem("refresh_token", data.refresh)
      return data.access
    })
    .finally(() => { pendingRefresh = undefined })
  return pendingRefresh
}

api.interceptors.response.use((response) => response, async (error: unknown) => {
  if (!axios.isAxiosError(error)) throw error
  const request: (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined = error.config
  if (!request || error.response?.status !== 401 || request._retry || unauthenticated.has(request.url || "")) {
    throw error
  }

  const refreshAtFailure = localStorage.getItem("refresh_token")
  const access = localStorage.getItem("access_token")
  if (!access && !refreshAtFailure) throw error
  const sent = request.headers.get("Authorization")
  if (typeof sent === "string" && access && sent !== `Bearer ${access}`
      && getUserIdFromAccessToken(sent.slice(7)) !== getUserIdFromAccessToken(access)) {
    throw error
  }
  request._retry = true
  try {
    if (!access || sent === `Bearer ${access}` || !sent) await refreshSession()
  } catch {
    if (localStorage.getItem("refresh_token") === refreshAtFailure) store.dispatch(logoutSuccess())
    throw error
  }
  return api(request)
})

export const getPageData = async (slug: string) => (await api.get(`/core/pages/${slug}/`)).data

export default api
