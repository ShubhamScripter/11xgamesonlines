// models/loginHistory.js
import mongoose from "mongoose";

// const loginHistorySchema = new mongoose.Schema({
//   userName: String,
//   status: String,
//   dateTime: String,
//   ip: String,
//   isp: String,
//   city: String,
//   region: String,
//   country: String,
// });

// export default mongoose.model("LoginHistory", loginHistorySchema);
export const loginHistorySchema = mongoose.Schema({
  userName: {
    type: String,
    // required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    // required: true,
  },
  dateTime: {
    type: String,
    // required: true,
  },
  ip: {
    type: String,
    // required: true,
  },
  isp: {
    type: String,
    // required: true,
  },
  city: {
    type: String,
  },
  region: {
    type: String,
  },
  country: {
    type: String,
  },
}, {
  timestamps: true,
});

const LoginHistory = mongoose.model("LoginHistory", loginHistorySchema);
export default LoginHistory;
