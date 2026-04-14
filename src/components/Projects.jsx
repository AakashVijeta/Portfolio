import "../styles/Projects.css";
import FolderOpenRoundedIcon from "@mui/icons-material/FolderOpenRounded";
import FadeInSection from "./FadeInSection";
import ExternalLinks from "./ExternalLinks";
import RevealTitle from "./RevealTitle";

const spotlightProjects = [
  {
    slug: "f1-podium-predictor",
    tag: "Machine Learning",
    title: "Calling the F1 podium before the lights go out",
    desc: "A calibrated gradient-boosting model that turns each Grand Prix qualifying grid into a live podium forecast — with a public accuracy scoreboard tracking every round.",
    techStack: "Python · scikit-learn · FastAPI · Postgres · React",
    link: "https://github.com/AakashVijeta/f1-podium-predictor",
    open: "https://f1.aakashvijeta.me",
    image: import.meta.env.BASE_URL + "assets/f1-predictor.png",
  },
  {
    slug: "niftyedge",
    tag: "Quant Research",
    title: "A pre-market trading desk for the Nifty 50",
    desc: "Walk-forward-validated XGBoost signals, an LLM analyst grounded in the day's probabilities, and a three-column dashboard that lands on screen before the opening bell.",
    techStack: "Python · XGBoost · FastAPI · React · Groq LLM",
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
              href={`#/projects/${project.slug}`}
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
