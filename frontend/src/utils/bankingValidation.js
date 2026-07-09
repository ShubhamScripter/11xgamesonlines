import {
  MIN_DEPOSIT_BDT,
  MIN_DEPOSIT_USDT,
  MIN_WITHDRAW_BDT,
  MOBILE_BANKING_METHODS,
} from './bankingConstants';

const MOBILE_IDS = MOBILE_BANKING_METHODS.map((m) => m.id);

function normalizeBdPhone(phone) {
  let d = String(phone || '').replace(/\D/g, '');
  if (d.startsWith('880')) d = d.slice(3);
  if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
  return d;
}

export function resolveMinDeposit(method, accountDetails, isUsdtUser) {
  const custom = Number(accountDetails?.minAmount);
  if (Number.isFinite(custom) && custom > 0) return custom;
  if (String(method) === 'crypto' || isUsdtUser) return MIN_DEPOSIT_USDT;
  return MIN_DEPOSIT_BDT;
}

export function validateDepositForm({
  mainTab,
  mobileMethod,
  amount,
  senderPhone,
  senderPhoneLast4,
  referenceId,
  selectedAccount,
  isUsdtUser,
}) {
  const method = mainTab === 'crypto' ? 'crypto' : mobileMethod;
  const minAmt = resolveMinDeposit(method, selectedAccount?.details, isUsdtUser);
  const amt = Number(amount);

  if (!selectedAccount?._id) {
    return { ok: false, message: 'No deposit account available. Contact admin.' };
  }
  if (!Number.isFinite(amt) || amt < minAmt) {
    return { ok: false, message: `Minimum amount is ${minAmt}.` };
  }

  if (mainTab === 'mobile_banking') {
    const sender = normalizeBdPhone(senderPhone);
    if (sender.length < 10) {
      return { ok: false, message: 'Enter your mobile number (10–11 digits).' };
    }
    const last4 = String(senderPhoneLast4 || '').replace(/\D/g, '');
    if (!/^\d{4}$/.test(last4)) {
      return { ok: false, message: 'Enter the last 4 digits of your mobile number.' };
    }
    if (!sender.endsWith(last4)) {
      return { ok: false, message: 'Last 4 digits do not match your mobile number.' };
    }
    const trx = String(referenceId).replace(/\s/g, '').toUpperCase();
    if (!/^[A-Z0-9]{8,20}$/.test(trx)) {
      return { ok: false, message: 'TrxID must be 8–20 characters (from SMS).' };
    }
    return {
      ok: true,
      method,
      referenceId: trx,
      senderPhone: sender,
      senderPhoneLast4: last4,
    };
  }

  const hash = String(referenceId).replace(/\s/g, '');
  if (hash.length < 10 || hash.length > 120) {
    return { ok: false, message: 'Enter valid transaction hash.' };
  }
  return { ok: true, method: 'crypto', referenceId: hash };
}

export function validateWithdrawForm({
  mobileMethod,
  amount,
  receivePhone,
  accountPassword,
  termsAccepted,
  withdrawable,
}) {
  const minAmt = MIN_WITHDRAW_BDT;
  const amt = Number(amount);

  if (!MOBILE_IDS.includes(mobileMethod)) {
    return { ok: false, message: 'Select a withdraw method.' };
  }
  if (!Number.isFinite(amt) || amt < minAmt) {
    return { ok: false, message: `Minimum withdraw is ${minAmt}.` };
  }
  if (amt > Number(withdrawable || 0)) {
    return { ok: false, message: 'Insufficient withdrawable balance.' };
  }
  const phone = normalizeBdPhone(receivePhone);
  if (phone.length < 10) {
    return { ok: false, message: 'Enter receiving number (10–11 digits).' };
  }
  if (!String(accountPassword || '').trim()) {
    return { ok: false, message: 'Enter account password.' };
  }
  if (!termsAccepted) {
    return { ok: false, message: 'Accept terms to continue.' };
  }
  return { ok: true, phoneNumber: phone };
}
