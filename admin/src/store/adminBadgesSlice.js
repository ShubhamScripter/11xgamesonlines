import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../utils/axiosInstance';

const COUNTS_CACHE_MS = 20_000;
const FRAUD_CACHE_MS = 120_000;
let inflight = null;

export const fetchAdminBadges = createAsyncThunk(
  'adminBadges/fetch',
  async (arg, { getState, rejectWithValue }) => {
    const force = typeof arg === 'object' && arg !== null ? Boolean(arg.force) : Boolean(arg);
    const state = getState().adminBadges;
    const now = Date.now();

    const countsFresh =
      state.countsFetchedAt && now - state.countsFetchedAt < COUNTS_CACHE_MS;
    const fraudFresh =
      state.fraudFetchedAt && now - state.fraudFetchedAt < FRAUD_CACHE_MS;

    if (!force && countsFresh && fraudFresh) {
      return {
        depositPending: state.depositPending,
        withdrawPending: state.withdrawPending,
        deviceAlerts: state.deviceAlerts,
        fromCache: true,
        updatedCounts: false,
        updatedFraud: false,
      };
    }

    if (!force && inflight) {
      try {
        return await inflight;
      } catch (err) {
        return rejectWithValue(err?.message || 'Failed to load badges');
      }
    }

    const needCounts = force || !countsFresh;
    const needFraud = force || !fraudFresh;

    const request = (async () => {
      const [countsRes, deviceRes] = await Promise.all([
        needCounts
          ? axiosInstance.get('/admin/deposit-pending-counts')
          : Promise.resolve(null),
        needFraud
          ? axiosInstance.get('/fraud-clusters').catch(() => null)
          : Promise.resolve(null),
      ]);

      const counts = countsRes?.data?.data || {};
      return {
        depositPending: needCounts
          ? Number(counts.depositPending || 0)
          : state.depositPending,
        withdrawPending: needCounts
          ? Number(counts.withdrawPending || 0)
          : state.withdrawPending,
        deviceAlerts: needFraud
          ? Number(deviceRes?.data?.stats?.flaggedClusters || 0)
          : state.deviceAlerts,
        fromCache: false,
        updatedCounts: needCounts,
        updatedFraud: needFraud,
      };
    })().finally(() => {
      inflight = null;
    });

    inflight = request;

    try {
      return await request;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || err?.message || 'Failed to load badges'
      );
    }
  }
);

const adminBadgesSlice = createSlice({
  name: 'adminBadges',
  initialState: {
    depositPending: 0,
    withdrawPending: 0,
    deviceAlerts: 0,
    countsFetchedAt: null,
    fraudFetchedAt: null,
    fetchedAt: null,
    loading: false,
  },
  reducers: {
    setDepositPending: (state, action) => {
      state.depositPending = Number(action.payload) || 0;
    },
    setWithdrawPending: (state, action) => {
      state.withdrawPending = Number(action.payload) || 0;
    },
    invalidateAdminBadges: (state) => {
      state.countsFetchedAt = null;
      state.fraudFetchedAt = null;
      state.fetchedAt = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminBadges.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminBadges.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.fromCache) return;
        state.depositPending = action.payload.depositPending;
        state.withdrawPending = action.payload.withdrawPending;
        state.deviceAlerts = action.payload.deviceAlerts;
        const now = Date.now();
        if (action.payload.updatedCounts) state.countsFetchedAt = now;
        if (action.payload.updatedFraud) state.fraudFetchedAt = now;
        state.fetchedAt = now;
      })
      .addCase(fetchAdminBadges.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const {
  setDepositPending,
  setWithdrawPending,
  invalidateAdminBadges,
} = adminBadgesSlice.actions;
export default adminBadgesSlice.reducer;
