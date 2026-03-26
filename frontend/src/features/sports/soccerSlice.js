import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import axios from "axios";
import api from "../../utils/axiosConfig"; // Adjust the import based on your project structure

const normalizeSoccerMatches = (matches) => {
  if (!Array.isArray(matches)) return [];
  return matches.map((m) => ({
    ...m,
    // League/group title for UI grouping (Soccer.jsx groups by `match.title`)
    title: m?.title ?? m?.cname ?? m?.leagueName ?? m?.competition ?? "Unknown League",
    id: m?.id ?? m?.gmid ?? m?.eventId ?? m?.gameId,
    match: m?.match ?? m?.ename ?? m?.eventName ?? m?.name ?? "",
    inplay: m?.inplay ?? m?.iplay ?? false,
    date: m?.date ?? m?.stime ?? m?.startTime ?? m?.start_date ?? null,
  }));
};

export const fetchSoccerData = createAsyncThunk(
  "soccer/fetchSoccerData",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/soccer");
      const list = response.data.matches ?? response.data.data ?? [];
      return normalizeSoccerMatches(list);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch matches"
      );
    }
  }
);
export const fetchSoccerInplayData = createAsyncThunk(
  "soccer/fetchSoccerInplayData",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/soccer");
      const list = response.data.matches ?? response.data.data ?? [];
      return normalizeSoccerMatches(list);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch in-play matches"
      );
    }
  }
);
export const fetchSoccerBatingData = createAsyncThunk(
  "cricket/fetchSoccerBatingData",
  async (gameid, { rejectWithValue }) => {
    try {
      const response = await api.get(`/soccer/betting?gameid=${gameid}`);
      const data = response.data?.data;
      // API may return { data: [...] } or { data: { data: [...] } } or { data: { result: [...] } }
      const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : Array.isArray(data?.result) ? data.result : [];
      return list;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch matches"
      );
    }
  }
);


// Create the slice
const soccerSlice = createSlice({
  name: "soccer",
  initialState: {
    soccerLoading: null,
    soccerError: null,
    soccerData: [],
    soccerInplayData: [],
    battingData: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSoccerData.pending, (state) => {
        state.soccerLoading = true;
        state.soccerError = null;
      })
      .addCase(fetchSoccerData.fulfilled, (state, action) => {
        state.soccerLoading = false;
        state.soccerData = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchSoccerData.rejected, (state, action) => {
        state.soccerLoading = false;
        state.soccerError = action.error.message;
      })
      .addCase(fetchSoccerInplayData.pending, (state) => {
        state.soccerLoading = true;
        state.soccerError = null;
      })
      .addCase(fetchSoccerInplayData.fulfilled, (state, action) => {
        state.soccerLoading = false;
        state.soccerInplayData = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchSoccerInplayData.rejected, (state, action) => {
        state.soccerLoading = false;
        state.soccerError = action.payload;
      })
      .addCase(fetchSoccerBatingData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSoccerBatingData.fulfilled, (state, action) => {
        state.loading = false;
        state.battingData = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchSoccerBatingData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default soccerSlice.reducer;
