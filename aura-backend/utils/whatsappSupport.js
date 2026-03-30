/**
 * Dial codes for WhatsApp (digits only, no +). Longer codes first for parsing.
 */
export const WHATSAPP_COUNTRY_DIALS = [
  { dial: '971', label: 'United Arab Emirates' },
  { dial: '966', label: 'Saudi Arabia' },
  { dial: '974', label: 'Qatar' },
  { dial: '973', label: 'Bahrain' },
  { dial: '968', label: 'Oman' },
  { dial: '965', label: 'Kuwait' },
  { dial: '880', label: 'Bangladesh' },
  { dial: '977', label: 'Nepal' },
  { dial: '94', label: 'Sri Lanka' },
  { dial: '93', label: 'Afghanistan' },
  { dial: '92', label: 'Pakistan' },
  { dial: '91', label: 'India' },
  { dial: '44', label: 'United Kingdom' },
  { dial: '61', label: 'Australia' },
  { dial: '49', label: 'Germany' },
  { dial: '33', label: 'France' },
  { dial: '39', label: 'Italy' },
  { dial: '34', label: 'Spain' },
  { dial: '86', label: 'China' },
  { dial: '81', label: 'Japan' },
  { dial: '82', label: 'South Korea' },
  { dial: '65', label: 'Singapore' },
  { dial: '60', label: 'Malaysia' },
  { dial: '66', label: 'Thailand' },
  { dial: '63', label: 'Philippines' },
  { dial: '62', label: 'Indonesia' },
  { dial: '1', label: 'USA / Canada' },
];

const DIAL_SORTED = [...new Set(WHATSAPP_COUNTRY_DIALS.map((c) => c.dial))].sort(
  (a, b) => b.length - a.length
);

export function buildFullWhatsAppDigits(dial, national) {
  const d = String(dial ?? '').replace(/\D/g, '');
  const n = String(national ?? '').replace(/\D/g, '');
  if (!d || !n) return '';
  return d + n;
}

/** Split stored full international digits into dial + national (best effort). */
export function parseFullToDialAndNational(full) {
  const digits = String(full ?? '').replace(/\D/g, '');
  if (!digits) return { dial: '91', national: '' };

  for (const code of DIAL_SORTED) {
    if (digits.startsWith(code) && digits.length > code.length) {
      return { dial: code, national: digits.slice(code.length) };
    }
  }
  return { dial: '91', national: digits };
}

export const DEFAULT_WHATSAPP_DIAL = '91';
export const DEFAULT_WHATSAPP_NATIONAL = '9549710379';
