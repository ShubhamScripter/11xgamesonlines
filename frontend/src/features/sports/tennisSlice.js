import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/axiosConfig";
import {
  applySportListPayload,
  packSportFetchResult,
} from "../../utils/sportListMerge";
import { parseBettingPayload } from "../../utils/bettingPayloadUtils";
import { parseInPlayFlag } from "../../utils/sportMatchFilters";

const normalizeTennisMatches = (matches) => {
  if (!Array.isArray(matches)) return [];
  return matches.map((m) => ({
    ...m,
    title:
      m?.title ??
      m?.cname ??
      m?.leagueName ??
      m?.competition ??
      "Unknown League",
    id: m?.id ?? m?.gmid ?? m?.eventId ?? m?.gameId,
    beventId: m?.beventId ?? m?.bevent_id ?? null,
    match: m?.match ?? m?.ename ?? m?.eventName ?? m?.name ?? "",
    inplay: parseInPlayFlag(m),
    iplay: parseInPlayFlag(m),
    date: m?.date ?? m?.stime ?? m?.startTime ?? m?.start_date ?? null,
  }));
};

let tennisInFlight = new Map();

const trackTennisRequest = (requestKey, promise) => {
  tennisInFlight.set(requestKey, promise);
  promise.finally(() => {
    if (tennisInFlight.get(requestKey) === promise) {
      tennisInFlight.delete(requestKey);
    }
  });
  return promise;
};

export const fetchTennisData = createAsyncThunk(
  "tennis/fetchTennisData",
  async (arg, { rejectWithValue, getState }) => {
    const force = arg?.force === true;
    const withOdds = arg?.withOdds === true;
    const oddsScope = arg?.oddsScope === "eligible" ? "eligible" : "all";
    try {
      const state = getState();
      const existing = state?.tennis?.data;
      const hasOdds = state?.tennis?.matchesHaveOdds === true;
      const scopeOk = state?.tennis?.matchesOddsScope === oddsScope;

      if (!force && Array.isArray(existing) && existing.length > 0) {
        const needOddsFetch = withOdds && (!hasOdds || !scopeOk);
        if (!needOddsFetch) {
          return {
            matches: existing,
            matchesHaveOdds: hasOdds,
            matchesOddsScope: state?.tennis?.matchesOddsScope || null,
          };
        }
      }

      const query = withOdds ? `?withOdds=true&oddsScope=${oddsScope}` : "";
      const requestKey = withOdds ? `odds-${oddsScope}` : "list";

      if (tennisInFlight.has(requestKey)) {
        const result = await tennisInFlight.get(requestKey);
        const matches = Array.isArray(result) ? result : result?.matches ?? [];
        return packSportFetchResult(matches, withOdds ? oddsScope : null);
      }

      const promise = api
        .get(`/tennis${query}`)
        .then((response) =>
          normalizeTennisMatches(
            response.data.matches ?? response.data.data ?? []
          )
        );
      trackTennisRequest(requestKey, promise);

      const result = await promise;
      return packSportFetchResult(result, withOdds ? oddsScope : null);
    } catch (error) {
      if (withOdds) {
        try {
          const response = await api.get("/tennis");
          const matches = normalizeTennisMatches(
            response.data.matches ?? response.data.data ?? []
          );
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
    }
  }
);

export const fetchTennisInplayData = createAsyncThunk(
  "tennis/fetchTennisInplayData",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const inplayExisting = state?.tennis?.inplayData;
      if (Array.isArray(inplayExisting) && inplayExisting.length > 0) {
        return inplayExisting;
      }

      const matchesExisting = state?.tennis?.data;
      if (Array.isArray(matchesExisting) && matchesExisting.length > 0) {
        return matchesExisting.filter(
          (m) => m?.inplay === true || m?.iplay === true
        );
      }

      if (tennisInFlight.has('list')) {
        const matches = await tennisInFlight.get('list');
        const list = Array.isArray(matches) ? matches : matches?.matches ?? [];
        return list.filter((m) => m?.inplay === true || m?.iplay === true);
      }

      const promise = api
        .get("/tennis")
        .then((response) =>
          normalizeTennisMatches(
            response.data.matches ?? response.data.data ?? []
          )
        );
      trackTennisRequest('list', promise);

      const matches = await promise;
      return matches.filter((m) => m?.inplay === true || m?.iplay === true);
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
      const response = await api.get(`/tannis/betting?gameid=${gameid}`);
      return parseBettingPayload(response.data);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch matches"
      );
    }
  }
);

const tennisSlice = createSlice({
  name: "tennis",
  initialState: {
    data: [],
    inplayData: [],
    battingData: [],
    premiumFancyData: [],
    providerCGameId: null,
    matchesHaveOdds: false,
    matchesOddsScope: null,
    loading: false,
    tesnnisError: null,
    error: null,
  },
  reducers: {
    hydrateTennisList(state, action) {
      const { matches, matchesHaveOdds, matchesOddsScope } = action.payload || {};
      if (!Array.isArray(matches) || matches.length === 0) return;
      state.data = matches;
      state.matchesHaveOdds = Boolean(matchesHaveOdds);
      state.matchesOddsScope = matchesOddsScope ?? null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTennisData.pending, (state) => {
        if (!state.data.length) state.loading = true;
        state.tesnnisError = null;
      })
      .addCase(fetchTennisData.fulfilled, (state, action) => {
        state.loading = false;
        applySportListPayload(state, action.payload, "data");
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
        state.battingData = action.payload?.markets ?? [];
        state.premiumFancyData = action.payload?.premiumFancy ?? [];
        state.providerCGameId = action.payload?.providerCGameId ?? null;
      })
      .addCase(fetchTannisBatingData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default tennisSlice.reducer;
export const { hydrateTennisList } = tennisSlice.actions;
