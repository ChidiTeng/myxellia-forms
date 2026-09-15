import React, { useState } from 'react';

/**
 * Renders a single survey question and its selectable options with a luxury aesthetic.
 *
 * @param {Object} props
 * @param {Object} props.survey - The survey item from results array
 * @param {number} props.currentIndex - 0-based index of the current survey
 * @param {number} props.totalSurveys - Total number of surveys in results
 * @param {boolean} props.isSubmitting - Mutation in-flight status
 * @param {string|null} props.error - Submission error message if any
 * @param {function} props.onSubmit - Callback when user submits selected option: (optionId) => void
 * @param {React.RefObject} props.headingRef - Ref for accessibility focus management
 */
export default function DynamicSurveyStep({
  survey,
  currentIndex,
  totalSurveys,
  isSubmitting,
  error,
  onSubmit,
  headingRef,
}) {
  const [selectedOptionId, setSelectedOptionId] = useState(null);

  if (!survey) return null;

  const sortedOptions = [...(survey.options || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const isLast = currentIndex === totalSurveys - 1;
  const progressPercent = Math.round(((currentIndex + 1) / totalSurveys) * 100);

  function handleSubmit(e) {
    e.preventDefault();
    if (selectedOptionId === null || isSubmitting) return;

    // Authoritative recipient_id from the fetched survey entity
    const recipientId = survey.recipient_id ?? survey.recipientId;
    onSubmit(selectedOptionId, recipientId);
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Unit Identifier Pill */}
      {survey.unit_identifier && (
        <div className="unit-badge" title="Associated Estate Unit">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 21h18M5 21V7l8-4v18M13 3l6 4v14M9 9h1M9 13h1M9 17h1M17 11h1M17 15h1"></path>
          </svg>
          <span>{survey.unit_identifier}</span>
        </div>
      )}

      {/* Progress & Survey Category */}
      <div className="survey-header-meta">
        <div className="progress-track" aria-hidden="true">
          <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
        <div className="meta-row">
          <span className="step-label">
            Step {currentIndex + 1} of {totalSurveys}
          </span>
          {survey.survey_name && (
            <span className="survey-title-tag">{survey.survey_name}</span>
          )}
        </div>
      </div>

      <h1 ref={headingRef} tabIndex={-1}>
        {survey.question}
      </h1>

      {/* Remark Advisory Box */}
      {survey.remark && (
        <div className="remark-box" role="note">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <div>{survey.remark}</div>
        </div>
      )}

      {/* Selectable Options */}
      <fieldset>
        <legend>{survey.question}</legend>
        {sortedOptions.map((opt) => {
          const isChecked = selectedOptionId === opt.id;
          return (
            <label className="opt" key={opt.id}>
              <input
                type="radio"
                name={`survey-option-${survey.recipient_id}`}
                value={opt.id}
                checked={isChecked}
                onChange={() => setSelectedOptionId(opt.id)}
                disabled={isSubmitting}
                required
              />
              <div className="opt-card">
                <div className="opt-radio-ring" aria-hidden="true">
                  <div className="opt-radio-dot" />
                </div>
                <span>{opt.label}</span>
              </div>
            </label>
          );
        })}
      </fieldset>

      {error && (
        <p className="error" role="alert" style={{ marginTop: '18px' }}>
          {error}
        </p>
      )}

      {/* Actions */}
      <div className="actions end">
        <button
          className="go"
          type="submit"
          disabled={selectedOptionId === null || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Submitting…
            </>
          ) : (
            <>
              <span>{isLast ? 'Submit Survey' : 'Continue'}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
