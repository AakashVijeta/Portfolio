import { useSectionContext } from '../../context/SectionContext';
import { projectDetails } from '../../data/projects';

const STATUSES = ['DEPLOYED', 'ACTIVE'];
const CLASSIFICATIONS = ['CASE', 'FILE'];

export default function ProjectsSection() {
  const { setOverlayProject } = useSectionContext();

  return (
    <section
      className="section section-stripe"
      style={{
        flexDirection: 'column',
        alignItems: 'stretch',
        padding: '56px 48px 48px',
        overflow: 'hidden',
      }}
    >
      {/* Header + classification stamp */}
      <div
        className="section-enter-item"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: '28px',
          flexShrink: 0,
        }}
      >
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.7rem',
          letterSpacing: '0.45em',
          color: 'var(--color-accent)',
          textTransform: 'uppercase',
        }}>
          Case Files
          <div className="speed-line" />
        </div>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.6rem',
          letterSpacing: '0.35em',
          color: 'var(--color-muted)',
          textTransform: 'uppercase',
        }}>
          CLASSIFICATION · PUBLIC · {projectDetails.length.toString().padStart(2, '0')} FILES
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '28px',
          alignContent: 'start',
        }}
      >
        {projectDetails.map((project, i) => {
          const caseNo = (i + 1).toString().padStart(2, '0');
          const status = STATUSES[i % STATUSES.length];
          const classification = CLASSIFICATIONS[i % CLASSIFICATIONS.length];
          return (
            <button
              key={project.slug}
              className="project-card section-enter-item"
              onClick={() => setOverlayProject(project)}
              style={{
                all: 'unset',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                overflow: 'hidden',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s',
                position: 'relative',
              }}
            >
              {/* Top metadata strip */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 16px',
                borderBottom: '1px solid var(--color-border)',
                fontFamily: 'var(--font-display)',
                fontSize: '0.55rem',
                letterSpacing: '0.3em',
                color: 'var(--color-muted)',
                textTransform: 'uppercase',
              }}>
                <span style={{ color: 'var(--color-accent)' }}>
                  {classification} / {caseNo}
                </span>
                <span className="project-card-status">
                  <span className="project-card-dot" /> {status}
                </span>
              </div>

              {/* Full-bleed screenshot */}
              <div style={{
                width: '100%',
                aspectRatio: '16/9',
                overflow: 'hidden',
                background: 'var(--color-bg)',
                position: 'relative',
              }}>
                <img
                  src={project.image}
                  alt={project.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                    transition: 'transform 0.4s ease',
                  }}
                />
                {/* Corner brackets on image */}
                <div className="project-card-bracket project-card-bracket-tl" />
                <div className="project-card-bracket project-card-bracket-br" />
              </div>

              {/* Body */}
              <div style={{ padding: '18px 20px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.58rem',
                  letterSpacing: '0.35em',
                  color: 'var(--color-accent)',
                  textTransform: 'uppercase',
                }}>
                  {project.tag}
                </div>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(1.1rem, 1.6vw, 1.45rem)',
                  letterSpacing: '0.02em',
                  color: 'var(--color-text)',
                  textTransform: 'uppercase',
                  lineHeight: 1.15,
                  fontWeight: 700,
                }}>
                  {project.title}
                </div>
                <div style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.8rem',
                  color: 'var(--color-muted)',
                  lineHeight: 1.55,
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}>
                  {project.subtitle}
                </div>

                {/* Tech chips */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  marginTop: '4px',
                }}>
                  {project.techStack.slice(0, 4).map((tech) => (
                    <span key={tech} style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '0.55rem',
                      letterSpacing: '0.2em',
                      color: 'var(--color-muted)',
                      border: '1px solid var(--color-border)',
                      padding: '3px 7px',
                      textTransform: 'uppercase',
                    }}>
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer CTA */}
              <div className="project-card-cta">
                <span className="project-card-cta-terminal">&gt; DECRYPT FILE</span>
                <span className="project-card-cta-f1">OPEN TELEMETRY</span>
                <span className="project-card-cta-arrow">→</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
