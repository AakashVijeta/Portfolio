import { useRef, useEffect, useState } from "react";

const readTheme = () =>
  typeof document !== "undefined" &&
  document.documentElement.getAttribute("data-theme") === "f1"
    ? "f1"
    : "default";

const ParticlePortrait = () => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });
  const linesRef = useRef([]);
  const imageLoadedRef = useRef(false);
  const startTimeRef = useRef(null);
  const [size, setSize] = useState(500);
  const [theme, setTheme] = useState(readTheme);

  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth;
      if (width <= 480) {
        setSize(Math.min(220, width - 40));
      } else if (width <= 768) {
        setSize(Math.min(280, width - 60));
      } else {
        setSize(400);
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(() => setTheme(readTheme()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const canvasWidth = size;
    const canvasHeight = size;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const isF1 = theme === "f1";
    let animationId;

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = import.meta.env.BASE_URL + "profile.png";

    img.onload = () => {
      const offscreen = document.createElement("canvas");
      const offCtx = offscreen.getContext("2d");
      offscreen.width = canvasWidth;
      offscreen.height = canvasHeight;

      const scale = 0.8;
      const imgAspect = img.width / img.height;

      let drawHeight = canvasHeight * scale;
      let drawWidth = drawHeight * imgAspect;

      if (drawWidth > canvasWidth * scale) {
        drawWidth = canvasWidth * scale;
        drawHeight = drawWidth / imgAspect;
      }

      const offsetX = (canvasWidth - drawWidth) / 2;
      const offsetY = (canvasHeight - drawHeight) / 2;

      offCtx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      const imageData = offCtx.getImageData(0, 0, canvasWidth, canvasHeight);
      const pixels = imageData.data;

      const lines = [];
      const rowGap = size <= 240 ? (isF1 ? 6 : 7) : size <= 280 ? (isF1 ? 5 : 6) : (isF1 ? 5 : 6);
      const fontSize = size <= 280 ? 7 : 9;
      const charStep = Math.round(fontSize * 0.65) + 1;

      for (let y = 0; y < canvasHeight; y += rowGap) {
        let x = 0;
        while (x < canvasWidth) {
          const i = (y * canvasWidth + x) * 4;
          const a = pixels[i + 3];

          if (a > 128) {
            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];
            const brightness = (r + g + b) / (3 * 255);

            const scatterX = (Math.random() - 0.5) * 300;
            const scatterY = (Math.random() - 0.5) * 300;

            if (isF1) {
              const lineLength = Math.floor(
                3 + brightness * (size <= 280 ? 8 : 15)
              );
              lines.push({
                x: x + scatterX,
                y: y + scatterY,
                targetX: x,
                targetY: y,
                vx: 0,
                vy: 0,
                length: lineLength,
                baseAlpha: 0.65 + brightness * 0.35,
                currentAlpha: 0,
                delay: Math.random() * 0.3,
              });
              x += lineLength + 3;
            } else {
              lines.push({
                x: x + scatterX,
                y: y + scatterY,
                targetX: x,
                targetY: y,
                vx: 0,
                vy: 0,
                char: Math.random() < 0.5 ? "0" : "1",
                baseAlpha: 0.55 + brightness * 0.45,
                currentAlpha: 0,
                delay: Math.random() * 0.3,
              });
              x += charStep;
            }
          } else {
            x += isF1 ? 4 : charStep;
          }
        }
      }

      linesRef.current = lines;
      imageLoadedRef.current = true;
      startTimeRef.current = performance.now();
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      if (!imageLoadedRef.current) {
        animationId = requestAnimationFrame(draw);
        return;
      }

      const lines = linesRef.current;
      const mouse = mouseRef.current;
      const elapsed = (performance.now() - startTimeRef.current) / 1000;
      let maxMotion = 0;

      if (!isF1) {
        const fontSize = size <= 280 ? 7 : 9;
        ctx.font = `${fontSize}px "SF Mono", "Fira Code", Consolas, monospace`;
        ctx.textBaseline = "top";
      } else {
        ctx.lineWidth = size <= 280 ? 1.5 : 2.25;
      }

      lines.forEach((p) => {
        const particleTime = elapsed - p.delay;
        if (particleTime < 0) return;

        const fadeProgress = Math.min(particleTime / 1.5, 1);
        const easedFade = 1 - Math.pow(1 - fadeProgress, 2);
        p.currentAlpha = p.baseAlpha * easedFade;

        const moveProgress = Math.min(particleTime / 2.5, 1);
        const easedMove = 1 - Math.pow(1 - moveProgress, 3);

        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 60;
          if (dist < maxDist && dist > 0) {
            const force = (1 - dist / maxDist) * 2;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
        }

        const dx = p.targetX - p.x;
        const dy = p.targetY - p.y;
        const pullStrength = 0.01 + easedMove * 0.07;
        p.vx += dx * pullStrength;
        p.vy += dy * pullStrength;
        p.vx *= 0.92;
        p.vy *= 0.92;
        p.x += p.vx;
        p.y += p.vy;

        const motion = Math.abs(p.vx) + Math.abs(p.vy);
        if (motion > maxMotion) maxMotion = motion;

        if (isF1) {
          ctx.strokeStyle = `rgba(255, 255, 255, ${p.currentAlpha})`;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.length, p.y);
          ctx.stroke();
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${p.currentAlpha})`;
          ctx.fillText(p.char, p.x, p.y);
        }
      });

      const settled = elapsed > 3 && !mouse.active && maxMotion < 0.05;
      if (settled) {
        animationId = null;
      } else {
        animationId = requestAnimationFrame(draw);
      }
    };

    const wake = () => {
      if (animationId == null) {
        animationId = requestAnimationFrame(draw);
      }
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      mouseRef.current.active = true;
      wake();
    };

    const handleTouchMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      mouseRef.current.x = touch.clientX - rect.left;
      mouseRef.current.y = touch.clientY - rect.top;
      mouseRef.current.active = true;
      wake();
    };

    const handleLeave = () => {
      mouseRef.current.active = false;
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleLeave);
    canvas.addEventListener("touchmove", handleTouchMove);
    canvas.addEventListener("touchend", handleLeave);

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      imageLoadedRef.current = false;
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleLeave);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleLeave);
    };
  }, [size, theme]);

  return (
    <canvas
      ref={canvasRef}
      className="simulation-container"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        cursor: "crosshair",
      }}
    />
  );
};

export default ParticlePortrait;
