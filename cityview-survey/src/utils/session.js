const STORAGE_KEYS = {
  TOKEN: 'cityview_survey_token',
  PROJECT_ID: 'cityview_survey_project_id',
  DEMO: 'cityview_survey_demo',
};

/**
 * Initializes session from URL query parameters and cleans the URL immediately.
 * Specifically extracts `magic` (or `token`) and `project_id`, stores them in
 * sessionStorage, and scrubs the URL with window.history.replaceState to prevent
 * the sensitive token from persisting in browser history, address bars, or referrers.
 */
export function initSessionFromUrl() {
  if (typeof window === 'undefined') {
    return { token: null, projectId: null, isDemo: false };
  }

  try {
    const searchParams = new URLSearchParams(window.location.search);
    const magicParam = searchParams.get('magic') || searchParams.get('token');
    const projectParam = searchParams.get('project_id');
    const demoParam = searchParams.get('demo');

    let urlModified = false;

    if (magicParam && magicParam.trim()) {
      sessionStorage.setItem(STORAGE_KEYS.TOKEN, magicParam.trim());
      searchParams.delete('magic');
      searchParams.delete('token');
      urlModified = true;
    }

    if (projectParam && projectParam.trim()) {
      sessionStorage.setItem(STORAGE_KEYS.PROJECT_ID, projectParam.trim());
      searchParams.delete('project_id');
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
    token: getAuthToken(),
    projectId: getProjectId(),
    isDemo: isDemoMode(),
  };
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
 * Retrieve active authorization token from session storage
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
 * Check if the current session has valid authentication credentials
 */
export function hasValidSession() {
  return Boolean(getAuthToken() && getProjectId());
}

/**
 * Clear session storage upon logout or explicit session invalidation
 */
export function clearSession() {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(STORAGE_KEYS.TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.PROJECT_ID);
  } catch (err) {
    console.error('Failed to clear session:', err);
  }
}
