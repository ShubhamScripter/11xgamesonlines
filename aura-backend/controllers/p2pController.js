import mongoose from 'mongoose';

import SubAdmin from '../models/subAdminModel.js';
import TransactionHistory from '../models/transtionHistoryModel.js';
import { sendBalanceUpdates } from '../socket/bettingSocket.js';
import { updateAllUplines } from './admin/subAdminController.js';

function round2(n) {
  return Math.round(Number(n) * 100) / 100;
}

/** Undo a debit of `amt` on a user (same shape as credit pipeline). */
function pipelineCreditBalance(amt) {
  return [
    {
      $set: {
        balance: { $add: ['$balance', amt] },
        baseBalance: { $add: ['$baseBalance', amt] },
        avbalance: { $add: ['$avbalance', amt] },
        exposureLimit: { $add: [{ $ifNull: ['$exposureLimit', 0] }, amt] },
        creditReferenceProfitLoss: {
          $subtract: [
            { $add: ['$baseBalance', amt] },
            { $ifNull: ['$creditReference', 0] },
          ],
        },
      },
    },
  ];
}

function pipelineDebitBalance(amt) {
  return [
    {
      $set: {
        balance: { $subtract: ['$balance', amt] },
        baseBalance: { $subtract: ['$baseBalance', amt] },
        avbalance: { $subtract: ['$avbalance', amt] },
        creditReferenceProfitLoss: {
          $subtract: [
            { $subtract: ['$baseBalance', amt] },
            { $ifNull: ['$creditReference', 0] },
          ],
        },
      },
    },
  ];
}

/**
 * Player-to-player transfer (wallet ID = MongoDB user _id).
 * Uses atomic updates (no multi-doc transaction — works on standalone MongoDB).
 */
export const transferP2P = async (req, res) => {
  try {
    const senderId = req.id;
    const { recipientWalletId, amount, remark } = req.body;

    const amt = round2(amount);
    if (!recipientWalletId || typeof recipientWalletId !== 'string') {
      return res.status(400).json({ message: 'Recipient wallet ID is required' });
    }
    const trimmedRecipient = recipientWalletId.trim();
    if (!mongoose.Types.ObjectId.isValid(trimmedRecipient)) {
      return res.status(400).json({ message: 'Invalid wallet ID format' });
    }
    if (!Number.isFinite(amt) || amt < 0.01) {
      return res.status(400).json({ message: 'Amount must be at least 0.01' });
    }
    if (trimmedRecipient === String(senderId)) {
      return res.status(400).json({ message: 'Cannot transfer to yourself' });
    }

    const recipientOid = new mongoose.Types.ObjectId(trimmedRecipient);

    const senderUpdated = await SubAdmin.findOneAndUpdate(
      {
        _id: senderId,
        role: 'user',
        status: 'active',
        avbalance: { $gte: amt },
      },
      pipelineDebitBalance(amt),
      { new: true }
    );

    if (!senderUpdated) {
      return res.status(400).json({
        message: 'Insufficient balance or transfer not allowed',
      });
    }

    const recipientUpdated = await SubAdmin.findOneAndUpdate(
      {
        _id: recipientOid,
        role: 'user',
        status: 'active',
      },
      pipelineCreditBalance(amt),
      { new: true }
    );

    if (!recipientUpdated) {
      await SubAdmin.findOneAndUpdate(
        { _id: senderId },
        pipelineCreditBalance(amt),
        { new: true }
      );
      return res.status(404).json({
        message: 'Recipient not found or inactive',
      });
    }

    const remarkText =
      remark && String(remark).trim()
        ? `P2P: ${String(remark).trim()}`
        : 'P2P transfer';

    try {
      await TransactionHistory.create([
        {
          userId: String(senderUpdated._id),
          userName: senderUpdated.userName,
          withdrawl: amt,
          deposite: 0,
          amount: senderUpdated.avbalance,
          remark: remarkText,
          from: senderUpdated.userName,
          to: recipientUpdated.userName,
          invite: senderUpdated.invite,
        },
        {
          userId: String(recipientUpdated._id),
          userName: recipientUpdated.userName,
          withdrawl: 0,
          deposite: amt,
          amount: recipientUpdated.avbalance,
          remark: remarkText,
          from: senderUpdated.userName,
          to: recipientUpdated.userName,
          invite: recipientUpdated.invite,
        },
      ]);
    } catch (histErr) {
      console.error('P2P history write failed, rolling back balances:', histErr);
      await SubAdmin.findOneAndUpdate({ _id: senderId }, pipelineCreditBalance(amt));
      await SubAdmin.findOneAndUpdate(
        { _id: recipientOid },
        pipelineDebitBalance(amt)
      );
      return res.status(500).json({ message: 'Could not record transfer' });
    }

    sendBalanceUpdates(String(senderUpdated._id), senderUpdated.avbalance);
    sendBalanceUpdates(String(recipientUpdated._id), recipientUpdated.avbalance);

    await updateAllUplines([senderUpdated._id, recipientUpdated._id]);

    return res.status(200).json({
      success: true,
      message: 'Transfer successful',
      newBalance: senderUpdated.avbalance,
    });
  } catch (error) {
    console.error('P2P transfer error:', error);
    return res.status(500).json({
      message: error.message || 'Transfer failed',
    });
  }
};

/** Paginated P2P rows for the logged-in user (remark starts with P2P). */
export const getP2PTransferHistory = async (req, res) => {
  try {
    const userId = String(req.id);
    const { page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

    const filter = {
      userId: { $in: [userId, new mongoose.Types.ObjectId(userId)] },
      remark: { $regex: /^P2P/i },
    };

    const [data, total] = await Promise.all([
      TransactionHistory.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      TransactionHistory.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data,
      total,
      totalPages: Math.ceil(total / limitNum) || 0,
      currentPage: pageNum,
    });
  } catch (error) {
    console.error('P2P log error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to load transfer log',
    });
  }
};
