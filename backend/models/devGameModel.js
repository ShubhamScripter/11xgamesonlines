import mongoose from "mongoose";

const DevGameSchema = new mongoose.Schema({
  gameId: { type: String, unique: true },   // e.g., "dev-<timestamp>"
  eventName: String,                        // e.g., "DEV: Player A v Player B"
  marketName: { type: String, default: "Match Odds" },
  gameType: { type: String, default: "Match Odds" },
  gameName: { type: String, default: "Tennis" },
  sid: { type: Number, default: 4 },
  teamA: String,
  teamB: String,
  inplay: { type: Boolean, default: true },
  result: { type: String, default: null },  // winning teamName to settle
}, { timestamps: true });

export default mongoose.model("DevGame", DevGameSchema);