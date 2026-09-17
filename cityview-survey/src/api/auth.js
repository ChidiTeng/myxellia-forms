import axios from 'axios';
import { NEXT_PUBLIC_BASE_URL } from './client';

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

  const url = `${NEXT_PUBLIC_BASE_URL}store/verify-magic-token/`;
  console.log('[AUTH:verify] POST', url, '(token:', magicToken.slice(0, 8) + '…)');

  const response = await axios.post(
    url,
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

  console.log('[AUTH:verify] Raw response status:', response.status);
  console.log('[AUTH:verify] Raw response data (full):', JSON.stringify(data, null, 2));
  console.log('[AUTH:verify] Key fields:', {
    valid: data?.valid,
    hasUserTokens: Boolean(data?.user_tokens),
    userTokensKeys: data?.user_tokens ? Object.keys(data.user_tokens) : [],
    'user_tokens.token': data?.user_tokens?.token ? `${data.user_tokens.token.slice(0, 20)}…` : undefined,
    'user_tokens.access': data?.user_tokens?.access ? `${data.user_tokens.access.slice(0, 20)}…` : undefined,
    'user_tokens.access_token': data?.user_tokens?.access_token ? `${data.user_tokens.access_token.slice(0, 20)}…` : undefined,
    'user_tokens.refresh': data?.user_tokens?.refresh ? `${String(data.user_tokens.refresh).slice(0, 20)}…` : undefined,
    hasUser: Boolean(data?.user),
    userKeys: data?.user ? Object.keys(data.user) : [],
    topLevelKeys: Object.keys(data || {}),
  });

  if (!data?.valid) {
    console.error('[AUTH:verify] data.valid is falsy — token rejected by server');
    throw new Error(
      data?.message ||
        'Your survey link could not be verified. It may have expired or already been used.'
    );
  }

  // Try multiple possible token field names from the response
  const accessToken = data.user_tokens?.token
    || data.user_tokens?.access
    || data.user_tokens?.access_token;

  if (!accessToken) {
    console.error('[AUTH:verify] No access token found in user_tokens. Available keys:', data.user_tokens ? Object.keys(data.user_tokens) : 'user_tokens is missing');
    throw new Error(
      'Authentication credentials were not returned by the server.'
    );
  }

  const rawUser = data?.user || {};
  const innerUser = rawUser?.user || {};
  const user = {
    firstName: innerUser.first_name || rawUser.first_name || 'Ahmed',
    lastName: innerUser.last_name || rawUser.last_name || '',
    email: innerUser.email || rawUser.email || '',
    avatar: rawUser.avatar || innerUser.avatar || null,
  };

  const result = {
    accessToken,
    refreshToken: data.user_tokens?.refresh ?? null,
    user,
  };

  console.log('[AUTH:verify] Parsed result:', {
    accessTokenPreview: result.accessToken ? `${result.accessToken.slice(0, 20)}…` : null,
    hasRefreshToken: Boolean(result.refreshToken),
    user: result.user,
  });

  return result;
}
