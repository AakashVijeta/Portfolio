import { useEffect, useRef, useState } from "react";
import "../styles/ThemeToggle.css";
import ThemeTransition from "./ThemeTransition";

const STORAGE_KEY = "portfolio-theme";

const getInitialTheme = () => {
  if (typeof window === "undefined") return "default";
  return window.localStorage.getItem(STORAGE_KEY) || "default";
};

const ThemeToggle = () => {
  const [theme, setTheme] = useState(getInitialTheme);
  const [stage, setStage] = useState("idle"); // idle | active | exit
  const timersRef = useRef([]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "f1") {
      root.setAttribute("data-theme", "f1");
    } else {
      root.removeAttribute("data-theme");
    }
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  useEffect(
    () => () => timersRef.current.forEach(clearTimeout),
    []
  );

  const isF1 = theme === "f1";

  const handleToggle = () => {
    if (stage !== "idle") return;

    const next = isF1 ? "default" : "f1";
    // Overlay appears and new theme applies in the same commit, so only
    // the destination theme's preloader is ever visible.
    setStage("active");
    setTheme(next);

    const exit = setTimeout(() => setStage("exit"), 1200);
    const done = setTimeout(() => setStage("idle"), 1900);

    timersRef.current.push(exit, done);
  };

  return (
    <>
      <button
        type="button"
        className={`theme-toggle ${isF1 ? "theme-toggle--f1" : ""}`}
        onClick={handleToggle}
        disabled={stage !== "idle"}
        aria-label={isF1 ? "Switch to default theme" : "Switch to F1 theme"}
        title={isF1 ? "Default mode" : "Race mode"}
      >
        <span className="theme-toggle-flag" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </span>
        <span className="theme-toggle-label">
          {isF1 ? "RACE MODE" : "LIGHTS OUT"}
        </span>
      </button>
      <ThemeTransition stage={stage} />
    </>
  );
};

export default ThemeToggle;
