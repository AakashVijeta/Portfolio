import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { projectDetails } from '../../data/projects';
import { useSectionContext } from '../../context/SectionContext';
import { useLayoutMode } from '../../hooks/useLayoutMode';
import { EASE_OUT, prefersReducedMotion } from '../../utils/motion';

const isTouch = () => window.matchMedia('(hover: none)').matches;


const CLASSIFIED_SLOTS = [
  { slug: '__c1', codename: 'CLASSIFIED', tag: 'REDACTED' },
  { slug: '__c2', codename: 'CLASSIFIED', tag: 'REDACTED' },
];

export default function ProjectsSection({ isActive }) {
  const mode = useLayoutMode();
  const rootRef = useRef(null);
  const paneRef = useRef(null);
  const { setOverlayProject } = useSectionContext();
  const cards = [...projectDetails, ...CLASSIFIED_SLOTS];

  const [activeProject, setActiveProject] = useState(null);
  const [displayProject, setDisplayProject] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  // Hover intent: a row only opens when the user deliberately points at it.
  // Scrolling disarms hover (rows sliding under a still cursor must not open);
  // real pointer movement after the scroll settles re-arms it; a short dwell
  // keeps a quick sweep across the board from flashing panels open.
  const pointerArmedRef = useRef(false);
  const dwellRef = useRef({ timer: 0, slug: null });
  const DWELL_MS = 90;
  const SCROLL_SETTLE_MS = 150;

  const openProject = (project) => {
    if (isHovered && activeProject?.slug === project.slug) return;
    setIsHovered(true);
    setActiveProject(project);
    setDisplayProject(project);
    setAnimKey(k => k + 1);
  };

  const handleMouseEnter = (project) => {
    if (!pointerArmedRef.current) return;
    if (isHovered && activeProject?.slug === project.slug) return;
    const dwell = dwellRef.current;
    if (dwell.slug === project.slug && dwell.timer) return;
    clearTimeout(dwell.timer);
    dwell.slug = project.slug;
    dwell.timer = setTimeout(() => {
      dwell.timer = 0;
      if (pointerArmedRef.current) openProject(project);
    }, DWELL_MS);
  };

  const handleMouseLeave = () => {
    clearTimeout(dwellRef.current.timer);
    dwellRef.current = { timer: 0, slug: null };
    setIsHovered(false);
  };

  useLayoutEffect(() => {
    if (!displayProject || !paneRef.current) return;
    if (prefersReducedMotion()) return;

    const pane = paneRef.current;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: EASE_OUT, force3D: true } });

      tl.from(pane, { opacity: 0, x: 24, duration: 0.4, clearProps: 'transform,opacity' });
      tl.from('.pane-title',    { y: 10, opacity: 0, duration: 0.3, clearProps: 'transform,opacity' }, '<0.08');
      tl.from('.pane-subtitle', { y: 8, opacity: 0, duration: 0.28, clearProps: 'transform,opacity' }, '<0.06');
      tl.from('.pane-link-btn', { y: 8,  opacity: 0, stagger: 0.06, duration: 0.24, clearProps: 'transform,opacity' }, '<0.05');
      tl.from('.pane-tag',      { scale: 0.95, opacity: 0, stagger: 0.03, duration: 0.2, clearProps: 'transform,opacity' }, '<0.04');
      tl.from('.pane-heading',  { opacity: 0, duration: 0.26, clearProps: 'opacity' }, '<0.08');
      tl.from('.pane-feature',  { x: 10, opacity: 0, stagger: 0.05, duration: 0.28, clearProps: 'transform,opacity' }, '<0.04');
    }, pane);

    return () => ctx.revert();
  }, [displayProject, animKey]);

  useEffect(() => {
    pointerArmedRef.current = false;
    if (!isActive) return;
    let lastScroll = 0;
    const onScroll = () => {
      lastScroll = performance.now();
      pointerArmedRef.current = false;
      clearTimeout(dwellRef.current.timer);
      dwellRef.current = { timer: 0, slug: null };
    };
    // Browsers synthesise mouse events at the same coordinates when content scrolls
    // under the pointer; only a real change of position after the scroll settles
    // counts as intent.
    let last = null;
    const onMove = (e) => {
      const moved = last && (Math.abs(e.clientX - last.x) > 1 || Math.abs(e.clientY - last.y) > 1);
      last = { x: e.clientX, y: e.clientY };
      if (moved && performance.now() - lastScroll > SCROLL_SETTLE_MS) pointerArmedRef.current = true;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('mousemove', onMove, { passive: true });
    // Leaving the section clears any hover state left behind
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('mousemove', onMove);
      clearTimeout(dwellRef.current.timer);
      setIsHovered(false);
    };
  }, [isActive]);

  useEffect(() => {
    projectDetails.forEach(p => {
      if (!p.image) return;
      const img = new Image();
      img.src = p.image;
      if (img.decode) img.decode().catch(() => {});
    });

    const dummy = { v: 0 };
    gsap.to(dummy, { v: 1, duration: 0.01, onComplete: () => gsap.killTweensOf(dummy) });
  }, []);

  // Flow mode: swipeable card slider (native scroll-snap) with prev/next arrows.
  const trackRef = useRef(null);
  const [slide, setSlide] = useState(0);

  const goTo = (i) => {
    const track = trackRef.current;
    const card = track?.children[i];
    if (!card) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    track.scrollTo({ left: card.offsetLeft - (track.clientWidth - card.offsetWidth) / 2, behavior: reduced ? 'auto' : 'smooth' });
  };

  const onTrackScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const centre = track.scrollLeft + track.clientWidth / 2;
    let best = 0;
    [...track.children].forEach((c, i) => {
      const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - centre);
      const bd = Math.abs(track.children[best].offsetLeft + track.children[best].offsetWidth / 2 - centre);
      if (d < bd) best = i;
    });
    if (best !== slide) setSlide(best);
  };

  const pad2 = (n) => String(n).padStart(2, '0');

  return (
    <section
      ref={rootRef}
      className="section section-stripe projects-section"
      data-enter-stagger="0.09"
      style={mode === 'paged' ? { flexDirection: 'column', alignItems: 'stretch', padding: 0, overflow: 'hidden' } : undefined}
    >
      <header className="projects-topbar section-enter-item">
        <div className="projects-topbar-row">
          <div className="projects-title">
            <span className="scramble-title">EVIDENCE BOARD</span>
          </div>
          <div className="projects-topmeta">
            <div>// FIELD_RECORDS</div>
          </div>
        </div>
        <hr className="profiler-rule" />
      </header>

      {mode === 'flow' ? (
        <div className="pm-slider">
          <div className="pm-track" ref={trackRef} onScroll={onTrackScroll}>
            {projectDetails.map((project, idx) => (
              <button
                type="button"
                key={project.slug}
                className="pm-card section-enter-item"
                onClick={() => setOverlayProject(project)}
                aria-label={`Open ${project.title}`}
              >
                {project.image && (
                  <img
                    className="pm-card-img"
                    src={project.image}
                    alt={`${project.title} — ${project.tag} project screenshot`}
                    loading="lazy"
                    decoding="async"
                  />
                )}
                <span className="pm-card-num" aria-hidden="true">{pad2(idx + 1)}</span>
                <span className="pm-card-body">
                  <span className="pm-card-id">EVIDENCE #{pad2(idx + 1)}</span>
                  <span className="pm-card-title">{project.title}</span>
                  <span className="pm-card-tag">{project.tag}</span>
                  <span className="pm-card-cta">[ OPEN FILE <span aria-hidden="true">→</span> ]</span>
                </span>
              </button>
            ))}
          </div>
          <div className="pm-controls">
            <button type="button" className="pm-arrow pm-arrow-prev" disabled={slide === 0} onClick={() => goTo(slide - 1)} aria-label="Previous project">‹</button>
            <span className="pm-count" aria-live="polite">{pad2(slide + 1)} / {pad2(projectDetails.length)}</span>
            <button type="button" className="pm-arrow pm-arrow-next" disabled={slide === projectDetails.length - 1} onClick={() => goTo(slide + 1)} aria-label="Next project">›</button>
          </div>
        </div>
      ) : (
      <div
        className={`projects-layout ${isHovered && activeProject ? 'is-active' : ''}`}
        onMouseLeave={handleMouseLeave}
      >
        <div className="projects-stack-col">
          <div className="projects-stack">
            {cards.map((project, idx) => {
              const isClassified = project.slug.startsWith('__');
              const isProjActive = isHovered && activeProject?.slug === project.slug;

              return (
                <div
                  key={project.slug}
                  className={`project-bar section-enter-item ${isClassified ? 'project-bar-classified' : ''} ${isProjActive ? 'is-active' : ''}`}
                  onMouseEnter={() => !isClassified && !isTouch() && handleMouseEnter(project)}
                  onMouseMove={() => !isClassified && !isTouch() && handleMouseEnter(project)}
                  onClick={() => !isClassified && isTouch() && setOverlayProject(project)}
                  style={{ '--idx': idx }}
                >
                  <div className="project-bar-inner">
                    {!isClassified && project.image && (
                      <img
                        src={project.image}
                        alt={`${project.title} — ${project.tag} project screenshot`}
                        className="bg-img"
                        loading="eager"
                        decoding="async"
                        fetchPriority="high"
                      />
                    )}
                    <div className="strip-content">
                      <div className="strip-left">
                        {(!isHovered || isProjActive) ? (
                          <>
                            <span className="strip-id">
                              {isClassified ? 'EVIDENCE ///' : `EVIDENCE #${String(projectDetails.findIndex(p => p.slug === project.slug) + 1).padStart(2, '0')}`}
                            </span>
                            <h3 className="strip-title">{isClassified ? project.codename : project.title}</h3>
                          </>
                        ) : (
                          <div className="strip-single-line">
                            <span className="strip-id-inline">
                              {isClassified ? 'EVIDENCE ///' : `EVIDENCE #${String(projectDetails.findIndex(p => p.slug === project.slug) + 1).padStart(2, '0')}`}
                            </span>
                            <span className="strip-title-inline">{isClassified ? project.codename : project.title}</span>
                          </div>
                        )}
                      </div>
                      <div className="strip-right">
                        <span className="strip-tag">
                          {project.tag} <span className="strip-dot">•</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="projects-details-col">
          {displayProject && !displayProject.slug.startsWith('__') && (
            <div
              ref={paneRef}
              className="project-details-pane custom-scrollbar"
            >
               <h2 className="pane-title">{displayProject.title}</h2>
               <p className="pane-subtitle">{displayProject.subtitle}</p>

               <div className="pane-links">
                 {displayProject.liveDemo && (
                   <a href={displayProject.liveDemo} target="_blank" rel="noreferrer" className="pane-link-btn">
                     Launch App <span className="arrow">↗</span>
                   </a>
                 )}
                 {displayProject.repos?.map(repo => (
                   <a key={repo.label} href={repo.href} target="_blank" rel="noreferrer" className="pane-link-btn pane-link-btn-secondary">
                     {repo.label} <span className="arrow">↗</span>
                   </a>
                 ))}
               </div>

               <div className="pane-tech">
                 {displayProject.techStack.map(t => <span key={t} className="pane-tag">{t}</span>)}
               </div>

               <div className="pane-section">
                 <h4 className="pane-heading">KEY FEATURES</h4>
                 <div className="pane-features">
                   {displayProject.features?.slice(0, 3).map((f, i) => {
                      const parts = f.split('.');
                      const title = parts[0];
                      const desc = parts.slice(1).join('.');
                      return (
                        <div key={i} className="pane-feature">
                          <strong>{title}.</strong> {desc.trim()}
                        </div>
                      );
                   })}
                 </div>
               </div>
            </div>
          )}
        </div>
      </div>
      )}

      <div className="projects-bottombar section-enter-item">
        <hr className="profiler-rule" />
        <div className="projects-bottombar-inner">
          <span>{projectDetails.length.toString().padStart(2, '0')} ACTIVE · {CLASSIFIED_SLOTS.length.toString().padStart(2, '0')} CLASSIFIED</span>
          {mode === 'paged' && (
            <span>{window.matchMedia('(hover: none)').matches ? '◁  SWIPE · TAP TO VIEW  ▷' : '◁  HOVER · NAVIGATE  ▷'}</span>
          )}
        </div>
      </div>
    </section>
  );
}
