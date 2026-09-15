export default function Confirmation({ buyer, result, demo, headingRef }) {
  return (
    <section id="done">
      <div className="tick" aria-hidden="true">
        <svg viewBox="0 0 20 20" fill="none"><path d="M4 10.5L8 14.5L16 5.5" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
      <h1 ref={headingRef} tabIndex={-1}><span className="hi">Thank you, {buyer.firstName}.</span>That is everything we needed.</h1>
      <p className="why">{demo
        ? 'This preview is complete. No response has been saved and no email has been sent.'
        : result.emailQueued
          ? 'A copy of the terms and the timeline you selected is on its way to you. If that timeline changes, tell us early. The sooner we know, the easier it is to adjust.'
          : 'Your development timeline and acceptance have been recorded. If your timeline changes, please contact the sales team early.'}</p>
      <div className="sentto">
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <rect x="1.5" y="4" width="17" height="12" rx="1.5" stroke="#20099B" strokeWidth="1.6" />
          <path d="M2 5l8 6 8-6" stroke="#20099B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div><b>{buyer.email}</b><small>Not your address? Call the sales team.</small></div>
      </div>
    </section>
  );
}
