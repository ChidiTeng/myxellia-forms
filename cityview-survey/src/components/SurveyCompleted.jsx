import React from 'react';

/**
 * Rendered when all surveys have been successfully submitted.
 */
export default function SurveyCompleted({ headingRef }) {
  return (
    <section id="done">
      <div className="breathable-icon-wrap">
        <div className="breathable-icon success" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
      </div>

      <h1 ref={headingRef} tabIndex={-1}>
        <span className="hi">Thank you.</span>
        Your response has been received.
      </h1>

      <p className="why">
        Your survey answers have been securely recorded. Our development and estate team will use these preferences to guide the master planning and scheduling for your unit.
      </p>

      <div className="completion-badge-card">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          <polyline points="9 12 11 14 15 10"></polyline>
        </svg>
        <div>
          <b>Responses Authenticated &amp; Saved</b>
          <small>You may now safely close this browser window.</small>
        </div>
      </div>
    </section>
  );
}
