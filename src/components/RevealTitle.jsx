import { useEffect, useRef, useState } from "react";
import "../styles/RevealTitle.css";

const RevealTitle = ({ children, className = "", as: Tag = "h2" }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setVisible(true),
      { threshold: 0.3 }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  const words = String(children).split(" ");

  return (
    <Tag
      ref={ref}
      className={`reveal-title ${visible ? "is-visible" : ""} ${className}`}
    >
      {words.map((w, i) => (
        <span className="reveal-word" key={i}>
          <span className="reveal-word-inner" style={{ "--d": `${i * 60}ms` }}>
            {w}
          </span>
        </span>
      ))}
    </Tag>
  );
};

export default RevealTitle;
