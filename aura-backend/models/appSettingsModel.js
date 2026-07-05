import mongoose from 'mongoose';

import {
  DEFAULT_WHATSAPP_DIAL,
  DEFAULT_WHATSAPP_NATIONAL,
  buildFullWhatsAppDigits,
  parseFullToDialAndNational,
} from '../utils/whatsappSupport.js';

const appSettingsSchema = new mongoose.Schema(
  {
    whatsappDialCode: {
      type: String,
      default: DEFAULT_WHATSAPP_DIAL,
      trim: true,
    },
    whatsappPhoneNational: {
      type: String,
      default: DEFAULT_WHATSAPP_NATIONAL,
      trim: true,
    },
    supportWhatsApp: {
      type: String,
      default: '',
      trim: true,
    },
    // Exchange rate: 1 USDT = X BDT. 0 means "not configured yet".
    usdtToBdtRate: {
      type: Number,
      default: 0,
      min: 0,
    },
    /** First deposit bonus — admin controlled */
    firstDepositBonusEnabled: {
      type: Boolean,
      default: false,
    },
    firstDepositBonusPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    /** Daily attendance check-in bonus */
    attendanceBonusEnabled: {
      type: Boolean,
      default: false,
    },
    attendanceBonusAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

const AppSettings = mongoose.model('AppSettings', appSettingsSchema);

/** Single row: create default doc if none exists */
export async function getAppSettingsDoc() {
  let doc = await AppSettings.findOne();
  if (!doc) {
    const full = buildFullWhatsAppDigits(
      DEFAULT_WHATSAPP_DIAL,
      DEFAULT_WHATSAPP_NATIONAL
    );
    return await AppSettings.create({
      whatsappDialCode: DEFAULT_WHATSAPP_DIAL,
      whatsappPhoneNational: DEFAULT_WHATSAPP_NATIONAL,
      supportWhatsApp: full,
    });
  }

  let modified = false;
  if (!String(doc.whatsappDialCode || '').trim()) {
    const p = parseFullToDialAndNational(doc.supportWhatsApp || '');
    doc.whatsappDialCode = p.dial || DEFAULT_WHATSAPP_DIAL;
    doc.whatsappPhoneNational = p.national || DEFAULT_WHATSAPP_NATIONAL;
    modified = true;
  }
  if (!String(doc.whatsappPhoneNational || '').trim()) {
    doc.whatsappPhoneNational = DEFAULT_WHATSAPP_NATIONAL;
    modified = true;
  }

  const full = buildFullWhatsAppDigits(
    doc.whatsappDialCode,
    doc.whatsappPhoneNational
  );
  if (full && doc.supportWhatsApp !== full) {
    doc.supportWhatsApp = full;
    modified = true;
  }
  if (modified) await doc.save();
  return doc;
}

export default AppSettings;
