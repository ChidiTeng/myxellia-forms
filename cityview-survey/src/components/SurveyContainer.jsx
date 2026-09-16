import React, { useEffect, useRef, useState } from 'react';
import { usePendingSurveys, useSubmitSurvey } from '../hooks/useSurveys';
import { getAuthToken, getProjectId, getUserProfile } from '../utils/session';
import TimelineStep from './TimelineStep';
import TermsStep from './TermsStep';
import Confirmation from './Confirmation';
import logo from '../assets/logo.png';
import hero from '../assets/hero.jpg';
import defaultAvatar from '../assets/avatar.png';

export default function SurveyContainer() {
  const [step, setStep] = useState(1);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [selectedOptionLabel, setSelectedOptionLabel] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const headingRef = useRef(null);

  const token = getAuthToken();
  const projectId = getProjectId();
  const userProfile = getUserProfile();

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step, isCompleted]);

  // Handle final survey submission at Step 2 (Terms acceptance)
  async function handleFinalSubmit() {
    const results = data?.results || [];
    const currentSurvey = results[0];
    console.log('currentSurvey', currentSurvey);

    const recipientId =
      currentSurvey?.recipient_id ??
      currentSurvey?.recipientId ??
      data?.recipient_id ??
      data?.recipientId;

    if (!recipientId && recipientId !== 0) {
      // In demo mode or preview without recipient, proceed to confirmation
      setIsCompleted(true);
      return;
    }

    setSubmitError(null);

    try {
      await submitMutation.mutateAsync({
        recipientId,
        optionId: selectedOptionId,
      });

      setIsCompleted(true);
    } catch (err) {
      console.error('Survey submission error:', err);
      const serverMsg = err.response?.data?.message || err.response?.data?.detail;
      setSubmitError(
        serverMsg || 'Unable to submit your answer. Please check your connection and try again.'
      );
    }
  }

  const results = data?.results || [];
  const currentSurvey = results[0];

  const buyerName = userProfile
    ? `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim() || 'Ahmed Ibraheem'
    : 'Ahmed Ibraheem';

  return (
    <>
      <div className="topbar">
        <header className="mast">
          <img className="logo" src={logo} alt="CityView Park and Resort" />
          <div className="avatar" title={buyerName}>
            <img
              src={userProfile?.avatar || defaultAvatar}
              alt={buyerName}
              onError={(e) => {
                // Fallback to bundled avatar asset if remote URL fails
                e.currentTarget.src = defaultAvatar;
              }}
            />
          </div>
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
                <div className="skeleton-line" style={{ width: '28%', height: '18px', borderRadius: '4px' }} />
                <div className="skeleton-line" style={{ width: '85%', height: '32px', borderRadius: '6px', margin: '14px 0 10px' }} />
                <div className="skeleton-line" style={{ width: '95%', height: '18px', borderRadius: '4px', marginBottom: '28px' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div className="skeleton-line" style={{ height: '56px', borderRadius: '1px' }} />
                  <div className="skeleton-line" style={{ height: '56px', borderRadius: '1px' }} />
                  <div className="skeleton-line" style={{ height: '56px', borderRadius: '1px' }} />
                  <div className="skeleton-line" style={{ height: '56px', borderRadius: '1px' }} />
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
                  Retry
                </button>
              </div>
            )}

            {/* Completed State: Confirmation (either just submitted, or no more pending surveys) */}
            {token && projectId && !isLoading && !isError && (isCompleted || results.length === 0) && (
              <Confirmation buyer={userProfile} headingRef={headingRef} />
            )}

            {/* Step 1: Timeline Selection */}
            {token && projectId && !isLoading && !isError && !isCompleted && results.length > 0 && step === 1 && (
              <TimelineStep
                survey={currentSurvey}
                selectedOptionId={selectedOptionId}
                onSelect={(id, label) => {
                  setSelectedOptionId(id);
                  setSelectedOptionLabel(label);
                }}
                onContinue={() => setStep(2)}
                headingRef={headingRef}
              />
            )}

            {/* Step 2: Provisional Allocation Terms */}
            {token && projectId && !isLoading && !isError && !isCompleted && results.length > 0 && step === 2 && (
              <TermsStep
                pending={submitMutation.isPending}
                error={submitError}
                onBack={() => setStep(1)}
                onSubmit={handleFinalSubmit}
                headingRef={headingRef}
              />
            )}
          </div>
        </div>
      </main>
    </>
  );
}
