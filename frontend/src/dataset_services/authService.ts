import api, { refreshSession } from "./api"

interface Credentials { email: string; password: string }
interface Registration extends Credentials {
  username: string
  first_name: string
  last_name: string
  password_confirm: string
}
export interface AuthResponse {
  access: string
  refresh: string
  user: {
    id: number
    email: string
    username: string
    first_name: string
    role: string
    profile: { full_name?: string; profile_picture_url?: string | null } | null
  }
}

const login = async (credentials: Credentials) => (await api.post<AuthResponse>("/auth/login/", credentials)).data

const register = async (userData: Registration) => (await api.post<AuthResponse>("/auth/register/", userData)).data

const logout = async () => {
  const refresh = localStorage.getItem("refresh_token")
  if (refresh) {
    try {
      await api.post("/auth/logout/", { refresh })
    } catch (error) {
      console.error("Failed to logout on server", error)
    }
  }
  localStorage.removeItem("access_token")
  localStorage.removeItem("refresh_token")
}

const refreshToken = async () => ({ access: await refreshSession() })
const forgotPassword = async (email: string) => (await api.post("/auth/password/reset/", { email })).data
const resetPassword = async (resetData: Record<string, string>) =>
  (await api.post("/auth/password/reset/confirm/", resetData)).data

export const authService = { login, register, logout, refreshToken, forgotPassword, resetPassword }
