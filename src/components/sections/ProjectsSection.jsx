import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { useSectionContext } from '../../context/SectionContext';
import { projectDetails } from '../../data/projects';
import { scrambleText } from '../../utils/scramble';

const CLASSIFIED_SLOTS = [
  { slug: '__c1', codename: 'CLASSIFIED', tag: 'REDACTED' },
  { slug: '__c2', codename: 'CLASSIFIED', tag: 'REDACTED' },
  { slug: '__c3', codename: 'CLASSIFIED', tag: 'REDACTED' },
];

export default function ProjectsSection({ isActive }) {
  const { setOverlayProject } = useSectionContext();
  const rootRef = useRef(null);
  const cards = [...projectDetails, ...CLASSIFIED_SLOTS];

  useLayoutEffect(() => {
    if (!isActive) return;
    const title = rootRef.current?.querySelector('.scramble-title');
    if (title) scrambleText(title);
  }, [isActive]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (prefersReduced || !canHover) return undefined;

    const ctx = gsap.context(() => {
      const strips = gsap.utils.toArray('.project-strip:not(:disabled)');
      const cleanups = strips.map((strip) => {
        const details = strip.querySelector('.strip-details');
        const corners = strip.querySelectorAll('.corner');
        const barcode = strip.querySelector('.strip-barcode');

        const enter = () => {
          gsap.to(details, { y: -4, duration: 0.42, ease: 'power3.out', overwrite: 'auto' });
          gsap.to(corners, { opacity: 1, duration: 0.24, stagger: 0.025, overwrite: 'auto' });
          gsap.to(barcode, { scaleY: 1.18, transformOrigin: 'top center', duration: 0.32, ease: 'power2.out', overwrite: 'auto' });
        };

        const leave = () => {
          gsap.to(details, { y: 0, duration: 0.38, ease: 'power3.out', overwrite: 'auto' });
          gsap.to(corners, { opacity: 0, duration: 0.2, overwrite: 'auto', clearProps: 'opacity' });
          gsap.to(barcode, { scaleY: 1, duration: 0.28, ease: 'power2.out', overwrite: 'auto', clearProps: 'transform' });
        };

        strip.addEventListener('mouseenter', enter);
        strip.addEventListener('mouseleave', leave);
        return () => {
          strip.removeEventListener('mouseenter', enter);
          strip.removeEventListener('mouseleave', leave);
        };
      });

      return () => cleanups.forEach((cleanup) => cleanup());
    }, root);

    return () => ctx.revert();
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
            <div className="speed-line" />
          </div>
          <div className="projects-topmeta">
            <div>SECTION 002</div>
            <div>// FIELD_RECORDS</div>
          </div>
        </div>
        <hr className="profiler-rule" />
      </header>

      <div className="projects-list section-scroll section-enter-item">
        {cards.map((p, i) => {
          const isClassified = p.slug.startsWith('__');
          const caseNo = (i + 1).toString().padStart(2, '0');
          return (
            <button
              key={p.slug}
              className={`project-strip ${isClassified ? 'project-strip-classified' : ''}`}
              onClick={() => !isClassified && setOverlayProject(p)}
              disabled={isClassified}
            >
              <div className="project-strip-inner">
                <div className="corner tl" />
                <div className="corner tr" />
                <div className="corner bl" />
                <div className="corner br" />

                <div className="strip-visual">
                  {!isClassified && <img src={p.image} alt={p.title} className="bg-img" loading="lazy" />}
                  <div className="strip-scan-grid" />
                  <div className="strip-scan-beam" />
                </div>

                <div className="strip-content">
                  <div className="strip-tech-header">
                    <div className="strip-barcode" />
                    <div className="strip-status">
                      <span className="uppercase">{isClassified ? 'CLASSIFIED' : p.tag}</span>
                      <div className="status-indicator" />
                    </div>
                  </div>

                  <div className="strip-details">
                    <span className="strip-id">CASE #{caseNo}</span>
                    <div className="strip-title-wrap">
                      <h3 className="strip-title">
                        {isClassified ? p.codename : p.title}
                      </h3>
                    </div>
                    <div className="strip-access">
                      [ {isClassified ? 'ACCESS DENIED' : 'CLICK TO DECRYPT'} ]
                    </div>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="projects-bottombar section-enter-item">
        <span>{projectDetails.length.toString().padStart(2, '0')} ACTIVE · {CLASSIFIED_SLOTS.length.toString().padStart(2, '0')} CLASSIFIED</span>
        <span>{window.matchMedia('(hover: none)').matches ? '◁  SWIPE · TAP TO VIEW  ▷' : '◁  HOVER · NAVIGATE  ▷'}</span>
      </div>
    </section>
  );
}
