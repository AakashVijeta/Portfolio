import { useSectionContext } from '../../context/SectionContext';
import { projectDetails } from '../../data/projects';

const CLASSIFIED_SLOTS = [
  { slug: '__c1', codename: 'CLASSIFIED', tag: 'REDACTED' },
  { slug: '__c2', codename: 'CLASSIFIED', tag: 'REDACTED' },
  { slug: '__c3', codename: 'CLASSIFIED', tag: 'REDACTED' },
];

export default function ProjectsSection() {
  const { setOverlayProject } = useSectionContext();
  const cards = [...projectDetails, ...CLASSIFIED_SLOTS];

  return (
    <section
      className="section section-stripe projects-section"
      style={{ flexDirection: 'column', alignItems: 'stretch', padding: 0, overflow: 'hidden' }}
    >
      <header className="projects-topbar section-enter-item">
        <div className="projects-topbar-row">
          <div className="projects-title">
            EVIDENCE BOARD
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
        <span>{window.matchMedia('(hover: none)').matches ? '↕  SCROLL · TAP TO VIEW' : '◁  HOVER · NAVIGATE  ▷'}</span>
      </div>
    </section>
  );
}
