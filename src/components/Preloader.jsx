import { useEffect, useState } from "react";
import "../styles/Preloader.css";

const Preloader = () => {
  const [stage, setStage] = useState(() => {
    if (typeof window === "undefined") return "done";
    return sessionStorage.getItem("preloaded") ? "done" : "active";
  });

  useEffect(() => {
    if (stage === "done") return;
    const t1 = setTimeout(() => {
      setStage("exit");
      window.dispatchEvent(new Event("preloader:done"));
    }, 1600);
    const t2 = setTimeout(() => {
      setStage("done");
      sessionStorage.setItem("preloaded", "1");
    }, 2300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [stage]);

  if (stage === "done") return null;

  return (
    <div className={`preloader ${stage === "exit" ? "is-exiting" : ""}`}>
      <div className="preloader-inner">
        <span className="preloader-word" style={{ "--i": 0 }}>Aakash</span>
        <span className="preloader-word" style={{ "--i": 1 }}>Vijeta</span>
      </div>
      <div className="preloader-bar" />
    </div>
  );
};

export default Preloader;
