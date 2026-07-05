import SubAdmin from '../models/subAdminModel.js';
import TransactionHistory from '../models/transtionHistoryModel.js';
import DepositHistory from '../models/depositeHistoryModel.js';
import { sendBalanceUpdates, sendToUser, sendUserRefresh } from '../socket/bettingSocket.js';
import {
  canClaimAttendanceToday,
  getAppDateKey,
  getAttendanceBonusSettings,
} from '../utils/attendanceBonus.js';

function round2(n) {
  return Math.round(Number(n) * 100) / 100;
}

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

async function resolveOwnerAdmin(user) {
  if (!user?.invite) return null;
  return SubAdmin.findOne({ code: user.invite, role: { $ne: 'user' } }).lean();
}

export const getAttendanceStatus = async (req, res) => {
  try {
    const user = await SubAdmin.findById(req.id).lean();
    if (!user || user.role !== 'user') {
      return res.status(404).json({ message: 'User not found.' });
    }

    const settings = await getAttendanceBonusSettings();
    const todayKey = getAppDateKey();
    const canClaim =
      settings.enabled && settings.amount > 0 && canClaimAttendanceToday(user, todayKey);

    return res.status(200).json({
      success: true,
      data: {
        enabled: settings.enabled,
        amount: settings.amount,
        canClaim,
        claimedToday: !canClaimAttendanceToday(user, todayKey),
        lastAttendanceDate: user.lastAttendanceDate || null,
        todayKey,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const claimAttendanceBonus = async (req, res) => {
  try {
    const settings = await getAttendanceBonusSettings();
    if (!settings.enabled || settings.amount <= 0) {
      return res.status(400).json({
        message: 'Daily attendance bonus is not available right now.',
      });
    }

    const bonusAmount = round2(settings.amount);
    const todayKey = getAppDateKey();

    const user = await SubAdmin.findById(req.id);
    if (!user || user.role !== 'user') {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (!canClaimAttendanceToday(user, todayKey)) {
      return res.status(400).json({
        message: 'You have already claimed today’s attendance bonus.',
      });
    }

    const ownerAdmin = await resolveOwnerAdmin(user);
    if (!ownerAdmin) {
      return res.status(400).json({ message: 'Your upline admin was not found.' });
    }

    const debitedAdmin = await SubAdmin.findOneAndUpdate(
      {
        _id: ownerAdmin._id,
        status: 'active',
        role: { $ne: 'user' },
        avbalance: { $gte: bonusAmount },
        balance: { $gte: bonusAmount },
      },
      pipelineDebitBalance(bonusAmount),
      { new: true }
    );

    if (!debitedAdmin) {
      return res.status(400).json({
        message: 'Attendance bonus could not be processed. Please try again later.',
      });
    }

    const marked = await SubAdmin.findOneAndUpdate(
      {
        _id: user._id,
        role: 'user',
        lastAttendanceDate: { $ne: todayKey },
      },
      { $set: { lastAttendanceDate: todayKey } },
      { new: false }
    );

    if (!marked) {
      await SubAdmin.findByIdAndUpdate(
        debitedAdmin._id,
        pipelineCreditBalance(bonusAmount),
        { new: true }
      );
      return res.status(400).json({
        message: 'You have already claimed today’s attendance bonus.',
      });
    }

    const creditedUser = await SubAdmin.findOneAndUpdate(
      { _id: user._id, role: 'user' },
      pipelineCreditBalance(bonusAmount),
      { new: true }
    );

    if (!creditedUser) {
      await SubAdmin.findByIdAndUpdate(user._id, {
        $unset: { lastAttendanceDate: '' },
      });
      await SubAdmin.findByIdAndUpdate(
        debitedAdmin._id,
        pipelineCreditBalance(bonusAmount),
        { new: true }
      );
      return res.status(500).json({ message: 'Could not credit attendance bonus.' });
    }

    await DepositHistory.create({
      userName: creditedUser.userName,
      amount: bonusAmount,
      remark: `Daily attendance bonus (${todayKey})`,
      invite: creditedUser.invite,
    });

    await TransactionHistory.create({
      userId: creditedUser._id,
      userName: creditedUser.userName,
      withdrawl: 0,
      deposite: bonusAmount,
      amount: Number(creditedUser.avbalance || 0),
      remark: `Daily attendance bonus +${bonusAmount}`,
      from: 'attendance-bonus',
      to: creditedUser.userName,
      invite: creditedUser.invite,
    });

    try {
      await TransactionHistory.create({
        userId: debitedAdmin._id,
        userName: debitedAdmin.userName,
        withdrawl: bonusAmount,
        deposite: 0,
        amount: Number(debitedAdmin.avbalance || 0),
        remark: `Attendance bonus for ${creditedUser.userName}`,
        from: debitedAdmin.userName,
        to: creditedUser.userName,
        invite: debitedAdmin.invite,
      });
    } catch {
      // non-blocking audit row
    }

    const wsUserId = String(creditedUser._id);
    sendBalanceUpdates(wsUserId, Number(creditedUser.avbalance || 0));
    sendUserRefresh(wsUserId);
    sendToUser(wsUserId, {
      type: 'balance_update',
      userId: wsUserId,
      newBalance: Number(creditedUser.avbalance || 0),
    });

    return res.status(200).json({
      success: true,
      message: `Attendance bonus ৳${bonusAmount} credited to your wallet.`,
      data: {
        amount: bonusAmount,
        newBalance: Number(creditedUser.avbalance || 0),
        claimedDate: todayKey,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
