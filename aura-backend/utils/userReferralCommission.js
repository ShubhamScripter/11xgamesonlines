import SubAdmin from '../models/subAdminModel.js';
import UserReferralCommission from '../models/userReferralCommissionModel.js';
import { getAppSettingsDoc } from '../models/appSettingsModel.js';
import {
  sendBalanceUpdates,
  sendToUser,
  sendUserRefresh,
} from '../socket/bettingSocket.js';

function round2(n) {
  return Math.round(Number(n) * 100) / 100;
}

export async function getUserReferralSettings() {
  const doc = await getAppSettingsDoc();
  return {
    enabled: Boolean(doc.userReferralModuleEnabled),
    commissionPercent: Math.min(
      100,
      Math.max(0, Number(doc.userReferralCommissionPercent) || 0)
    ),
  };
}

/**
 * Credit peer-referrer when a referred user loses on settlement.
 * Pays into referrer's wallet (balance + avbalance) and tracks referralCommissionBalance.
 */
export async function creditUserReferralOnLoss(
  userId,
  lossAmount,
  { betId = '', source = 'bet_settlement' } = {}
) {
  const loss = round2(Math.abs(Number(lossAmount)));
  if (!userId || loss <= 0) return null;

  const settings = await getUserReferralSettings();
  if (!settings.enabled || settings.commissionPercent <= 0) return null;

  const user = await SubAdmin.findById(userId).select(
    'role referredByUserId userName'
  );
  if (!user || user.role !== 'user' || !user.referredByUserId) return null;

  if (betId) {
    const existing = await UserReferralCommission.findOne({
      referrerId: user.referredByUserId,
      userId: user._id,
      betId: String(betId),
      source,
    }).select('_id');
    if (existing) return null;
  }

  const commissionAmount = round2((loss * settings.commissionPercent) / 100);
  if (commissionAmount <= 0) return null;

  const referrer = await SubAdmin.findOneAndUpdate(
    {
      _id: user.referredByUserId,
      role: 'user',
      status: { $ne: 'delete' },
    },
    {
      $inc: {
        balance: commissionAmount,
        avbalance: commissionAmount,
        totalBalance: commissionAmount,
        referralCommissionBalance: commissionAmount,
      },
    },
    { new: true }
  ).select('_id userName avbalance referralCommissionBalance');

  if (!referrer) return null;

  const log = await UserReferralCommission.create({
    referrerId: referrer._id,
    userId: user._id,
    userLossAmount: loss,
    commissionPercent: settings.commissionPercent,
    commissionAmount,
    source,
    betId: String(betId || ''),
  });

  const rid = String(referrer._id);
  try {
    sendBalanceUpdates(rid, Number(referrer.avbalance || 0));
    sendToUser(rid, {
      type: 'balance_update',
      userId: rid,
      newBalance: Number(referrer.avbalance || 0),
    });
    sendUserRefresh(rid, {
      reason: 'user_referral_commission',
      newBalance: Number(referrer.avbalance || 0),
    });
  } catch {
    // ignore socket errors
  }

  return { referrer, commissionAmount, log };
}
