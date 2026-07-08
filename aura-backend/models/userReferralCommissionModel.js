import mongoose from 'mongoose';

const userReferralCommissionSchema = new mongoose.Schema(
  {
    referrerId: {
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

userReferralCommissionSchema.index({ referrerId: 1, createdAt: -1 });
userReferralCommissionSchema.index({ userId: 1, createdAt: -1 });
userReferralCommissionSchema.index(
  { referrerId: 1, userId: 1, betId: 1, source: 1 },
  { unique: true, partialFilterExpression: { betId: { $ne: '' } } }
);

const UserReferralCommission = mongoose.model(
  'UserReferralCommission',
  userReferralCommissionSchema
);
export default UserReferralCommission;
