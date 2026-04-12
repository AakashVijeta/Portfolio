import "../styles/Projects.css";
import FolderOpenRoundedIcon from "@mui/icons-material/FolderOpenRounded";
import FadeInSection from "./FadeInSection";
import ExternalLinks from "./ExternalLinks";
import RevealTitle from "./RevealTitle";

const spotlightProjects = [
  {
    tag: "Machine Learning",
    title: "Forecasting F1 podium finishers with XGBoost",
    desc: "End-to-end ML system combining a Python training pipeline, a FastAPI prediction service backed by SQLite, and a React frontend for race-weekend exploration.",
    techStack: "Python · XGBoost · FastAPI · SQLite · React",
    link: "https://github.com/AakashVijeta/f1-podium-predictor",
    image: import.meta.env.BASE_URL + "assets/f1-predictor.png",
  },
  {
    tag: "Quant Research",
    title: "Generating daily Indian equity signals before market open",
    desc: "Python backend handles ingestion, feature engineering, model training, and backtesting; a Vite + React frontend surfaces daily signals and strategy analytics.",
    techStack: "Python · pandas · React · Vite · Netlify",
    link: "https://github.com/AakashVijeta/NiftyEdge-backend",
    open: "https://github.com/AakashVijeta/NiftyEdge-frontend",
    image: import.meta.env.BASE_URL + "assets/niftyedge.png",
  },
];

const projects = [];

const Projects = () => {
  return (
    <section id="projects">
      <header className="section-header">
        <RevealTitle className="section-title">/ projects</RevealTitle>
      </header>

      {/* Spotlight: horizontal bands */}
      <ul className="spotlight-list">
        {spotlightProjects.map((project, i) => (
          <FadeInSection key={project.title} delay={`${(i + 1) * 100}ms`}>
            <a
              className="spotlight-row"
              href={project.open || project.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="spotlight-info">
                <span className="spotlight-tag">{project.tag}</span>
                <h3 className="spotlight-title">{project.title}</h3>
                <p className="spotlight-desc">{project.desc}</p>
                <ul className="spotlight-tech">
                  {project.techStack.split("·").map((t) => (
                    <li key={t.trim()}>{t.trim()}</li>
                  ))}
                </ul>
                <div
                  className="spotlight-links"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLinks
                    githubLink={project.link}
                    openLink={project.open}
                  />
                </div>
              </div>

              <div className="spotlight-media">
                <img src={project.image} alt={project.title} />
              </div>

              <span className="spotlight-chevron" aria-hidden="true">
                ›
              </span>
            </a>
          </FadeInSection>
        ))}
      </ul>

      {/* Project Grid */}
      {projects.length > 0 && (
        <div className="project-container">
          <ul className="projects-grid">
            {projects.map((project, i) => (
              <FadeInSection key={project.title} delay={`${(i + 1) * 100}ms`}>
                <li className="projects-card">
                  <div className="card-header">
                    <FolderOpenRoundedIcon sx={{ fontSize: 35 }} />

                    <ExternalLinks
                      githubLink={project.link}
                      openLink={project.open}
                    />
                  </div>

                  <div className="card-title">{project.title}</div>
                  <div className="card-desc">{project.desc}</div>
                  <div className="card-tech">{project.techStack}</div>
                </li>
              </FadeInSection>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};

export default Projects;
