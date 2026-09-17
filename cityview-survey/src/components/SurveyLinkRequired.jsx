import React, { useEffect } from 'react';

/**
 * Displayed when the survey token or project ID is missing from session/URL.
 * Matches the official "Link required" template.
 */
export default function SurveyLinkRequired({
  headingRef,
  supportPhone = '+234 712 017 1162',
  supportEmail = 'allocation@lcrng.com',
}) {
  useEffect(() => {
    document.title = 'Link required | CityView Park & Resort';
  }, []);

  return (
    <div className="view on" id="link-required">
      <div className="mark" aria-hidden="true">
        <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3.5" y="8.6" width="13" height="8.4" rx="2" stroke="#fff" strokeWidth="1.8" />
          <path d="M6.6 8.6V6.4a3.4 3.4 0 016.8 0v2.2" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </div>

      <h1 ref={headingRef} tabIndex={-1} style={{ outline: 'none' }}>
        <span className="hi">This page is private.</span>
        Open it from your email.
      </h1>

      <p className="why">
        This form belongs to a single subscriber record, so it can only be opened through the link we sent you. Typing the address on its own will not get you in.
      </p>
      <p className="why">
        Go to the inbox for the address on your subscription and look for this email:
      </p>

      <div className="subject">
        <span>From CityView Park &amp; Resort</span>
        Your plot at CityView is ready for allocation
      </div>

      <div className="help">
        <p>Cannot find it? Check your spam folder first.</p>
        <p className="tel">
          Call the sales team on <a href={`tel:${supportPhone.replace(/\s+/g, '')}`}>{supportPhone}</a> or email <a href={`mailto:${supportEmail}`}>{supportEmail}</a> and we will send it again.
        </p>
      </div>
    </div>
  );
}
