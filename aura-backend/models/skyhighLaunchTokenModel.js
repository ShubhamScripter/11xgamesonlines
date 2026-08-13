import mongoose from 'mongoose';

const skyhighLaunchTokenSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, unique: true, index: true },
    playerId: { type: String, required: true, index: true },
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

// Auto-delete expired tokens
skyhighLaunchTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('SkyhighLaunchToken', skyhighLaunchTokenSchema);
