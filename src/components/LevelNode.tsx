import AudioManager from "../utils/AudioManager";

type Props = {
  id?: string;
  left: string;
  top: string;
  label: string;
  imgSrc: string;
  unlocked?: boolean;
  completed?: boolean;
  onClick?: () => void;
};

export default function LevelNode({
  id,
  left,
  top,
  label,
  imgSrc,
  unlocked = false,
  completed = false,
  onClick,
}: Props) {
  return (
    <div
      id={id}
      className={`level-node ${unlocked ? "unlocked" : "locked"} ${completed ? "completed" : ""}`}
      style={{ left, top }}
      onClick={() => {
        if (!unlocked) return;
        // play click sound for building image click
        try {
          AudioManager.play("click");
        } catch {}
        onClick && onClick();
      }}
      role={unlocked ? "button" : undefined}
      tabIndex={unlocked ? 0 : -1}
      title={label.replace(/\n/g, " - ")}
    >
      <div className="building-wrap">
        <img src={imgSrc} alt={label.split("\n")[0]} className="building-img" draggable={false} />
        {completed && <div className="completed-badge">✓</div>}
      </div>

      <div className="node-label">
        {label.split("\n").map((line, idx) => (
          <div key={idx} className="label-line">{line}</div>
        ))}
      </div>
    </div>
  );
}