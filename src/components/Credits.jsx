import "../styles/Credits.css";
import FadeInSection from "./FadeInSection";

const Credits = () => {
  return (
    <FadeInSection>
      <footer id="credits">
        <div className="ending-credits">
          <span>
            Designed and built by <strong>Aakash Vijeta</strong>.
          </span>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </footer>
    </FadeInSection>
  );
};

export default Credits;
