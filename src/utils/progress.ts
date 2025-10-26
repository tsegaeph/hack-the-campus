// utility to read/write/validate level completion progress in localStorage
const PROGRESS_KEY = "htc_progress";

/**
 * Ensure the incoming value is converted to an array of booleans of length `levels`.
 * - If stored value is missing or invalid, returns an array of `levels` falses.
 */
export function loadProgress(levels: number): boolean[] {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) {
      return Array(levels).fill(false);
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return Array(levels).fill(false);
    const coerced = parsed.slice(0, levels).map((v) => !!v);
    if (coerced.length < levels) {
      return coerced.concat(Array(levels - coerced.length).fill(false));
    }
    return coerced;
  } catch (err) {
    return Array(levels).fill(false);
  }
}

/**
 * Save a validated boolean array into localStorage.
 */
export function saveProgress(progress: boolean[]) {
  try {
    const toSave = progress.map((v) => !!v);
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(toSave));
  } catch (err) {
    // ignore storage errors
  }
}

/**
 * Mark a single level as completed and persist the array.
 * Returns the saved progress array.
 */
export function markLevelCompleted(levelIndex: number, levels: number): boolean[] {
  const p = loadProgress(levels);
  if (levelIndex >= 0 && levelIndex < levels) {
    p[levelIndex] = true;
    saveProgress(p);
  }
  return p;
}

/**
 * Remove stored progress (reset). Useful for dev/testing or user reset action.
 */
export function clearProgress() {
  try {
    localStorage.removeItem(PROGRESS_KEY);
  } catch (err) {
    // ignore
  }
}