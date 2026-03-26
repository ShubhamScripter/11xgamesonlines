// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import axios from '../utils/axiosInstance';

// // Async thunk for fetching downline tree
// export const fetchDownlineTree = createAsyncThunk(
//   'downline/fetchDownlineTree',
//   async (userId, { rejectWithValue }) => {
//     try {
//       const { data } = await axios.post('/get/all-user', { id: userId });
//       console.log("downline tree data", data);
//       return data; 
      
//     } catch (err) {
//       return rejectWithValue(err.response?.data?.error || 'Failed to fetch downline tree');
//     }
//   }
// );

// const downlineSlice = createSlice({
//   name: 'downline',
//   initialState: {
//     balanceData: [],
//     downlines: [],
//     loading: false,
//     error: null,
//   },
//   reducers: {},
//   extraReducers: builder => {
//     builder
//       .addCase(fetchDownlineTree.pending, state => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchDownlineTree.fulfilled, (state, action) => {
//         const currentUser = action.payload;
//         state.currentUser = currentUser;
//         state.balanceData = [
//           { label: "Total Balance", value: `BDT ${(currentUser.totalBalance ?? 0).toFixed(2)}` },
//           { label: "Total Exposure", value: `BDT ${(currentUser.totalExposure ?? 0).toFixed(2)}`, highlight: true },
//           { label: "Total Avail. bal.", value: `BDT ${(currentUser.totalAvailableBalance ?? 0).toFixed(2)}` },
//           { label: "Balance", value: `BDT ${(currentUser.balance ?? 0).toFixed(2)}` },
//           { label: "Available Balance", value: `BDT ${(currentUser.availableBalance ?? 0).toFixed(2)}` },
//           { label: "Total Player Balance", value: `BDT ${(currentUser.totalPlayerBalance ?? 0).toFixed(2)}` },
//         ];
//         state.downlines = (currentUser.downlines || []).map((u, i) => ({
//           id: i + 1,
//           _id: u._id,
//           role: u.role,
//           username: u.userName,
//           creditRef: u.creditRef || 0,
//           balance: u.balance || 0,
//           exposure: u.totalExposure || 0,
//           availBal: u.totalAvailableBalance || 0,
//           playerBal: u.totalPlayerBalance || 0,
//           refPL: 0,
//           status: u.status,
//         }));
//         state.loading = false;
//       })
//       .addCase(fetchDownlineTree.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       });
//   }
// });

// export default downlineSlice.reducer;

// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import axios from '../utils/axiosInstance';

// // --- Async thunk ---
// export const fetchDownlineTree = createAsyncThunk(
//   'downline/fetchDownlineTree',
//   async (userId, { rejectWithValue }) => {
//     try {
//       const { data } = await axios.post('/get/all-user', { id: userId });
//       console.log('downline tree data', data);
//       return data; // { message, data: [], selfData: {...} }
//     } catch (err) {
//       return rejectWithValue(err.response?.data?.error || 'Failed to fetch downline tree');
//     }
//   }
// );

// const downlineSlice = createSlice({
//   name: 'downline',
//   initialState: {
//     currentUser: null,     // <— NEW
//     balanceData: [],
//     downlines: [],
//     loading: false,
//     error: null,
//     ipWarnings: null,  // Store IP warnings
//   },
//   reducers: {},
//   extraReducers: builder => {
//     builder
//       .addCase(fetchDownlineTree.pending, state => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchDownlineTree.fulfilled, (state, action) => {
//   const {
//     data: downlineArray = [],
//     selfData = {},
//     totalUserDownlineBalance = 0,   // <— destructure here
//     ipWarnings = null  // <— destructure IP warnings
//   } = action.payload;

//   state.currentUser = selfData;
//   state.ipWarnings = ipWarnings; // Store IP warnings in state

//   state.downlines = downlineArray.map((u, i) => ({
//     id: i + 1,
//     _id: u._id,
//     role: u.role,
//     username: u.userName,
//     account: u.account,
//     code: u.code,
//     commission: u.commission ?? u.commition ?? 0,
//     commissionPercentage: u.commissionPercentage || 0,
//     balance: u.balance,
//     totalBalance: u.totalBalance,
//     profitLoss: u.profitLoss,
//     avbalance: u.avbalance,
//     agentAvbalance: u.agentAvbalance,
//     totalAvbalance: u.totalAvbalance,
//     exposure: u.exposure,
//     totalExposure: u.totalExposure,
//     exposureLimit: u.exposureLimit,
//     creditRef: u.creditReference,
//     rollingCommission: u.rollingCommission,
//     phone: u.phone,
//     status: u.status,
//     gamelock: u.gamelock,
//     sessionToken: u.sessionToken,
//     lastLogin: u.lastLogin,
//     lastDevice: u.lastDevice,
//     lastIP: u.lastIP,
//   }));

//   state.balanceData = [
//     { label: 'Total Balance', value: `BDT ${(selfData.totalBalance ?? 0).toFixed(2)}` },
//     { label: 'Total Exposure', value: `BDT ${(selfData.exposure ?? 0).toFixed(2)}` },
//     { label: 'Total Avail. Balance', value: `BDT ${(selfData.totalAvbalance ?? 0).toFixed(2)}` },
//     { label: 'Balance', value: `BDT ${(selfData.avbalance ?? 0).toFixed(2)}` },
//     { label: 'Available Balance', value: `BDT ${(selfData.agentAvbalance ?? 0).toFixed(2)}` },

    
//     { label: 'Total Player Balance', value: `BDT ${totalUserDownlineBalance.toFixed(2)}` },
//   ];

//   state.loading = false;
// })

//       .addCase(fetchDownlineTree.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       });
//   },
// });

// export default downlineSlice.reducer;


import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../utils/axiosInstance';

// --- Async thunk ---
export const fetchDownlineTree = createAsyncThunk(
  'downline/fetchDownlineTree',
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await axios.post('/get/all-user', { id: userId });
     
      return data; // { message, data: [], selfData: {...} }
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to fetch downline tree');
    }
  }
);

const downlineSlice = createSlice({
  name: 'downline',
  initialState: {
    currentUser: null,     // <— NEW
    balanceData: [],
    downlines: [],
    loading: false,
    error: null,
    ipWarnings: null,  // Store IP warnings
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchDownlineTree.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDownlineTree.fulfilled, (state, action) => {
  const {
    data: downlineArray = [],
    selfData = {},
    totalUserDownlineBalance = 0,
    totalUserDownlineExposure = 0,   // <— destructure here
    ipWarnings = null  // <— destructure IP warnings
  } = action.payload;

  state.currentUser = selfData;
  state.ipWarnings = ipWarnings; // Store IP warnings in state

  state.downlines = downlineArray.map((u, i) => ({
    id: i + 1,
    _id: u._id,
    role: u.role,
    username: u.userName,
    account: u.account,
    code: u.code,
    commission: u.commission ?? u.commition ?? 0,
    commissionPercentage: u.commissionPercentage || 0,
    balance: u.balance,
    totalBalance: u.totalBalance,
    profitLoss: u.profitLoss,
    avbalance: u.avbalance,
    agentAvbalance: u.agentAvbalance,
    totalAvbalance: u.totalAvbalance,
    exposure: u.exposure,
    totalExposure: u.downlineExposure,
    exposureLimit: u.exposureLimit,
    playerbalancee: u.playerbalancee,
    creditRef: u.creditReference,
    rollingCommission: u.rollingCommission,
    phone: u.phone,
    status: u.status,
    gamelock: u.gamelock,
    sessionToken: u.sessionToken,
    lastLogin: u.lastLogin,
    lastDevice: u.lastDevice,
    lastIP: u.lastIP,
  }));

  state.balanceData = [
  { label: 'Total Balance', value: `BDT ${(selfData.totalBalance ?? 0).toFixed(2)}` },
  { label: 'Total Exposure', value: `BDT ${(selfData.exposure ?? 0).toFixed(2)}` },
  { label: 'Total Avail. Balance', value: `BDT ${(selfData.totalBalance ?? 0).toFixed(2)}` },
  { label: 'Balance', value: `BDT ${(selfData.avbalance ?? 0).toFixed(2)}` },
 {
  label: 'Available Balance',
  value: `BDT ${(
    (selfData.avbalance ?? 0) + 
    (selfData.totalBalance ?? 0)
  ).toFixed(2)}`
}
,
  { 
    label: 'Total Player Balance', 
    value: `BDT ${totalUserDownlineBalance.toFixed(2)}` 
  },
];


  state.loading = false;
})

      .addCase(fetchDownlineTree.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default downlineSlice.reducer;
