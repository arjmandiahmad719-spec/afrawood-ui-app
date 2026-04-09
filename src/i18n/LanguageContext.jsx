import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getLanguageMeta, t as translate } from "./translations.js";

const STORAGE_KEY = "afrawood_language_v2";
const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || "en";
    } catch {
      return "en";
    }
  });

  const meta = useMemo(() => getLanguageMeta(language), [language]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {}
    document.documentElement.lang = meta.code;
    document.documentElement.dir = meta.dir;
  }, [language, meta]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      dir: meta.dir,
      languageMeta: meta,
      t: (key, fallback = "") => translate(language, key, fallback),
    }),
    [language, meta]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return ctx;
}