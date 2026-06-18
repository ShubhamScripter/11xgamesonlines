// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import axios from '../utils/axiosInstance';

// export const fetchActivityLogs = createAsyncThunk(
//   'activityLog/fetchActivityLogs',
//   async (userId, { rejectWithValue }) => {
//     try {
//       const { data } = await axios.get(`/users/${userId}/login-logs`);
//       return data.logs || [];
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.error || 'Failed to fetch logs');
//     }
//   }
// );

// const activityLogSlice = createSlice({
//   name: 'activityLog',
//   initialState: {
//     logs: [],
//     loading: false,
//     error: null,
//   },
//   reducers: {},
//   extraReducers: builder => {
//     builder
//       .addCase(fetchActivityLogs.pending, state => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchActivityLogs.fulfilled, (state, action) => {
//         state.logs = action.payload;
//         state.loading = false;
//       })
//       .addCase(fetchActivityLogs.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       });
//   }
// });

// export default activityLogSlice.reducer;

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../utils/axiosInstance';

const CACHE_MS = 2 * 60 * 1000;

export const fetchActivityLogs = createAsyncThunk(
  'activityLog/fetchActivityLogs',
  async (userId, { getState, rejectWithValue }) => {
    const { userId: cachedId, logs, fetchedAt } = getState().activityLog;
    if (
      cachedId === userId &&
      fetchedAt &&
      Date.now() - fetchedAt < CACHE_MS
    ) {
      return { logs, userId, fromCache: true };
    }

    try {
      const { data } = await axiosInstance.get(`/get/login-history/${userId}`);
      return { logs: data.data || [], userId, fromCache: false };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to fetch logs'
      );
    }
  }
);

const activityLogSlice = createSlice({
  name: 'activityLog',
  initialState: {
    logs: [],
    userId: null,
    fetchedAt: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchActivityLogs.pending, (state, action) => {
        const reqId = action.meta.arg;
        if (state.userId !== reqId) {
          state.logs = [];
          state.fetchedAt = null;
        }
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivityLogs.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.fromCache) return;
        if (state.userId && state.userId !== action.payload.userId) return;
        state.logs = action.payload.logs;
        state.userId = action.payload.userId;
        state.fetchedAt = Date.now();
      })
      .addCase(fetchActivityLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default activityLogSlice.reducer;
