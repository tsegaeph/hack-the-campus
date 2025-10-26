// AudioManager - updated to try to start background on load and to attach a
// first-user-gesture handler to resume playback if browsers block autoplay.
const STORAGE_KEY = "htc_settings";

type Settings = {
  background: number;
  effects: number;
};

class AudioManager {
  private static instance: AudioManager;
  private bgAudio: HTMLAudioElement | null = null;
  private sounds: Record<string, HTMLAudioElement> = {};
  private settings: Settings = { background: 60, effects: 80 };
  private runningBg = false;
  private gestureHandlerBound = false;

  private constructor() {
    this.loadSettings();
    this.initElements();
  }

  static getInstance() {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  getSettings() {
    return { ...this.settings };
  }

  private loadSettings() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        this.settings = { background: 60, effects: 80 };
      } else {
        const parsed = JSON.parse(raw);
        this.settings = {
          background: typeof parsed.background === "number" ? parsed.background : 60,
          effects: typeof parsed.effects === "number" ? parsed.effects : 80,
        };
      }
    } catch {
      this.settings = { background: 60, effects: 80 };
    }
  }

  saveSettings(s: Settings) {
    this.settings = { ...s };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
    } catch {}
    this.applyVolumes();
  }

  private initElements() {
    try {
      const bg = new Audio("/assets/sounds/bg_loop.mp3");
      bg.loop = true;
      bg.preload = "auto";
      bg.volume = (this.settings.background || 0) / 100;
      this.bgAudio = bg;
    } catch {
      this.bgAudio = null;
    }

    const make = (src: string) => {
      try {
        const a = new Audio(src);
        a.preload = "auto";
        return a;
      } catch {
        return null;
      }
    };

    const click = make("/assets/sounds/click.wav");
    const wrong = make("/assets/sounds/wrong.wav");
    const success = make("/assets/sounds/success.wav");

    if (click) this.sounds.click = click;
    if (wrong) this.sounds.wrong = wrong;
    if (success) this.sounds.success = success;

    this.applyVolumes();
  }

  private applyVolumes() {
    const bgVol = Math.max(0, Math.min(1, (this.settings.background || 0) / 100));
    const fxVol = Math.max(0, Math.min(1, (this.settings.effects || 0) / 100));

    if (this.bgAudio) this.bgAudio.volume = bgVol;
    Object.keys(this.sounds).forEach((k) => {
      this.sounds[k].volume = fxVol;
    });
  }

  // Public API
  play(soundName: "click" | "wrong" | "success") {
    const s = this.sounds[soundName];
    if (!s) return;
    try {
      const inst = s.cloneNode(true) as HTMLAudioElement;
      inst.volume = s.volume;
      inst.play().catch(() => {});
    } catch {}
  }

  playBackground() {
    if (!this.bgAudio) return;
    if (this.runningBg) return;
    try {
      // attempt to play immediately; if browser blocks, gesture listener will resume later
      this.bgAudio.currentTime = 0;
      const p = this.bgAudio.play();
      if (p && typeof p.then === "function") {
        p
          .then(() => {
            this.runningBg = true;
          })
          .catch(() => {
            // Play blocked by autoplay policy, register gesture handler to resume on user interaction
            this.registerGestureStart();
          });
      } else {
        this.runningBg = true;
      }
    } catch {
      // ignore
    }
  }

  stopBackground() {
    if (!this.bgAudio) return;
    try {
      this.bgAudio.pause();
      this.runningBg = false;
    } catch {}
  }

  setVolumes(backgroundPercent: number, effectsPercent: number) {
    this.settings.background = Math.max(0, Math.min(100, backgroundPercent));
    this.settings.effects = Math.max(0, Math.min(100, effectsPercent));
    this.saveSettings(this.settings);
  }

  // If autoplay is blocked, call this to start playback on the first user gesture.
  private registerGestureStart() {
    if (this.gestureHandlerBound) return;
    const handler = () => {
      try {
        if (this.bgAudio) {
          this.bgAudio.play().catch(() => {});
          this.runningBg = true;
        }
      } catch {}
      // remove listeners after first gesture
      window.removeEventListener("pointerdown", handler);
      window.removeEventListener("keydown", handler);
      this.gestureHandlerBound = false;
    };
    window.addEventListener("pointerdown", handler, { once: true });
    window.addEventListener("keydown", handler, { once: true });
    this.gestureHandlerBound = true;
  }

  // Convenience: called from app entry to ensure bg is attempted and fallback to gesture resume is set
  ensureBackgroundAutoStart() {
    this.playBackground();
  }
}

export default AudioManager.getInstance();