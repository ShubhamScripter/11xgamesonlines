import { VALID_DEPOSIT_METHODS } from '../constants/manualDepositConstants.js';
import SubAdmin from '../models/subAdminModel.js';

/** Roles that typically own platform deposit accounts (not agents). */
const DEPOSIT_OWNER_ROLES = new Set([
  'superadmin',
  'admin',
  'subadmin',
  'seniorSuper',
]);

/**
 * Resolve which admin's deposit accounts a user should see.
 * Agent-referred users have invite = agent code; walk up to superadmin/admin.
 */
export async function resolveDepositOwnerAdmin(user) {
  if (!user?.invite) return null;

  let code = String(user.invite).trim().toUpperCase();
  const visited = new Set();
  let directParent = null;

  for (let depth = 0; depth < 20 && code && !visited.has(code); depth++) {
    visited.add(code);
    const parent = await SubAdmin.findOne({
      code,
      status: { $ne: 'delete' },
    }).lean();
    if (!parent) break;

    if (!directParent) directParent = parent;

    if (DEPOSIT_OWNER_ROLES.has(parent.role)) {
      return parent;
    }

    code = parent.invite ? String(parent.invite).trim().toUpperCase() : '';
  }

  return directParent;
}

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
export async function pickRandomDepositAccount(
  ManualDepositAccount,
  filter,
  { excludeId } = {}
) {
  const match = { ...filter };
  if (excludeId) {
    match._id = { $ne: excludeId };
  }
  const rows = await ManualDepositAccount.aggregate([
    { $match: match },
    { $sample: { size: 1 } },
  ]);
  if (!rows.length) return null;
  return ManualDepositAccount.findById(rows[0]._id);
}

export async function countDepositAccounts(ManualDepositAccount, filter) {
  return ManualDepositAccount.countDocuments(filter);
}
