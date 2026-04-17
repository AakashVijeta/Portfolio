import { useEffect, useState } from "react";
import "../styles/ThemeToggle.css";

const STORAGE_KEY = "portfolio-theme";

const getInitialTheme = () => {
  if (typeof window === "undefined") return "default";
  return window.localStorage.getItem(STORAGE_KEY) || "default";
};

const ThemeToggle = () => {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "f1") {
      root.setAttribute("data-theme", "f1");
    } else {
      root.removeAttribute("data-theme");
    }
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  // Sync when T key toggles theme externally (via useSectionManager)
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const attr = document.documentElement.getAttribute("data-theme");
      setTheme(attr === "f1" ? "f1" : "default");
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  const isF1 = theme === "f1";

  const handleToggle = () => {
    setTheme(isF1 ? "default" : "f1");
  };

  return (
    <button
      type="button"
      className={`theme-toggle ${isF1 ? "theme-toggle--f1" : ""}`}
      onClick={handleToggle}
      aria-label={isF1 ? "Switch to Terminal theme" : "Switch to F1 theme"}
      title={isF1 ? "Terminal mode" : "F1 mode"}
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
  );
};

export default ThemeToggle;
