import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { skyhighLaunch } from '../controllers/skyhighLaunchController.js';

const router = express.Router();

router.post('/skyhigh/launch', authMiddleware, skyhighLaunch);

export default router;
