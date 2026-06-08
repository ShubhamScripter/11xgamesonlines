import express from 'express';

import {
  changePasswordByDownline,
  changePasswordBySelf,
  changePasswordBySubAdmin,
  createSubAdmin,
  deleteSubAdmin,
  forceLogoutUser,
  getAgentTransactionHistory,
  getAgentOwnTransactionHistory,
  getUserOwnTransactionHistory,
  // getAllBetHistory,
  getAllDownlineBets,
  getAllOnlyUser,
  getAllUser,
  getAllUsersWithCompleteInfo,
  getCreditRefHistoryByUserId,
  getDeleteUser,
  getLoginHistory,
  getPasswordHistoryByUserId,
  getSubAdmin,
  getSubAdminuser,
  getUserProfile,
  getUsersByInvite,
  getUserTransactionHistory,
  loginSubAdmin,
  logout,
  parentsDetails,
  restoreDeleteUser,
  updateCreditReference,
  updateExploserLimit,
  updateGameLock,
  updatePartnership,
  userSetting,
  withdrowalAndDeposite,
  getDuplicateIPUsers,
  getLockedUsers,
  getUserCompleteInfo,
  getUserProfileLight,
} from '../../controllers/admin/subAdminController.js';
import { adminAuthMiddleware } from '../../middleware/authMiddleware.js';
import {
  getAdminAppSettings,
  updateAdminAppSettings,
} from '../../controllers/appSettingsController.js';

const router = express.Router();

// Only logged-in users can create sub-admins
router.post('/sub-admin/create', adminAuthMiddleware, createSubAdmin);
router.post('/sub-admin/login', loginSubAdmin);
router.get('/sub-admin/getuserbyid', adminAuthMiddleware, getSubAdmin);

router.post('/get/all-user', adminAuthMiddleware, getAllUser);
router.get('/get/delete-user', adminAuthMiddleware, getDeleteUser);
router.get('/get/all-user-by-invite', adminAuthMiddleware, getUsersByInvite);
router.post('/user-logout', adminAuthMiddleware, logout);
router.post('/force-logout/:userId', adminAuthMiddleware, forceLogoutUser);
router.put('/update/user-details', adminAuthMiddleware, updateCreditReference);
router.put(
  '/update/user-explosore-limit',
  adminAuthMiddleware,
  updateExploserLimit
);
router.put('/withdrowal-deposite', adminAuthMiddleware, withdrowalAndDeposite);
router.put('/update/partnership', adminAuthMiddleware, updatePartnership);
router.put('/user-setting', adminAuthMiddleware, userSetting);
router.delete('/sub-admin/delete/:userId', adminAuthMiddleware, deleteSubAdmin);
router.delete(
  '/restore/user/:userId/:masterPassword',
  adminAuthMiddleware,
  restoreDeleteUser
);
router.post('/sub-admin/getSubAdmin', adminAuthMiddleware, getSubAdminuser);
router.get('/get/all-only-user', adminAuthMiddleware, getAllOnlyUser);
router.get('/credit-ref-history/:userId', getCreditRefHistoryByUserId);
router.post('/change/password-self', adminAuthMiddleware, changePasswordBySelf);
router.post(
  '/change/password-downline',
  adminAuthMiddleware,
  changePasswordByDownline
);
router.get(
  '/get/password-history',
  adminAuthMiddleware,
  getPasswordHistoryByUserId
);
router.get('/get/login-history/:userId', adminAuthMiddleware, getLoginHistory);
router.get('/get/user-profile/:userId', adminAuthMiddleware, getUserProfile);
router.post(
  '/get/agent-trantionhistory',
  adminAuthMiddleware,
  getAgentTransactionHistory
);
router.post(
  '/get/agent-own-trantionhistory',
  adminAuthMiddleware,
  getAgentOwnTransactionHistory
);
router.get(
  '/get/user-own-trantion-history/:userId',
  adminAuthMiddleware,
  getUserOwnTransactionHistory
);
router.get(
  '/get/user-trantion-history/:userId',
  adminAuthMiddleware,
  getUserTransactionHistory
);
router.post('/get/all-bet-list', adminAuthMiddleware, getAllDownlineBets);
router.get('/get/bet-perents/:id', adminAuthMiddleware, parentsDetails);
router.patch('/gamelock/:id', adminAuthMiddleware, updateGameLock);
router.get(
  '/getAllUsersWithCompleteInfo',
  adminAuthMiddleware,
  getAllUsersWithCompleteInfo
);
router.post(
  '/change/password-subAdmin',
  adminAuthMiddleware,
  changePasswordBySubAdmin
);
router.post("/sub-admin/profile-data", adminAuthMiddleware, getUserCompleteInfo);
router.post("/sub-admin/profile-light", adminAuthMiddleware, getUserProfileLight);

router.get("/duplicate-ip-users", adminAuthMiddleware, getDuplicateIPUsers);
router.get("/users-locked", adminAuthMiddleware, getLockedUsers);

router.get('/admin/app-settings', adminAuthMiddleware, getAdminAppSettings);
router.put('/admin/app-settings', adminAuthMiddleware, updateAdminAppSettings);

export default router;
