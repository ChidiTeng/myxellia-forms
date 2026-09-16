import React from 'react';

export const FALLBACK_TIMELINES = [
  { id: 1, value: 'Within 1 year', label: 'Within 1 year' },
  { id: 2, value: '1 to 2 years', label: '1 to 2 years' },
  { id: 3, value: '2 to 3 years', label: '2 to 3 years' },
  { id: 4, value: '3 to 5 years', label: '3 to 5 years' },
  { id: 5, value: 'More than 5 years', label: 'More than 5 years' },
  { id: 6, value: 'Not yet decided', label: 'I have not decided yet' },
];

/**
 * Step 1 of 2: Selection of development timeline.
 * Mirrors the exact PRD markup and styles while seamlessly binding to the API options.
 */
export default function TimelineStep({
  survey,
  selectedOptionId,
  onSelect,
  onContinue,
  headingRef,
}) {
  const question = survey?.question || 'When do you plan to begin developing the land?';
  const remark =
    survey?.remark?.trim() ||
    'Plots are grouped by build timeline, so your answer decides which part of the estate you are placed in.';

  const options =
    survey?.options && survey.options.length > 0
      ? [...survey.options].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      : FALLBACK_TIMELINES;

  function handleSubmit(event) {
    event.preventDefault();
    if (selectedOptionId !== null && selectedOptionId !== undefined) {
      onContinue();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="view on" id="step1">
      <p className="step">Step 1 of 2</p>
      <h1 ref={headingRef} tabIndex={-1}>
        {question}
      </h1>
      <p className="why">{remark}</p>

      <fieldset>
        <legend>{question}</legend>
        {options.map((opt) => {
          const optId = opt.id ?? opt.value;
          const optLabel = opt.label || opt.value;
          const isChecked = selectedOptionId === optId;

          return (
            <label className="opt" key={optId}>
              <input
                type="radio"
                name="timeline"
                value={optId}
                checked={isChecked}
                onChange={() => onSelect(optId, optLabel)}
                required
              />
              <span>{optLabel}</span>
            </label>
          );
        })}
      </fieldset>

      <div className="actions end">
        <button
          className="go"
          id="next"
          type="submit"
          disabled={selectedOptionId === null || selectedOptionId === undefined}
        >
          Continue
        </button>
      </div>
    </form>
  );
}
