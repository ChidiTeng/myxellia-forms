import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SurveyContainer from './components/SurveyContainer';
import { initSessionFromUrl, setAuthTokens, getAuthToken } from './utils/session';
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
 *  1. Parse URL, extract one-time magic token, scrub URL immediately.
 *  2. If magic token exists → POST to verify-magic-token → store JWT.
 *  3. If no magic token but JWT already in sessionStorage → proceed.
 *  4. If neither → SurveyContainer renders "Personal Survey Link Required".
 *
 * Uses a ref guard to prevent React 18 StrictMode double-execution from
 * consuming the one-time magic token twice (first call succeeds, cleanup
 * discards result, second call fails because token is already consumed).
 */
function AuthGate({ children }) {
  const [ready, setReady] = useState(false);
  const bootstrapRan = useRef(false);

  useEffect(() => {
    // Guard against StrictMode double-mount: magic tokens are single-use.
    if (bootstrapRan.current) {
      setReady(true);
      return;
    }
    bootstrapRan.current = true;

    async function bootstrap() {
      // Step 1: Extract magic token and scrub URL (synchronous, immediate).
      const { magicToken } = initSessionFromUrl();

      // Step 2: If a magic token was present, exchange it for JWT credentials.
      if (magicToken) {
        try {
          const credentials = await verifyMagicToken(magicToken);
          setAuthTokens(credentials.accessToken, credentials.refreshToken);
        } catch (err) {
          // Exchange failed (expired link, network error, already consumed).
          // Log for diagnostics; SurveyContainer will render the appropriate
          // "Link Required" or error state based on whether a JWT exists.
          console.error('Magic token verification failed:', err);
        }
      }

      // Step 3: Ready — SurveyContainer reads JWT via getAuthToken().
      setReady(true);
    }

    bootstrap();
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
