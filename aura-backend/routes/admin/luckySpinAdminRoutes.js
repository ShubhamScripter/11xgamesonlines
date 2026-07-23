import express from 'express';
import { getRewardsAndConfig, updateConfig, saveReward } from '../../controllers/admin/luckySpinAdminController.js';
import { adminAuthMiddleware } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.get('/lucky-spin/config', adminAuthMiddleware, getRewardsAndConfig);
router.post('/lucky-spin/config', adminAuthMiddleware, updateConfig);
router.post('/lucky-spin/reward', adminAuthMiddleware, saveReward);

export default router;
