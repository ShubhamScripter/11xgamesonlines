import express from 'express';
import { requireSkyhighSignature } from '../middleware/skyhighSignature.js';
import {
  skyhighAuthenticate,
  skyhighBalance,
  skyhighBet,
  skyhighWin,
  skyhighRollback,
} from '../controllers/skyhighWalletController.js';

const router = express.Router();

router.use(requireSkyhighSignature);

router.post('/authenticate', skyhighAuthenticate);
router.post('/balance', skyhighBalance);
router.post('/bet', skyhighBet);
router.post('/win', skyhighWin);
router.post('/rollback', skyhighRollback);

export default router;
