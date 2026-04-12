import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css'
import Intro from "./components/Intro";
import NavBar from "./components/NavBar";
import About from "./components/about";
import "./App.css";
import Projects from "./components/Projects";
import Credits from "./components/Credits";
import StatusChrome from "./components/StatusChrome";
import Preloader from "./components/Preloader";

function App() {
  return (
    <div className="App">
      <Preloader />
      <div className="grain" aria-hidden="true" />
      <StatusChrome />
      <NavBar />
      <div id="content">
        <Intro />
        <Projects />
        <About />
        <Credits />
      </div>
    </div>
  );
}

export default App;
