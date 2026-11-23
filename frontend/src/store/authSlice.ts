import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

import type { AuthResponse } from "../dataset_services/authService"

interface AuthState {
  isAuthenticated: boolean
  user: AuthResponse["user"] | null
  loading: boolean
}

const initialState: AuthState = {
  isAuthenticated: localStorage.getItem("access_token") ? true : false,
  user: null,
  loading: true,
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess(state, action: PayloadAction<AuthResponse>) {
      state.isAuthenticated = true
      state.user = action.payload.user
      localStorage.setItem("access_token", action.payload.access)
      localStorage.setItem("refresh_token", action.payload.refresh)
    },
    logoutSuccess(state) {
      state.isAuthenticated = false
      state.user = null
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload
    },
  },
})

export const { loginSuccess, logoutSuccess, setLoading } = authSlice.actions
export default authSlice.reducer
