
// Match Override Model for all Sports excluding Casino and Lottery

import mongoose from "mongoose";
import SubAdmin from "./subAdminModel.js";

const matchOverrideSchema = new mongoose.Schema({
  matchId: {
    type: String,
    required: true,
    index: true,
  },
  sport: {
    type: String,
    required: true,
    enum: ["cricket", "soccer", "tennis", "casino"],
    index: true,
  },
  matchName: {
    type: String,
  },
  isSuspended: {
    type: Boolean,
    default: false,
  },
  reason: {
    type: String,
    maxLength: 200,
  },
  suspendedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "subAdmin",
  },
  suspendedAt: {
    type: Date,
  },
});

// Compound index on sport and matchId
matchOverrideSchema.index({ sport: 1, matchId: 1 }, { unique: true });

const matchOverrideModel = mongoose.model(
  "matchOverrideModel",
  matchOverrideSchema
);

export default matchOverrideModel;











