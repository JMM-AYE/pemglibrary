/**
 * Median.co helpers. Median wraps this web app into native iOS/Android apps and
 * identifies itself by adding "median" to the browser user agent.
 */

declare global {
  interface Window {
    isMedianApp?: boolean;
  }
}

/** True when the app is running inside the Median.co native wrapper. */
export function isMedianApp(): boolean {
  if (typeof navigator === "undefined") return false;
  return navigator.userAgent.toLowerCase().indexOf("median") > -1;
}

/** Exposes `window.isMedianApp` for inline scripts and Median's own JS hooks. */
export function registerMedianGlobal() {
  if (typeof window === "undefined") return false;
  window.isMedianApp = isMedianApp();
  return window.isMedianApp;
}

export {};