import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import axios from "axios";
import api from "../../utils/axiosConfig"; // Adjust the import based on your project structure

const normalizeTennisMatches = (matches) => {
  if (!Array.isArray(matches)) return [];
  return matches.map((m) => ({
    ...m,
    // League/group title for UI grouping (Tennis.jsx groups by `match.title`)
    title: m?.title ?? m?.cname ?? m?.leagueName ?? m?.competition ?? "Unknown League",
    id: m?.id ?? m?.gmid ?? m?.eventId ?? m?.gameId,
    match: m?.match ?? m?.ename ?? m?.eventName ?? m?.name ?? "",
    inplay: m?.inplay ?? m?.iplay ?? false,
    date: m?.date ?? m?.stime ?? m?.startTime ?? m?.start_date ?? null,
  }));
};

export const fetchTennisData = createAsyncThunk(
  "tennis/fetchTennisData",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/tennis");
      const list = response.data.matches ?? response.data.data ?? [];
      return normalizeTennisMatches(list);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch matches"
      );
    }
  }
);

export const fetchTennisInplayData = createAsyncThunk(
  "tennis/fetchTennisInplayData",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/tennis");
      const list = response.data.matches ?? response.data.data ?? [];
      return normalizeTennisMatches(list);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch in-play matches"
      );
    }
  }
);

export const fetchTannisBatingData = createAsyncThunk(
  "cricket/fetchTannisBatingData",
  async (gameid, { rejectWithValue }) => {
    try {
      const response = await api.get(`/tannis/betting?gameid=${gameid}`); // Your backend API
      const data = response.data?.data;
      // API may return { data: [...] } or { data: { data: [...] } } or { data: { result: [...] } }
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.result)
        ? data.result
        : [];
      return list;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch matches"
      );
    }
  }
);

// Create the slice
const tennisSlice = createSlice({
  name: "tennis",
  initialState: {
    data: [],
    inplayData: [],
    battingData: [],
    loading: false,
    tesnnisError: null,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTennisData.pending, (state) => {
        state.loading = true;
        state.tesnnisError = null;
      })
      .addCase(fetchTennisData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchTennisData.rejected, (state, action) => {
        state.loading = false;
        state.tesnnisError = action.error.message;
      })
      .addCase(fetchTennisInplayData.pending, (state) => {
        state.loading = true;
        state.tesnnisError = null;
      })
      .addCase(fetchTennisInplayData.fulfilled, (state, action) => {
        state.loading = false;
        state.inplayData = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchTennisInplayData.rejected, (state, action) => {
        state.loading = false;
        state.tesnnisError = action.payload;
      })
      .addCase(fetchTannisBatingData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTannisBatingData.fulfilled, (state, action) => {
        state.loading = false;
        state.battingData = Array.isArray(action.payload) ? action.payload : [];
      })
      // .addCase(fetchTannisBatingData.fulfilled, (state, action) => {
      //   state.loading = false;
      //   state.battingData = action.payload;        // use the array returned by the thunk
      // })
      .addCase(fetchTannisBatingData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default tennisSlice.reducer;
