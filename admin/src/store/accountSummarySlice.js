import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../utils/axiosInstance';

const CACHE_MS = 25_000;
const inflightByUserId = new Map();

/**
 * Lightweight header/banking balance fetch with in-flight dedupe + short TTL.
 * Use force: true after transfers / manual refresh.
 */
export const fetchAccountSummary = createAsyncThunk(
  'accountSummary/fetchAccountSummary',
  async (arg, { getState, rejectWithValue }) => {
    const userId = typeof arg === 'object' && arg !== null ? arg.userId : arg;
    const force = typeof arg === 'object' && arg !== null ? Boolean(arg.force) : false;

    if (!userId) {
      return rejectWithValue('User ID is required');
    }

    const state = getState().accountSummary;
    if (
      !force &&
      state.summary &&
      state.userId === userId &&
      state.fetchedAt &&
      Date.now() - state.fetchedAt < CACHE_MS
    ) {
      return { userId, summary: state.summary, fromCache: true };
    }

    if (!force && inflightByUserId.has(userId)) {
      try {
        const summary = await inflightByUserId.get(userId);
        return { userId, summary, fromCache: false };
      } catch (err) {
        return rejectWithValue(
          err?.response?.data?.error || err?.message || 'Failed to fetch profile'
        );
      }
    }

    const request = axios
      .post('/sub-admin/profile-light', { userId })
      .then(({ data }) => {
        if (data.success) return data.data;
        throw new Error(data.message || 'Failed to fetch profile');
      })
      .finally(() => {
        inflightByUserId.delete(userId);
      });

    inflightByUserId.set(userId, request);

    try {
      const summary = await request;
      return { userId, summary, fromCache: false };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || err.message || 'Failed to fetch profile'
      );
    }
  }
);

const accountSummarySlice = createSlice({
  name: 'accountSummary',
  initialState: {
    userId: null,
    summary: null,
    fetchedAt: null,
    loading: false,
    error: null,
  },
  reducers: {
    invalidateAccountSummary: (state) => {
      state.fetchedAt = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccountSummary.pending, (state, action) => {
        const arg = action.meta.arg;
        const userId = typeof arg === 'object' && arg !== null ? arg.userId : arg;
        if (state.userId !== userId || !state.summary) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchAccountSummary.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.fromCache) return;
        state.userId = action.payload.userId;
        state.summary = action.payload.summary;
        state.fetchedAt = Date.now();
      })
      .addCase(fetchAccountSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { invalidateAccountSummary } = accountSummarySlice.actions;
export default accountSummarySlice.reducer;
