import GiftCoupon from '../models/giftCouponModel.js';
import CouponClaim from '../models/couponClaimModel.js';
import SubAdmin from '../models/subAdminModel.js';
import TransactionHistory from '../models/transtionHistoryModel.js';

const ADMIN_ROLES = new Set(['superadmin', 'admin', 'subadmin', 'seniorSuper']);

function round2(n) {
  return Math.round(Number(n) * 100) / 100;
}

function pipelineCreditBalance(amount) {
  const amt = round2(amount);
  return [
    {
      $set: {
        balance: { $round: [{ $add: ['$balance', amt] }, 2] },
        avbalance: { $round: [{ $add: ['$avbalance', amt] }, 2] },
        baseBalance: { $round: [{ $add: ['$baseBalance', amt] }, 2] },
        exposureLimit: { $round: [{ $add: [{ $ifNull: ['$exposureLimit', 0] }, amt] }, 2] },
      },
    },
  ];
}

export async function listCoupons(req, res) {
  try {
    if (!ADMIN_ROLES.has(req.role)) {
      return res.status(403).json({ message: 'Not allowed' });
    }
    const coupons = await GiftCoupon.find().sort({ createdAt: -1 }).lean();
    const data = coupons.map((c) => ({
      ...c,
      remainingSlots: Math.max(0, (c.maxValids || 0) - (c.currentUses || 0)),
    }));
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to list coupons' });
  }
}

export async function createCoupon(req, res) {
  try {
    if (!ADMIN_ROLES.has(req.role)) {
      return res.status(403).json({ message: 'Not allowed' });
    }
    const { couponCode, valueAmount, maxValids } = req.body;
    const code = String(couponCode || '').trim().toUpperCase();
    const value = round2(valueAmount);
    const max = Number(maxValids);

    if (!code) {
      return res.status(400).json({ message: 'Coupon code is required.' });
    }
    if (!Number.isFinite(value) || value <= 0) {
      return res.status(400).json({ message: 'Value amount must be greater than 0.' });
    }
    if (!Number.isFinite(max) || max < 1) {
      return res.status(400).json({ message: 'Number of valids must be at least 1.' });
    }

    const existing = await GiftCoupon.findOne({ couponCode: code });
    if (existing) {
      return res.status(400).json({ message: 'Coupon code already exists.' });
    }

    const coupon = await GiftCoupon.create({
      couponCode: code,
      valueAmount: value,
      maxValids: Math.floor(max),
      currentUses: 0,
      isActive: true,
      createdBy: req.id,
    });

    return res.status(201).json({ success: true, data: coupon });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to create coupon' });
  }
}

export async function updateCouponStatus(req, res) {
  try {
    if (!ADMIN_ROLES.has(req.role)) {
      return res.status(403).json({ message: 'Not allowed' });
    }
    const { isActive } = req.body;
    const coupon = await GiftCoupon.findByIdAndUpdate(
      req.params.couponId,
      { $set: { isActive: Boolean(isActive) } },
      { new: true }
    );
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found.' });
    }
    return res.json({ success: true, data: coupon });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to update coupon' });
  }
}

export async function getCouponClaims(req, res) {
  try {
    if (!ADMIN_ROLES.has(req.role)) {
      return res.status(403).json({ message: 'Not allowed' });
    }
    const claims = await CouponClaim.find({ couponId: req.params.couponId })
      .populate('userId', 'userName name')
      .sort({ claimedAt: -1 })
      .lean();
    const data = claims.map((c) => ({
      _id: c._id,
      userName: c.userId?.userName || '—',
      name: c.userId?.name || '',
      valueAmount: c.valueAmount,
      claimedAt: c.claimedAt,
    }));
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to fetch claims' });
  }
}

export async function deleteCoupon(req, res) {
  try {
    if (!ADMIN_ROLES.has(req.role)) {
      return res.status(403).json({ message: 'Not allowed' });
    }
    const coupon = await GiftCoupon.findByIdAndDelete(req.params.couponId);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found.' });
    }
    return res.json({ success: true, message: 'Coupon deleted.' });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to delete coupon' });
  }
}

/**
 * Validate coupon claim without crediting (for tests / middleware).
 */
export async function validateCouponClaim(userId, couponCode) {
  const code = String(couponCode || '').trim().toUpperCase();
  if (!code) {
    return { ok: false, message: 'Coupon code is required.' };
  }

  const coupon = await GiftCoupon.findOne({ couponCode: code });
  if (!coupon) {
    return { ok: false, message: 'Invalid coupon code.' };
  }
  if (!coupon.isActive) {
    return { ok: false, message: 'This coupon is no longer active.' };
  }
  if ((coupon.currentUses || 0) >= coupon.maxValids) {
    return { ok: false, message: 'This coupon has reached its usage limit.' };
  }

  const prior = await CouponClaim.findOne({ userId, couponId: coupon._id });
  if (prior) {
    return { ok: false, message: 'You have already claimed this coupon.' };
  }

  return { ok: true, coupon };
}

export async function claimCoupon(req, res) {
  try {
    const userId = req.id;
    const { couponCode } = req.body;

    const user = await SubAdmin.findById(userId);
    if (!user || user.role !== 'user') {
      return res.status(403).json({ message: 'Only users can claim coupons.' });
    }

    const check = await validateCouponClaim(userId, couponCode);
    if (!check.ok) {
      return res.status(400).json({ message: check.message });
    }

    const coupon = check.coupon;
    const reserved = await GiftCoupon.findOneAndUpdate(
      {
        _id: coupon._id,
        isActive: true,
        $expr: { $lt: ['$currentUses', '$maxValids'] },
      },
      { $inc: { currentUses: 1 } },
      { new: true }
    );

    if (!reserved) {
      return res.status(400).json({ message: 'This coupon is no longer available.' });
    }

    try {
      await CouponClaim.create({
        userId,
        couponId: coupon._id,
        valueAmount: reserved.valueAmount,
      });
    } catch (claimErr) {
      await GiftCoupon.findByIdAndUpdate(coupon._id, { $inc: { currentUses: -1 } });
      if (claimErr?.code === 11000) {
        return res.status(400).json({ message: 'You have already claimed this coupon.' });
      }
      throw claimErr;
    }

    const credited = await SubAdmin.findOneAndUpdate(
      { _id: userId, role: 'user' },
      pipelineCreditBalance(reserved.valueAmount),
      { new: true }
    );

    if (!credited) {
      await CouponClaim.deleteOne({ userId, couponId: coupon._id });
      await GiftCoupon.findByIdAndUpdate(coupon._id, { $inc: { currentUses: -1 } });
      return res.status(500).json({ message: 'Could not credit coupon reward.' });
    }

    await TransactionHistory.create({
      userId,
      userName: user.userName,
      withdrawl: 0,
      deposite: reserved.valueAmount,
      amount: credited.avbalance,
      remark: `Gift coupon claimed: ${reserved.couponCode}`,
      from: 'coupon',
      to: user.userName,
      invite: user.invite || '',
    });

    return res.json({
      success: true,
      message: `Coupon claimed! ${reserved.valueAmount} credited to your wallet.`,
      data: {
        valueAmount: reserved.valueAmount,
        balance: credited.balance,
        avbalance: credited.avbalance,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to claim coupon' });
  }
}
