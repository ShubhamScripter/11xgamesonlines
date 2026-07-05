import { VALID_DEPOSIT_METHODS } from '../constants/manualDepositConstants.js';

/** Accounts owned by the user's upline admin. */
export function buildOwnerAdminAccountFilter(ownerAdmin, extra = {}) {
  return {
    isActive: true,
    method: { $in: VALID_DEPOSIT_METHODS },
    ...extra,
    $or: [
      { createdById: ownerAdmin._id },
      { createdById: null, createdBy: ownerAdmin.userName },
    ],
  };
}

/**
 * Pick one random active deposit account for a method (MongoDB $sample).
 * Used so multiple Nagad/bKash/etc. accounts are load-balanced across users.
 */
export async function pickRandomDepositAccount(ManualDepositAccount, filter) {
  const rows = await ManualDepositAccount.aggregate([
    { $match: filter },
    { $sample: { size: 1 } },
  ]);
  if (!rows.length) return null;
  return ManualDepositAccount.findById(rows[0]._id);
}

export async function countDepositAccounts(ManualDepositAccount, filter) {
  return ManualDepositAccount.countDocuments(filter);
}
