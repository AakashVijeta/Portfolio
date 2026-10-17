// Button label split into characters for a hover letter-roll (desktop CSS in desktop.css).
// Visual only: give the parent control an aria-label with the plain text.
export default function RollText({ text }) {
  return (
    <span className="roll" aria-hidden="true">
      {[...text].map((ch, i) => (
        <span key={i} className="roll-char" style={{ '--i': i }} data-ch={ch}>
          {ch === ' ' ? ' ' : ch}
        </span>
      ))}
    </span>
  );
}
