// File: routes/user.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
// const { getMyDownlineTree } = require('../controllers/user.controller');
const { getUserDownlines,getAccountSummary,updateUserPassword ,getUserLoginLogs,changeUserStatus,addSubadmin,subadminLogin,viewDownlineSubadmins,changeAccountStatus,editDownlineSubadminPassword,getActivityLog,depositToSubadmin,withdrawFromSubadmin,getSubadminTransactions} = require('../controllers/user.controller');

// router.get('/downline-tree/:userId', authMiddleware(), getMyDownlineTree);
router.get('/downline-tree/:userId', authMiddleware(), getUserDownlines);

router.get('/account-summary/:userId',authMiddleware(),getAccountSummary)

router.put('/change-password/:userId', authMiddleware(), updateUserPassword);

router.get('/:userId/login-logs', authMiddleware(), getUserLoginLogs);

router.patch("/:userId/change-status",authMiddleware(),changeUserStatus);

router.post("/add-subadmin",authMiddleware(),addSubadmin);

router.post("/subadmin-login",subadminLogin);

router.get("/:subadminId/downlines",viewDownlineSubadmins);

router.get("/:subadminId/account-summary",viewDownlineSubadmins);

router.patch("/:subadminId/change-status",authMiddleware(),changeAccountStatus);

router.put("/:subadminId/password",authMiddleware(),editDownlineSubadminPassword);

router.get("/:userId/activity-log",authMiddleware(),getActivityLog);


router.post('/subadmin/:subadminId/deposit', authMiddleware(), depositToSubadmin);
router.post('/subadmin/:subadminId/withdraw', authMiddleware(), withdrawFromSubadmin);
router.get('/subadmin/transactions', authMiddleware(), getSubadminTransactions);




module.exports = router;
