import React, { useEffect, useState } from "react";
import Intro from "./components/Intro";
import NavBar from "./components/NavBar";
import About from "./components/about";
import "./App.css";
import Projects from "./components/Projects";
import Credits from "./components/Credits";
import StatusChrome from "./components/StatusChrome";
import Preloader from "./components/Preloader";
import ProjectDetail from "./components/ProjectDetail";
import ThemeToggle from "./components/ThemeToggle";
import PageTransition from "./components/PageTransition";
import { getProjectBySlug } from "./data/projects";

const parseProjectSlug = (hash) => {
  const match = hash.match(/^#\/projects\/([\w-]+)/);
  return match ? match[1] : null;
};

function App() {
  const [projectSlug, setProjectSlug] = useState(() =>
    parseProjectSlug(window.location.hash)
  );

  useEffect(() => {
    const onHashChange = () => {
      setProjectSlug(parseProjectSlug(window.location.hash));
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const activeProject = projectSlug ? getProjectBySlug(projectSlug) : null;

  const handleBack = () => {
    window.location.hash = "#projects";
  };

  if (activeProject) {
    return (
      <div className="App">
        <div className="grain" aria-hidden="true" />
        <StatusChrome />
        <ThemeToggle />
        <NavBar />
        <PageTransition key={activeProject.slug}>
          <ProjectDetail project={activeProject} onBack={handleBack} />
        </PageTransition>
      </div>
    );
  }

  return (
    <div className="App">
      <Preloader />
      <div className="grain" aria-hidden="true" />
      <StatusChrome />
      <ThemeToggle />
      <NavBar />
      <PageTransition key="home">
        <div id="content">
          <Intro />
          <Projects />
          <About />
          <Credits />
        </div>
      </PageTransition>
    </div>
  );
}

export default App;
