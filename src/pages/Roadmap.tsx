import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import LevelNode from "../components/LevelNode";
import { loadProgress, clearProgress } from "../utils/progress";
import AudioManager from "../utils/AudioManager";

type Node = {
  id: string;
  x: number; // percent
  y: number; // percent
  label: string;
  img: string;
};

const NODES: Node[] = [
  { id: "lvl1", x: 14, y: 64, label: "Level 1\nLIBRARY", img: "./assets/building.png" },
  { id: "lvl2", x: 32, y: 46, label: "Level 2\nSERVER LAB", img: "./assets/building.png" },
  { id: "lvl3", x: 50, y: 58, label: "Level 3\nCAFETERIA", img: "./assets/building.png" },
  { id: "lvl4", x: 68, y: 44, label: "Level 4\nCAMPUS WEBSITE", img: "./assets/building.png" },
  { id: "lvl5", x: 86, y: 56, label: "Level 5\nADMIN OFFICE", img: "./assets/building.png" },
];

export default function Roadmap() {
  const nav = useNavigate();
  const [finished, setFinished] = useState<boolean[]>(() => loadProgress(NODES.length));
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // keep local state in sync if other tab changes storage
  useEffect(() => {
    function onStorage() {
      setFinished(loadProgress(NODES.length));
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const unlocked = useMemo(() => {
    return NODES.map((_, idx) => (idx === 0 ? true : finished[idx - 1] === true));
  }, [finished]);

  const connections: [number, number][] = useMemo(() => {
    return NODES.map((_, i) => [i, i + 1]).slice(0, NODES.length - 1) as [number, number][];
  }, []);

  function openLevel(index: number) {
    if (!unlocked[index]) {
      const el = document.querySelector(`#node-${index}`);
      if (el) {
        el.classList.remove("locked-pulse");
        el.clientWidth; // reflow
        el.classList.add("locked-pulse");
        setTimeout(() => el.classList.remove("locked-pulse"), 700);
      }
      return;
    }
    try { AudioManager.play("click"); } catch {}
    // Slight delay so the click sound has a moment to start before navigation cancels/changes audio context.
    setTimeout(() => nav(`/level/${index + 1}`), 120);
  }

  function handleResetProgress() {
    if (!confirm("Reset saved progress for this browser? This will unlock only Level 1 for testing.")) return;
    clearProgress();
    setFinished(loadProgress(NODES.length));
    try { AudioManager.play("click"); } catch {}
  }

  const flagsCaptured = finished.filter(Boolean).length;
  const totalFlags = NODES.length;

  return (
    <div className="roadmap-screen styled-roadmap enhanced-roadmap">
      <div className="roadmap-topbar">
        <button
          className="main-menu-btn"
          onClick={() => {
            // Play click sound and delay navigation slightly so audio can start reliably.
            try {
              AudioManager.play("click");
            } catch {
              // fallback: try direct audio element (best-effort)
              try {
                const a = new Audio("./assets/sounds/click.wav");
                a.play().catch(() => {});
              } catch {}
            }
            setTimeout(() => nav("/"), 120);
          }}
        >
          ⟵ MAIN MENU
        </button>

        <div className="campus-title">CAMPUS MAP</div>

        <div className="status-holder">
          <div className="status-box">
            <div className="status-row">
              <div className="status-label">Flags</div>
              <div className="status-value">{flagsCaptured}/{totalFlags}</div>
            </div>
            <div className="status-row">
              <div className="status-label">Time</div>
              <div className="status-value">{now.toLocaleTimeString()}</div>
            </div>

            <div style={{ marginTop: 8, display: "flex", justifyContent: "flex-end" }}>
              <button onClick={handleResetProgress} className="main-menu-btn" style={{ padding: "6px 8px", fontSize: 12 }}>
                Reset Progress
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="roadmap-container">
        <div className="map-layer" />
        <div className="scan-line-vertical" aria-hidden />
        <div className="scan-line-horizontal" aria-hidden />

        <svg className="connector-layer" preserveAspectRatio="none">
          {connections.map(([a, b], idx) => {
            const na = NODES[a];
            const nb = NODES[b];
            const x1 = na.x;
            const y1 = na.y;
            const x2 = nb.x;
            const y2 = nb.y;
            return (
              <g key={idx}>
                <line x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`} stroke="rgba(0,195,195,0.9)" strokeWidth={3} strokeLinecap="round" />
                <line x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`} stroke="rgba(0,195,195,0.12)" strokeWidth={12} strokeLinecap="round" />
              </g>
            );
          })}
        </svg>

        {NODES.map((n, i) => (
          <LevelNode
            key={n.id}
            id={`node-${i}`}
            left={`${n.x}%`}
            top={`${n.y}%`}
            label={n.label}
            imgSrc={n.img}
            unlocked={unlocked[i]}
            completed={finished[i]}
            onClick={() => openLevel(i)}
          />
        ))}
      </div>
    </div>
  );
}