export const TIMELINES = [
  { value: 'Within 1 year', label: 'Within 1 year' },
  { value: '1 to 2 years', label: '1 to 2 years' },
  { value: '2 to 3 years', label: '2 to 3 years' },
  { value: '3 to 5 years', label: '3 to 5 years' },
  { value: 'More than 5 years', label: 'More than 5 years' },
  { value: 'Not yet decided', label: 'I have not decided yet' },
];

export default function TimelineStep({ value, onChange, onContinue, headingRef }) {
  return (
    <form onSubmit={(event) => { event.preventDefault(); if (value) onContinue(); }}>
      <p className="step">Step 1 of 2</p>
      <h1 ref={headingRef} tabIndex={-1}>When do you plan to begin developing the land?</h1>
      <p className="why">Plots are grouped by build timeline, so your answer decides which part of the estate you are placed in.</p>
      <fieldset>
        <legend>When do you plan to begin developing the land?</legend>
        {TIMELINES.map((option) => (
          <label className="opt" key={option.value}>
            <input type="radio" name="timeline" value={option.value} checked={value === option.value}
              onChange={() => onChange(option.value)} required />
            <span>{option.label}</span>
          </label>
        ))}
      </fieldset>
      <div className="actions end"><button className="go" type="submit" disabled={!value}>Continue</button></div>
    </form>
  );
}
