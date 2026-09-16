import React, { useEffect, useId, useRef, useState } from 'react';
import TermsContent from './TermsContent';

/**
 * Step 2 of 2: Provisional allocation terms.
 * Enforces reading to the bottom of the terms container before unlocking the acceptance checkbox.
 */
export default function TermsStep({ pending, error, onBack, onSubmit, headingRef }) {
  const [hasReachedEnd, setHasReachedEnd] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const panelRef = useRef(null);
  const contentRef = useRef(null);
  const checkboxId = useId();

  function checkScroll() {
    const panel = panelRef.current;
    if (panel && panel.scrollTop + panel.clientHeight >= panel.scrollHeight - 8) {
      setHasReachedEnd(true);
    }
  }

  useEffect(() => {
    checkScroll();
    const panel = panelRef.current;
    const content = contentRef.current;
    if (!panel || !content) return;

    const observer = new ResizeObserver(checkScroll);
    observer.observe(panel);
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  function handleSubmit(event) {
    event.preventDefault();
    if (hasReachedEnd && accepted && !pending) {
      onSubmit();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="view on" id="step2" aria-busy={pending}>
      <p className="step">Step 2 of 2</p>
      <h1 ref={headingRef} tabIndex={-1}>
        Provisional allocation terms
      </h1>
      <p className="why">
        Read to the end, then accept to complete your notification. Version 1.0.
      </p>

      <div
        className="terms"
        id="terms"
        ref={panelRef}
        tabIndex={0}
        role="region"
        aria-label="Provisional allocation terms"
        onScroll={checkScroll}
      >
        <div ref={contentRef}>
          <TermsContent />
        </div>
      </div>

      <div className={`accept${hasReachedEnd ? '' : ' locked'}`} id="acceptRow">
        <input
          id={checkboxId}
          type="checkbox"
          checked={accepted}
          disabled={!hasReachedEnd || pending}
          onChange={(event) => setAccepted(event.target.checked)}
        />
        <label htmlFor={checkboxId}>
          I accept these terms, including the development timeline I have selected.
        </label>
      </div>

      {error && (
        <p className="error" role="alert" style={{ marginTop: '16px' }}>
          {error}
        </p>
      )}

      <div className="actions">
        <button
          className="back"
          id="back"
          type="button"
          disabled={pending}
          onClick={onBack}
        >
          Back to your selection
        </button>
        <button
          className="go"
          id="submit"
          type="submit"
          disabled={!hasReachedEnd || !accepted || pending}
        >
          {pending ? 'Submitting…' : 'Accept and complete'}
        </button>
      </div>
    </form>
  );
}
