import { useEffect, useState } from "react";
import { isMedianApp } from "@/lib/median";

/**
 * Hydration-safe check for the Median.co native wrapper. Always false on the
 * server and on the first client render, then flips after mount.
 */
export function useIsMedianApp() {
  const [inApp, setInApp] = useState(false);
  useEffect(() => setInApp(isMedianApp()), []);
  return inApp;
}