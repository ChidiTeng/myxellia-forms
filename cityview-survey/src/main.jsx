import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SurveyContainer from './components/SurveyContainer';
import { initSessionFromUrl } from './utils/session';
import './styles.css';

// Scrub URL and persist credentials in sessionStorage immediately on application boot
initSessionFromUrl();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <SurveyContainer />
    </QueryClientProvider>
  </React.StrictMode>,
);
