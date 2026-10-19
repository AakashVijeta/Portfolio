import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { projectDetails } from '../../data/projects';
import { useSectionContext } from '../../context/SectionContext';
import { useLayoutMode } from '../../hooks/useLayoutMode';
import { EASE_OUT, prefersReducedMotion } from '../../utils/motion';
import RollText from '../RollText';

// One placeholder row: "more coming", not padding
const CLASSIFIED_SLOTS = [
  { slug: '__c1', codename: 'CLASSIFIED', tag: 'REDACTED' },
];

const pad2 = (n) => String(n).padStart(2, '0');
// First clause of a long spec line: "LightGBM (LGBMClassifier) + ..." -> "LightGBM"
const lead = (s = '') => s.split(/ \(|[;.,]| \+ /)[0].trim();

// The file for one project: image left, details right (two columns each of the grid),
// the open button at the foot of the fourth column
function CaseFile({ project, liveStat, open, onOpen }) {
  const ref = useRef(null);

  // Opening a file: pinned at its top-left corner, it starts with the right side swung
  // up and lowers gently until level.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!open || !el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.set(el, { transformOrigin: '0% 0%' });
      // Held until the drawer has mostly unfolded, so the fall plays in view
      gsap.set(el, { rotation: -6, opacity: 0 });
      gsap.timeline({ delay: 0.16 })
        .to(el, { opacity: 1, duration: 0.35, ease: 'sine.out' }, 0)
        .to(el, { rotation: 0, duration: 0.75, ease: 'power2.out', clearProps: 'transform,opacity' }, 0)
        .fromTo('.case-file-info > *, .case-file-actions', { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: EASE_OUT, clearProps: 'transform,opacity' }, 0.25);
    }, el);
    return () => ctx.revert();
  }, [open]);

  const facts = [
    ['DOMAIN', project.tag],
    ['STACK', project.techStack.slice(0, 4).join(' · ')],
    ['MODEL', lead(project.model?.algorithm)],
    ['EVALUATED ON', lead(project.model?.metrics)],
  ];

  return (
    <div ref={ref} className="case-file">
      <div className="case-file-media">
        {project.image && (
          <img src={project.image} alt={`${project.title} — ${project.tag} project screenshot`} decoding="async" />
        )}
      </div>
      <div className="case-file-info">
        <p className="case-file-subtitle">{project.subtitle}</p>
        {project.stat && (
          <p className="case-file-stat">
            <span className="case-file-stat-value">{liveStat ?? project.stat.value}</span>
            <span className="case-file-stat-label">{project.stat.label}{liveStat && ' · live'}</span>
          </p>
        )}
        <dl className="case-file-facts">
          {facts.map(([k, v]) => (
            <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
          ))}
        </dl>
      </div>
      <div className="case-file-actions">
        <button type="button" className="case-file-open" onClick={() => onOpen(project)} aria-label={`Open ${project.title} file`}>
          <RollText text="[ OPEN FILE → ]" />
        </button>
        {project.liveDemo && (
          <a className="case-file-live" href={project.liveDemo} target="_blank" rel="noopener noreferrer" aria-label={`${project.title} live demo (opens in a new tab)`}>
            <RollText text="[ LIVE DEMO ↗ ]" />
          </a>
        )}
      </div>
    </div>
  );
}

// Evidence board in Linie's case-study style: a quiet list on a four-column grid.
// A row's file opens in place under it: on desktop while the row is pointed at,
// on phones by tapping the row.
export default function ProjectsSection() {
  const mode = useLayoutMode();
  const { setOverlayProject } = useSectionContext();
  const [active, setActive] = useState(null);
  const rows = [...projectDetails, ...CLASSIFIED_SLOTS];
  const inline = mode === 'flow';

  // Headline stats with a live source replace their baked-in value once it answers;
  // any failure (asleep, offline, slow) just keeps the fallback
  const [liveStats, setLiveStats] = useState({});
  useEffect(() => {
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 8000);
    projectDetails.filter((p) => p.stat?.live).forEach(({ slug, stat }) => {
      fetch(stat.live.url, { signal: ctrl.signal })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          const value = d && stat.live.pick(d);
          if (value) setLiveStats((cur) => ({ ...cur, [slug]: value }));
        })
        .catch(() => {});
    });
    return () => { clearTimeout(timeout); ctrl.abort(); };
  }, []);

  // Desktop hover intent: a row opens only once the pointer settles on it, so sweeping
  // across the list doesn't open every file on the way past
  const timer = useRef(0);
  const point = (slug) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setActive(slug), slug ? 120 : 180);
  };
  useEffect(() => () => clearTimeout(timer.current), []);

  // Scrolling slides rows under a still pointer, which the browser counts as hovering.
  // While the page scrolls the list ignores the pointer (no opening, no letter roll);
  // the next real pointer move hands it back. The open file closes as soon as scrolling
  // carries it out from under the pointer. The flag is a data attribute, not a class:
  // that close re-renders the list's className, which would wipe a class mid-scroll.
  const listRef = useRef(null);
  useEffect(() => {
    const list = listRef.current;
    if (inline || !list) return;
    let held = false;
    let px = -1;
    let py = -1;
    let frame = 0;
    const closeIfLeft = () => {
      frame = 0;
      const entry = list.querySelector('.case-row.is-active')?.closest('li');
      if (!entry) return;
      const r = entry.getBoundingClientRect();
      if (px < r.left || px > r.right || py < r.top || py > r.bottom) {
        clearTimeout(timer.current);
        setActive(null);
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(closeIfLeft);
      if (held) return;
      held = true;
      list.dataset.scrolling = '';
    };
    const onMove = (e) => {
      px = e.clientX;
      py = e.clientY;
      if (!held) return;
      held = false;
      delete list.dataset.scrolling;
      if (!list.contains(document.elementFromPoint(e.clientX, e.clientY))) point(null);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(frame);
      delete list.dataset.scrolling;
    };
  }, [inline]);

  const select = (project) => {
    if (inline) setActive((cur) => (cur === project.slug ? null : project.slug));
    else setOverlayProject(project);
  };

  return (
    <section className="section section-stripe projects-section cases" data-enter-stagger="0.07">
      <header className="projects-topbar section-enter-item">
        <div className="projects-topbar-row">
          <div className="projects-title" data-parallax="24">
            <span className="scramble-title reveal-line"><span>EVIDENCE BOARD</span></span>
          </div>
          <div className="projects-topmeta">
            <div>// FIELD_RECORDS</div>
          </div>
        </div>
        <hr className="profiler-rule reveal-rule" />
      </header>

      <div className="cases-grid">
        <ul
          ref={listRef}
          className={`cases-list ${active ? 'is-pointing' : ''}`}
          onMouseLeave={(e) => { if (!inline && !('scrolling' in e.currentTarget.dataset)) point(null); }}
          onBlur={(e) => { if (!inline && !e.currentTarget.contains(e.relatedTarget)) point(null); }}
        >
          {rows.map((project, idx) => {
            const classified = project.slug.startsWith('__');
            const isActive = active === project.slug;
            return (
              <li
                key={project.slug}
                className="section-enter-item"
                onMouseEnter={() => { if (!inline) point(classified ? null : project.slug); }}
              >
                {classified ? (
                  <div className="case-row is-classified" aria-label="Classified file">
                    <span className="case-row-id">///</span>
                    <span className="case-row-title">{project.codename}</span>
                    <span className="case-row-tag">{project.tag}</span>
                    <span className="case-row-go" aria-hidden="true">—</span>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      className={`case-row ${isActive ? 'is-active' : ''}`}
                      aria-expanded={isActive}
                      aria-label={`${project.title}, ${project.tag}`}
                      onFocus={() => { if (!inline) point(project.slug); }}
                      onClick={() => select(project)}
                    >
                      <span className="case-row-id">#{pad2(idx + 1)}</span>
                      <span className="case-row-title"><RollText text={project.title} /></span>
                      <span className="case-row-tag">{project.tag}</span>
                      <span className="case-row-go" aria-hidden="true">{inline ? (isActive ? '−' : '+') : '→'}</span>
                    </button>
                    <div className={`case-drawer ${isActive ? 'is-open' : ''}`} inert={!isActive}>
                      <div className="case-drawer-inner">
                        <CaseFile project={project} liveStat={liveStats[project.slug]} open={isActive} onOpen={setOverlayProject} />
                      </div>
                    </div>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
