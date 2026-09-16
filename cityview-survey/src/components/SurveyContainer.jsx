import React, { useEffect, useRef, useState } from 'react';
import { usePendingSurveys, useSubmitSurvey } from '../hooks/useSurveys';
import { getAuthToken, getProjectId, getUserProfile, getUserInitials } from '../utils/session';
import TimelineStep from './TimelineStep';
import TermsStep from './TermsStep';
import Confirmation from './Confirmation';
import SurveyLinkRequired from './SurveyLinkRequired';
import logo from '../assets/logo.png';
import hero from '../assets/hero.jpg';

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
  const initials = getUserInitials(userProfile);

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

  const isMissingLink = !token || !projectId;

  return (
    <>
      <div className="topbar">
        <header className="mast">
          <img className="logo" src={logo} alt="CityView Park and Resort" />
          {isMissingLink ? (
            <div className="who">Gousa District, Abuja</div>
          ) : (
            <div className="avatar-wrapper">
              <div className="avatar" tabIndex={0} aria-label={buyerName} role="button">
                <span className="avatar-initials">{initials}</span>
                {/* <span className="avatar-status-pip" aria-hidden="true" /> */}
              </div>
              {/* <div className="avatar-tooltip" role="tooltip">
                <span className="tooltip-name">{buyerName}</span>
                {userProfile?.email && <span className="tooltip-email">{userProfile.email}</span>}
                <span className="tooltip-arrow" aria-hidden="true" />
              </div> */}
            </div>
          )}
        </header>
        <div className="rule" aria-hidden="true">
          <span className="r" />
          <span className="n" />
        </div>
      </div>

      <main className="shell">
        {!isMissingLink && (
          <div
            className="visual"
            style={{ '--hero': `url("${hero}")` }}
            aria-hidden="true"
          />
        )}

        <div className="panel">
          <div className="card">
            {/* Missing Token or Project ID State */}
            {isMissingLink && (
              <SurveyLinkRequired headingRef={headingRef} />
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
