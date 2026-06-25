import mongoose from 'mongoose';

const tvEventSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    eventName: { type: String, default: '' },
    sportName: { type: String, default: '' },
    tv: { type: String, default: '' },
    iframeScore: { type: mongoose.Schema.Types.Mixed, default: null },
    iframeScoreV1: { type: mongoose.Schema.Types.Mixed, default: null },
    iframeScoreV2: { type: mongoose.Schema.Types.Mixed, default: null },
    iframeScoreV4: { type: mongoose.Schema.Types.Mixed, default: null },
    utcTime: { type: String, default: '' },
    syncedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const TvEvent = mongoose.model('TvEvent', tvEventSchema);

export default TvEvent;
