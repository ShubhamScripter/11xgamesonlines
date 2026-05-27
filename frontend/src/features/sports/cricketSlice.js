import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import api from "../../utils/axiosConfig";

// Async thunk to fetch cricket data

const normalizeCricketMatches = (matches) => {
  if (!Array.isArray(matches)) return [];
  return matches.map((m) => ({
    ...m,
    // League/group title for UI grouping (Cricket.jsx groups by `match.title`)
    title: m?.title ?? m?.cname ?? m?.leagueName ?? m?.competition ?? "Unknown League",
    // Ensure the UI has a stable id/match name (Cricket.jsx uses `match.id` and `match.match`)
    id: m?.id ?? m?.gmid ?? m?.eventId ?? m?.gameId,
    match: m?.match ?? m?.ename ?? m?.eventName ?? m?.name ?? "",
    // Normalize inplay flag naming
    inplay: m?.inplay ?? m?.iplay ?? false,
    // Normalize date string field for Today/Tomorrow filtering (Cricket.jsx uses `match.date`)
    date: m?.date ?? m?.stime ?? m?.startTime ?? m?.start_date ?? null,
  }));
};

let cricketMatchesPromise = null;

export const fetchCricketData = createAsyncThunk(
  "cricket/fetchCricketData",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const existing = state?.cricket?.matches;
      if (Array.isArray(existing) && existing.length > 0) {
        return existing;
      }

      if (cricketMatchesPromise) {
        return await cricketMatchesPromise;
      }

      cricketMatchesPromise = api
        .get("/cricket/matches")
        .then((response) => normalizeCricketMatches(response.data.matches));

      const result = await cricketMatchesPromise;
      return result;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch matches"
      );
    } finally {
      cricketMatchesPromise = null;
    }
  }
);

export const fetchCricketInplayData = createAsyncThunk(
  "cricket/fetchCricketInplayData",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const inplayExisting = state?.cricket?.inplayMatches;
      if (Array.isArray(inplayExisting) && inplayExisting.length > 0) {
        return inplayExisting;
      }

      const matchesExisting = state?.cricket?.matches;
      if (Array.isArray(matchesExisting) && matchesExisting.length > 0) {
        return matchesExisting.filter((m) => m?.inplay === true);
      }

      // If another component already started the cricket fetch, reuse it.
      if (cricketMatchesPromise) {
        const matches = await cricketMatchesPromise;
        return matches.filter((m) => m?.inplay === true);
      }

      cricketMatchesPromise = api
        .get("/cricket/matches")
        .then((response) => normalizeCricketMatches(response.data.matches));

      const matches = await cricketMatchesPromise;
      return matches.filter((m) => m?.inplay === true);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch in-play matches"
      );
    } finally {
      cricketMatchesPromise = null;
    }
  }
);

const normalizeBettingMarkets = (payload) => {
  const data = payload?.data ?? payload;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.result)) return data.result;
  return [];
};

export const fetchCricketBatingData = createAsyncThunk(
  "cricket/fetchCricketBatingData",
  async (gameid, { rejectWithValue }) => {
    try {
      const response = await api.get(`/cricket/betting?gameid=${gameid}`);
      return normalizeBettingMarkets(response.data);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch matches"
      );
    }
  }
);

// Slice
const cricketSlice = createSlice({
  name: "cricket",
  initialState: {
    matches: [],
    inplayMatches: [],
    battingData: [],
    loader: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCricketData.pending, (state) => {
        state.loader = true;
        state.error = null;
      })
      .addCase(fetchCricketData.fulfilled, (state, action) => {
        state.loader = false;
        state.matches = action.payload;
      })
      .addCase(fetchCricketData.rejected, (state, action) => {
        state.loader = false;
        state.error = action.payload;
      })
      .addCase(fetchCricketInplayData.pending, (state) => {
        state.loader = true;
        state.error = null;
      })
      .addCase(fetchCricketInplayData.fulfilled, (state, action) => {
        state.loader = false;
        state.inplayMatches = action.payload;
      })
      .addCase(fetchCricketInplayData.rejected, (state, action) => {
        state.loader = false;
        state.error = action.payload;
      })
      .addCase(fetchCricketBatingData.fulfilled, (state, action) => {
        state.battingData = action.payload;
        state.error = null;
      })
      .addCase(fetchCricketBatingData.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default cricketSlice.reducer;
