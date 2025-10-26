import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AudioManager from "../utils/AudioManager";
import { loadProgress, markLevelCompleted } from "../utils/progress";

const TOTAL_LEVELS = 5;

type FileEntry = {
  url: string;
  name?: string;
  isPortal?: boolean;
  isImage?: boolean;
};

type Props = {
  levelIndex: number;
  title: string;
  story: string;
  secretText?: string;
  expectedFlag: string;
  durationSeconds?: number;
  hintText?: string;
  hintPenaltySeconds?: number;
  files?: FileEntry[];
  fileUrl?: string;
  fileName?: string;
};

/**
 * TerminalChallenge
 *
 * Behavior change implemented per request:
 * - When the player submits the correct flag the level is marked completed (persisted),
 *   success sound plays and background audio stops.
 * - The terminal stays open after success (no automatic navigation to next level).
 * - The player must click the "✕" close button to return to the roadmap and choose the next level.
 *
 * This avoids automatically opening the next level terminal for the player.
 */
export default function TerminalChallenge({
  levelIndex,
  title,
  story,
  secretText = "",
  expectedFlag,
  durationSeconds = 10 * 60,
  hintText,
  hintPenaltySeconds = 120,
  files,
  fileUrl,
  fileName,
}: Props) {
  const nav = useNavigate();

  // core UI state
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const [inputFlag, setInputFlag] = useState("");
  const [status, setStatus] = useState<{ type: "idle" | "success" | "error" | "timeout" | "info"; text?: string }>({
    type: "idle",
  });
  const intervalRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [locked, setLocked] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // downloads / portal entries resolved on start
  const [downloadEntries, setDownloadEntries] = useState<
    { url: string; name?: string; isPortal?: boolean; isImage?: boolean; createdBlob?: boolean }[]
  >([]);

  // hint state
  const [hintUsed, setHintUsed] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);
  const [hintNotice, setHintNotice] = useState<string | null>(null);

  // Defensive initialization on mount and when levelIndex changes:
  useEffect(() => {
    setStarted(false);
    setTimeLeft(durationSeconds);
    setInputFlag("");
    setStatus({ type: "idle" });
    setLocked(false);
    setDownloadEntries([]);
    setHintUsed(false);
    setHintVisible(false);
    setHintNotice(null);

    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    try {
      AudioManager.stopBackground();
    } catch {}

    // ensure progress is valid (no side-effects)
    loadProgress(TOTAL_LEVELS);

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      try {
        AudioManager.stopBackground();
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelIndex]);

  // Timer tick logic when started
  useEffect(() => {
    if (!started) return;
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (intervalRef.current) {
            window.clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setLocked(true);
          setStatus({ type: "timeout", text: "Time's up! The terminal locked." });
          try {
            AudioManager.stopBackground();
          } catch {}
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [started]);

  // SUCCESS HANDLING: mark this level as completed, play success sound and stop background
  // IMPORTANT: do NOT auto-navigate to next level. The player must click ✕ to return to roadmap.
  useEffect(() => {
    if (status.type !== "success") return;

    // Persist exactly this level as completed
    markLevelCompleted(levelIndex, TOTAL_LEVELS);

    try {
      AudioManager.play("success");
    } catch {}
    try {
      AudioManager.stopBackground();
    } catch {}

    // Keep the terminal open and locked so the user sees the success state and can close manually.
    setLocked(true);
    // update the status text to remind user to close
    setStatus({ type: "success", text: "Correct flag! Level complete. Click ✕ to return to the map." });

    // No navigation here - user must click the close button to return to roadmap.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status.type]);

  function formatTime(secs: number) {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  // Resolve downloadable entries (only expose portal link if portal is present)
  async function handleStart() {
    if (started) return;

    const resolved: { url: string; name?: string; isPortal?: boolean; isImage?: boolean; createdBlob?: boolean }[] = [];

    if (files && files.length > 0) {
      const hasPortal = files.some((f) => !!f.isPortal || /portal\.html|console\.html|index\.html$/i.test(f.url));
      const toExpose = hasPortal ? files.filter((f) => !!f.isPortal || /portal\.html|console\.html|index\.html$/i.test(f.url)) : files;
      for (const f of toExpose) {
        resolved.push({
          url: f.url,
          name: f.name || f.url.split("/").pop(),
          isPortal: !!f.isPortal || /portal\.html|console\.html|index\.html$/i.test(f.url),
          isImage: !!f.isImage || /\.(png|jpe?g|gif|webp|svg)$/i.test(f.url),
          createdBlob: false,
        });
      }
    } else if (fileUrl) {
      resolved.push({
        url: fileUrl,
        name: fileName || fileUrl.split("/").pop(),
        isPortal: !!fileName && /portal\.html|console\.html|index\.html$/i.test(fileName),
        isImage: /\.(png|jpe?g|gif|webp|svg)$/i.test(fileUrl),
        createdBlob: false,
      });
    } else if (secretText) {
      try {
        const blob = new Blob([secretText], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        resolved.push({ url, name: `level${levelIndex + 1}_secret.txt`, isImage: false, createdBlob: true });
      } catch {}
    }

    setDownloadEntries(resolved);

    // Start UI and audio
    setStarted(true);
    setStatus({ type: "idle" });
    setLocked(false);
    setTimeLeft(durationSeconds);
    try {
      AudioManager.playBackground();
    } catch {}
    setTimeout(() => inputRef.current?.focus(), 300);
  }

  function useHint() {
    if (!hintText || hintUsed || !started || locked) return;
    setHintUsed(true);
    setHintVisible(true);
    setTimeLeft((t) => Math.max(0, t - (hintPenaltySeconds || 0)));
    const mins = Math.floor((hintPenaltySeconds || 0) / 60)
      .toString()
      .padStart(1, "0");
    const secs = ((hintPenaltySeconds || 0) % 60).toString().padStart(2, "0");
    setHintNotice(`Hint used — ${mins}:${secs} deducted from timer`);
    setStatus({ type: "info", text: "Hint revealed. Time penalty applied." });
    try {
      AudioManager.play("click");
    } catch {}
    setTimeout(() => {
      setHintNotice(null);
    }, 4200);
  }

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (locked || !started) return;
    const trimmed = inputFlag.trim();
    if (trimmed === expectedFlag) {
      setStatus({ type: "success", text: "Correct flag! Level complete." });
      setLocked(true);
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    try {
      AudioManager.play("wrong");
    } catch {}
    setStatus({ type: "error", text: "Flag incorrect — try again." });
    const el = containerRef.current;
    if (el) {
      el.classList.remove("shake");
      // force reflow
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      el.offsetWidth;
      el.classList.add("shake");
      setTimeout(() => el.classList.remove("shake"), 600);
    }
  }

  function handleClose() {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    try {
      AudioManager.stopBackground();
    } catch {}
    // Return to roadmap so the player can manually select next level
    nav("/roadmap");
  }

  return (
    <div className="terminal-page">
      <div className="terminal-window" ref={containerRef}>
        <div className="terminal-header">
          <div className="dots">
            <span className="dot red" />
            <span className="dot yellow" />
            <span className="dot green" />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="terminal-title">{title}</div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div className="terminal-timer">{formatTime(timeLeft)}</div>
            <button
              className="terminal-close"
              onClick={() => {
                try {
                  AudioManager.play("click");
                } catch {}
                handleClose();
              }}
              aria-label="Close challenge"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="terminal-body">
          <div className="story-block">
            <pre className="story-text">{story}</pre>
          </div>

          <div className="file-row">
            <div className="file-desc">Resources</div>

            {started && downloadEntries.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 260 }}>
                {downloadEntries.map((d, i) =>
                  d.isPortal ? (
                    <div key={i} className="portal-link" style={{ display: "inline-block" }}>
                      Here is the link to the site:{" "}
                      <a
                        href={d.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                          try {
                            AudioManager.play("click");
                          } catch {}
                        }}
                      >
                        Open page
                      </a>
                    </div>
                  ) : (
                    <a
                      key={i}
                      className="download-link"
                      href={d.url}
                      download={d.name || undefined}
                      target={d.createdBlob ? undefined : "_self"}
                      onClick={() => {
                        try {
                          AudioManager.play("click");
                        } catch {}
                      }}
                    >
                      {d.name || d.url.split("/").pop()}
                    </a>
                  )
                )}
              </div>
            ) : (
              <div className="download-lock" aria-hidden style={{ color: "#7aa", fontSize: 13 }}>
                Start the terminal for more information
              </div>
            )}
          </div>

          {started &&
            downloadEntries.length > 0 &&
            (downloadEntries.find((d) => d.isImage) ? (
              <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
                <img
                  src={downloadEntries.find((d) => d.isImage)!.url}
                  alt="preview"
                  style={{
                    maxWidth: "60%",
                    maxHeight: 320,
                    borderRadius: 6,
                    border: "1px solid rgba(255,255,255,0.04)",
                    boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
                  }}
                />
              </div>
            ) : null)}

          <div className="controls-row">
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <button
                className={`neon-btn btn-green start-btn ${started ? "running" : ""}`}
                onClick={() => {
                  try {
                    AudioManager.play("click");
                  } catch {}
                  handleStart();
                }}
                disabled={started}
              >
                {started ? "RUNNING" : "START"}
              </button>

              {hintText && (
                <button
                  className={`neon-btn btn-gold hint-btn ${hintUsed ? "used" : ""}`}
                  onClick={() => {
                    try {
                      AudioManager.play("click");
                    } catch {}
                    useHint();
                  }}
                  disabled={!started || hintUsed || locked}
                >
                  HINT
                </button>
              )}
            </div>

            <div className="submit-block">
              <form
                onSubmit={(e) => {
                  try {
                    AudioManager.play("click");
                  } catch {}
                  handleSubmit(e);
                }}
                className="flag-form"
              >
                <input
                  ref={inputRef}
                  className={`flag-input ${status.type === "error" ? "error" : ""}`}
                  placeholder="Enter flag: flag{...}"
                  value={inputFlag}
                  onChange={(e) => setInputFlag(e.target.value)}
                  disabled={!started || locked}
                />
                <button type="submit" className="neon-btn btn-cyan submit-btn" disabled={!started || locked}>
                  SUBMIT
                </button>
              </form>

              <div className={`status-line ${status.type}`}>
                {status.type === "idle" && <span className="muted">Awaiting submission</span>}
                {status.type === "error" && <span className="err">{status.text}</span>}
                {status.type === "success" && <span className="ok">{status.text}</span>}
                {status.type === "timeout" && <span className="err">{status.text}</span>}
                {status.type === "info" && <span className="info">{status.text}</span>}
              </div>

              {hintNotice && <div className="hint-notice">{hintNotice}</div>}
              {hintVisible && hintText && (
                <div className="hint-text">
                  <strong>Hint:</strong> {hintText}
                </div>
              )}
            </div>
          </div>

          <div className="terminal-footer muted-note">Tip: flags are case-sensitive and must be submitted exactly.</div>
        </div>
      </div>
    </div>
  );
}