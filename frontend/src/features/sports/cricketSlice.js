import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/axiosConfig";
import {
  applySportListPayload,
  packSportFetchResult,
} from "../../utils/sportListMerge";
import { parseInPlayFlag } from "../../utils/sportMatchFilters";
import { parseBettingPayload } from "../../utils/bettingPayloadUtils";

const normalizeCricketMatches = (matches) => {
  if (!Array.isArray(matches)) return [];
  return matches.map((m) => ({
    ...m,
    title:
      m?.title ?? m?.cname ?? m?.leagueName ?? m?.competition ?? "Unknown League",
    id: m?.id ?? m?.gmid ?? m?.eventId ?? m?.gameId,
    match: m?.match ?? m?.ename ?? m?.eventName ?? m?.name ?? "",
    inplay: parseInPlayFlag(m),
    iplay: parseInPlayFlag(m),
    date: m?.date ?? m?.stime ?? m?.startTime ?? m?.start_date ?? null,
  }));
};

let cricketMatchesPromise = null;

export const fetchCricketData = createAsyncThunk(
  "cricket/fetchCricketData",
  async (arg, { rejectWithValue, getState }) => {
    const force = arg?.force === true;
    const withOdds = arg?.withOdds === true;
    const oddsScope = arg?.oddsScope === "eligible" ? "eligible" : "all";
    try {
      const state = getState();
      const existing = state?.cricket?.matches;
      const hasOdds = state?.cricket?.matchesHaveOdds === true;
      const scopeOk = state?.cricket?.matchesOddsScope === oddsScope;

      if (!force && Array.isArray(existing) && existing.length > 0) {
        const needOddsFetch = withOdds && (!hasOdds || !scopeOk);
        if (!needOddsFetch) {
          return {
            matches: existing,
            matchesHaveOdds: hasOdds,
            matchesOddsScope: state?.cricket?.matchesOddsScope || null,
          };
        }
      }

      const query = withOdds ? `?withOdds=true&oddsScope=${oddsScope}` : "";
      const requestKey = withOdds ? `odds-${oddsScope}` : "list";

      if (cricketMatchesPromise?.key === requestKey) {
        const result = await cricketMatchesPromise.promise;
        const matches = Array.isArray(result) ? result : result?.matches ?? [];
        return packSportFetchResult(matches, withOdds ? oddsScope : null);
      }

      cricketMatchesPromise = {
        key: requestKey,
        promise: api
          .get(`/cricket/matches${query}`)
          .then((response) => normalizeCricketMatches(response.data.matches)),
      };

      const result = await cricketMatchesPromise.promise;
      return packSportFetchResult(result, withOdds ? oddsScope : null);
    } catch (error) {
      if (withOdds) {
        try {
          const response = await api.get("/cricket/matches");
          const matches = normalizeCricketMatches(response.data.matches);
          if (matches.length > 0) {
            return {
              matches,
              matchesHaveOdds: false,
              matchesOddsScope: null,
            };
          }
        } catch {
          // fall through
        }
      }
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

      if (cricketMatchesPromise?.promise) {
        const matches = await cricketMatchesPromise.promise;
        const list = Array.isArray(matches) ? matches : matches?.matches ?? [];
        return list.filter((m) => m?.inplay === true);
      }

      cricketMatchesPromise = {
        key: "list",
        promise: api
          .get("/cricket/matches")
          .then((response) => normalizeCricketMatches(response.data.matches)),
      };

      const matches = await cricketMatchesPromise.promise;
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
  const parsed = parseBettingPayload(payload);
  return parsed.markets ?? [];
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

export const fetchCricketPremiumFancy = createAsyncThunk(
  "cricket/fetchCricketPremiumFancy",
  async (gameid, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/cricket/premium-fancy?gameid=${gameid}`
      );
      const data = response.data?.data ?? response.data ?? {};
      return {
        premiumFancy: Array.isArray(data.premiumFancy) ? data.premiumFancy : [],
        providerCGameId: data.providerCGameId ?? String(gameid),
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch premium fancy"
      );
    }
  }
);

const cricketSlice = createSlice({
  name: "cricket",
  initialState: {
    matches: [],
    inplayMatches: [],
    battingData: [],
    premiumFancyData: [],
    providerCGameId: null,
    matchesHaveOdds: false,
    matchesOddsScope: null,
    loader: false,
    error: null,
  },
  reducers: {
    hydrateCricketList(state, action) {
      const { matches, matchesHaveOdds, matchesOddsScope } = action.payload || {};
      if (!Array.isArray(matches) || matches.length === 0) return;
      state.matches = matches;
      state.matchesHaveOdds = Boolean(matchesHaveOdds);
      state.matchesOddsScope = matchesOddsScope ?? null;
      state.loader = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCricketData.pending, (state) => {
        if (!state.matches.length) state.loader = true;
        state.error = null;
      })
      .addCase(fetchCricketData.fulfilled, (state, action) => {
        state.loader = false;
        applySportListPayload(state, action.payload, "matches");
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
        state.battingData = Array.isArray(action.payload) ? action.payload : [];
        state.error = null;
      })
      .addCase(fetchCricketBatingData.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(fetchCricketPremiumFancy.fulfilled, (state, action) => {
        state.premiumFancyData = action.payload?.premiumFancy ?? [];
        state.providerCGameId = action.payload?.providerCGameId ?? null;
      });
  },
});

export default cricketSlice.reducer;
export const { hydrateCricketList } = cricketSlice.actions;
