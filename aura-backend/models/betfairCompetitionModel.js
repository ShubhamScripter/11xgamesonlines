import mongoose from 'mongoose';

const betfairCompetitionSchema = new mongoose.Schema(
  {
    sportId: {
      type: Number,
      required: true,
      index: true,
    },
    competitionId: {
      type: String,
      required: true,
    },
    name: {
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

betfairCompetitionSchema.index(
  { sportId: 1, competitionId: 1 },
  { unique: true }
);

const BetfairCompetition = mongoose.model(
  'BetfairCompetition',
  betfairCompetitionSchema
);

export default BetfairCompetition;
