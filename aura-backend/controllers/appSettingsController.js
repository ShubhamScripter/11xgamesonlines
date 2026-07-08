import { getAppSettingsDoc } from '../models/appSettingsModel.js';
import {
  WHATSAPP_COUNTRY_DIALS,
  buildFullWhatsAppDigits,
  parseFullToDialAndNational,
} from '../utils/whatsappSupport.js';

const ALLOWED_UPDATE_ROLES = [
  'superadmin',
  'admin',
  'subadmin',
  'seniorSuper',
];

const ALLOWED_DIALS = new Set(WHATSAPP_COUNTRY_DIALS.map((c) => c.dial));

export const getWhatsAppCountryList = (req, res) => {
  return res.json({ success: true, data: WHATSAPP_COUNTRY_DIALS });
};

export const getPublicAppSettings = async (req, res) => {
  try {
    const doc = await getAppSettingsDoc();
    return res.json({
      success: true,
      data: {
        supportWhatsApp: doc.supportWhatsApp || '',
        usdtToBdtRate: doc.usdtToBdtRate || 0,
        firstDepositBonusEnabled: Boolean(doc.firstDepositBonusEnabled),
        firstDepositBonusPercent: Number(doc.firstDepositBonusPercent) || 0,
        attendanceBonusEnabled: Boolean(doc.attendanceBonusEnabled),
        attendanceBonusAmount: Number(doc.attendanceBonusAmount) || 0,
        firstDepositWageringPercent: Number(doc.firstDepositWageringPercent) || 80,
        affiliateModuleEnabled: Boolean(doc.affiliateModuleEnabled),
        affiliateCommissionPercent: Number(doc.affiliateCommissionPercent) || 0,
        userReferralModuleEnabled: Boolean(doc.userReferralModuleEnabled),
        userReferralCommissionPercent:
          Number(doc.userReferralCommissionPercent) || 0,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to load settings',
    });
  }
};

export const getAdminAppSettings = async (req, res) => {
  try {
    const doc = await getAppSettingsDoc();
    return res.json({
      success: true,
      data: {
        supportWhatsApp: doc.supportWhatsApp || '',
        whatsappDialCode: doc.whatsappDialCode || '',
        whatsappPhoneNational: doc.whatsappPhoneNational || '',
        usdtToBdtRate: doc.usdtToBdtRate || 0,
        firstDepositBonusEnabled: Boolean(doc.firstDepositBonusEnabled),
        firstDepositBonusPercent: Number(doc.firstDepositBonusPercent) || 0,
        attendanceBonusEnabled: Boolean(doc.attendanceBonusEnabled),
        attendanceBonusAmount: Number(doc.attendanceBonusAmount) || 0,
        firstDepositWageringPercent: Number(doc.firstDepositWageringPercent) || 80,
        affiliateModuleEnabled: Boolean(doc.affiliateModuleEnabled),
        affiliateCommissionPercent: Number(doc.affiliateCommissionPercent) || 0,
        userReferralModuleEnabled: Boolean(doc.userReferralModuleEnabled),
        userReferralCommissionPercent:
          Number(doc.userReferralCommissionPercent) || 0,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to load settings',
    });
  }
};

export const updateAdminAppSettings = async (req, res) => {
  try {
    const { role } = req;
    if (!ALLOWED_UPDATE_ROLES.includes(role)) {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to update app settings',
      });
    }

    const {
      whatsappDialCode,
      whatsappPhoneNational,
      supportWhatsApp,
      usdtToBdtRate,
      firstDepositBonusEnabled,
      firstDepositBonusPercent,
      attendanceBonusEnabled,
      attendanceBonusAmount,
      firstDepositWageringPercent,
      affiliateModuleEnabled,
      affiliateCommissionPercent,
      userReferralModuleEnabled,
      userReferralCommissionPercent,
    } = req.body;

    const doc = await getAppSettingsDoc();

    // Only touch WhatsApp fields when the request actually carries them, so a
    // rate-only update doesn't trip the phone-number validation.
    const whatsappProvided =
      whatsappDialCode !== undefined ||
      whatsappPhoneNational !== undefined ||
      supportWhatsApp !== undefined;

    if (whatsappProvided) {
      if (
        whatsappDialCode === undefined &&
        whatsappPhoneNational === undefined &&
        supportWhatsApp !== undefined &&
        typeof supportWhatsApp === 'string'
      ) {
        const p = parseFullToDialAndNational(supportWhatsApp);
        if (!p.dial || !ALLOWED_DIALS.has(p.dial)) {
          return res.status(400).json({
            success: false,
            message: 'Could not detect a valid country code in the number',
          });
        }
        const nat = String(p.national || '').replace(/\D/g, '');
        if (nat.length < 6 || nat.length > 15) {
          return res.status(400).json({
            success: false,
            message: 'Phone number must be 6–15 digits (national part)',
          });
        }
        doc.whatsappDialCode = p.dial;
        doc.whatsappPhoneNational = nat;
      } else {
        const dial = String(whatsappDialCode ?? '')
          .replace(/\D/g, '')
          .trim();
        const national = String(whatsappPhoneNational ?? '')
          .replace(/\D/g, '')
          .trim();

        if (!dial || !ALLOWED_DIALS.has(dial)) {
          return res.status(400).json({
            success: false,
            message: 'Select a valid country',
          });
        }
        if (national.length < 6 || national.length > 15) {
          return res.status(400).json({
            success: false,
            message:
              'Enter mobile number only (6–15 digits), without country code',
          });
        }

        doc.whatsappDialCode = dial;
        doc.whatsappPhoneNational = national;
      }

      doc.supportWhatsApp = buildFullWhatsAppDigits(
        doc.whatsappDialCode,
        doc.whatsappPhoneNational
      );
    }

    if (usdtToBdtRate !== undefined) {
      const rate = Number(usdtToBdtRate);
      if (!Number.isFinite(rate) || rate < 0) {
        return res.status(400).json({
          success: false,
          message: 'USDT→BDT rate must be a non-negative number',
        });
      }
      doc.usdtToBdtRate = rate;
    }

    if (firstDepositBonusEnabled !== undefined) {
      doc.firstDepositBonusEnabled = Boolean(firstDepositBonusEnabled);
    }

    if (firstDepositBonusPercent !== undefined) {
      const pct = Number(firstDepositBonusPercent);
      if (!Number.isFinite(pct) || pct < 0 || pct > 100) {
        return res.status(400).json({
          success: false,
          message: 'First deposit bonus must be between 0 and 100 percent',
        });
      }
      doc.firstDepositBonusPercent = pct;
    }

    if (attendanceBonusEnabled !== undefined) {
      doc.attendanceBonusEnabled = Boolean(attendanceBonusEnabled);
    }

    if (attendanceBonusAmount !== undefined) {
      const amt = Number(attendanceBonusAmount);
      if (!Number.isFinite(amt) || amt < 0) {
        return res.status(400).json({
          success: false,
          message: 'Attendance bonus amount must be zero or greater',
        });
      }
      doc.attendanceBonusAmount = amt;
    }

    if (firstDepositWageringPercent !== undefined) {
      const pct = Number(firstDepositWageringPercent);
      if (!Number.isFinite(pct) || pct < 0 || pct > 100) {
        return res.status(400).json({
          success: false,
          message: 'Wagering percent must be between 0 and 100',
        });
      }
      doc.firstDepositWageringPercent = pct;
    }

    if (affiliateModuleEnabled !== undefined) {
      doc.affiliateModuleEnabled = Boolean(affiliateModuleEnabled);
    }

    if (affiliateCommissionPercent !== undefined) {
      const pct = Number(affiliateCommissionPercent);
      if (!Number.isFinite(pct) || pct < 0 || pct > 100) {
        return res.status(400).json({
          success: false,
          message: 'Affiliate commission must be between 0 and 100 percent',
        });
      }
      doc.affiliateCommissionPercent = pct;
    }

    if (userReferralModuleEnabled !== undefined) {
      doc.userReferralModuleEnabled = Boolean(userReferralModuleEnabled);
    }

    if (userReferralCommissionPercent !== undefined) {
      const pct = Number(userReferralCommissionPercent);
      if (!Number.isFinite(pct) || pct < 0 || pct > 100) {
        return res.status(400).json({
          success: false,
          message: 'User referral commission must be between 0 and 100 percent',
        });
      }
      doc.userReferralCommissionPercent = pct;
    }

    await doc.save();

    return res.json({
      success: true,
      message: 'Settings saved',
      data: {
        supportWhatsApp: doc.supportWhatsApp,
        whatsappDialCode: doc.whatsappDialCode,
        whatsappPhoneNational: doc.whatsappPhoneNational,
        usdtToBdtRate: doc.usdtToBdtRate || 0,
        firstDepositBonusEnabled: Boolean(doc.firstDepositBonusEnabled),
        firstDepositBonusPercent: Number(doc.firstDepositBonusPercent) || 0,
        attendanceBonusEnabled: Boolean(doc.attendanceBonusEnabled),
        attendanceBonusAmount: Number(doc.attendanceBonusAmount) || 0,
        firstDepositWageringPercent: Number(doc.firstDepositWageringPercent) || 80,
        affiliateModuleEnabled: Boolean(doc.affiliateModuleEnabled),
        affiliateCommissionPercent: Number(doc.affiliateCommissionPercent) || 0,
        userReferralModuleEnabled: Boolean(doc.userReferralModuleEnabled),
        userReferralCommissionPercent:
          Number(doc.userReferralCommissionPercent) || 0,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to save settings',
    });
  }
};
