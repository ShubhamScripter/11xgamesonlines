// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import authService from './authService'

// const storedUser = localStorage.getItem("user");
// const storedToken = localStorage.getItem("token");

// const initialState = {
//   user: storedUser ? JSON.parse(storedUser) : null,
//   token: storedToken || null,
//   isLoading: false,
//   isError: false,
//   isSuccess: false,
//   message: "",
// };

// //  Login
// export const login = createAsyncThunk(
//   "auth/login",
//   async (userData, thunkAPI) => {
//     try {
//       return await authService.login(userData);
//     } catch (error) {
//       const message =
//         error?.response?.data?.message || error.message || error.toString();
//       return thunkAPI.rejectWithValue(message);
//     }
//   }
// );

// //  Register
// export const register = createAsyncThunk(
//   "auth/register",
//   async (userData, thunkAPI) => {
//     try {
//       return await authService.register(userData);
//     } catch (error) {
//       const message =
//         error?.response?.data?.message || error.message || error.toString();
//       return thunkAPI.rejectWithValue(message);
//     }
//   }
// );

// // Change password
// export const changePassword = createAsyncThunk(
//   "auth/changePassword",
//   async ({ userId, passwordData }, thunkAPI) => {
//     try {
//       return await authService.changePassword(userId, passwordData);
//     } catch (error) {
//       const message = error?.response?.data?.message || error.message || error.toString();
//       return thunkAPI.rejectWithValue(message);
//     }
//   }
// );
// //  Logout
// export const logout = createAsyncThunk("auth/logout", async () => {
//   authService.logout();
// });

// const authSlice = createSlice({
//   name: "auth",
//   initialState,
//   reducers: {
//     reset: (state) => {
//       state.isLoading = false;
//       state.isError = false;
//       state.isSuccess = false;
//       state.message = "";
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       // Login
//       .addCase(login.pending, (state) => {
//         state.isLoading = true;
//       })
//       .addCase(login.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.isSuccess = true;
//         state.user = action.payload.user;
//         state.token = action.payload.token;
//       })
//       .addCase(login.rejected, (state, action) => {
//         state.isLoading = false;
//         state.isError = true;
//         state.message = action.payload;
//         state.user = null;
//         state.token = null;
//       })

//       // Register
//       .addCase(register.pending, (state) => {
//         state.isLoading = true;
//       })
//       .addCase(register.fulfilled, (state) => {
//         state.isLoading = false;
//         state.isSuccess = true;
//       })
//       .addCase(register.rejected, (state, action) => {
//         state.isLoading = false;
//         state.isError = true;
//         state.message = action.payload;
//       })

//       // Change password
//       .addCase(changePassword.pending, (state) => { state.isLoading = true; })
//       .addCase(changePassword.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.isSuccess = true;
//         state.message = action.payload.message || "Password changed successfully";
//       })
//       .addCase(changePassword.rejected, (state, action) => {
//         state.isLoading = false;
//         state.isError = true;
//         state.message = action.payload;
//       })

//       // Logout
//       .addCase(logout.fulfilled, (state) => {
//         state.user = null;
//         state.token = null;
//       });
//   },
// });

// export const { reset } = authSlice.actions;
// export default authSlice.reducer;


import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from '../../utils/axiosConfig'

// -------- Thunks --------

// Login (new endpoint & response)
export const login = createAsyncThunk(
  "auth/login",
  async (credentials, thunkAPI) => {
    try {

      const res = await api.post("/user/login", credentials);

      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.data));
      }

      return res.data;
    } catch (err) {
      const msg =
        err?.response?.data?.message || err.message || err.toString();
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// Self-registration → creates user under superadmin, returns token for auto-login
export const register = createAsyncThunk(
  "auth/register",
  async (userData, thunkAPI) => {
    try {
      const res = await api.post("/user/register", userData);
      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.data));
      }
      return res.data;
    } catch (err) {
      const msg =
        err?.response?.data?.message || err.message || err.toString();
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// Change password
export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (passwordData, thunkAPI) => {
    try {
      // use POST or PUT depending on your backend
      const res = await api.post("/change/password-self/user", passwordData);

      // Optionally refresh stored user if backend sends updated data
      if (res.data?.data) {
        localStorage.setItem("user", JSON.stringify(res.data.data));
      }

      return res.data; // contains {success, message, data}
    } catch (err) {
      const msg =
        err?.response?.data?.message || err.message || err.toString();
      return thunkAPI.rejectWithValue(msg);
    }
  }
);


// Logout
export const logout = createAsyncThunk("auth/logout", async () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
});


export const getUser = createAsyncThunk(
  "user/get-user",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/get/user-details", {
        withCredentials: true,
      });
      const data = response.data;
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Something went wrong" }
      );
    }
  }
);

// -------- Initial State --------
const storedUserRaw = localStorage.getItem("user");
const storedToken = localStorage.getItem("token");

let storedUser = null;
if (storedUserRaw && storedUserRaw !== "undefined") {
  try {
    storedUser = JSON.parse(storedUserRaw);
  } catch (e) {
    storedUser = null;
  }
}

const initialState = {
  user: storedUser,
  token: storedToken || null,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: "",
};

// -------- Slice --------
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = "";
    },
    setLiveBalance: (state, action) => {
      const nextBalance = Number(action.payload);
      if (!Number.isFinite(nextBalance)) return;
      if (!state.user) return;
      state.user = {
        ...state.user,
        avbalance: nextBalance,
      };
      localStorage.setItem("user", JSON.stringify(state.user));
    },
  },
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.token = action.payload.token;
        state.user = action.payload.data;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
        state.token = null;
      })

      // REGISTER (backend returns token + data for auto-login)
      .addCase(register.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        if (action.payload?.token) {
          state.token = action.payload.token;
          state.user = action.payload.data;
        }
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // CHANGE PASSWORD
      .addCase(changePassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = action.payload.message || "Password changed successfully";

        // ✅ replace user in Redux state with updated user data
        if (action.payload.data) {
          state.user = action.payload.data;
        }
      })


      // LOGOUT
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
      })

      // Get user by ID
      .addCase(getUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload.data;
        // ✅ Also update the user field that header components read from
        state.user = action.payload.data;
        // ✅ Update localStorage with fresh data
        localStorage.setItem("user", JSON.stringify(action.payload.data));
      })
      .addCase(getUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { reset, setLiveBalance } = authSlice.actions;
export default authSlice.reducer;
