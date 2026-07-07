import mongoose from 'mongoose';

const couponClaimSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubAdmin',
      required: true,
    },
    couponId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GiftCoupon',
      required: true,
    },
    valueAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    claimedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

couponClaimSchema.index({ userId: 1, couponId: 1 }, { unique: true });

const CouponClaim = mongoose.model('CouponClaim', couponClaimSchema);
export default CouponClaim;
