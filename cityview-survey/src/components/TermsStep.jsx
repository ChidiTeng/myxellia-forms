import { useEffect, useId, useRef, useState } from 'react';
import TermsContent from './TermsContent';

export default function TermsStep({ timeline, pending, error, onBack, onSubmit, headingRef }) {
  const [hasReachedEnd, setHasReachedEnd] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const panelRef = useRef(null);
  const contentRef = useRef(null);
  const checkboxId = useId();
  const hintId = useId();

  function checkScroll() {
    const panel = panelRef.current;
    if (panel && panel.scrollTop + panel.clientHeight >= panel.scrollHeight - 8) {
      setHasReachedEnd(true);
    }
  }

  useEffect(() => {
    checkScroll();
    // Also unlock if the terms fit without scrolling after a resize.
    const observer = new ResizeObserver(checkScroll);
    observer.observe(panelRef.current);
    observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, []);

  function handleSubmit(event) {
    event.preventDefault();
    if (hasReachedEnd && accepted && !pending) onSubmit();
  }

  return (
    <form onSubmit={handleSubmit} aria-busy={pending}>
      <p className="step">Step 2 of 2</p>
      <h1 ref={headingRef} tabIndex={-1}>Provisional allocation terms</h1>
      <p className="why" id={hintId}>Read to the end, then accept to complete your notification.</p>
      <p className="selected-timeline">Selected timeline: <strong>{timeline}</strong></p>
      <div className="terms" ref={panelRef} tabIndex={0} role="region"
        aria-label="Provisional allocation terms" aria-describedby={hintId} onScroll={checkScroll}>
        <div ref={contentRef}><TermsContent /></div>
      </div>
      <div className={`accept${hasReachedEnd ? '' : ' locked'}`}>
        <input id={checkboxId} type="checkbox" checked={accepted} disabled={!hasReachedEnd || pending}
          aria-describedby={hintId} onChange={(event) => setAccepted(event.target.checked)} />
        <label htmlFor={checkboxId}>I accept these terms, including the development timeline I have selected.</label>
      </div>
      {error && <p className="error" role="alert">{error}</p>}
      <div className="actions">
        <button className="back" type="button" disabled={pending} onClick={onBack}>Back to your selection</button>
        <button className="go" type="submit" disabled={!hasReachedEnd || !accepted || pending}>
          {pending ? 'Submitting…' : 'Accept and complete'}
        </button>
      </div>
    </form>
  );
}
