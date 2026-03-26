import mongoose from 'mongoose';

const manualDepositRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubAdmin',
      required: true,
      index: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    requestType: {
      type: String,
      enum: ['deposit', 'withdraw'],
      default: 'deposit',
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    method: {
      type: String,
      enum: ['bank', 'upi', 'crypto', 'whatsapp'],
      required: true,
      index: true,
    },
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ManualDepositAccount',
      default: null,
    },
    accountSnapshot: {
      type: Object,
      required: true,
      default: {},
    },
    referenceId: { type: String, trim: true },
    paymentNote: { type: String, trim: true },
    bonusType: { type: String, trim: true },
    paymentImageUrl: { type: String, trim: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    adminRemark: { type: String, trim: true },
    approvedById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubAdmin',
      default: null,
    },
    approvedByUserName: { type: String, trim: true },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const ManualDepositRequest = mongoose.model(
  'ManualDepositRequest',
  manualDepositRequestSchema
);

export default ManualDepositRequest;
