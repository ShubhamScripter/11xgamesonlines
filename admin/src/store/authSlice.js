
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../utils/axiosInstance';

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
      });
  },
});

export const { logout, setAuthFromStorage } = authSlice.actions;
export default authSlice.reducer;
