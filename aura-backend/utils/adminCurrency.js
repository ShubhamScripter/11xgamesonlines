import SubAdmin from '../models/subAdminModel.js';
import { getAppSettingsDoc } from '../models/appSettingsModel.js';

/** Admin panel displays all monetary values in BDT (USDT wallets × rate). */
export async function getUsdtToBdtRate() {
  const doc = await getAppSettingsDoc();
  return Number(doc?.usdtToBdtRate) || 0;
}

export function amountToAdminBdt(amount, currency, rate) {
  const n = Number(amount) || 0;
  if (String(currency || '').toUpperCase() === 'USDT' && rate > 0) {
    return Math.round(n * rate * 100) / 100;
  }
  return n;
}

const FINANCIAL_KEYS = [
  'balance',
  'baseBalance',
  'totalBalance',
  'avbalance',
  'agentAvbalance',
  'totalAvbalance',
  'exposure',
  'totalExposure',
  'creditReference',
  'creditReferenceProfitLoss',
  'bettingProfitLoss',
  'uplineBettingProfitLoss',
  'rollingCommission',
  'profitLoss',
  'playerbalancee',
  'totalDownlineUserBalance',
  'uplineTotalBalance',
];

/** Convert a plain user object’s financial fields to BDT for admin display. */
export function mapUserFinancialsForAdmin(user, rate) {
  if (!user) return user;
  const plain = typeof user.toObject === 'function' ? user.toObject() : { ...user };
  const currency = plain.currency || 'BDT';
  const out = { ...plain, currency };
  for (const key of FINANCIAL_KEYS) {
    if (plain[key] != null && plain[key] !== '') {
      out[key] = amountToAdminBdt(plain[key], currency, rate);
    }
  }
  return out;
}

const SPORTS_BET_AMOUNT_KEYS = [
  'price',
  'betAmount',
  'resultAmount',
  'profitLossChange',
];

const CASINO_BET_AMOUNT_KEYS = [
  'bet_amount',
  'win_amount',
  'change',
  'wallet_before',
  'wallet_after',
];

/** Convert sports bet history monetary fields to BDT for admin display. */
export function mapSportsBetHistoryForAdmin(bet, currency, rate) {
  const plain = typeof bet.toObject === 'function' ? bet.toObject() : { ...bet };
  const out = { ...plain };
  for (const key of SPORTS_BET_AMOUNT_KEYS) {
    if (plain[key] != null && plain[key] !== '') {
      out[key] = amountToAdminBdt(plain[key], currency, rate);
    }
  }
  return out;
}

/** Convert casino bet history monetary fields to BDT for admin display. */
export function mapCasinoBetHistoryForAdmin(bet, currency, rate) {
  const plain = typeof bet.toObject === 'function' ? bet.toObject() : { ...bet };
  const out = { ...plain };
  for (const key of CASINO_BET_AMOUNT_KEYS) {
    if (plain[key] != null && plain[key] !== '') {
      out[key] = amountToAdminBdt(plain[key], currency, rate);
    }
  }
  return out;
}

export async function mapTransactionsForAdmin(transactions, rate) {
  if (!Array.isArray(transactions) || !rate || rate <= 0) {
    return transactions;
  }

  const ids = [
    ...new Set(transactions.map((t) => String(t.userId || '')).filter(Boolean)),
  ];
  const names = [
    ...new Set(transactions.map((t) => t.userName).filter(Boolean)),
  ];

  const users = await SubAdmin.find({
    $or: [
      ...(ids.length ? [{ _id: { $in: ids } }] : []),
      ...(names.length ? [{ userName: { $in: names } }] : []),
    ],
  })
    .select('currency userName')
    .lean();

  const currencyById = new Map(
    users.map((u) => [String(u._id), u.currency || 'BDT'])
  );
  const currencyByName = new Map(
    users.map((u) => [u.userName, u.currency || 'BDT'])
  );

  return transactions.map((txn) => {
    const c =
      currencyById.get(String(txn.userId)) ||
      currencyByName.get(txn.userName) ||
      'BDT';
    return {
      ...txn,
      deposite: amountToAdminBdt(txn.deposite, c, rate),
      withdrawl: amountToAdminBdt(txn.withdrawl, c, rate),
      amount: amountToAdminBdt(txn.amount, c, rate),
    };
  });
}
