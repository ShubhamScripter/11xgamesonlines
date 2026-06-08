import express from 'express';

import {
  checkMatchStatus,
  getDeactivatedMatches,
  getInactiveMatches,
  toggleMatchStatus,
  updateMatchStatus,
} from '../../controllers/admin/matchSettingsController.js';
import { adminAuthMiddleware } from '../../middleware/authMiddleware.js';

const router = express.Router();

//Toggle Match active/deactive
router.patch(
  '/match-settings/:matchId/toggle-active',
  adminAuthMiddleware,
  toggleMatchStatus
);

// Inactive matches list (admin UI)
router.get('/inactivematches', adminAuthMiddleware, getInactiveMatches);

// Activate / suspend match (admin UI)
router.patch('/matches/:matchId/status', adminAuthMiddleware, updateMatchStatus);

//Get all deactivated matches
router.get('/match-settings/deactivated', adminAuthMiddleware, getDeactivatedMatches);

//Check single match status
router.get(
  '/match-settings/:matchId/status',
  adminAuthMiddleware,
  checkMatchStatus
);

export default router;
