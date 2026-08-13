import SubAdmin from '../models/subAdminModel.js';
import SkyhighLaunchToken from '../models/skyhighLaunchTokenModel.js';
import SkyhighWalletTx from '../models/skyhighWalletTxModel.js';
import { sendToUser } from '../socket/bettingSocket.js';

function round2(n) {
  return Math.round((Number(n) || 0) * 100) / 100;
}

function pushBalance(user) {
  try {
    sendToUser(user.userName, {
      type: 'balance_update',
      newBalance: round2(user.avbalance),
      userId: String(user._id),
    });
  } catch {
    /* ignore ws errors */
  }
}

async function findPlayer(playerId) {
  if (!playerId) return null;
  return SubAdmin.findOne({ _id: playerId, role: 'user' });
}

function walletCurrency(user) {
  return String(user?.currency || 'BDT').toUpperCase();
}

/** POST /wallet/authenticate */
export async function skyhighAuthenticate(req, res) {
  try {
    const token = String(req.body.token || '');
    if (!token) {
      return res.status(400).json({ error: 'Missing token' });
    }

    const row = await SkyhighLaunchToken.findOne({ token });
    if (!row || row.expiresAt.getTime() < Date.now()) {
      return res.status(401).json({ error: 'Invalid or expired launch token' });
    }

    const player = await findPlayer(row.playerId);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    // One-time use
    await SkyhighLaunchToken.deleteOne({ _id: row._id });

    return res.json({
      playerId: String(player._id),
      currency: walletCurrency(player),
      balance: round2(player.avbalance),
      nickname: player.userName || player.name || 'Player',
    });
  } catch (e) {
    console.error('[skyhigh] authenticate', e.message);
    return res.status(500).json({ error: 'Authenticate failed' });
  }
}

/** POST /wallet/balance */
export async function skyhighBalance(req, res) {
  try {
    const player = await findPlayer(String(req.body.playerId || ''));
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }
    return res.json({ balance: round2(player.avbalance) });
  } catch (e) {
    console.error('[skyhigh] balance', e.message);
    return res.status(500).json({ error: 'Balance failed' });
  }
}

/** POST /wallet/bet */
export async function skyhighBet(req, res) {
  try {
    const playerId = String(req.body.playerId || '');
    const amount = round2(req.body.amount);
    const txId = String(req.body.txId || '');
    const roundId = String(req.body.roundId || '');
    const currency = String(req.body.currency || 'BDT').toUpperCase();

    if (!playerId || !txId || amount <= 0) {
      return res.status(400).json({ error: 'Invalid bet payload' });
    }

    const existing = await SkyhighWalletTx.findOne({ txId });
    if (existing) {
      const player = await findPlayer(playerId);
      return res.json({
        balance: round2(player?.avbalance),
        txId,
      });
    }

    const updated = await SubAdmin.findOneAndUpdate(
      {
        _id: playerId,
        role: 'user',
        avbalance: { $gte: amount },
      },
      {
        $inc: {
          avbalance: -amount,
          balance: -amount,
          baseBalance: -amount,
        },
      },
      { new: true }
    );

    if (!updated) {
      const player = await findPlayer(playerId);
      if (!player) {
        return res.status(404).json({ error: 'Player not found' });
      }
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    await SkyhighWalletTx.create({
      txId,
      type: 'bet',
      playerId,
      amount,
      currency,
      roundId,
      status: 'completed',
    });

    pushBalance(updated);
    console.log(`[skyhigh] bet -${amount} → ${updated.userName} bal=${updated.avbalance}`);
    return res.json({ balance: round2(updated.avbalance), txId });
  } catch (e) {
    if (e?.code === 11000) {
      const player = await findPlayer(String(req.body.playerId || ''));
      return res.json({
        balance: round2(player?.avbalance),
        txId: String(req.body.txId || ''),
      });
    }
    console.error('[skyhigh] bet', e.message);
    return res.status(500).json({ error: 'Bet failed' });
  }
}

/** POST /wallet/win */
export async function skyhighWin(req, res) {
  try {
    const playerId = String(req.body.playerId || '');
    const amount = round2(req.body.amount);
    const txId = String(req.body.txId || '');
    const refTxId = String(req.body.refTxId || '');
    const roundId = String(req.body.roundId || '');
    const currency = String(req.body.currency || 'BDT').toUpperCase();

    if (!playerId || !txId) {
      return res.status(400).json({ error: 'Invalid win payload' });
    }

    const existing = await SkyhighWalletTx.findOne({ txId });
    if (existing) {
      const player = await findPlayer(playerId);
      return res.json({
        balance: round2(player?.avbalance),
        txId,
      });
    }

    if (amount < 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    let updated;
    if (amount > 0) {
      updated = await SubAdmin.findOneAndUpdate(
        { _id: playerId, role: 'user' },
        {
          $inc: {
            avbalance: amount,
            balance: amount,
            baseBalance: amount,
          },
        },
        { new: true }
      );
    } else {
      updated = await findPlayer(playerId);
    }

    if (!updated) {
      return res.status(404).json({ error: 'Player not found' });
    }

    await SkyhighWalletTx.create({
      txId,
      type: 'win',
      playerId,
      amount,
      currency,
      roundId,
      refTxId,
      status: 'completed',
    });

    pushBalance(updated);
    console.log(`[skyhigh] win +${amount} → ${updated.userName} bal=${updated.avbalance}`);
    return res.json({ balance: round2(updated.avbalance), txId });
  } catch (e) {
    if (e?.code === 11000) {
      const player = await findPlayer(String(req.body.playerId || ''));
      return res.json({
        balance: round2(player?.avbalance),
        txId: String(req.body.txId || ''),
      });
    }
    console.error('[skyhigh] win', e.message);
    return res.status(500).json({ error: 'Win failed' });
  }
}

/** POST /wallet/rollback */
export async function skyhighRollback(req, res) {
  try {
    const playerId = String(req.body.playerId || '');
    const refTxId = String(req.body.refTxId || '');
    const roundId = String(req.body.roundId || '');
    const currency = String(req.body.currency || 'BDT').toUpperCase();
    const rollbackTxId = `rb_${refTxId || roundId || Date.now()}`;

    if (!playerId || !refTxId) {
      return res.status(400).json({ error: 'Invalid rollback payload' });
    }

    const already = await SkyhighWalletTx.findOne({
      $or: [
        { txId: rollbackTxId },
        { refTxId, type: 'rollback' },
        { txId: refTxId, status: 'rolled_back' },
      ],
    });

    const bet = await SkyhighWalletTx.findOne({ txId: refTxId, type: 'bet' });
    const amount = round2(bet?.amount ?? req.body.amount);

    if (already || (bet && bet.status === 'rolled_back')) {
      const player = await findPlayer(playerId);
      return res.json({ balance: round2(player?.avbalance) });
    }

    // If win already settled this bet, do not refund
    const winForBet = await SkyhighWalletTx.findOne({
      type: 'win',
      refTxId,
    });
    if (winForBet) {
      const player = await findPlayer(playerId);
      return res.json({ balance: round2(player?.avbalance) });
    }

    let updated = await findPlayer(playerId);
    if (!updated) {
      return res.status(404).json({ error: 'Player not found' });
    }

    if (amount > 0) {
      updated = await SubAdmin.findOneAndUpdate(
        { _id: playerId, role: 'user' },
        {
          $inc: {
            avbalance: amount,
            balance: amount,
            baseBalance: amount,
          },
        },
        { new: true }
      );
    }

    await SkyhighWalletTx.create({
      txId: rollbackTxId,
      type: 'rollback',
      playerId,
      amount,
      currency,
      roundId,
      refTxId,
      status: 'completed',
    });

    if (bet) {
      await SkyhighWalletTx.updateOne(
        { _id: bet._id },
        { $set: { status: 'rolled_back' } }
      );
    }

    if (updated) pushBalance(updated);
    console.log(
      `[skyhigh] rollback +${amount} → ${updated?.userName} bal=${updated?.avbalance} ref=${refTxId}`
    );
    return res.json({ balance: round2(updated?.avbalance) });
  } catch (e) {
    if (e?.code === 11000) {
      const player = await findPlayer(String(req.body.playerId || ''));
      return res.json({ balance: round2(player?.avbalance) });
    }
    console.error('[skyhigh] rollback', e.message);
    return res.status(500).json({ error: 'Rollback failed' });
  }
}
