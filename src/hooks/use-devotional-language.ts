import { useCallback, useEffect, useState } from "react";
import { DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY } from "@/lib/devotionals";

const EVENT = "pemg:devotional-language";

/** Reading language, shared across the app and remembered on this device. */
export function useDevotionalLanguage() {
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);

  useEffect(() => {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored) setLanguage(stored);
    const onChange = (e: Event) => setLanguage((e as CustomEvent<string>).detail);
    window.addEventListener(EVENT, onChange);
    return () => window.removeEventListener(EVENT, onChange);
  }, []);

  const changeLanguage = useCallback((next: string) => {
    const value = next.toLowerCase();
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, value);
    window.dispatchEvent(new CustomEvent<string>(EVENT, { detail: value }));
  }, []);

  return { language, changeLanguage };
}
