import mongoose from 'mongoose';

const luckySpinRewardSchema = new mongoose.Schema(
  {
    number: {
      type: Number,
      required: true,
      unique: true,
    },
    winGift: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['cash', 'item', 'none'],
      default: 'cash',
    },
    value: {
      type: Number,
      default: 0, // 0 for item or none
    },
  },
  { timestamps: true }
);

const LuckySpinReward = mongoose.model('LuckySpinReward', luckySpinRewardSchema);

export default LuckySpinReward;
