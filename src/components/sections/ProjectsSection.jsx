import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { projectDetails } from '../../data/projects';
import { useSectionContext } from '../../context/SectionContext';
import KeyHints from '../KeyHints';

const isTouch = () => window.matchMedia('(hover: none)').matches;


const CLASSIFIED_SLOTS = [
  { slug: '__c1', codename: 'CLASSIFIED', tag: 'REDACTED' },
  { slug: '__c2', codename: 'CLASSIFIED', tag: 'REDACTED' },
  { slug: '__c3', codename: 'CLASSIFIED', tag: 'REDACTED' },
];

export default function ProjectsSection({ isActive }) {
  const rootRef = useRef(null);
  const paneRef = useRef(null);
  const { setOverlayProject } = useSectionContext();
  const cards = [...projectDetails, ...CLASSIFIED_SLOTS];

  const [activeProject, setActiveProject] = useState(null);
  const [displayProject, setDisplayProject] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  const handleMouseEnter = (project) => {
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
      const tl = gsap.timeline({ defaults: { ease: 'power2.out', force3D: true, clearProps: 'transform,opacity' } });

      tl.from(pane, { opacity: 0, x: -16, duration: 0.35 });
      tl.from('.pane-title',    { y: 16, opacity: 0, duration: 0.3 }, '<0.05');
      tl.from('.pane-subtitle', { y: 12, opacity: 0, duration: 0.28 }, '<0.06');
      tl.from('.pane-link-btn', { y: 8,  opacity: 0, stagger: 0.06, duration: 0.24 }, '<0.05');
      tl.from('.pane-tag',      { scale: 0.78, opacity: 0, stagger: 0.03, duration: 0.2 }, '<0.04');
      tl.from('.pane-heading',  { opacity: 0, duration: 0.26 }, '<0.08');
      tl.from('.pane-feature',  { x: -14, opacity: 0, stagger: 0.05, duration: 0.24 }, '<0.04');
    }, pane);

    return () => ctx.revert();
  }, [displayProject, animKey]);

  useLayoutEffect(() => {
    if (!isActive) return;
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

  return (
    <section
      ref={rootRef}
      className="section section-stripe projects-section"
      style={{ flexDirection: 'column', alignItems: 'stretch', padding: 0, overflow: 'hidden' }}
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
                  onClick={() => !isClassified && isTouch() && setOverlayProject(project)}
                  style={{ '--idx': idx }}
                >
                  <div className="project-bar-inner">
                    {!isClassified && project.image && (
                      <img
                        src={project.image}
                        alt={project.title}
                        className="bg-img"
                        loading="eager"
                        decoding="async"
                        fetchpriority="high"
                      />
                    )}
                    <div className="strip-content">
                      <div className="strip-left">
                        <span className="strip-id">
                          {isClassified ? 'EVIDENCE ///' : `EVIDENCE #${String(projectDetails.findIndex(p => p.slug === project.slug) + 1).padStart(2, '0')}`}
                        </span>
                        <h3 className="strip-title">{isClassified ? project.codename : project.title}</h3>
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

      <div className="projects-bottombar section-enter-item">
        <hr className="profiler-rule" />
        <div className="projects-bottombar-inner">
          <span>{projectDetails.length.toString().padStart(2, '0')} ACTIVE · {CLASSIFIED_SLOTS.length.toString().padStart(2, '0')} CLASSIFIED</span>
          <KeyHints />
          <span>{window.matchMedia('(hover: none)').matches ? '◁  SWIPE · TAP TO VIEW  ▷' : '◁  HOVER · NAVIGATE  ▷'}</span>
        </div>
      </div>
    </section>
  );
}
