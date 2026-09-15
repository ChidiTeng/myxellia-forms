import axios from 'axios';
import { BASE_URL } from './client';

/**
 * Exchanges a one-time magic link token for JWT credentials.
 *
 * Uses a standalone axios call — NOT apiClient — because:
 *  1. The magic token is sent in the request body, not as a Bearer header.
 *  2. apiClient's request interceptor would inject a stale/missing Bearer token.
 *  3. apiClient's 401 response interceptor would clear the session on a
 *     legitimate auth-bootstrapping failure, making recovery impossible.
 *
 * @param {string} magicToken - The one-time token extracted from the invitation URL
 * @returns {Promise<{ accessToken: string, refreshToken: string|null }>}
 * @throws {Error} If verification fails, the token is expired, or the response is malformed
 */
export async function verifyMagicToken(magicToken) {
  if (!magicToken || !magicToken.trim()) {
    throw new Error('Magic token is required for verification.');
  }

  const response = await axios.post(
    `${BASE_URL}webstore/verify-magic-token/`,
    {
      token: magicToken.trim(),
      store_name: '',
    },
    {
      timeout: 15000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    }
  );

  const data = response.data;

  if (!data?.valid) {
    throw new Error(
      data?.message ||
        'Your survey link could not be verified. It may have expired or already been used.'
    );
  }

  const accessToken = data.user_tokens?.token;
  if (!accessToken) {
    throw new Error(
      'Authentication credentials were not returned by the server.'
    );
  }

  return {
    accessToken,
    refreshToken: data.user_tokens?.refresh ?? null,
  };
}
