/** Max active deposit accounts admin can add per payment method section. */
export const MAX_ACCOUNTS_PER_METHOD = 10;

export const VALID_DEPOSIT_METHODS = ['bkash', 'nagad', 'rocket', 'crypto'];

/** Legacy methods — hidden from UI; existing DB rows may still exist. */
export const LEGACY_DEPOSIT_METHODS = ['bank', 'upi', 'whatsapp'];

export const MOBILE_BANKING_METHODS = ['bkash', 'nagad', 'rocket'];

export const MIN_DEPOSIT_BDT = 100;
export const MIN_DEPOSIT_USDT = 10;
export const MIN_WITHDRAW_BDT = 100;

export const ADMIN_SECTION_REQUIREMENTS = {
  bkash: ['title', 'phoneNumber'],
  nagad: ['title', 'phoneNumber'],
  rocket: ['title', 'phoneNumber'],
  crypto: ['title', 'network', 'walletAddress'],
};

export function isActiveDepositMethod(method) {
  return VALID_DEPOSIT_METHODS.includes(String(method || '').toLowerCase());
}

export function isMobileBankingMethod(method) {
  return MOBILE_BANKING_METHODS.includes(String(method || '').toLowerCase());
}

export function normalizeBdPhone(phone) {
  let digits = String(phone || '').replace(/\D/g, '');
  if (digits.startsWith('880')) digits = digits.slice(3);
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  return digits;
}

export function validateBdMobilePhone(phone, label = 'Mobile number') {
  const digits = normalizeBdPhone(phone);
  if (digits.length < 10 || digits.length > 11) {
    return {
      ok: false,
      message: `${label} must be 10–11 digits (Bangladesh, e.g. 01755224890).`,
    };
  }
  return { ok: true, value: digits };
}

export function resolveMinDepositAmount(method, accountDetails = {}) {
  const custom = Number(accountDetails?.minAmount);
  if (Number.isFinite(custom) && custom > 0) return custom;
  const m = String(method || '').toLowerCase();
  if (m === 'crypto') return MIN_DEPOSIT_USDT;
  return MIN_DEPOSIT_BDT;
}

export function validateAdminAccountDetails(
  method,
  details = {},
  { hasQrImage = false } = {}
) {
  const m = String(method || '').toLowerCase();
  if (!isActiveDepositMethod(m)) {
    return { ok: false, message: 'Invalid or disabled deposit method.' };
  }

  const d = { ...details };

  if (isMobileBankingMethod(m)) {
    const phone = validateBdMobilePhone(d.phoneNumber, 'Mobile number');
    if (!phone.ok) return phone;
    return {
      ok: true,
      details: {
        ...d,
        phoneNumber: phone.value,
        accountType: String(d.accountType || 'Personal').trim() || 'Personal',
        note: String(d.note || 'Send Money only').trim(),
      },
    };
  }

  if (m === 'crypto') {
    const wallet = String(d.walletAddress || '').trim();
    const network = String(d.network || '').trim();
    if (!network) return { ok: false, message: 'Network / currency is required.' };
    if (!wallet) return { ok: false, message: 'Wallet address is required.' };
    if (wallet.length < 20) {
      return { ok: false, message: 'Wallet address looks invalid (too short).' };
    }
    return { ok: true, details: { ...d, walletAddress: wallet, network } };
  }

  return { ok: false, message: 'Invalid deposit method.' };
}

export function validateDepositReferenceId(method, referenceId) {
  const ref = String(referenceId ?? '').trim();
  if (!ref) {
    return { ok: false, message: 'Transaction ID is required.' };
  }

  const m = String(method || '').toLowerCase();

  if (isMobileBankingMethod(m)) {
    const trx = ref.replace(/\s/g, '').toUpperCase();
    if (!/^[A-Z0-9]{8,20}$/.test(trx)) {
      return {
        ok: false,
        message: 'TrxID must be 8–20 letters or numbers (from SMS).',
      };
    }
    return { ok: true, value: trx };
  }

  if (m === 'crypto') {
    const hash = ref.replace(/\s/g, '');
    if (hash.length < 10 || hash.length > 120) {
      return { ok: false, message: 'Enter a valid on-chain transaction hash.' };
    }
    return { ok: true, value: hash };
  }

  return { ok: false, message: 'Invalid deposit method.' };
}

export function depositScreenshotRequired() {
  return false;
}

export function validateSenderPhoneLast4(senderPhone, last4) {
  const digits = String(last4 ?? '').replace(/\D/g, '');
  if (!/^\d{4}$/.test(digits)) {
    return { ok: false, message: 'Enter the last 4 digits of your mobile number.' };
  }
  const phone = normalizeBdPhone(senderPhone);
  if (!phone.endsWith(digits)) {
    return {
      ok: false,
      message: 'Last 4 digits do not match your mobile number.',
    };
  }
  return { ok: true, value: digits };
}

export function validateUserDepositRequest({
  method,
  amount,
  referenceId,
  senderPhone,
  senderPhoneLast4,
  accountDetails,
}) {
  const m = String(method || '').toLowerCase();
  if (!isActiveDepositMethod(m)) {
    return { ok: false, message: 'Invalid deposit method.' };
  }

  const minAmt = resolveMinDepositAmount(m, accountDetails);
  const amt = Number(amount);

  if (!Number.isFinite(amt) || amt < minAmt) {
    return {
      ok: false,
      message: `Minimum deposit amount is ${minAmt}.`,
    };
  }

  const refCheck = validateDepositReferenceId(m, referenceId);
  if (!refCheck.ok) return refCheck;

  if (isMobileBankingMethod(m)) {
    const phone = validateBdMobilePhone(senderPhone, 'Your mobile number');
    if (!phone.ok) return phone;
    const last4Check = validateSenderPhoneLast4(phone.value, senderPhoneLast4);
    if (!last4Check.ok) return last4Check;
    return {
      ok: true,
      referenceId: refCheck.value,
      senderPhone: phone.value,
      senderPhoneLast4: last4Check.value,
    };
  }

  if (m === 'crypto') {
    return { ok: true, referenceId: refCheck.value };
  }

  return { ok: false, message: 'Invalid deposit method.' };
}

export function validateUserWithdrawRequest({
  method,
  amount,
  withdrawable,
  phoneNumber,
  hasPassword,
  requiredWagering,
  currentWageredAmount,
}) {
  const m = String(method || '').toLowerCase();
  const amt = Number(amount);
  const minAmt = MIN_WITHDRAW_BDT;

  if (!isMobileBankingMethod(m)) {
    return { ok: false, message: 'Withdraw is only available via mobile banking.' };
  }

  const reqWager = Number(requiredWagering) || 0;
  const curWager = Number(currentWageredAmount) || 0;
  if (reqWager > 0 && curWager < reqWager) {
    const remaining = Math.round((reqWager - curWager) * 100) / 100;
    return {
      ok: false,
      message: `Withdrawal locked until wagering target is met. Remaining: ${remaining}.`,
    };
  }

  if (!Number.isFinite(amt) || amt < minAmt) {
    return { ok: false, message: `Minimum withdraw amount is ${minAmt}.` };
  }
  if (amt > Number(withdrawable || 0)) {
    return { ok: false, message: 'Insufficient withdrawable balance.' };
  }
  if (!hasPassword) {
    return { ok: false, message: 'Account password is required.' };
  }

  const phone = validateBdMobilePhone(phoneNumber, 'Receiving mobile number');
  if (!phone.ok) return phone;
  return { ok: true, phoneNumber: phone.value };
}
