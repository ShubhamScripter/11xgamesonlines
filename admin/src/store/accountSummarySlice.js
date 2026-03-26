// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import axios from '../utils/axiosInstance';

// export const fetchAccountSummary = createAsyncThunk(
//   'accountSummary/fetchAccountSummary',
//   async (userId, { rejectWithValue }) => {
//     try {
//       const { data } = await axios.get(`/users/account-summary/${userId}`);
//       return data.user;
//     } catch (err) {
//       return rejectWithValue(err.response?.data?.error || 'Failed to fetch account summary');
//     }
//   }
// );

// const accountSummarySlice = createSlice({
//   name: 'accountSummary',
//   initialState: {
//     summary: null,
//     loading: false,
//     error: null,
//   },
//   reducers: {},
//   extraReducers: builder => {
//     builder
//       .addCase(fetchAccountSummary.pending, state => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchAccountSummary.fulfilled, (state, action) => {
//         state.summary = action.payload;
//         state.loading = false;
//       })
//       .addCase(fetchAccountSummary.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       });
//   }
// });

// export default accountSummarySlice.reducer;

// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import axios from '../utils/axiosInstance';

// // POST request with userId in the body
// export const fetchAccountSummary = createAsyncThunk(
//   'accountSummary/fetchAccountSummary',
//   async (userId, { rejectWithValue }) => {
//     try {
//       // Post body is { userId: ... }
//       const { data } = await axios.post(
//         '/users/account-summary',   // or your actual route
//         { userId }
//       );
//       // The API returns { success, message, data: {...} }
//       return data.data;
//     } catch (err) {
//       return rejectWithValue(
//         err.response?.data?.error || 'Failed to fetch account summary'
//       );
//     }
//   }
// );

// const accountSummarySlice = createSlice({
//   name: 'accountSummary',
//   initialState: {
//     summary: null,
//     loading: false,
//     error: null,
//   },
//   reducers: {},
//   extraReducers: builder => {
//     builder
//       .addCase(fetchAccountSummary.pending, state => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchAccountSummary.fulfilled, (state, action) => {
//         state.summary = action.payload; // full `data` object
//         state.loading = false;
//       })
//       .addCase(fetchAccountSummary.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       });
//   },
// });

// export default accountSummarySlice.reducer;

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../utils/axiosInstance';

// Fetch full profile data including balance
export const fetchAccountSummary = createAsyncThunk(
  'accountSummary/fetchAccountSummary',
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await axios.post('/sub-admin/profile-data', { userId });
      if (data.success) {
        return data.data; // full profile object
      }
      console.log("data.data",data.data)
      return rejectWithValue(data.message || 'Failed to fetch profile');
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || 'Failed to fetch profile'
      );
    }
  }
);

const accountSummarySlice = createSlice({
  name: 'accountSummary',
  initialState: {
    summary: null,   // full profile data
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccountSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccountSummary.fulfilled, (state, action) => {
        state.summary = action.payload;
        state.loading = false;
      })
      .addCase(fetchAccountSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default accountSummarySlice.reducer;
