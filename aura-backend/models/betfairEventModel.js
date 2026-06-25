import mongoose from 'mongoose';

const betfairEventSchema = new mongoose.Schema(
  {
    sportId: {
      type: Number,
      required: true,
      index: true,
    },
    competitionId: {
      type: String,
      required: true,
      index: true,
    },
    eventId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      default: '',
    },
    openDate: {
      type: String,
      default: '',
    },
    competitionName: {
      type: String,
      default: '',
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

betfairEventSchema.index({ sportId: 1, eventId: 1 }, { unique: true });
betfairEventSchema.index({ sportId: 1, competitionId: 1 });

const BetfairEvent = mongoose.model('BetfairEvent', betfairEventSchema);

export default BetfairEvent;
