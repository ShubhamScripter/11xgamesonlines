import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/axiosConfig";
import { parseInPlayFlag } from "../../utils/sportMatchFilters";
import {
  applySportListPayload,
  packSportFetchResult,
} from "../../utils/sportListMerge";
import { patchMatchesWithOddsUpdates } from "../../utils/listOddsSocketPatch";
import { parseBettingPayload } from "../../utils/bettingPayloadUtils";
import { normalizeBettingThunkError } from "../../utils/bettingApiErrors";

const normalizeSoccerMatches = (matches) => {
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

let soccerInFlight = new Map();

const trackSoccerRequest = (requestKey, promise) => {
  soccerInFlight.set(requestKey, promise);
  promise.finally(() => {
    if (soccerInFlight.get(requestKey) === promise) {
      soccerInFlight.delete(requestKey);
    }
  });
  return promise;
};

export const fetchSoccerData = createAsyncThunk(
  "soccer/fetchSoccerData",
  async (arg, { rejectWithValue, getState }) => {
    const force = arg?.force === true;
    const withOdds = arg?.withOdds === true;
    const oddsScope = arg?.oddsScope === "eligible" ? "eligible" : "all";
    try {
      const state = getState();
      const existing = state?.soccer?.soccerData;
      const hasOdds = state?.soccer?.matchesHaveOdds === true;
      const scopeOk = state?.soccer?.matchesOddsScope === oddsScope;

      if (!force && Array.isArray(existing) && existing.length > 0) {
        const needOddsFetch = withOdds && (!hasOdds || !scopeOk);
        if (!needOddsFetch) {
          return {
            matches: existing,
            matchesHaveOdds: hasOdds,
            matchesOddsScope: state?.soccer?.matchesOddsScope || null,
          };
        }
      }

      const query = withOdds ? `?withOdds=true&oddsScope=${oddsScope}` : "";
      const requestKey = withOdds ? `odds-${oddsScope}` : "list";

      if (soccerInFlight.has(requestKey)) {
        const result = await soccerInFlight.get(requestKey);
        const matches = Array.isArray(result) ? result : result?.matches ?? [];
        return packSportFetchResult(matches, withOdds ? oddsScope : null);
      }

      const promise = api
        .get(`/soccer${query}`)
        .then((response) =>
          normalizeSoccerMatches(
            response.data.matches ?? response.data.data ?? []
          )
        );
      trackSoccerRequest(requestKey, promise);

      const result = await promise;
      return packSportFetchResult(result, withOdds ? oddsScope : null);
    } catch (error) {
      if (withOdds) {
        try {
          const response = await api.get("/soccer");
          const matches = normalizeSoccerMatches(
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
        return matchesExisting.filter(
          (m) => m?.inplay === true || m?.iplay === true
        );
      }

      if (soccerInFlight.has('list')) {
        const matches = await soccerInFlight.get('list');
        const list = Array.isArray(matches) ? matches : matches?.matches ?? [];
        return list.filter((m) => m?.inplay === true || m?.iplay === true);
      }

      const promise = api
        .get("/soccer")
        .then((response) =>
          normalizeSoccerMatches(
            response.data.matches ?? response.data.data ?? []
          )
        );
      trackSoccerRequest('list', promise);

      const matches = await promise;
      return matches.filter((m) => m?.inplay === true || m?.iplay === true);
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
      return parseBettingPayload(response.data);
    } catch (error) {
      return rejectWithValue(normalizeBettingThunkError(error, gameid));
    }
  }
);

const soccerSlice = createSlice({
  name: "soccer",
  initialState: {
    soccerLoading: null,
    soccerError: null,
    soccerData: [],
    soccerInplayData: [],
    battingData: [],
    premiumFancyData: [],
    providerCGameId: null,
    matchesHaveOdds: false,
    matchesOddsScope: null,
    loading: false,
    error: null,
  },
  reducers: {
    hydrateSoccerList(state, action) {
      const { matches, matchesHaveOdds, matchesOddsScope } = action.payload || {};
      if (!Array.isArray(matches) || matches.length === 0) return;
      state.soccerData = matches;
      state.matchesHaveOdds = Boolean(matchesHaveOdds);
      state.matchesOddsScope = matchesOddsScope ?? null;
      state.soccerLoading = false;
    },
    patchSoccerListOdds(state, action) {
      const updates = action.payload;
      if (!Array.isArray(updates) || !updates.length || !state.soccerData.length) {
        return;
      }
      state.soccerData = patchMatchesWithOddsUpdates(
        state.soccerData,
        updates,
        'soccer'
      );
      state.matchesHaveOdds = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSoccerData.pending, (state) => {
        if (!state.soccerData.length) state.soccerLoading = true;
        state.soccerError = null;
      })
      .addCase(fetchSoccerData.fulfilled, (state, action) => {
        state.soccerLoading = false;
        applySportListPayload(state, action.payload, "soccerData");
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
        state.soccerInplayData = Array.isArray(action.payload)
          ? action.payload
          : [];
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
        state.battingData = action.payload?.markets ?? [];
        state.premiumFancyData = action.payload?.premiumFancy ?? [];
        state.providerCGameId = action.payload?.providerCGameId ?? null;
      })
      .addCase(fetchSoccerBatingData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default soccerSlice.reducer;
export const { hydrateSoccerList, patchSoccerListOdds } = soccerSlice.actions;
