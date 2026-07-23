import mongoose from 'mongoose';

const luckySpinHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubAdmin',
      required: true,
      index: true,
    },
    rewardNumber: {
      type: Number,
      required: true,
    },
    winGift: {
      type: String,
      required: true,
    },
    rewardType: {
      type: String,
      required: true,
    },
    rewardValue: {
      type: Number,
      required: true,
    },
    cost: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const LuckySpinHistory = mongoose.model('LuckySpinHistory', luckySpinHistorySchema);

export default LuckySpinHistory;
