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

// pass userId as the argument to fetchActivityLogs(userId)
export const fetchActivityLogs = createAsyncThunk(
  'activityLog/fetchActivityLogs',
  async (userId, { rejectWithValue }) => {
    try {
      // Only the relative path is needed
      const { data } = await axiosInstance.get(`/get/login-history/${userId}`, { userId });
      return data.data || [];
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
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchActivityLogs.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivityLogs.fulfilled, (state, action) => {
        state.logs = action.payload;
        state.loading = false;
      })
      .addCase(fetchActivityLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default activityLogSlice.reducer;
