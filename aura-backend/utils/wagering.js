function round2(n) {
  return Math.round(Number(n) * 100) / 100;
}

/** Wagering target = (deposit + bonus) × multiplier (default 80%). */
export function calcRequiredWagering(depositAmount, bonusAmount, multiplierPercent = 80) {
  const deposit = round2(depositAmount);
  const bonus = round2(bonusAmount);
  const pct = Math.min(100, Math.max(0, Number(multiplierPercent) || 0));
  if (!deposit && !bonus) return 0;
  return round2((deposit + bonus) * (pct / 100));
}

export function getWageringStatus(user) {
  const required = round2(Number(user?.requiredWagering) || 0);
  const current = round2(Number(user?.currentWageredAmount) || 0);
  const remaining = required > current ? round2(required - current) : 0;
  const met = required <= 0 || current >= required;
  return {
    requiredWagering: required,
    currentWageredAmount: current,
    remainingWagering: remaining,
    wageringMet: met,
    withdrawalLocked: required > 0 && !met,
  };
}

export function validateWithdrawalWagering(user) {
  const status = getWageringStatus(user);
  if (status.withdrawalLocked) {
    return {
      ok: false,
      message: `Withdrawal locked until wagering target is met. Remaining: ${status.remainingWagering}.`,
      ...status,
    };
  }
  return { ok: true, ...status };
}

/**
 * Set wagering requirement when first-deposit bonus is credited.
 */
export async function applyWageringOnFirstDepositBonus(
  userId,
  depositAmount,
  bonusAmount,
  multiplierPercent = 80
) {
  if (!userId || !bonusAmount || bonusAmount <= 0) return null;
  const required = calcRequiredWagering(depositAmount, bonusAmount, multiplierPercent);
  if (required <= 0) return null;

  const SubAdmin = (await import('../models/subAdminModel.js')).default;
  return SubAdmin.findByIdAndUpdate(
    userId,
    {
      $set: {
        requiredWagering: required,
        currentWageredAmount: 0,
      },
    },
    { new: true }
  );
}

/**
 * Increment wagered turnover when user places a bet (fire-and-forget safe).
 */
export async function incrementWageredAmount(userId, betStake) {
  const stake = round2(Math.abs(Number(betStake)));
  if (!userId || !stake) return;

  const SubAdmin = (await import('../models/subAdminModel.js')).default;
  const user = await SubAdmin.findById(userId).select('requiredWagering currentWageredAmount');
  if (!user || !(Number(user.requiredWagering) > 0)) return;

  await SubAdmin.findByIdAndUpdate(userId, {
    $inc: { currentWageredAmount: stake },
  });
}
