import { useSectionContext, SECTIONS, SECTION_LABELS } from '../context/SectionContext';

const pad = (n) => String(n).padStart(2, '0');

// Mobile-only top bar: section index with scroll-spy highlight.
export default function MobileRail() {
  const { activeIndex } = useSectionContext();

  const jump = (i) => {
    const el = document.getElementById(`sec-${SECTIONS[i]}`);
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  };

  return (
    <nav className="mobile-rail" aria-label="Section navigation">
      <ol className="mobile-rail-list">
        {SECTIONS.map((name, i) => (
          <li key={name}>
            <button
              type="button"
              className={`mobile-rail-item ${i === activeIndex ? 'is-active' : ''}`}
              aria-current={i === activeIndex ? 'true' : undefined}
              aria-label={`Go to ${SECTION_LABELS[i]}`}
              onClick={() => jump(i)}
            >
              <span className="mobile-rail-num">{pad(i + 1)}</span>
              <span className="mobile-rail-label">{SECTION_LABELS[i]}</span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
