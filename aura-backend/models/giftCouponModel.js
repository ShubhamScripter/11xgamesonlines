import mongoose from 'mongoose';

const giftCouponSchema = new mongoose.Schema(
  {
    couponCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    valueAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    maxValids: {
      type: Number,
      required: true,
      min: 1,
    },
    currentUses: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubAdmin',
    },
  },
  { timestamps: true }
);

giftCouponSchema.index({ isActive: 1 });

const GiftCoupon = mongoose.model('GiftCoupon', giftCouponSchema);
export default GiftCoupon;
