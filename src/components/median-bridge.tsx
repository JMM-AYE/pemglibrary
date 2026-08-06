import { useEffect } from "react";
import { registerMedianGlobal } from "@/lib/median";

/**
 * Boots the Median JavaScript bridge on the client so native features
 * (push tokens, status bar, share sheet…) are reachable from the web app.
 */
export function MedianBridge() {
  useEffect(() => {
    const inApp = registerMedianGlobal();
    if (!inApp) return;
    let cancelled = false;
    void import("median-js-bridge").then(({ default: Median }) => {
      if (cancelled) return;
      Median.onReady(() => {
        document.documentElement.dataset["median"] = "true";
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return null;
}