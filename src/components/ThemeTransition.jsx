import "../styles/Preloader.css";

const ThemeTransition = ({ stage }) => {
  if (stage === "idle") return null;

  return (
    <div className={`preloader ${stage === "exit" ? "is-exiting" : ""}`}>
      <div className="preloader-inner">
        <span className="preloader-word" style={{ "--i": 0 }}>
          Aakash
        </span>
        <span className="preloader-word" style={{ "--i": 1 }}>
          Vijeta
        </span>
      </div>
      <div className="preloader-bar" />
      <div className="preloader-lights" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="preloader-lights-pillar"
            style={{ "--i": i }}
          >
            <span className="preloader-lights-lamp" />
            <span className="preloader-lights-lamp" />
          </span>
        ))}
      </div>
    </div>
  );
};

export default ThemeTransition;
