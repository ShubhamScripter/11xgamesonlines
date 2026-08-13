import crypto from 'crypto';
import SubAdmin from '../models/subAdminModel.js';
import SkyhighLaunchToken from '../models/skyhighLaunchTokenModel.js';

/**
 * POST /api/skyhigh/launch
 * Mint a short-lived launch token and return SkyHigh provider launch URL.
 */
export async function skyhighLaunch(req, res) {
  try {
    const apiUrl = (process.env.SKYHIGH_API_URL || '').replace(/\/+$/, '');
    const apiKey = process.env.SKYHIGH_API_KEY || '';
    const secret = process.env.SKYHIGH_SECRET_KEY || '';

    if (!apiUrl || !apiKey || !secret) {
      return res.status(503).json({
        success: false,
        message:
          'SkyHigh Aviator is not configured. Set SKYHIGH_API_URL, SKYHIGH_API_KEY, and SKYHIGH_SECRET_KEY.',
      });
    }

    const user = await SubAdmin.findById(req.id);
    if (!user || user.role !== 'user') {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Optional casino gamelock
    const casinoLocked = Array.isArray(user.gamelock)
      ? user.gamelock.some(
          (g) =>
            String(g?.game || '').toLowerCase() === 'casino' && g?.lock === true
        )
      : false;
    if (casinoLocked) {
      return res.status(403).json({
        success: false,
        message: 'Casino games are locked for this account',
      });
    }

    const token = `tok_${crypto.randomBytes(16).toString('hex')}`;
    const ttlMs = 10 * 60 * 1000;
    await SkyhighLaunchToken.create({
      token,
      playerId: String(user._id),
      expiresAt: new Date(Date.now() + ttlMs),
    });

    const publicUrl = (
      process.env.USER_FRONTEND_URL ||
      process.env.PUBLIC_URL ||
      'http://localhost:5173'
    ).replace(/\/+$/, '');

    const lang = String(req.body.lang || 'EN');
    const returnUrl = String(req.body.return_url || `${publicUrl}/`);

    const launchUrl =
      `${apiUrl}/api/provider/launch` +
      `?api_key=${encodeURIComponent(apiKey)}` +
      `&token=${encodeURIComponent(token)}` +
      `&lang=${encodeURIComponent(lang)}` +
      `&return_url=${encodeURIComponent(returnUrl)}`;

    return res.json({
      success: true,
      launchUrl,
      gameUrl: launchUrl,
      player: {
        id: String(user._id),
        userName: user.userName,
        balance: Number(user.avbalance) || 0,
        currency: String(user.currency || 'BDT').toUpperCase(),
      },
    });
  } catch (e) {
    console.error('[skyhigh] launch', e.message);
    return res.status(500).json({
      success: false,
      message: e.message || 'Launch failed',
    });
  }
}
