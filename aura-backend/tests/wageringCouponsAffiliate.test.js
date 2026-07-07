import { describe, expect, test, vi, beforeEach } from 'vitest';

import { validateUserWithdrawRequest } from '../constants/manualDepositConstants.js';
import {
  calcRequiredWagering,
  getWageringStatus,
  validateWithdrawalWagering,
} from '../utils/wagering.js';
import { calcFirstDepositBonusAmount } from '../utils/firstDepositBonus.js';
import { validateCouponClaim } from '../controllers/giftCouponController.js';

vi.mock('../models/giftCouponModel.js', () => ({
  default: {
    findOne: vi.fn(),
  },
}));

vi.mock('../models/couponClaimModel.js', () => ({
  default: {
    findOne: vi.fn(),
  },
}));

import GiftCoupon from '../models/giftCouponModel.js';
import CouponClaim from '../models/couponClaimModel.js';

describe('Wagering requirement', () => {
  test('calcRequiredWagering uses 80% of deposit + bonus', () => {
    expect(calcRequiredWagering(1000, 200, 80)).toBe(960);
    expect(calcRequiredWagering(500, 0, 80)).toBe(400);
  });

  test('getWageringStatus reports lock until target met', () => {
    const open = getWageringStatus({ requiredWagering: 800, currentWageredAmount: 200 });
    expect(open.withdrawalLocked).toBe(true);
    expect(open.remainingWagering).toBe(600);

    const done = getWageringStatus({ requiredWagering: 800, currentWageredAmount: 800 });
    expect(done.wageringMet).toBe(true);
    expect(done.withdrawalLocked).toBe(false);
  });

  test('validateWithdrawalWagering blocks incomplete wagering', () => {
    const blocked = validateWithdrawalWagering({
      requiredWagering: 100,
      currentWageredAmount: 40,
    });
    expect(blocked.ok).toBe(false);
    expect(blocked.message).toMatch(/Remaining: 60/);
  });

  test('validateUserWithdrawRequest rejects when wagering not met', () => {
    const result = validateUserWithdrawRequest({
      method: 'bkash',
      amount: 500,
      withdrawable: 1000,
      phoneNumber: '01712345678',
      hasPassword: true,
      requiredWagering: 800,
      currentWageredAmount: 100,
    });
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/wagering target/i);
  });
});

describe('First deposit bonus math', () => {
  test('bonus percent applied to deposit', () => {
    expect(calcFirstDepositBonusAmount(1000, 10)).toBe(100);
    expect(calcFirstDepositBonusAmount(0, 10)).toBe(0);
  });
});

describe('Gift coupon validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('rejects inactive coupon', async () => {
    GiftCoupon.findOne.mockResolvedValue({
      _id: 'c1',
      couponCode: 'SAVE10',
      isActive: false,
      maxValids: 10,
      currentUses: 0,
    });
    const result = await validateCouponClaim('u1', 'SAVE10');
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/no longer active/i);
  });

  test('rejects exhausted coupon', async () => {
    GiftCoupon.findOne.mockResolvedValue({
      _id: 'c1',
      couponCode: 'SAVE10',
      isActive: true,
      maxValids: 5,
      currentUses: 5,
    });
    const result = await validateCouponClaim('u1', 'SAVE10');
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/usage limit/i);
  });

  test('rejects duplicate claim', async () => {
    GiftCoupon.findOne.mockResolvedValue({
      _id: 'c1',
      couponCode: 'SAVE10',
      isActive: true,
      maxValids: 5,
      currentUses: 1,
    });
    CouponClaim.findOne.mockResolvedValue({ _id: 'claim1' });
    const result = await validateCouponClaim('u1', 'SAVE10');
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/already claimed/i);
  });

  test('accepts valid coupon', async () => {
    const coupon = {
      _id: 'c1',
      couponCode: 'SAVE10',
      isActive: true,
      maxValids: 5,
      currentUses: 1,
      valueAmount: 50,
    };
    GiftCoupon.findOne.mockResolvedValue(coupon);
    CouponClaim.findOne.mockResolvedValue(null);
    const result = await validateCouponClaim('u1', 'SAVE10');
    expect(result.ok).toBe(true);
    expect(result.coupon).toEqual(coupon);
  });
});

describe('Affiliate commission math', () => {
  test('commission = loss × percent / 100', () => {
    const loss = 200;
    const percent = 5;
    expect(Math.round((loss * percent) / 100 * 100) / 100).toBe(10);
  });
});
