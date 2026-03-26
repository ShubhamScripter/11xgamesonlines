// src/store/transactionsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../utils/axiosInstance";

// thunk
export const fetchAgentTransactions = createAsyncThunk(
  "transactions/fetchAgentTransactions",
  async (userId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const { data } = await axiosInstance.post(
        "/get/agent-own-trantionhistory",
        { id: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data.data; // array of transactions
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || err.message || "Failed to fetch transactions"
      );
    }
  }
);

const transactionsSlice = createSlice({
  name: "transactions",
  initialState: { list: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAgentTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAgentTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchAgentTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default transactionsSlice.reducer;
