// routes/tennisRoutes.js
import express from 'express';

import {
  fetchTannisBettingData,
  fetchTennisData,
  getTennisScorecard,
} from '../controllers/tennisController.js';

const router = express.Router();

router.get('/tennis', fetchTennisData); // GET /api/tennis
router.get('/tannis/betting', fetchTannisBettingData); // /api/betting?gameid=123
router.get('/tennis/scorecard', getTennisScorecard);

export default router;
