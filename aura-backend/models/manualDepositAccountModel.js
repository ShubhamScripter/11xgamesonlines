import mongoose from 'mongoose';

const manualDepositAccountSchema = new mongoose.Schema(
  {
    method: {
      type: String,
      enum: ['bank', 'upi', 'crypto', 'whatsapp'],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    details: {
      accountHolderName: { type: String, trim: true },
      accountNumber: { type: String, trim: true },
      ifscCode: { type: String, trim: true },
      bankName: { type: String, trim: true },
      branchName: { type: String, trim: true },
      upiId: { type: String, trim: true },
      qrCodeUrl: { type: String, trim: true },
      walletAddress: { type: String, trim: true },
      network: { type: String, trim: true },
      note: { type: String, trim: true },
      phoneNumber: { type: String, trim: true },
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    createdBy: { type: String, trim: true }, // legacy (username)
    updatedBy: { type: String, trim: true }, // legacy (username)
    createdById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubAdmin',
      default: null,
      index: true,
    },
    updatedById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubAdmin',
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

const ManualDepositAccount = mongoose.model(
  'ManualDepositAccount',
  manualDepositAccountSchema
);

export default ManualDepositAccount;
