import DepositHistory from '../models/depositeHistoryModel.js';
import ManualDepositRequest from '../models/manualDepositRequestModel.js';
import SubAdmin from '../models/subAdminModel.js';
import { getAppSettingsDoc } from '../models/appSettingsModel.js';

function round2(n) {
  return Math.round(Number(n) * 100) / 100;
}

export async function getFirstDepositBonusSettings() {
  const doc = await getAppSettingsDoc();
  const enabled = Boolean(doc.firstDepositBonusEnabled);
  const percent = Math.min(
    100,
    Math.max(0, Number(doc.firstDepositBonusPercent) || 0)
  );
  const wageringPercent = Math.min(
    100,
    Math.max(0, Number(doc.firstDepositWageringPercent) || 80)
  );
  return { enabled, percent, wageringPercent };
}

export function calcFirstDepositBonusAmount(depositAmount, percent) {
  const amt = round2(Number(depositAmount));
  const pct = Number(percent);
  if (!amt || amt <= 0 || !pct || pct <= 0) return 0;
  return round2((amt * pct) / 100);
}

/**
 * True if user has never received an approved deposit (any channel).
 */
export async function isFirstDepositEligible(user) {
  if (!user?._id) return false;
  if (user.firstDepositBonusClaimed) return false;

  const [historyCount, approvedManualCount] = await Promise.all([
    DepositHistory.countDocuments({ userName: user.userName }),
    ManualDepositRequest.countDocuments({
      userId: user._id,
      requestType: 'deposit',
      status: 'approved',
    }),
  ]);

  return historyCount === 0 && approvedManualCount === 0;
}

/**
 * Compute bonus for a pending deposit. Does not mark as claimed.
 */
export async function computeFirstDepositBonus(user, depositAmount) {
  const settings = await getFirstDepositBonusSettings();
  if (!settings.enabled || settings.percent <= 0) {
    return { bonusAmount: 0, percent: 0, applied: false };
  }

  const eligible = await isFirstDepositEligible(user);
  if (!eligible) {
    return { bonusAmount: 0, percent: settings.percent, applied: false };
  }

  const bonusAmount = calcFirstDepositBonusAmount(depositAmount, settings.percent);
  return {
    bonusAmount,
    percent: settings.percent,
    applied: bonusAmount > 0,
  };
}

/**
 * Atomically mark first-deposit bonus as claimed (prevents double bonus).
 */
export async function claimFirstDepositBonusFlag(userId) {
  const updated = await SubAdmin.findOneAndUpdate(
    {
      _id: userId,
      role: 'user',
      firstDepositBonusClaimed: { $ne: true },
    },
    { $set: { firstDepositBonusClaimed: true } },
    { new: true }
  );
  return Boolean(updated);
}
