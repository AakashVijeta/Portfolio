import { useEffect, useRef, useState } from 'react';
import { useSectionContext } from '../context/SectionContext';
import { projectDetails } from '../data/projects';
import { prefersReducedMotion } from '../utils/motion';
import RollText from './RollText';

const pad = (n) => String(n).padStart(2, '0');
const projectFromHash = () =>
  projectDetails.find((d) => d.slug === decodeURIComponent(window.location.hash.slice(1))) ?? null;

// Project file at every width: a full-screen "case file" with prev/next between projects.
export default function ProjectViewer() {
  const { overlayProject, setOverlayProject } = useSectionContext();
  const scrollRef = useRef(null);
  const [closing, setClosing] = useState(false);
  const [copied, setCopied] = useState(false);
  const p = overlayProject;

  // Exit the way it entered (fade + slight drop), then unmount
  const close = () => {
    if (prefersReducedMotion()) { setOverlayProject(null); return; }
    setClosing(true);
  };
  const closeRef = useRef(() => {});
  useEffect(() => {
    closeRef.current = () => { if (p) close(); };
  });

  // Each open file has its own address (#slug): a shared link opens it, and back/forward
  // open and close files like pages
  useEffect(() => {
    const sync = () => {
      const next = projectFromHash();
      if (next) setOverlayProject(next);
      else closeRef.current();
    };
    if (projectFromHash()) sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, [setOverlayProject]);

  useEffect(() => {
    const onFile = !!projectFromHash();
    if (p) {
      if (projectFromHash()?.slug === p.slug) return;
      // Opening adds a history entry (so back closes it); prev/next just swaps the address
      if (onFile) window.history.replaceState(window.history.state, '', `#${p.slug}`);
      else window.history.pushState({ projectFile: true }, '', `#${p.slug}`);
    } else if (onFile) {
      // Closed in the page: undo our entry, or drop the hash if the visit started on it
      if (window.history.state?.projectFile) window.history.back();
      else window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, [p]);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }, [copied]);
  const copyLink = () => {
    navigator.clipboard?.writeText(window.location.href).then(() => setCopied(true), () => {});
  };
  const onAnimationEnd = (e) => {
    if (closing && e.target === e.currentTarget) {
      setClosing(false);
      setOverlayProject(null);
    }
  };
  const index = p ? projectDetails.findIndex((d) => d.slug === p.slug) : -1;

  // Hold the page still behind the file
  useEffect(() => {
    document.documentElement.classList.toggle('overlay-open', !!p);
    return () => document.documentElement.classList.remove('overlay-open');
  }, [p]);

  useEffect(() => {
    if (!p) return;
    scrollRef.current?.scrollTo(0, 0);
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [p]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!p) return null;

  const total = projectDetails.length;
  const step = (dir) => setOverlayProject(projectDetails[(index + dir + total) % total]);

  return (
    <div className={`pv ${closing ? 'pv--out' : ''}`} role="dialog" aria-modal="true" aria-label={p.title} onAnimationEnd={onAnimationEnd}>
      <div className="pv-scroll" ref={scrollRef} data-lenis-prevent>
        <button type="button" className="pv-close" onClick={close}>
          <RollText text="[ CLOSE FILE ]" />
        </button>

        {/* Keyed by project so stepping prev/next crossfades the file */}
        <div key={p.slug} className="pv-content">
        <header className="pv-head">
          <p className="pv-kicker">CASE FILE // DECRYPTED</p>
          <div className="pv-idrow">
            <span className="pv-id">EVIDENCE #{pad(index + 1)}</span>
            <span className="pv-tag">{p.tag}</span>
          </div>
          <h2 className="pv-title">{p.title}</h2>
          <p className="pv-subtitle">{p.subtitle}</p>
        </header>

        {p.image && (
          <img className="pv-img" src={p.image} alt={`${p.title} — ${p.tag} project screenshot`} decoding="async" />
        )}

        <div className="pv-links">
          {p.liveDemo && (
            <a className="pv-link pv-link-primary" href={p.liveDemo} target="_blank" rel="noopener noreferrer">
              [ LAUNCH APP <span aria-hidden="true">↗</span> ]
            </a>
          )}
          {p.repos?.map((r) => (
            <a key={r.label} className="pv-link" href={r.href} target="_blank" rel="noopener noreferrer">
              [ {r.label} <span aria-hidden="true">↗</span> ]
            </a>
          ))}
          <button type="button" className="pv-link pv-copy" onClick={copyLink} aria-live="polite">
            {copied ? '[ LINK COPIED ]' : '[ COPY LINK ]'}
          </button>
        </div>

        <section className="pv-panel">
          <h3 className="pv-panel-title">STACK</h3>
          <ul className="pv-chips">
            {p.techStack.map((t) => <li key={t} className="pv-chip">{t}</li>)}
          </ul>
        </section>

        {p.overview?.length > 0 && (
          <section className="pv-section pv-overview">
            <h3 className="pv-section-title">// MISSION_REPORT</h3>
            {p.overview.map((para, i) => <p key={i}>{para}</p>)}
          </section>
        )}

        {p.features?.length > 0 && (
          <section className="pv-section">
            <h3 className="pv-section-title">// KEY_FEATURES</h3>
            <ul className="pv-features">
              {p.features.map((feat, i) => {
                const [title, ...rest] = feat.split('.');
                return (
                  <li key={i} className="pv-feature">
                    <strong>{title}.</strong> {rest.join('.').trim()}
                  </li>
                );
              })}
            </ul>
          </section>
        )}
        </div>
      </div>

      <button type="button" className="pv-nav pv-prev" onClick={() => step(-1)} aria-label="Previous project">‹</button>
      <button type="button" className="pv-nav pv-next" onClick={() => step(1)} aria-label="Next project">›</button>
    </div>
  );
}
