import express from 'express';

import { getAllTv, getTvByEventId } from '../controllers/tvController.js';

const router = express.Router();

router.get('/get-all-tv', getAllTv);
router.get('/tv/by-event', getTvByEventId);

export default router;
