export const MAX_ACCOUNTS_PER_METHOD = 10;

export const MOBILE_BANKING_METHODS = [
  { id: 'bkash', label: 'bKash', color: '#e2136e' },
  { id: 'nagad', label: 'Nagad', color: '#f69220' },
  { id: 'rocket', label: 'Rocket', color: '#8b3f9e' },
];

export const DEPOSIT_MAIN_TABS = [
  { id: 'mobile_banking', label: 'Mobile Banking' },
  { id: 'crypto', label: 'Crypto' },
];

export const QUICK_AMOUNTS_BDT = [500, 1000, 2000, 5000];

export const MIN_DEPOSIT_BDT = 100;
export const MIN_DEPOSIT_USDT = 10;
export const MIN_WITHDRAW_BDT = 100;

export function formatBdPhoneDisplay(digits) {
  const d = String(digits || '').replace(/\D/g, '');
  if (d.length === 11 && d.startsWith('0')) {
    return `${d.slice(0, 5)}-${d.slice(5, 8)} ${d.slice(8)}`;
  }
  if (d.length === 10) {
    return `${d.slice(0, 4)}-${d.slice(4, 7)} ${d.slice(7)}`;
  }
  return d;
}

export function methodLabel(method) {
  const map = {
    bkash: 'bKash',
    nagad: 'Nagad',
    rocket: 'Rocket',
    crypto: 'Crypto',
  };
  return map[String(method || '').toLowerCase()] || method;
}
