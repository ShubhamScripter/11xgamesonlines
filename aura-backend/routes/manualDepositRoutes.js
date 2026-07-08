import express from 'express';

import {
  createManualDepositAccount,
  createManualDepositRequest,
  deleteManualDepositAccount,
  getManualDepositAccountsForAdmin,
  getManualDepositAccountsForUser,
  getManualDepositRequestsForAdmin,
  getManualDepositPendingCounts,
  getMyManualDepositRequests,
  getFirstDepositBonusInfo,
  reviewManualDepositRequest,
  updateManualDepositAccount,
} from '../controllers/manualDepositController.js';
import {
  adminAuthMiddleware,
  authMiddleware,
} from '../middleware/authMiddleware.js';
import { manualDepositUpload } from '../middleware/manualDepositUpload.js';
import { manualDepositAccountUpload } from '../middleware/manualDepositAccountUpload.js';

const router = express.Router();

// User-side manual deposit flow
router.get('/user/deposit-accounts', authMiddleware, getManualDepositAccountsForUser);
router.post(
  '/user/deposit-requests',
  authMiddleware,
  manualDepositUpload.single('paymentImage'),
  createManualDepositRequest
);
router.get('/user/deposit-requests', authMiddleware, getMyManualDepositRequests);
router.get('/user/first-deposit-bonus', authMiddleware, getFirstDepositBonusInfo);

// Admin-side management
router.get(
  '/admin/deposit-accounts',
  adminAuthMiddleware,
  getManualDepositAccountsForAdmin
);
router.post(
  '/admin/deposit-accounts',
  adminAuthMiddleware,
  manualDepositAccountUpload.single('accountImage'),
  createManualDepositAccount
);
router.put(
  '/admin/deposit-accounts/:accountId',
  adminAuthMiddleware,
  manualDepositAccountUpload.single('accountImage'),
  updateManualDepositAccount
);
router.delete(
  '/admin/deposit-accounts/:accountId',
  adminAuthMiddleware,
  deleteManualDepositAccount
);
router.get(
  '/admin/deposit-requests',
  adminAuthMiddleware,
  getManualDepositRequestsForAdmin
);
router.get(
  '/admin/deposit-pending-counts',
  adminAuthMiddleware,
  getManualDepositPendingCounts
);
router.patch(
  '/admin/deposit-requests/:requestId/review',
  adminAuthMiddleware,
  reviewManualDepositRequest
);

export default router;
