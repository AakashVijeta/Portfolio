import "../styles/About.css";
import FadeInSection from "./FadeInSection";
import RevealTitle from "./RevealTitle";

const techStack = [
  "Python",
  "PyTorch",
  "Numpy",
  "Pandas",
  "React.js",
  "Javascript ES6+",
];

export default function About() {
  const one = (
    <p>
      I’m a developer focused on building intelligent systems and deepening
      the mathematics behind them. I’m currently pursuing a B.Sc. in Data
      Science & Artificial Intelligence at{" "}
      <a href="https://www.iitg.ac.in/">IIT Guwahati</a>, where I’m building a
      strong foundation across machine learning, statistics, and software
      engineering.
    </p>
  );

  const two = (
    <p>
      Outside of work, I’m drawn to well-designed tech, good anime, and the
      occasional battle royale.
    </p>
  );

  return (
    <div id="about">
      <FadeInSection>
        <div className="section-header">
          <RevealTitle as="span" className="section-title">/ about me</RevealTitle>
        </div>

        <div className="about-content">
          <div className="about-description">
            {one}

            <p>Here are some technologies I have been working with:</p>

            <ul className="tech-stack">
              {techStack.map((tech, i) => (
                <FadeInSection key={tech} delay={`${i + 1}00ms`}>
                  <li>{tech}</li>
                </FadeInSection>
              ))}
            </ul>

            {two}
          </div>

          <div className="about-image">
            <img alt="Aakash Vijeta" src="https://picsum.photos/300" />
          </div>
        </div>
      </FadeInSection>
    </div>
  );
}
