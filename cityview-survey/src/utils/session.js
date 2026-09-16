const STORAGE_KEYS = {
  TOKEN: 'cityview_survey_token',
  REFRESH_TOKEN: 'cityview_survey_refresh_token',
  PROJECT_ID: 'cityview_survey_project_id',
  DEMO: 'cityview_survey_demo',
  USER: 'cityview_survey_user',
};

/**
 * Parses URL query parameters, stores non-sensitive identifiers (project_id, demo)
 * in sessionStorage, and scrubs ALL sensitive parameters from the browser address bar
 * immediately to prevent exposure via browser history, referrers, or shoulder surfing.
 *
 * Returns the raw magic token (if present) in memory WITHOUT persisting it.
 * The caller MUST exchange it via the verify-magic-token endpoint to obtain a JWT
 * before the app can authenticate against protected API endpoints.
 */
export function initSessionFromUrl() {
  if (typeof window === 'undefined') {
    return { magicToken: null, projectId: null, isDemo: false };
  }

  let magicToken = null;

  try {
    const searchParams = new URLSearchParams(window.location.search);
    const magicParam = searchParams.get('magic') || searchParams.get('token');
    const projectParam = searchParams.get('project_id');
    const demoParam = searchParams.get('demo');

    let urlModified = false;

    // Extract magic token into local variable only — never persist the raw
    // one-time token to sessionStorage, localStorage, cookies, or any durable store.
    if (magicParam && magicParam.trim()) {
      magicToken = magicParam.trim();
      searchParams.delete('magic');
      searchParams.delete('token');
      urlModified = true;
    }

    if (projectParam && projectParam.trim()) {
      sessionStorage.setItem(STORAGE_KEYS.PROJECT_ID, projectParam.trim());
      searchParams.delete('project_id');
      urlModified = true;
    }

    // Clean any legacy recipient_id params from URL without storing them
    // (recipient_id is authoritatively provided by the fetched survey endpoint)
    if (searchParams.has('recipient_id') || searchParams.has('recipient')) {
      searchParams.delete('recipient_id');
      searchParams.delete('recipient');
      urlModified = true;
    }

    if (demoParam === 'true') {
      sessionStorage.setItem(STORAGE_KEYS.DEMO, 'true');
      searchParams.delete('demo');
      urlModified = true;
    }

    // Immediately sanitize URL without reloading page
    if (urlModified) {
      const remainingSearch = searchParams.toString();
      const cleanUrl = `${window.location.pathname}${remainingSearch ? `?${remainingSearch}` : ''}${window.location.hash}`;
      window.history.replaceState(null, document.title, cleanUrl);
    }
  } catch (err) {
    console.error('Failed to initialize session from URL:', err);
  }

  return {
    magicToken,
    projectId: getProjectId(),
    isDemo: isDemoMode(),
  };
}

/**
 * Persist JWT credentials obtained from the verify-magic-token exchange.
 * Only the derived access token (and optional refresh token) are stored —
 * the raw magic token is intentionally discarded after exchange.
 *
 * @param {string} accessToken - JWT access token for Bearer auth
 * @param {string|null} [refreshToken] - JWT refresh token for future renewal
 */
export function setAuthTokens(accessToken, refreshToken = null) {
  if (typeof window === 'undefined') return;
  try {
    if (accessToken) {
      sessionStorage.setItem(STORAGE_KEYS.TOKEN, accessToken);
    }
    if (refreshToken) {
      sessionStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    }
  } catch (err) {
    console.error('Failed to store auth tokens:', err);
  }
}

/**
 * Check if demo mode is enabled in session storage
 */
export function isDemoMode() {
  if (typeof window === 'undefined') return false;
  try {
    return sessionStorage.getItem(STORAGE_KEYS.DEMO) === 'true';
  } catch {
    return false;
  }
}

/**
 * Retrieve active JWT access token from session storage.
 * After the magic-token exchange, this returns the real JWT — not the raw magic token.
 */
export function getAuthToken() {
  if (typeof window === 'undefined') return null;
  try {
    return sessionStorage.getItem(STORAGE_KEYS.TOKEN) || null;
  } catch {
    return null;
  }
}

/**
 * Retrieve the JWT refresh token from session storage (if stored).
 */
export function getRefreshToken() {
  if (typeof window === 'undefined') return null;
  try {
    return sessionStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN) || null;
  } catch {
    return null;
  }
}

/**
 * Retrieve active project ID from session storage
 */
export function getProjectId() {
  if (typeof window === 'undefined') return null;
  try {
    return sessionStorage.getItem(STORAGE_KEYS.PROJECT_ID) || null;
  } catch {
    return null;
  }
}

/**
 * Persist user profile (name, email, avatar).
 */
export function setUserProfile(profile) {
  if (typeof window === 'undefined' || !profile) return;
  try {
    sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to store user profile:', err);
  }
}

/**
 * Retrieve user profile from session storage.
 */
export function getUserProfile() {
  if (typeof window === 'undefined') return null;
  try {
    const data = sessionStorage.getItem(STORAGE_KEYS.USER);
    console.log('user profile', data)
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

/**
 * Check if the current session has valid authentication credentials
 */
export function hasValidSession() {
  return Boolean(getAuthToken() && getProjectId());
}

/**
 * Clear all session credentials.
 * Called on confirmed authentication expiry (HTTP 401) — after which the user
 * must obtain a fresh magic link from their invitation email.
 */
export function clearSession() {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(STORAGE_KEYS.TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.PROJECT_ID);
    sessionStorage.removeItem(STORAGE_KEYS.USER);
  } catch (err) {
    console.error('Failed to clear session:', err);
  }
}
