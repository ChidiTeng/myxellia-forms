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
      __bootstrapPromise = (async () => {
        const { magicToken } = __urlSession;

        if (magicToken) {
          const credentials = await verifyMagicToken(magicToken);
          setAuthTokens(credentials.accessToken, credentials.refreshToken);
          if (credentials.user) {
            setUserProfile(credentials.user);
          }
        }
      })().catch((err) => {
        // Exchange failed (expired link, network error, already consumed).
        // Log for diagnostics; SurveyContainer will render the appropriate
        // "Link Required" or error state based on whether a JWT exists.
        console.error('Magic token verification failed:', err);
      });
    }

    __bootstrapPromise.then(() => {
      if (!cancelled) setReady(true);
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
