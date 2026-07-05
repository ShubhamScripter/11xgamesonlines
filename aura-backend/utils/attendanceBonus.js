import { getAppSettingsDoc } from '../models/appSettingsModel.js';
import { APP_TIMEZONE } from './appTime.js';

export function getAppDateKey(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: APP_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

export async function getAttendanceBonusSettings() {
  const doc = await getAppSettingsDoc();
  const enabled = Boolean(doc.attendanceBonusEnabled);
  const amount = Math.max(0, Number(doc.attendanceBonusAmount) || 0);
  return { enabled, amount };
}

export function canClaimAttendanceToday(user, todayKey = getAppDateKey()) {
  if (!user?._id) return false;
  return String(user.lastAttendanceDate || '') !== todayKey;
}
