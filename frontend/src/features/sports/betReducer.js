import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/axiosConfig";
import {
  normalizeBetPlacementRejectPayload,
  showBetPlacementErrorToast,
} from "../../utils/bettingApiErrors";

// Async thunk to place a bet
export const createBet = createAsyncThunk(
  "bet/create",
  async (formData, { rejectWithValue }) => {
    // Helper function to simulate a delay
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    try {
      // Simulate a 5-second loading delay
      // await delay(3000);

      // Make the API request
      const response = await api.post("/user/place-bet", formData, {
        withCredentials: true,
      });

      // Return the response data
      return response.data; // directly return { message, bet }
    } catch (error) {
      const payload = normalizeBetPlacementRejectPayload(error);
      showBetPlacementErrorToast(payload.message);
      return rejectWithValue(payload);
    }
  }
);
// Async thunk to place a bet
export const getPendingBet = createAsyncThunk(
  "bet/getPendingBet",
  async (gameId, { rejectWithValue }) => {
    // console.log("eventName", gameId);
    try {
      const response = await api.get(`/user/pending-bet?gameId=${gameId}`, {
        withCredentials: true,
      });
      // console.log("response", response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Something went wrong" }
      );
    }
  }
);
export const getPendingBetAmo = createAsyncThunk(
  "bet/getPendingBetAmo",
  async (gameId, { rejectWithValue }) => {
    // console.log("getPendingBetAmo", gameId);
    try {
      const response = await api.get(`/user/pending-bet/amounts?gameId=${gameId}`, {
        withCredentials: true,
      });
      // console.log("response", response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Something went wrong" }
      );
    }
  }
);
export const getProLoss = createAsyncThunk(
  "bet/getProLoss",
  async ({ startDate, endDate, limit, page, gameName, eventName, marketName }, { rejectWithValue }) => {
    // console.log("eventName", gameId);
    try {

      let query = `page=${page}&limit=${limit}`;
      if (startDate && endDate) {
        query += `&startDate=${startDate}&endDate=${endDate}`;
      }
      if (gameName) {
        query += `&gameName=${gameName}`;
      }

      if (eventName) {
        query += `&eventName=${eventName}`;
      }

      if (marketName) {
        query += `&marketName=${marketName}`;
      }

      const response = await api.get(`/user/profit-loss/history?${query}`, {
        withCredentials: true,
      });
      // console.log("response", response)
      // console.log("response", response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Something went wrong" }
      );
    }
  }
);

export const createfancyBet = createAsyncThunk(
  "bet/create-fancy-bet",
  async (formData, { rejectWithValue }) => {
    // console.log("formData", formData);
    try {
      const response = await api.post("/user/place-fancy-bet", formData, {
        withCredentials: true,
      });
      return response.data; // directly return { message, bet }
    } catch (error) {
      const payload = normalizeBetPlacementRejectPayload(error);
      showBetPlacementErrorToast(payload.message);
      return rejectWithValue(payload);
    }
  }
);


export const getBetHistory = createAsyncThunk(
  "bet/getBetHistory",
  async ({ page = 1, limit, startDate, endDate, selectedGame, selectedVoid }, { rejectWithValue }) => {
    try {
      let query = `?page=${page}&limit=${limit}`;
      if (startDate && endDate) {
        query += `&startDate=${startDate}&endDate=${endDate}`;
      }
      if (selectedGame != null && selectedGame !== '') {
        query += `&selectedGame=${encodeURIComponent(selectedGame)}`;
      }
      if (selectedVoid) {
        query += `&selectedVoid=${encodeURIComponent(selectedVoid)}`;
      }

      const response = await api.get(`/user/bet/history${query}`, {
        withCredentials: true,
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Something went wrong" }
      );
    }
  }
);

// Async thunk to get current bet count
export const getCurrentBetCount = createAsyncThunk(
  "bet/getCurrentBetCount",
  async (_, { rejectWithValue }) => {
    try {
      const currentDate = new Date();
      const startDate = currentDate.toISOString().split('T')[0];
      const endDate = currentDate.toISOString().split('T')[0];
      
      const query = `?page=1&limit=1000&selectedVoid=unsettel`;
      
      const response = await api.get(`/user/bet/history${query}`, {
        withCredentials: true,
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Something went wrong" }
      );
    }
  }
);
export const getTransactionHistory = createAsyncThunk(
  "bet/getTransHistory",
  async ({ startDate, endDate, page, limit }, { rejectWithValue }) => {
    try {
      // let query = `?&selectedVoid=${selectedVoid}`;

      if (startDate && endDate) {
        var query = `?startDate=${startDate}&endDate=${endDate}&page=${page}&limit=${limit}`;
      }

      const response = await api.get(`/user/transactions-hisrtory${query}`, {
        withCredentials: true,
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Something went wrong" }
      );
    }
  }
);

// Initial state
const initialState = {
  loading: false,
  errorMessage: "",
  successMessage: "",
  eventName: [],
  pendingBet: [],
  betHistory: [],
  betHistoryPagination: { total: 0, page: 1, pages: 1 },
  transHistory: [],
  proLossHistory: [],
  currentBetCount: 0,
};

// Slice
const betSlice = createSlice({
  name: "bet",
  initialState,
  reducers: {
    messageClear: (state) => {
      state.errorMessage = "";
      state.successMessage = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createBet.pending, (state) => {
        state.loading = true;
        state.errorMessage = "";
        state.successMessage = "";
      })
      .addCase(createBet.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.pendingBet = payload?.bet;
        state.successMessage = payload?.message;
      })
      .addCase(createBet.rejected, (state, { payload }) => {
        state.loading = false;
        state.errorMessage = payload?.message || "Something went wrong";
      })
      .addCase(getPendingBet.pending, (state) => {
        state.loading = true;
        state.errorMessage = "";
      })
      .addCase(getPendingBet.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.eventName = payload?.data;
      })
      .addCase(getPendingBet.rejected, (state) => {
        state.loading = false;
      })
      .addCase(getPendingBetAmo.pending, (state) => {
        state.loading = true;
        state.errorMessage = "";
      })
      .addCase(getPendingBetAmo.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.pendingBet = payload?.data;
      })
      .addCase(getPendingBetAmo.rejected, (state) => {
        state.loading = false;
      })
      .addCase(getBetHistory.pending, (state) => {
        state.loading = true;
        state.errorMessage = "";
        state.successMessage = "";
      })
      .addCase(getBetHistory.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.betHistory = payload?.data ?? [];
        state.betHistoryPagination = payload?.pagination ?? {
          total: 0,
          page: 1,
          pages: 1,
        };
        state.successMessage = payload?.message;
      })
      .addCase(getBetHistory.rejected, (state, { payload }) => {
        state.loading = false;
        state.errorMessage =
          payload?.message ||
          payload?.error ||
          (typeof payload === 'string' ? payload : 'Something went wrong');
      })
      .addCase(getTransactionHistory.pending, (state) => {
        state.loading = true;
        state.errorMessage = "";
        state.successMessage = "";
      })
      .addCase(getTransactionHistory.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.transHistory = payload?.data;
        state.successMessage = payload?.message;
      })
      .addCase(getTransactionHistory.rejected, (state, { payload }) => {
        state.loading = false;
        state.errorMessage = payload?.message || "Something went wrong";
      })
      .addCase(getProLoss.pending, (state) => {
        state.loading = true;
        state.errorMessage = "";
        state.successMessage = "";
      })
      .addCase(getProLoss.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.proLossHistory = payload.data.report;
        // console.log("payload", payload.data)
        state.successMessage = payload?.message;
      })
      .addCase(getProLoss.rejected, (state, { payload }) => {
        state.loading = false;
        state.errorMessage = payload?.message || "Something went wrong";
      })
      .addCase(createfancyBet.pending, (state) => {
        state.loading = true;
        state.errorMessage = "";
        state.successMessage = "";
      })
      .addCase(createfancyBet.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.pendingBet = payload?.bet;
        state.successMessage = payload?.message;
      })
      .addCase(createfancyBet.rejected, (state, { payload }) => {
        state.loading = false;
        state.errorMessage =
          typeof payload === 'string'
            ? payload
            : payload?.message || 'Something went wrong';
      })
      .addCase(getCurrentBetCount.pending, (state) => {
        state.loading = true;
        state.errorMessage = "";
        state.successMessage = "";
      })
      .addCase(getCurrentBetCount.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.currentBetCount = payload?.data?.length || 0;
        state.successMessage = payload?.message;
      })
      .addCase(getCurrentBetCount.rejected, (state, { payload }) => {
        state.loading = false;
        state.errorMessage = payload?.message || "Something went wrong";
        state.currentBetCount = 0;
      })
  },
});

export const { messageClear } = betSlice.actions;
export default betSlice.reducer;
