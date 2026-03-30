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
      data: { supportWhatsApp: doc.supportWhatsApp || '' },
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

    const { whatsappDialCode, whatsappPhoneNational, supportWhatsApp } =
      req.body;

    const doc = await getAppSettingsDoc();

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
    await doc.save();

    return res.json({
      success: true,
      message: 'Settings saved',
      data: {
        supportWhatsApp: doc.supportWhatsApp,
        whatsappDialCode: doc.whatsappDialCode,
        whatsappPhoneNational: doc.whatsappPhoneNational,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to save settings',
    });
  }
};
