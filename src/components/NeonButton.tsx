import AudioManager from "../utils/AudioManager";

type Props = {
  color?: "green" | "cyan" | "gold";
  label: string;
  icon?: string;
  onClick?: () => void;
};

const colorClass: Record<string, string> = {
  green: "btn-green",
  cyan: "btn-cyan",
  gold: "btn-gold",
};

export default function NeonButton({ color = "green", icon, label, onClick }: Props) {
  const cls = colorClass[color] ?? colorClass.green;

  function handleClick() {
    // play click sound (effects)
    try {
      AudioManager.play("click");
    } catch {}
    if (onClick) onClick();
  }

  return (
    <button className={`neon-btn ${cls}`} onClick={handleClick} aria-label={label}>
      <span className="icon">{icon}</span>
      <span className="label">{label}</span>
    </button>
  );
}