import { useEffect, useState } from "react";
import "../styles/Intro.css";
import Typist from "react-typist-component";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import FadeInSection from "./FadeInSection";
import ParticlePortrait from "./ParticlePortrait";

function Intro() {
  const [ready, setReady] = useState(() =>
    typeof window !== "undefined" && !!sessionStorage.getItem("preloaded")
  );

  useEffect(() => {
    if (ready) return;
    const handler = () => setReady(true);
    window.addEventListener("preloader:done", handler);
    return () => window.removeEventListener("preloader:done", handler);
  }, [ready]);

  return (
    <div id="intro">
      <div className="intro-simulation">
        <ParticlePortrait />
      </div>

      <div className="intro-block">
        {ready ? (
          <Typist typingDelay={120} cursor={<span className="cursor">|</span>}>
            <span className="intro-title">
              {"hi, "}
              <span className="intro-name">{"aakash"}</span>
              {" here."}
            </span>
          </Typist>
        ) : (
          <span className="intro-title" aria-hidden="true">&nbsp;</span>
        )}

        <FadeInSection delay="200ms">
          <div className="intro-desc">
            I build intelligent systems at the intersection of machine learning,
            software engineering, and applied mathematics. Currently studying
            Data Science & AI at IIT Guwahati and open to roles where I can
            ship meaningful work.
          </div>

          <a href="mailto:aakashvijeta2@gmail.com" className="intro-contact">
            <EmailRoundedIcon />
            {" Get in touch"}
          </a>
        </FadeInSection>
      </div>
    </div>
  );
}

export default Intro;
