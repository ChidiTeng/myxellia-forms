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

  // Handle survey submission with recipient_id resolved directly from fetched survey data
  async function handleOptionSubmit(optionId, explicitRecipientId) {
    if (!data?.results || !data.results[currentIndex]) return;

    const currentSurvey = data.results[currentIndex];
    setSubmitError(null);

    // 10x Resilient Resolution:
    // Sourced strictly from the fetched API response, never from query parameters
    const recipientId =
      explicitRecipientId ??
      currentSurvey?.recipient_id ??
      currentSurvey?.recipientId ??
      data?.recipient_id ??
      data?.recipientId;

    if (!recipientId && recipientId !== 0) {
      setSubmitError('Unable to identify survey recipient from server response. Please reload and try again.');
      return;
    }

    try {
      await submitMutation.mutateAsync({
        recipientId,
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
                <div className="portal-tag">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <span>Private Client Portal</span>
                </div>

                <div className="breathable-icon-wrap">
                  <div className="breathable-icon warning" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                      <path d="M22 7l-10 7L2 7"></path>
                      <circle cx="18" cy="15" r="3" fill="#D97706" stroke="#FFFFFF" strokeWidth="1.5"></circle>
                    </svg>
                  </div>
                </div>

                <h2 ref={headingRef} tabIndex={-1}>Personal Survey Link Required</h2>
                <p>
                  This questionnaire is tailored specifically to your property unit. To securely record your preferences, please open the direct survey link found in your invitation email.
                </p>

                <div className="guidance-box">
                  <div className="guidance-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  </div>
                  <p>
                    <strong>Check your inbox:</strong> Click the <em>&quot;Take Survey&quot;</em> or <em>&quot;Confirm Timeline&quot;</em> button in your email to authenticate automatically.
                  </p>
                </div>
              </div>
            )}

            {/* Loading Skeleton */}
            {token && projectId && isLoading && (
              <div className="skeleton-container" aria-busy="true" aria-live="polite">
                <div className="skeleton-line" style={{ width: '32%', height: '24px', borderRadius: '999px' }} />
                <div className="skeleton-line" style={{ width: '100%', height: '6px', borderRadius: '999px', margin: '6px 0 14px' }} />
                <div className="skeleton-line" style={{ width: '75%', height: '32px' }} />
                <div className="skeleton-line" style={{ width: '90%', height: '18px' }} />
                <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="skeleton-line" style={{ height: '60px', borderRadius: '14px' }} />
                  <div className="skeleton-line" style={{ height: '60px', borderRadius: '14px' }} />
                  <div className="skeleton-line" style={{ height: '60px', borderRadius: '14px' }} />
                </div>
              </div>
            )}

            {/* Error State */}
            {token && projectId && !isLoading && isError && (
              <div className="status-card">
                <div className="breathable-icon-wrap">
                  <div className="breathable-icon error" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                  </div>
                </div>
                <h2 ref={headingRef} tabIndex={-1}>Unable to Load Survey</h2>
                <p>
                  {queryError?.response?.status === 401 || queryError?.response?.status === 403
                    ? 'Your survey invitation link has expired or has already been used. Please request a new link from your relationship manager.'
                    : queryError?.response?.data?.message || 'We could not connect to the survey server. Please check your internet connection and try again.'}
                </p>
                <button className="go" type="button" onClick={() => refetch()}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                  </svg>
                  Retry
                </button>
              </div>
            )}

            {/* Empty State (No Pending Surveys) */}
            {token && projectId && !isLoading && !isError && results.length === 0 && (
              <div className="status-card">
                <div className="breathable-icon-wrap">
                  <div className="breathable-icon success" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                  </div>
                </div>
                <h2 ref={headingRef} tabIndex={-1}>All Surveys Completed</h2>
                <p>
                  You have already answered all outstanding questionnaires for this property allocation. Thank you for your valuable feedback!
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
