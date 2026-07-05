const MOBILE = ['bkash', 'nagad', 'rocket'];

export const MAX_ACCOUNTS_PER_METHOD = 10;

export const SECTION_HELP = {
  bkash: {
    title: 'bKash deposit account',
    required: ['Account title', 'Mobile number (11 digits)'],
    optional: ['Account type', 'Note shown to user', 'Min deposit amount'],
    userNeeds: ['Amount', 'Sender bKash number', 'TrxID from SMS', 'Payment screenshot'],
    distribution:
      'Multiple bKash accounts are shown to users at random so deposits are spread across all numbers.',
  },
  nagad: {
    title: 'Nagad deposit account',
    required: ['Account title', 'Mobile number (11 digits)'],
    optional: ['Account type', 'Note', 'Min deposit amount'],
    userNeeds: ['Amount', 'Sender Nagad number', 'TrxID', 'Payment screenshot'],
    distribution:
      'Multiple Nagad accounts are shown to users at random so deposits are spread across all numbers.',
  },
  rocket: {
    title: 'Rocket deposit account',
    required: ['Account title', 'Mobile number (11 digits)'],
    optional: ['Account type', 'Note', 'Min deposit amount'],
    userNeeds: ['Amount', 'Sender Rocket number', 'TrxID', 'Payment screenshot'],
    distribution:
      'Multiple Rocket accounts are shown to users at random so deposits are spread across all numbers.',
  },
  crypto: {
    title: 'Crypto (USDT) wallet',
    required: ['Account title', 'Network (e.g. TRC20)', 'Wallet address'],
    optional: ['QR code image', 'Note', 'Min deposit USDT'],
    userNeeds: ['Amount', 'On-chain transaction hash'],
    distribution:
      'Multiple crypto wallets are assigned to users at random when more than one is active.',
  },
};

function normalizeBdPhone(phone) {
  let d = String(phone || '').replace(/\D/g, '');
  if (d.startsWith('880')) d = d.slice(3);
  if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
  return d;
}

export function validateAdminDepositAccountForm(form) {
  const method = String(form.method || '').toLowerCase();

  if (!String(form.title || '').trim()) {
    return { ok: false, message: 'Account title is required.' };
  }

  if (MOBILE.includes(method)) {
    const digits = normalizeBdPhone(form.phoneNumber);
    if (digits.length < 10 || digits.length > 11) {
      return {
        ok: false,
        message: 'Mobile number is required (10–11 digits, e.g. 01755224890).',
      };
    }
    return { ok: true };
  }

  if (method === 'crypto') {
    if (!String(form.network || '').trim()) {
      return { ok: false, message: 'Network / currency is required.' };
    }
    if (!String(form.walletAddress || '').trim()) {
      return { ok: false, message: 'Wallet address is required.' };
    }
    if (String(form.walletAddress).trim().length < 20) {
      return { ok: false, message: 'Wallet address looks too short.' };
    }
    return { ok: true };
  }

  return { ok: false, message: 'Invalid section.' };
}
