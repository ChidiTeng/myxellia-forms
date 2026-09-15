import { useEffect, useRef, useState } from 'react';
import TimelineStep from './components/TimelineStep';
import TermsStep from './components/TermsStep';
import Confirmation from './components/Confirmation';
import logo from './assets/logo.png';
import hero from './assets/hero.jpg';
import './styles.css';

// Replace this integration identifier with the backend's canonical terms version.
export const TERMS_VERSION = 'cityview-provisional-allocation-v1';

/**
 * onSubmit(payload) must resolve to { submissionId: string, emailQueued?: boolean }
 * only after the server has durably recorded the response. It should throw on failure.
 * buyer: { firstName, fullName, email, avatarUrl? }; allocationId: server-issued ID.
 */
export default function AllocationForm({ buyer, allocationId, onSubmit, demo = false }) {
  const [step, setStep] = useState('timeline');
  const [timeline, setTimeline] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const headingRef = useRef(null);
  const inFlight = useRef(false);
  const requestId = useRef(null);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [step]);

  function changeTimeline(value) {
    setTimeline(value);
    // TermsStep remounts after Back, requiring acceptance again.
    requestId.current = null;
    setError('');
  }

  async function submit() {
    if (inFlight.current || !timeline) return;
    inFlight.current = true;
    setPending(true);
    setError('');
    try {
      if (typeof onSubmit !== 'function') throw new Error('Submission is not configured. Please contact the sales team.');
      requestId.current ??= crypto.randomUUID();
      const response = await onSubmit({
        allocationId,
        timeline,
        acceptedTerms: true,
        termsVersion: TERMS_VERSION,
        idempotencyKey: requestId.current,
      });
      if (!response || typeof response.submissionId !== 'string' || !response.submissionId.trim()) {
        throw new Error('We could not confirm your submission. Please try again.');
      }
      setResult(response);
      setStep('done');
    } catch {
      // Avoid displaying raw server errors or sensitive response data.
      setError('We could not confirm your submission. Please try again or contact the sales team.');
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }

  return (
    <>
      <div className="topbar">
        <header className="mast">
          <img className="logo" src={logo} alt="CityView Park and Resort" />
          {buyer.avatarUrl && <div className="avatar" title={buyer.fullName}><img src={buyer.avatarUrl} alt={buyer.fullName} /></div>}
        </header>
        <div className="rule" aria-hidden="true"><span className="r" /><span className="n" /></div>
      </div>
      <main className="shell">
        <div className="visual" style={{ '--hero': `url("${hero}")` }} aria-hidden="true" />
        <div className="panel"><div className="card">
          {demo && step !== 'done' && <p className="demo-notice">Preview mode — responses are not saved or emailed.</p>}
          {step === 'timeline' && <TimelineStep value={timeline} onChange={changeTimeline}
            onContinue={() => setStep('terms')} headingRef={headingRef} />}
          {step === 'terms' && <TermsStep timeline={timeline} pending={pending} error={error}
            onBack={() => { setError(''); setStep('timeline'); }} onSubmit={submit} headingRef={headingRef} />}
          {step === 'done' && <Confirmation buyer={buyer} result={result} demo={demo} headingRef={headingRef} />}
        </div></div>
      </main>
    </>
  );
}
