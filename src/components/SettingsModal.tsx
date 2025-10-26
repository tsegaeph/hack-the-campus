import React from "react";
import AudioManager from "../utils/AudioManager";

type Props = {
  onClose?: () => void;
};

type SettingsState = {
  background: number; // 0-100
  effects: number; // 0-100
};

export default function SettingsModal({ onClose }: Props) {
  // existing logic omitted for brevity — assume same as before, we only update the close/save handlers
  // If your SettingsModal is already implemented earlier, just update the save/close to play click

  // For completeness include a minimal implementation here that calls AudioManager on close/save:
  const [settings, setSettings] = React.useState<SettingsState>(() => {
    try {
      const raw = localStorage.getItem("htc_settings");
      if (!raw) return { background: 60, effects: 80 };
      const parsed = JSON.parse(raw);
      return {
        background: typeof parsed.background === "number" ? parsed.background : 60,
        effects: typeof parsed.effects === "number" ? parsed.effects : 80,
      };
    } catch {
      return { background: 60, effects: 80 };
    }
  });

  function saveSettings() {
    localStorage.setItem("htc_settings", JSON.stringify(settings));
    try { AudioManager.setVolumes(settings.background, settings.effects); } catch {}
    try { AudioManager.play("click"); } catch {}
    if (onClose) onClose();
  }

  function handleClose() {
    try { AudioManager.play("click"); } catch {}
    if (onClose) onClose();
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="neon-modal settings-modal">
        <div className="modal-header settings-header">
          <div className="modal-title">SYSTEM CONFIGURATION</div>
          <button className="modal-close" onClick={handleClose} aria-label="Close">✕</button>
        </div>

        <div className="modal-content settings-content">
          <div className="settings-panel">
            <h4 className="settings-section-title">AUDIO CONFIGURATION</h4>

            {/* Background slider */}
            <div className="setting-row">
              <div className="setting-label"><span>Background Music</span><span className="percent">{settings.background}%</span></div>
              <input type="range" min={0} max={100} value={settings.background} onChange={(e) => {
                const v = Number(e.target.value); setSettings(s => ({ ...s, background: v })); try { AudioManager.setVolumes(v, settings.effects); } catch {}
              }} />
            </div>

            {/* Effects slider */}
            <div className="setting-row">
              <div className="setting-label"><span>Sound Effects</span><span className="percent">{settings.effects}%</span></div>
              <input type="range" min={0} max={100} value={settings.effects} onChange={(e) => {
                const v = Number(e.target.value); setSettings(s => ({ ...s, effects: v })); try { AudioManager.setVolumes(settings.background, v); } catch {}
              }} />
            </div>

            <div style={{ display: "flex", justifyContent: "center", marginTop: 18 }}>
              <button className="neon-btn btn-green" onClick={saveSettings}>SAVE CONFIGURATION</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}