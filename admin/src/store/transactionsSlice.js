// src/store/transactionsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../utils/axiosInstance";

const CACHE_MS = 2 * 60 * 1000;

export const fetchAgentTransactions = createAsyncThunk(
  "transactions/fetchAgentTransactions",
  async (userId, { getState, rejectWithValue }) => {
    const { userId: cachedId, list, fetchedAt } = getState().transactions;
    if (
      cachedId === userId &&
      fetchedAt &&
      Date.now() - fetchedAt < CACHE_MS
    ) {
      return { list, userId, fromCache: true };
    }

    try {
      const token = getState().auth.token;
      const { data } = await axiosInstance.post(
        "/get/agent-own-trantionhistory",
        { id: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return { list: data.data || [], userId, fromCache: false };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || err.message || "Failed to fetch transactions"
      );
    }
  }
);

const transactionsSlice = createSlice({
  name: "transactions",
  initialState: { list: [], userId: null, fetchedAt: null, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAgentTransactions.pending, (state, action) => {
        const reqId = action.meta.arg;
        if (state.userId !== reqId || state.fetchedAt == null) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchAgentTransactions.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.fromCache) return;
        state.list = action.payload.list;
        state.userId = action.payload.userId;
        state.fetchedAt = Date.now();
      })
      .addCase(fetchAgentTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default transactionsSlice.reducer;
