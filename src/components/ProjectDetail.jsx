import { useEffect } from "react";
import GitHubIcon from "@mui/icons-material/GitHub";
import OpenInBrowserIcon from "@mui/icons-material/OpenInBrowser";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import FadeInSection from "./FadeInSection";
import "../styles/ProjectDetail.css";

const SectionHeader = ({ number, title }) => (
  <header className="project-detail-section-header">
    <span className="project-detail-section-number">{number}.</span>
    <h2 className="project-detail-section-title">{title}</h2>
  </header>
);

const ProjectDetail = ({ project, onBack }) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [project.slug]);

  let sectionIndex = 0;
  const nextNumber = () =>
    String(++sectionIndex).padStart(2, "0");

  return (
    <main className="project-detail">
      <button type="button" className="project-detail-back" onClick={onBack}>
        <ArrowBackRoundedIcon sx={{ fontSize: 16 }} />
        Back to projects
      </button>

      <FadeInSection>
        <header className="project-detail-hero">
          <span className="project-detail-tag">{project.tag}</span>
          <h1 className="project-detail-title">{project.title}</h1>
          <p className="project-detail-subtitle">{project.subtitle}</p>

          <div className="project-detail-links">
            {project.liveDemo && (
              <a
                className="project-detail-link primary"
                href={project.liveDemo}
                target="_blank"
                rel="noopener noreferrer"
              >
                <OpenInBrowserIcon sx={{ fontSize: 16 }} />
                Live demo
              </a>
            )}
            {project.repos.map((repo) => (
              <a
                key={repo.href}
                className="project-detail-link"
                href={repo.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <GitHubIcon sx={{ fontSize: 14 }} />
                {repo.label}
              </a>
            ))}
          </div>
        </header>
      </FadeInSection>

      {project.image && (
        <FadeInSection delay="100ms">
          <div className="project-detail-media">
            <img src={project.image} alt={project.title} />
          </div>
        </FadeInSection>
      )}

      <FadeInSection delay="150ms">
        <section className="project-detail-section">
          <SectionHeader number={nextNumber()} title="Overview" />
          {project.overview.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </section>
      </FadeInSection>

      <FadeInSection delay="100ms">
        <section className="project-detail-section">
          <SectionHeader number={nextNumber()} title="Key features" />
          <ul className="project-detail-features">
            {project.features.map((feature) => {
              const [head, ...rest] = feature.split(". ");
              const hasHead = rest.length > 0;
              return (
                <li key={feature}>
                  {hasHead ? (
                    <>
                      <strong>{head}.</strong> {rest.join(". ")}
                    </>
                  ) : (
                    feature
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      </FadeInSection>

      {project.architecture && (
        <FadeInSection delay="100ms">
          <section className="project-detail-section">
            <SectionHeader number={nextNumber()} title="Architecture" />
            <pre className="project-detail-architecture">
              {project.architecture}
            </pre>
          </section>
        </FadeInSection>
      )}

      {project.endpoints && project.endpoints.length > 0 && (
        <FadeInSection delay="100ms">
          <section className="project-detail-section">
            <SectionHeader number={nextNumber()} title="API endpoints" />
            <div className="project-detail-endpoints">
              {project.endpoints.map(([route, desc]) => (
                <div key={route} className="project-detail-endpoint">
                  <code>{route}</code>
                  <span>{desc}</span>
                </div>
              ))}
            </div>
          </section>
        </FadeInSection>
      )}

      {project.model && (
        <FadeInSection delay="100ms">
          <section className="project-detail-section">
            <SectionHeader number={nextNumber()} title="Model" />
            <dl className="project-detail-model">
              <div className="project-detail-model-row">
                <dt>Algorithm</dt>
                <dd>{project.model.algorithm}</dd>
              </div>
              <div className="project-detail-model-row">
                <dt>Target</dt>
                <dd>{project.model.target}</dd>
              </div>
              <div className="project-detail-model-row">
                <dt>Training</dt>
                <dd>{project.model.training}</dd>
              </div>
              <div className="project-detail-model-row">
                <dt>Metrics</dt>
                <dd>{project.model.metrics}</dd>
              </div>
            </dl>
          </section>
        </FadeInSection>
      )}

      <FadeInSection delay="100ms">
        <section className="project-detail-section">
          <SectionHeader number={nextNumber()} title="Tech stack" />
          <ul className="project-detail-tech">
            {project.techStack.map((tech) => (
              <li key={tech}>{tech}</li>
            ))}
          </ul>
        </section>
      </FadeInSection>
    </main>
  );
};

export default ProjectDetail;
