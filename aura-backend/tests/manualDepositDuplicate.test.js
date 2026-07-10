import { describe, expect, test } from 'vitest';

import {
  BLOCKED_DUPLICATE_DEPOSIT_STATUSES,
  DUPLICATE_TRANSACTION_ID_MESSAGE,
  buildDuplicateDepositReferenceFilter,
  validateDepositReferenceId,
} from '../constants/manualDepositConstants.js';

describe('manual deposit duplicate transaction ID', () => {
  test('blocks pending and approved (successful) statuses only', () => {
    expect(BLOCKED_DUPLICATE_DEPOSIT_STATUSES).toEqual(['pending', 'approved']);
    expect(BLOCKED_DUPLICATE_DEPOSIT_STATUSES).not.toContain('rejected');
  });

  test('buildDuplicateDepositReferenceFilter matches exact and case-insensitive IDs', () => {
    const filter = buildDuplicateDepositReferenceFilter('9F4KX2M7QP');
    expect(filter.requestType).toBe('deposit');
    expect(filter.status.$in).toEqual(['pending', 'approved']);
    expect(filter.$or[0]).toEqual({ referenceId: '9F4KX2M7QP' });
    expect(filter.$or[1].referenceId.test('9f4kx2m7qp')).toBe(true);
    expect(filter.$or[1].referenceId.test('9F4KX2M7QQ')).toBe(false);
  });

  test('returns null filter for empty reference', () => {
    expect(buildDuplicateDepositReferenceFilter('')).toBeNull();
    expect(buildDuplicateDepositReferenceFilter('   ')).toBeNull();
  });

  test('normalizes mobile TrxID before duplicate lookup', () => {
    const ref = validateDepositReferenceId('bkash', ' 9f4kx2m7qp ');
    expect(ref.ok).toBe(true);
    expect(ref.value).toBe('9F4KX2M7QP');

    const filter = buildDuplicateDepositReferenceFilter(ref.value);
    expect(filter.$or[0].referenceId).toBe('9F4KX2M7QP');
  });

  test('exposes user-facing duplicate message', () => {
    expect(DUPLICATE_TRANSACTION_ID_MESSAGE.toLowerCase()).toContain('duplicated');
    expect(DUPLICATE_TRANSACTION_ID_MESSAGE.toLowerCase()).toContain('pending');
  });
});
