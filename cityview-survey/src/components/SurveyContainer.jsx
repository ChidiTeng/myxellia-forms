import React, { useEffect, useRef, useState } from 'react';
import { usePendingSurveys, useSubmitSurvey } from '../hooks/useSurveys';
import { getAuthToken, getProjectId } from '../utils/session';
import DynamicSurveyStep from './DynamicSurveyStep';
import SurveyCompleted from './SurveyCompleted';
import logo from '../assets/logo.png';
import hero from '../assets/hero.jpg';

export default function SurveyContainer() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const headingRef = useRef(null);

  const token = getAuthToken();
  const projectId = getProjectId();

  const {
    data,
    isLoading,
    isError,
    error: queryError,
    refetch,
  } = usePendingSurveys(projectId, Boolean(token && projectId));

  const submitMutation = useSubmitSurvey();

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentIndex, isCompleted]);

  // Handle survey submission for the current survey in results
  async function handleOptionSubmit(optionId) {
    if (!data?.results || !data.results[currentIndex]) return;

    const currentSurvey = data.results[currentIndex];
    setSubmitError(null);

    try {
      await submitMutation.mutateAsync({
        recipientId: currentSurvey.recipient_id,
        optionId,
      });

      if (currentIndex + 1 < data.results.length) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setIsCompleted(true);
      }
    } catch (err) {
      console.error('Survey submission error:', err);
      const serverMsg = err.response?.data?.message || err.response?.data?.detail;
      setSubmitError(
        serverMsg || 'Unable to submit your answer. Please check your connection and try again.'
      );
    }
  }

  const results = data?.results || [];
  const currentSurvey = results[currentIndex];

  return (
    <>
      <div className="topbar">
        <header className="mast">
          <img className="logo" src={logo} alt="CityView Park and Resort" />
        </header>
        <div className="rule" aria-hidden="true">
          <span className="r" />
          <span className="n" />
        </div>
      </div>

      <main className="shell">
        <div
          className="visual"
          style={{ '--hero': `url("${hero}")` }}
          aria-hidden="true"
        />

        <div className="panel">
          <div className="card">
            {/* Missing Token or Project ID State */}
            {(!token || !projectId) && (
              <div className="status-card">
                <div className="status-icon warning">
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                </div>
                <h2 ref={headingRef} tabIndex={-1}>Authentication Link Required</h2>
                <p>
                  We could not locate your survey access credentials. Please click the direct survey link provided in your email to participate.
                </p>
              </div>
            )}

            {/* Loading State */}
            {token && projectId && isLoading && (
              <div className="skeleton-container" aria-busy="true" aria-live="polite">
                <div className="skeleton-line" style={{ width: '40%' }} />
                <div className="skeleton-line" style={{ width: '80%', height: '32px' }} />
                <div className="skeleton-line" style={{ width: '60%' }} />
                <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="skeleton-line" style={{ height: '54px' }} />
                  <div className="skeleton-line" style={{ height: '54px' }} />
                  <div className="skeleton-line" style={{ height: '54px' }} />
                </div>
              </div>
            )}

            {/* Error State */}
            {token && projectId && !isLoading && isError && (
              <div className="status-card">
                <div className="status-icon error">
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                  </svg>
                </div>
                <h2 ref={headingRef} tabIndex={-1}>Unable to Load Survey</h2>
                <p>
                  {queryError?.response?.status === 401 || queryError?.response?.status === 403
                    ? 'Your survey session is invalid or has expired. Please use the original link from your email.'
                    : queryError?.response?.data?.message || 'We could not fetch your pending surveys at this time.'}
                </p>
                <button className="go" type="button" onClick={() => refetch()}>
                  Retry
                </button>
              </div>
            )}

            {/* Empty State (No Pending Surveys) */}
            {token && projectId && !isLoading && !isError && results.length === 0 && (
              <div className="status-card">
                <div className="status-icon info">
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <h2 ref={headingRef} tabIndex={-1}>No Pending Surveys</h2>
                <p>
                  You have already answered all outstanding surveys for this unit or none are scheduled at this time. Thank you!
                </p>
              </div>
            )}

            {/* Survey Completed Screen */}
            {token && projectId && !isLoading && !isError && isCompleted && (
              <SurveyCompleted headingRef={headingRef} />
            )}

            {/* Dynamic Survey Questions */}
            {token && projectId && !isLoading && !isError && !isCompleted && results.length > 0 && currentSurvey && (
              <DynamicSurveyStep
                key={currentSurvey.recipient_id || currentIndex}
                survey={currentSurvey}
                currentIndex={currentIndex}
                totalSurveys={results.length}
                isSubmitting={submitMutation.isPending}
                error={submitError}
                onSubmit={handleOptionSubmit}
                headingRef={headingRef}
              />
            )}
          </div>
        </div>
      </main>
    </>
  );
}
