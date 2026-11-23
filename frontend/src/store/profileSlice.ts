import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { accountApi, accountError } from "../dataset_services/accountApi"
import type { AccountProfile } from "../types/account"

export const fetchUserProfile = createAsyncThunk("profile/fetchUserProfile", async (_, { rejectWithValue }) => {
  try {
    return await accountApi.profile()
  } catch (error) {
    return rejectWithValue(accountError(error))
  }
})

export const updateUserProfile = createAsyncThunk(
  "profile/updateUserProfile",
  async (data: Record<string, unknown>, { rejectWithValue }) => {
    try {
      return await accountApi.updateProfile(data)
    } catch (error) {
      return rejectWithValue(accountError(error))
    }
  },
)

interface ProfileState { profile: AccountProfile | null; loading: boolean; error: string | null }
const initialState: ProfileState = { profile: null, loading: false, error: null }

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: { clearProfile: () => initialState },
  extraReducers: (builder) => {
    for (const action of [fetchUserProfile, updateUserProfile]) {
      builder
        .addCase(action.pending, (state) => { state.loading = true; state.error = null })
        .addCase(action.fulfilled, (state, event) => { state.loading = false; state.profile = event.payload })
        .addCase(action.rejected, (state, event) => {
          state.loading = false
          state.error = typeof event.payload === "string" ? event.payload : null
        })
    }
  },
})

export const { clearProfile } = profileSlice.actions
export default profileSlice.reducer
