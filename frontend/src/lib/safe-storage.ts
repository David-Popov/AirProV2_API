/**
 * safeStorage — defensive wrapper around `localStorage`.
 *
 * Why: in Safari Private mode (and some corporate-locked-down browsers) every
 * `localStorage.setItem` / `.getItem` call throws `SecurityError` or
 * `QuotaExceededError`. An uncaught throw inside the auth flow crashes the
 * entire React tree. This wrapper degrades gracefully — reads return `null`,
 * writes log a warning and report failure via the boolean return so callers
 * can surface a "Storage unavailable" toast if persistence is critical.
 */
export const safeStorage = {
  get(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  set(key: string, value: string): boolean {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      console.warn(`safeStorage.set(${key}) failed:`, e);
      return false;
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      /* no-op — already gone or storage unavailable */
    }
  },
};
