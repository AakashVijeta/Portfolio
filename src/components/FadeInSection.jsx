import { useEffect, useRef, useState } from "react";

export default function FadeInSection({ children, delay = "0ms" }) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef(null);

  useEffect(() => {
    if (!domRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target); // stop observing after reveal
        }
      },
      { threshold: 0.01, rootMargin: "0px 0px -5% 0px" }
    );

    observer.observe(domRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={domRef}
      className={`fade-in-section ${isVisible ? "is-visible" : ""}`}
      style={{ transitionDelay: delay }}
    >
      {children}
    </div>
  );
}
