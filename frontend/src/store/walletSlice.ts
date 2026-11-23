import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { accountApi } from "@/dataset_services/accountApi"
import type { Wallet } from "@/types/account"
import { logoutSuccess, loginSuccess } from "./authSlice"

interface WalletState {
  wallet: Wallet | null
  request: string | null
  error: boolean
}

const initialState: WalletState = { wallet: null, request: null, error: false }

export const fetchWallet = createAsyncThunk("wallet/fetch", () => accountApi.wallet())

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {},
  extraReducers: (builder) => builder
    .addCase(loginSuccess, () => initialState)
    .addCase(logoutSuccess, () => initialState)
    .addCase(fetchWallet.pending, (state, { meta }) => {
      state.request = meta.requestId
      state.error = false
    })
    .addCase(fetchWallet.fulfilled, (state, { payload, meta }) => {
      if (state.request !== meta.requestId) return
      state.wallet = payload
      state.request = null
    })
    .addCase(fetchWallet.rejected, (state, { meta }) => {
      if (state.request !== meta.requestId) return
      state.request = null
      state.error = true
    }),
})

export default walletSlice.reducer
