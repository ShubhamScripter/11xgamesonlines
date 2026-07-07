import express from 'express';

import {
  checkMatchStatus,
  getAdminMatchSectionSettings,
  getDeactivatedMatches,
  getInactiveMatches,
  getPublicMatchSectionSettings,
  toggleMatchStatus,
  updateMatchSections,
  updateMatchStatus,
} from '../../controllers/admin/matchSettingsController.js';
import { adminAuthMiddleware } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.patch(
  '/match-settings/:matchId/toggle-active',
  adminAuthMiddleware,
  toggleMatchStatus
);

router.get('/inactivematches', adminAuthMiddleware, getInactiveMatches);
router.patch('/matches/:matchId/status', adminAuthMiddleware, updateMatchStatus);
router.patch('/matches/:matchId/sections', adminAuthMiddleware, updateMatchSections);
router.get('/admin/match-section-settings', adminAuthMiddleware, getAdminMatchSectionSettings);

router.get('/match-settings/deactivated', adminAuthMiddleware, getDeactivatedMatches);
router.get('/match-settings/:matchId/status', adminAuthMiddleware, checkMatchStatus);

/** Public — user frontend reads section visibility */
router.get('/public/match-section-settings/:matchId', getPublicMatchSectionSettings);

export default router;
