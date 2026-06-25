import mongoose from 'mongoose';

const betfairEventMarketSchema = new mongoose.Schema(
  {
    sportId: {
      type: Number,
      required: true,
      index: true,
    },
    eventId: {
      type: String,
      required: true,
      index: true,
    },
    marketId: {
      type: String,
      required: true,
    },
    marketName: {
      type: String,
      default: '',
    },
    isMatchOdds: {
      type: Boolean,
      default: false,
      index: true,
    },
    runners: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    contentHash: {
      type: String,
      required: true,
    },
    raw: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    syncedAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

betfairEventMarketSchema.index({ eventId: 1, marketId: 1 }, { unique: true });
betfairEventMarketSchema.index({ sportId: 1, eventId: 1 });

const BetfairEventMarket = mongoose.model(
  'BetfairEventMarket',
  betfairEventMarketSchema
);

export default BetfairEventMarket;
