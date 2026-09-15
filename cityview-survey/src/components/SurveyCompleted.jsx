import React from 'react';

/**
 * Rendered when all surveys have been successfully submitted.
 */
export default function SurveyCompleted({ headingRef }) {
  return (
    <section id="done">
      <div className="tick" aria-hidden="true">
        <svg viewBox="0 0 20 20" fill="none">
          <path d="M4 10.5L8 14.5L16 5.5" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <h1 ref={headingRef} tabIndex={-1}>
        <span className="hi">Thank you.</span>
        Your response has been received.
      </h1>

      <p className="why">
        Your survey answers have been securely recorded. Our development and estate team will use these preferences to guide the master planning and scheduling for your unit.
      </p>

      <div className="sentto">
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z" fill="#20099B" />
        </svg>
        <div>
          <b>Responses Saved Successfully</b>
          <small>You may now safely close this window.</small>
        </div>
      </div>
    </section>
  );
}
