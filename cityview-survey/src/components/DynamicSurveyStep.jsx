import React, { useState } from 'react';

/**
 * Renders a single survey question and its selectable options.
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

  function handleSubmit(e) {
    e.preventDefault();
    if (selectedOptionId === null || isSubmitting) return;
    onSubmit(selectedOptionId);
  }

  return (
    <form onSubmit={handleSubmit}>
      {survey.unit_identifier && (
        <div className="unit-badge" title="Associated unit">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span>{survey.unit_identifier}</span>
        </div>
      )}

      <div className="survey-meta">
        <p className="step">
          Survey {currentIndex + 1} of {totalSurveys}
        </p>
        {survey.survey_name && (
          <span className="survey-name-tag">{survey.survey_name}</span>
        )}
      </div>

      <h1 ref={headingRef} tabIndex={-1}>
        {survey.question}
      </h1>

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
              <span>{opt.label}</span>
            </label>
          );
        })}
      </fieldset>

      {error && (
        <p className="error" role="alert" style={{ marginTop: '16px' }}>
          {error}
        </p>
      )}

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
          ) : isLast ? (
            'Submit Survey'
          ) : (
            'Continue'
          )}
        </button>
      </div>
    </form>
  );
}
