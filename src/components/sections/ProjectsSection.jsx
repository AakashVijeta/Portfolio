import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { projectDetails } from '../../data/projects';
import { useSectionContext } from '../../context/SectionContext';
import KeyHints from '../KeyHints';
import { useLayoutMode } from '../../hooks/useLayoutMode';

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

  // Ignore hover until the cursor actually moves after the section opens,
  // so cards don't activate just because they slid in under a still cursor.
  const pointerArmedRef = useRef(false);

  const handleMouseEnter = (project) => {
    if (!pointerArmedRef.current) return;
    if (isHovered && activeProject?.slug === project.slug) return;
    setIsHovered(true);
    setActiveProject(project);
    setDisplayProject(project);
    setAnimKey(k => k + 1);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  useLayoutEffect(() => {
    if (!displayProject || !paneRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const pane = paneRef.current;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out', force3D: true } });

      tl.from(pane, { opacity: 0, x: 56, duration: 0.5, clearProps: 'transform,opacity' });
      tl.from('.pane-title',    { y: 16, opacity: 0, duration: 0.3, clearProps: 'transform,opacity' }, '<0.08');
      tl.from('.pane-subtitle', { y: 12, opacity: 0, duration: 0.28, clearProps: 'transform,opacity' }, '<0.06');
      tl.from('.pane-link-btn', { y: 8,  opacity: 0, stagger: 0.06, duration: 0.24, clearProps: 'transform,opacity' }, '<0.05');
      tl.from('.pane-tag',      { scale: 0.78, opacity: 0, stagger: 0.03, duration: 0.2, clearProps: 'transform,opacity' }, '<0.04');
      tl.from('.pane-heading',  { opacity: 0, duration: 0.26, clearProps: 'opacity' }, '<0.08');
      tl.from('.pane-feature',  { x: 18, opacity: 0, stagger: 0.05, duration: 0.28, clearProps: 'transform,opacity' }, '<0.04');
    }, pane);

    return () => ctx.revert();
  }, [displayProject, animKey]);

  useEffect(() => {
    pointerArmedRef.current = false;
    if (!isActive) return;
    const arm = () => { pointerArmedRef.current = true; };
    window.addEventListener('mousemove', arm, { once: true });
    // Leaving the section clears any hover state left behind
    return () => {
      window.removeEventListener('mousemove', arm);
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

  const listRef = useRef(null);

  // Flow mode: mark each card once it scrolls into view (drives rise + scan reveal).
  useEffect(() => {
    if (mode !== 'flow' || !listRef.current) return;
    const cards = listRef.current.querySelectorAll('.pm-card');
    if (typeof IntersectionObserver === 'undefined') {
      cards.forEach((c) => c.classList.add('is-seen'));
      return;
    }
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-seen');
        obs.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -15% 0px' });
    cards.forEach((c) => obs.observe(c));
    return () => obs.disconnect();
  }, [mode]);

  return (
    <section
      ref={rootRef}
      className="section section-stripe projects-section"
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
        <div className="pm-list" ref={listRef}>
          {projectDetails.map((project, idx) => (
            <article key={project.slug} className="pm-card">
              <button
                type="button"
                className="pm-media"
                onClick={() => setOverlayProject(project)}
                aria-label={`Open ${project.title}`}
              >
                {project.image && (
                  <img
                    src={project.image}
                    alt={`${project.title} — ${project.tag} project screenshot`}
                    loading="lazy"
                    decoding="async"
                  />
                )}
                <span className="pm-scan" aria-hidden="true" />
              </button>
              <div className="pm-body">
                <div className="pm-meta">
                  <span className="pm-id">EVIDENCE #{String(idx + 1).padStart(2, '0')}</span>
                  <span className="pm-tag">{project.tag}</span>
                </div>
                <h3 className="pm-title">{project.title}</h3>
                <p className="pm-subtitle">{project.subtitle}</p>
                <ul className="pm-tech">
                  {project.techStack.slice(0, 4).map((t) => <li key={t}>{t}</li>)}
                </ul>
                <button type="button" className="pm-open" onClick={() => setOverlayProject(project)}>
                  [ OPEN FILE <span aria-hidden="true">→</span> ]
                </button>
              </div>
            </article>
          ))}
          <div className="pm-classified">
            +{String(CLASSIFIED_SLOTS.length).padStart(2, '0')} FILES · CLASSIFIED
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
                  className={`project-bar ${isClassified ? 'project-bar-classified' : ''} ${isProjActive ? 'is-active' : ''}`}
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
          <KeyHints />
          {mode === 'paged' && (
            <span>{window.matchMedia('(hover: none)').matches ? '◁  SWIPE · TAP TO VIEW  ▷' : '◁  HOVER · NAVIGATE  ▷'}</span>
          )}
        </div>
      </div>
    </section>
  );
}
