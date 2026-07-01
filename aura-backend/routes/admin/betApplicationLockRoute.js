import express from 'express';

import {
  getBetApplicationLock,
  getBetLockEvents,
  updateBetApplicationLock,
} from '../../controllers/admin/betApplicationLockController.js';
import { adminAuthMiddleware } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.get('/bet-application-lock', adminAuthMiddleware, getBetApplicationLock);
router.put('/bet-application-lock', adminAuthMiddleware, updateBetApplicationLock);
router.get('/bet-application-lock/events', adminAuthMiddleware, getBetLockEvents);

export default router;
