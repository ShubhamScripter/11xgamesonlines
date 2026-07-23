import express from 'express';
import { getSpinInfo, spin } from '../controllers/luckySpinController.js';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/lucky-spin/info', optionalAuthMiddleware, getSpinInfo);
router.post('/lucky-spin/spin', authMiddleware, spin);

export default router;
