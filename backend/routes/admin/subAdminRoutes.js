// import express from "express";
// import {
//   changePasswordByDownline,
//   changePasswordBySelf,
//   createSubAdmin,
//   deleteSubAdmin,
//   forceLogoutUser,
//   getAgentTransactionHistory,
//   // getAllBetHistory,
//   getAllDownlineBets,
//   getAllOnlyUser,
//   getAllUser,
//   getCreditRefHistoryByUserId,
//   getDeleteUser,
//   getLoginHistory,
//   getPasswordHistoryByUserId,
//   getSubAdmin,
//   getSubAdminuser,
//   getUserProfile,
//   getUsersByInvite,
//   getUserTransactionHistory,
//   loginSubAdmin,
//   logout,
//   parentsDetails,
//   restoreDeleteUser,
//   updateCreditReference,
//   updateExploserLimit,
//   updateGameLock,
//   userSetting,
//   withdrowalAndDeposite,
//   getUserCompleteInfo,
// } from "../../controllers/admin/subAdminController.js";
// import { adminAuthMiddleware } from "../../middleware/authMiddleware.js";

// const router = express.Router();

// // Only logged-in users can create sub-admins
// router.post("/sub-admin/create", adminAuthMiddleware, createSubAdmin);
// router.post("/sub-admin/profile-data", adminAuthMiddleware, getUserCompleteInfo);
// router.post("/sub-admin/login", loginSubAdmin);
// router.get("/sub-admin/getuserbyid", adminAuthMiddleware, getSubAdmin);

// router.post("/get/all-user", adminAuthMiddleware, getAllUser);
// router.get("/get/delete-user", adminAuthMiddleware, getDeleteUser);
// router.get("/get/all-user-by-invite", adminAuthMiddleware, getUsersByInvite);
// router.post("/user-logout", adminAuthMiddleware, logout);
// router.post("/force-logout/:userId", adminAuthMiddleware, forceLogoutUser);
// router.put("/update/user-details", adminAuthMiddleware, updateCreditReference);
// router.put("/update/user-explosore-limit", adminAuthMiddleware, updateExploserLimit);
// router.put("/withdrowal-deposite", adminAuthMiddleware, withdrowalAndDeposite);
// router.put("/user-setting", adminAuthMiddleware, userSetting);
// router.delete("/sub-admin/delete/:userId", adminAuthMiddleware, deleteSubAdmin);
// router.delete(
//   "/restore/user/:userId/:masterPassword",
//   adminAuthMiddleware,
//   restoreDeleteUser
// );
// router.post("/sub-admin/getSubAdmin", adminAuthMiddleware, getSubAdminuser);
// router.get("/get/all-only-user", adminAuthMiddleware, getAllOnlyUser);
// router.get("/credit-ref-history/:userId", getCreditRefHistoryByUserId);
// router.post("/change/password/self", adminAuthMiddleware, changePasswordBySelf);
// router.post(
//   "/change/password-downline",
//   adminAuthMiddleware,
//   changePasswordByDownline
// );
// router.get(
//   "/get/password-history",
//   adminAuthMiddleware,
//   getPasswordHistoryByUserId
// );
// router.post("/get/login-history", adminAuthMiddleware, getLoginHistory);
// router.get("/get/user-profile/:userId", adminAuthMiddleware, getUserProfile);
// router.post("/get/agent-trantionhistory", adminAuthMiddleware, getAgentTransactionHistory);
// router.get("/get/user-trantion-history/:userId", adminAuthMiddleware, getUserTransactionHistory);
// router.post("/get/all-bet-list", adminAuthMiddleware, getAllDownlineBets);
// router.get("/get/bet-perents/:id", adminAuthMiddleware, parentsDetails);
// router.patch("/gamelock/:id", updateGameLock);

// export default router;



import express from "express";
import {
  changePasswordByDownline,
  changePasswordBySelf,
  createSubAdmin,
  deleteSubAdmin,
  forceLogoutUser,
  getAgentTransactionHistory,
  // getAllBetHistory,
  getAllDownlineBets,
  getAllOnlyUser,
  getAllUser,
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
  userSetting,
  withdrowalAndDeposite,
  getUserCompleteInfo,
  getActiveUsers,
  getLockedUsers,
  getAllUsersIncludingSubAdmins,
  getAllUsersWithUpperline,
  getLockedUsersWithUpperline,
  getUsersByTotalExposure,
  updateUserStatus,
  getUsersByProfitLoss,
  getAgentTransactionHistory2,
  setAgentCommission,
  getDuplicateIPUsers
  
} from "../../controllers/admin/subAdminController.js";
import { adminAuthMiddleware } from "../../middleware/authMiddleware.js";

const router = express.Router();

// Only logged-in users can create sub-admins
router.post("/sub-admin/create", adminAuthMiddleware, createSubAdmin);
router.post("/sub-admin/profile-data", adminAuthMiddleware, getUserCompleteInfo);
router.post("/sub-admin/login", loginSubAdmin);
router.get("/sub-admin/getuserbyid", adminAuthMiddleware, getSubAdmin);
router.post("/get/all-user", adminAuthMiddleware, getAllUser);



router.get("/get/delete-user", adminAuthMiddleware, getDeleteUser);
router.get("/get/all-user-by-invite", adminAuthMiddleware, getUsersByInvite);
router.post("/user-logout", adminAuthMiddleware, logout);
router.post("/force-logout/:userId", adminAuthMiddleware, forceLogoutUser);
router.put("/update/user-details", adminAuthMiddleware, updateCreditReference);
router.put("/update/user-explosore-limit", adminAuthMiddleware, updateExploserLimit);
router.put("/withdrowal-deposite", adminAuthMiddleware, withdrowalAndDeposite);
router.put("/user-setting", adminAuthMiddleware, userSetting);
router.delete("/sub-admin/delete/:userId", adminAuthMiddleware, deleteSubAdmin);
router.delete(
  "/restore/user/:userId/:masterPassword",
  adminAuthMiddleware,
  restoreDeleteUser
);
router.post("/sub-admin/getSubAdmin", adminAuthMiddleware, getSubAdminuser);
router.get("/get/all-only-user", adminAuthMiddleware, getAllOnlyUser);
router.get("/credit-ref-history/:userId", getCreditRefHistoryByUserId);
router.post("/change/password/self", adminAuthMiddleware, changePasswordBySelf);
router.post(
  "/change/password-downline",
  adminAuthMiddleware,
  changePasswordByDownline
);
router.get(
  "/get/password-history",
  adminAuthMiddleware,
  getPasswordHistoryByUserId
);
router.post("/get/login-history", adminAuthMiddleware, getLoginHistory);
router.get("/get/user-profile/:userId", adminAuthMiddleware, getUserProfile);
router.post("/get/agent-trantionhistory", adminAuthMiddleware, getAgentTransactionHistory);
router.post("/get/agent-trantionhistory2",
  //  adminAuthMiddleware,
    getAgentTransactionHistory2);
router.get("/get/user-trantion-history/:userId", adminAuthMiddleware, getUserTransactionHistory);
router.post("/get/all-bet-list", adminAuthMiddleware, getAllDownlineBets);
router.get("/get/bet-perents/:id", adminAuthMiddleware, parentsDetails);
router.get("/active-users", adminAuthMiddleware, getActiveUsers);
router.get("/locked-users", adminAuthMiddleware, getLockedUsers);
router.get("/users-including-subadmins",adminAuthMiddleware, getAllUsersIncludingSubAdmins);
router.get("/to-10-users"
  ,adminAuthMiddleware,
   getUsersByProfitLoss);
router.get("/to-10-exposures",adminAuthMiddleware, getUsersByTotalExposure);
// router.get("/users-with-upperline", getAllUsersWithUpperline);
router.get("/users-locked", getLockedUsersWithUpperline);
router.put("/agent/:agentId/commission", adminAuthMiddleware, setAgentCommission);






router.patch("/gamelock/:id", updateGameLock);
router.get("/duplicate-ip-users", adminAuthMiddleware, getDuplicateIPUsers);

export default router;
