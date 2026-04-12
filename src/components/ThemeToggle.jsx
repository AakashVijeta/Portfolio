import { useEffect, useState } from "react";
import "../styles/ThemeToggle.css";

const getInitialTheme = () => {
  if (typeof window === "undefined") return "dark";
  const saved = localStorage.getItem("theme");
  if (saved === "light" || saved === "dark") return saved;
  return "dark";
};

const ThemeToggle = () => {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <button
      className="theme-toggle"
      onClick={toggle}
      aria-label="Toggle theme"
      data-cursor-label="toggle"
    >
      <span className={`theme-toggle-dot ${theme}`} />
      <span className="theme-toggle-label">
        {theme === "dark" ? "dark" : "light"}
      </span>
    </button>
  );
};

export default ThemeToggle;
