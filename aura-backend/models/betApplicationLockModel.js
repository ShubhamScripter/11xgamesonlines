import mongoose from 'mongoose';

const leagueLockSchema = new mongoose.Schema(
  {
    sport: { type: String, required: true, trim: true },
    leagueName: { type: String, required: true, trim: true },
    locked: { type: Boolean, default: true },
  },
  { _id: false }
);

const matchLockSchema = new mongoose.Schema(
  {
    sport: { type: String, required: true, trim: true },
    matchId: { type: String, required: true, trim: true },
    matchName: { type: String, default: '' },
    leagueName: { type: String, default: '' },
    date: { type: String, default: '' },
    locked: { type: Boolean, default: true },
  },
  { _id: false }
);

const betApplicationLockSchema = new mongoose.Schema(
  {
    sports: {
      type: Map,
      of: Boolean,
      default: () => new Map(),
    },
    betTypes: {
      type: Map,
      of: Boolean,
      default: () => new Map(),
    },
    marketTypes: {
      type: Map,
      of: Boolean,
      default: () => new Map(),
    },
    leagues: { type: [leagueLockSchema], default: [] },
    matches: { type: [matchLockSchema], default: [] },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubAdmin',
      default: null,
    },
  },
  { timestamps: true }
);

const BetApplicationLock = mongoose.model(
  'BetApplicationLock',
  betApplicationLockSchema
);

export async function getBetApplicationLockDoc() {
  let doc = await BetApplicationLock.findOne().lean();
  if (!doc) {
    const created = await BetApplicationLock.create({});
    doc = created.toObject();
  }
  return doc;
}

export default BetApplicationLock;
