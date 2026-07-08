
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../utils/axiosInstance';
import { fetchAccountSummary } from './accountSummarySlice';

const tokenFromStorage = localStorage.getItem('token');
const userFromStorage = tokenFromStorage
  ? JSON.parse(localStorage.getItem('user'))
  : null;


export const loginAsync = createAsyncThunk(
  'auth/loginAsync',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post('/sub-admin/login', {
        userName: username, 
        password,
      });

    
      return {
        token: data.token,
        user: data.data,
      };
    } catch (err) {
      console.log(err);
      return rejectWithValue(
        err.response?.data?.message || err.response?.data?.error || err.message || 'Login failed'
      );
    }
  }
);

const initialState = {
  user: userFromStorage,
  role: userFromStorage?.role || null,
  token: tokenFromStorage,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      state.role = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    setAuthFromStorage(state, action) {
      const { token, user } = action.payload;
      state.token = token;
      state.user = user;
      state.role = user?.role || null;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        const { token, user } = action.payload;
        state.token = token;
        // normalize id field so it’s always state.user.id
        state.user = { ...user, id: user._id || user.id };
        state.role = state.user.role;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(state.user));
        state.loading = false;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAccountSummary.fulfilled, (state, action) => {
        if (!state.user || action.payload?.fromCache) return;
        const profile = action.payload?.summary || action.payload;
        const fin = profile?.financialInfo;
        if (!fin) return;
        const sessionId = state.user._id || state.user.id;
        const payloadUserId =
          action.payload?.userId || profile?.basicInfo?.id;
        if (payloadUserId && sessionId && String(payloadUserId) !== String(sessionId)) {
          return;
        }
        state.user = {
          ...state.user,
          avbalance: fin.avbalance ?? state.user.avbalance,
          balance: fin.balance ?? state.user.balance,
          totalBalance: fin.totalBalance ?? state.user.totalBalance,
          exposure: fin.exposure ?? state.user.exposure,
        };
        localStorage.setItem('user', JSON.stringify(state.user));
      });
  },
});

export const { logout, setAuthFromStorage } = authSlice.actions;

/** Clears server session + httpOnly cookie, then local auth state */
export const logoutAsync = createAsyncThunk(
  'auth/logoutAsync',
  async (_, { dispatch }) => {
    try {
      await axios.post('/user-logout');
    } catch {
      // Token may already be invalid; still clear client
    }
    dispatch(logout());
  }
);

export default authSlice.reducer;
