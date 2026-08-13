import mongoose from 'mongoose';

/**
 * Idempotency + rollback ledger for SkyHigh wallet callbacks.
 * type: bet | win | rollback
 */
const skyhighWalletTxSchema = new mongoose.Schema(
  {
    txId: { type: String, required: true, unique: true, index: true },
    type: { type: String, enum: ['bet', 'win', 'rollback'], required: true },
    playerId: { type: String, required: true, index: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'BDT' },
    roundId: { type: String, default: '' },
    refTxId: { type: String, default: '', index: true },
    status: {
      type: String,
      enum: ['completed', 'rolled_back'],
      default: 'completed',
    },
  },
  { timestamps: true }
);

export default mongoose.model('SkyhighWalletTx', skyhighWalletTxSchema);
