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
    beventId: m?.beventId ?? m?.bevent_id ?? null,
    match: m?.match ?? m?.ename ?? m?.eventName ?? m?.name ?? "",
    inplay: m?.inplay ?? m?.iplay ?? false,
    date: m?.date ?? m?.stime ?? m?.startTime ?? m?.start_date ?? null,
  }));
};

let soccerMatchesPromise = null;

export const fetchSoccerData = createAsyncThunk(
  "soccer/fetchSoccerData",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const existing = state?.soccer?.soccerData;
      if (Array.isArray(existing) && existing.length > 0) {
        return existing;
      }

      if (soccerMatchesPromise) {
        return await soccerMatchesPromise;
      }

      soccerMatchesPromise = api
        .get("/soccer")
        .then((response) => normalizeSoccerMatches(response.data.matches ?? response.data.data ?? []));

      const result = await soccerMatchesPromise;
      return result;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch matches"
      );
    } finally {
      soccerMatchesPromise = null;
    }
  }
);
export const fetchSoccerInplayData = createAsyncThunk(
  "soccer/fetchSoccerInplayData",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const inplayExisting = state?.soccer?.soccerInplayData;
      if (Array.isArray(inplayExisting) && inplayExisting.length > 0) {
        return inplayExisting;
      }

      const matchesExisting = state?.soccer?.soccerData;
      if (Array.isArray(matchesExisting) && matchesExisting.length > 0) {
        return matchesExisting.filter((m) => m?.inplay === true || m?.iplay === true);
      }

      if (soccerMatchesPromise) {
        const matches = await soccerMatchesPromise;
        return matches.filter((m) => m?.inplay === true || m?.iplay === true);
      }

      soccerMatchesPromise = api
        .get("/soccer")
        .then((response) => normalizeSoccerMatches(response.data.matches ?? response.data.data ?? []));

      const matches = await soccerMatchesPromise;
      return matches.filter((m) => m?.inplay === true || m?.iplay === true);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch in-play matches"
      );
    } finally {
      soccerMatchesPromise = null;
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
        if (!state.soccerData.length) state.soccerLoading = true;
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
