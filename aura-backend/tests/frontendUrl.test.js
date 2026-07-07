import { describe, expect, test } from 'vitest';

import {
  buildUserRegisterReferralLink,
  getUserFrontendBaseUrl,
} from '../utils/frontendUrl.js';

describe('frontendUrl', () => {
  test('uses USER_FRONTEND_URL when set', () => {
    const prev = process.env.USER_FRONTEND_URL;
    process.env.USER_FRONTEND_URL = 'https://baajilive.com';
    const req = { protocol: 'http', get: () => 'localhost:5000', headers: {} };
    expect(getUserFrontendBaseUrl(req)).toBe('https://baajilive.com');
    expect(buildUserRegisterReferralLink('abc123', req)).toBe(
      'https://baajilive.com/register?ref=ABC123'
    );
    process.env.USER_FRONTEND_URL = prev;
  });

  test('strips ag. admin host to user domain', () => {
    const prev = process.env.USER_FRONTEND_URL;
    const prevPublic = process.env.PUBLIC_UPLOADS_BASE_URL;
    delete process.env.USER_FRONTEND_URL;
    delete process.env.FRONTEND_URL;
    delete process.env.PUBLIC_UPLOADS_BASE_URL;

    const req = {
      protocol: 'https',
      get: () => 'ag.baajilive.com',
      headers: { 'x-forwarded-proto': 'https' },
    };
    expect(getUserFrontendBaseUrl(req)).toBe('https://baajilive.com');
    expect(buildUserRegisterReferralLink('deadbeef', req)).toBe(
      'https://baajilive.com/register?ref=DEADBEEF'
    );

    process.env.USER_FRONTEND_URL = prev;
    process.env.PUBLIC_UPLOADS_BASE_URL = prevPublic;
  });

  test('local API on :5000 maps to frontend :5173', () => {
    const prev = process.env.USER_FRONTEND_URL;
    const prevPublic = process.env.PUBLIC_UPLOADS_BASE_URL;
    delete process.env.USER_FRONTEND_URL;
    delete process.env.FRONTEND_URL;
    delete process.env.PUBLIC_UPLOADS_BASE_URL;

    const req = {
      protocol: 'http',
      get: () => 'localhost:5000',
      headers: {},
    };
    expect(getUserFrontendBaseUrl(req)).toBe('http://localhost:5173');

    process.env.USER_FRONTEND_URL = prev;
    process.env.PUBLIC_UPLOADS_BASE_URL = prevPublic;
  });
});
