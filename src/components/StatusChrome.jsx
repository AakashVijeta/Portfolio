import { useEffect, useState } from "react";

const StatusChrome = () => {
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const ss = String(now.getSeconds()).padStart(2, "0");
      setTime(`${hh}:${mm}:${ss}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <div className="chrome chrome-tl">
        <span className="chrome-dot" />
        AAKASH VIJETA / PORTFOLIO · 2026
      </div>
      <div className="chrome chrome-bl">
        LOC · 13.08°N 80.27°E
      </div>
      <div className="chrome chrome-br">
        {time} IST
      </div>
    </>
  );
};

export default StatusChrome;
