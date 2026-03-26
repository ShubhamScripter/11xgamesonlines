import express from 'express'
import {updateMatchStatus} from '../controllers/matchOverrideController.js';
import {getSuspendedMatches} from '../controllers/matchOverrideController.js';
import {adminAuthMiddleware} from '../middleware/authMiddleware.js';
const router=express.Router();


//Route to update match status(suspend or active)
router.patch('/matches/:matchId/status',adminAuthMiddleware,updateMatchStatus);

//Route to get suspended matches
router.get('/inactivematches',adminAuthMiddleware,getSuspendedMatches);

export default router;

