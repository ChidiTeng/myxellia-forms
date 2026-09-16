import React from 'react';

/**
 * Confirmation view matching the exact PRD specification:
 * - Red square with tick mark
 * - "Thank you, {firstName}. That is everything we needed."
 * - Notice about terms copy and date selected
 * - Sent-to badge with user's email address
 */
export default function Confirmation({ buyer, headingRef }) {
  const firstName = buyer?.firstName || 'Ahmed';
  const email = buyer?.email || 'a.ibraheem@gmail.com';

  return (
    <div className="view on" id="done">
      <div className="tick" aria-hidden="true">
        <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 10.5L8 14.5L16 5.5" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <h1 ref={headingRef} tabIndex={-1}>
        <span className="hi">Thank you, {firstName}.</span>
        That is everything we needed.
      </h1>

      <p className="why">
        A copy of the terms and the date you selected is on its way to you. If that date changes, tell us early. The sooner we know, the easier it is to adjust.
      </p>

      <div className="sentto">
        <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect x="1.5" y="4" width="17" height="12" rx="1.5" stroke="#20099B" strokeWidth="1.6" />
          <path d="M2 5l8 6 8-6" stroke="#20099B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div>
          <b>{email}</b>
          <small>Not your address? Call the sales team.</small>
        </div>
      </div>
    </div>
  );
}
