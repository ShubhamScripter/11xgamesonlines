import mongoose from 'mongoose';

const luckySpinConfigSchema = new mongoose.Schema(
  {
    mode: {
      type: String,
      enum: ['random', 'custom_random', 'manual'],
      default: 'random',
    },
    customRandomSelections: {
      type: [Number],
      default: [],
    },
    manualSelection: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

const LuckySpinConfig = mongoose.model('LuckySpinConfig', luckySpinConfigSchema);

export async function getLuckySpinConfigDoc() {
  let doc = await LuckySpinConfig.findOne();
  if (!doc) {
    doc = await LuckySpinConfig.create({
      mode: 'random',
      customRandomSelections: [],
      manualSelection: 1,
    });
  }
  return doc;
}

export default LuckySpinConfig;
