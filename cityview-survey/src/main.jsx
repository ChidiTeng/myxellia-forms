import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SurveyContainer from './components/SurveyContainer';
import { initSessionFromUrl, setAuthTokens, setUserProfile } from './utils/session';
import { verifyMagicToken } from './api/auth';
import './styles.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

/**
 * Auth bootstrap gate.
 *
 * Handles the async magic-token → JWT exchange before the survey UI mounts.
 *
 * Flow:
 *  1. Parse URL at module scope (before React mounts), extract one-time magic
 *     token, scrub URL immediately — runs exactly once.
 *  2. If magic token exists → POST to verify-magic-token → store JWT.
 *  3. If no magic token but JWT already in sessionStorage → proceed.
 *  4. If neither → SurveyContainer renders "Personal Survey Link Required".
 *
 * Why module-scope URL parsing + a shared promise?
 *
 * React 18 StrictMode double-mounts components (mount → unmount → remount).
 * If initSessionFromUrl() runs inside useEffect, the first mount scrubs the
 * URL params and starts the async token exchange, StrictMode then unmounts
 * the component (abandoning the in-flight request), and the second mount
 * finds an empty URL — leaving the user stuck on "Link Required".
 *
 * By parsing the URL at module scope we capture params before React takes
 * control, and by sharing a single bootstrap promise we ensure both mounts
 * wait on the same token exchange without re-consuming the one-time token.
 */

// ── Module-scope URL bootstrap (runs exactly once, before React mounts) ──
// initSessionFromUrl() is synchronous: it reads query params, persists
// project_id to sessionStorage, scrubs the URL, and returns the raw magic
// token in memory. Calling it here guarantees the URL is parsed before
// React 18 StrictMode can unmount/remount and lose the params.
const __urlSession = initSessionFromUrl();
console.log('[AUTH] Module-scope URL parse result:', {
  hasMagicToken: Boolean(__urlSession.magicToken),
  magicTokenPreview: __urlSession.magicToken ? `${__urlSession.magicToken.slice(0, 8)}…` : null,
  projectId: __urlSession.projectId,
  isDemo: __urlSession.isDemo,
  href: window.location.href,
});

// Shared bootstrap promise — ensures the async magic-token → JWT exchange
// happens exactly once, and every mount of AuthGate awaits the same result.
let __bootstrapPromise = null;

function AuthGate({ children }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // Deduplicate: the first mount creates the promise, subsequent mounts
    // (including StrictMode remount) simply .then() on the same promise.
    if (!__bootstrapPromise) {
      console.log('[AUTH] Creating bootstrap promise (first mount)');
      __bootstrapPromise = (async () => {
        const { magicToken } = __urlSession;

        if (magicToken) {
          console.log('[AUTH] Magic token found, calling verifyMagicToken…');
          const credentials = await verifyMagicToken(magicToken);
          console.log('[AUTH] verifyMagicToken returned:', {
            hasAccessToken: Boolean(credentials.accessToken),
            accessTokenPreview: credentials.accessToken ? `${credentials.accessToken.slice(0, 20)}…` : null,
            hasRefreshToken: Boolean(credentials.refreshToken),
            user: credentials.user,
          });
          setAuthTokens(credentials.accessToken, credentials.refreshToken);
          if (credentials.user) {
            setUserProfile(credentials.user);
          }
          console.log('[AUTH] Credentials stored. Session state after store:', {
            tokenInStorage: Boolean(sessionStorage.getItem('cityview_survey_token')),
            projectIdInStorage: sessionStorage.getItem('cityview_survey_project_id'),
          });
        } else {
          console.log('[AUTH] No magic token — checking existing session:', {
            tokenInStorage: Boolean(sessionStorage.getItem('cityview_survey_token')),
            projectIdInStorage: sessionStorage.getItem('cityview_survey_project_id'),
          });
        }
      })().catch((err) => {
        console.error('[AUTH] Magic token verification FAILED:', err);
        console.error('[AUTH] Error details:', {
          message: err.message,
          status: err.response?.status,
          responseData: err.response?.data,
        });
      });
    }

    __bootstrapPromise.then(() => {
      if (!cancelled) {
        console.log('[AUTH] Bootstrap complete → setReady(true). Final session:', {
          token: Boolean(sessionStorage.getItem('cityview_survey_token')),
          projectId: sessionStorage.getItem('cityview_survey_project_id'),
          user: sessionStorage.getItem('cityview_survey_user'),
        });
        setReady(true);
      } else {
        console.log('[AUTH] Bootstrap complete but mount was cancelled (StrictMode unmount)');
      }
    });

    // Cleanup: prevent state updates on an unmounted component.
    return () => { cancelled = true; };
  }, []);

  // Render nothing during the brief (<1s) token exchange to prevent
  // SurveyContainer from flashing the "Link Required" screen while
  // the JWT is still being obtained.
  if (!ready) return null;

  return children;
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthGate>
        <SurveyContainer />
      </AuthGate>
    </QueryClientProvider>
  </React.StrictMode>,
);
