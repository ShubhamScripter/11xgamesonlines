import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../utils/axiosInstance";

const CACHE_MS = 2 * 60 * 1000;

export const fetchMyAccountProfile = createAsyncThunk(
  "myAccount/fetchProfile",
  async (userId, { getState, rejectWithValue }) => {
    const { userId: cachedUserId, profile, fetchedAt } = getState().myAccount;
    if (
      profile &&
      cachedUserId === userId &&
      fetchedAt &&
      Date.now() - fetchedAt < CACHE_MS
    ) {
      return { userId, profile, fromCache: true };
    }

    try {
      const { data } = await axiosInstance.post("/sub-admin/profile-light", {
        userId,
      });
      if (!data?.success || !data.data) {
        return rejectWithValue(data?.message || "Failed to load profile");
      }
      return { userId, profile: data.data, fromCache: false };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to load profile"
      );
    }
  }
);

const myAccountSlice = createSlice({
  name: "myAccount",
  initialState: {
    userId: null,
    profile: null,
    fetchedAt: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearMyAccountProfile: (state) => {
      state.userId = null;
      state.profile = null;
      state.fetchedAt = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyAccountProfile.pending, (state, action) => {
        const reqId = action.meta.arg;
        if (state.userId !== reqId || !state.profile) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchMyAccountProfile.fulfilled, (state, action) => {
        if (action.payload.fromCache) {
          state.loading = false;
          return;
        }
        state.loading = false;
        state.userId = action.payload.userId;
        state.profile = action.payload.profile;
        state.fetchedAt = Date.now();
      })
      .addCase(fetchMyAccountProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearMyAccountProfile } = myAccountSlice.actions;
export default myAccountSlice.reducer;
