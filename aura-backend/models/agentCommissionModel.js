import mongoose from 'mongoose';

const agentCommissionSchema = new mongoose.Schema(
  {
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubAdmin',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubAdmin',
      required: true,
      index: true,
    },
    userLossAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    commissionPercent: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    commissionAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    source: {
      type: String,
      default: 'bet_settlement',
    },
    betId: { type: String, default: '' },
  },
  { timestamps: true }
);

agentCommissionSchema.index({ agentId: 1, createdAt: -1 });
agentCommissionSchema.index({ userId: 1, createdAt: -1 });
agentCommissionSchema.index(
  { agentId: 1, userId: 1, betId: 1, source: 1 },
  { unique: true, partialFilterExpression: { betId: { $ne: '' } } }
);

const AgentCommission = mongoose.model('AgentCommission', agentCommissionSchema);
export default AgentCommission;
