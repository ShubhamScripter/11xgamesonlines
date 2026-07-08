import express from 'express';

import {
  changePasswordByFirstLogin,
  changePasswordByUserSelf,
  getLoginHistory,
  getPasswordHistoryByUserId,
  getUserById,
  getUserWageringStatus,
  loginUser,
  registerSelf,
  updateQuickStakes,
  updateTheme,
  user_logout,
  getMyReferralStats,
} from '../controllers/userController.js';
import {
  getPublicAppSettings,
  getWhatsAppCountryList,
} from '../controllers/appSettingsController.js';
import {
  getP2PTransferHistory,
  transferP2P,
} from '../controllers/p2pController.js';
import {
  claimAttendanceBonus,
  getAttendanceStatus,
} from '../controllers/attendanceBonusController.js';
import { claimCoupon } from '../controllers/giftCouponController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/public/app-settings', getPublicAppSettings);
router.get('/public/whatsapp-countries', getWhatsAppCountryList);

// router.post("/register", registerUser);
router.post('/user/register', registerSelf);
router.post('/user/login', loginUser);

router.get('/get/user-details', authMiddleware, getUserById);
router.get('/customer/logout', user_logout);
router.post(
  '/change/password-self/user',
  authMiddleware,
  changePasswordByUserSelf
);
router.post(
  '/change/password/first-login',
  authMiddleware,
  changePasswordByFirstLogin
);
router.get('/password/history', authMiddleware, getPasswordHistoryByUserId);
router.get('/get/user-login-history/:userId', authMiddleware, getLoginHistory);
router.put('/update/quick-stakes', authMiddleware, updateQuickStakes);
router.put('/update/theme', authMiddleware, updateTheme);
router.post('/user/p2p-transfer', authMiddleware, transferP2P);
router.get('/user/p2p-transfer-log', authMiddleware, getP2PTransferHistory);
router.get('/user/attendance', authMiddleware, getAttendanceStatus);
router.post('/user/attendance/claim', authMiddleware, claimAttendanceBonus);
router.get('/user/wagering-status', authMiddleware, getUserWageringStatus);
router.post('/user/coupon/claim', authMiddleware, claimCoupon);
router.get('/user/referral', authMiddleware, getMyReferralStats);
export default router;