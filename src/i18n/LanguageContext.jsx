import React, { createContext, useContext, useMemo, useState } from "react";
import { SUPPORTED_LANGUAGES, TRANSLATIONS } from "./translations.js";

const STORAGE_KEY = "afrawood_language";
const LanguageContext = createContext(null);

function getSupportedCode(code = "") {
  const normalized = String(code || "").trim().toLowerCase();
  const direct = SUPPORTED_LANGUAGES.find((item) => item.code === normalized);
  if (direct) return direct.code;

  const short = normalized.slice(0, 2);
  const shortMatch = SUPPORTED_LANGUAGES.find((item) => item.code === short);
  return shortMatch ? shortMatch.code : "en";
}

function detectInitialLanguage() {
  if (typeof window === "undefined") return "en";

  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved) {
    return getSupportedCode(saved);
  }

  const browserLanguage =
    window.navigator.language ||
    window.navigator.userLanguage ||
    "en";

  return getSupportedCode(browserLanguage);
}

function readTranslation(obj, key) {
  if (!obj || !key) return undefined;
  return String(key)
    .split(".")
    .reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(detectInitialLanguage);

  function setLanguage(nextLanguage) {
    const finalCode = getSupportedCode(nextLanguage);
    setLanguageState(finalCode);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, finalCode);
      document.documentElement.lang = finalCode;
      document.documentElement.dir = finalCode === "fa" ? "rtl" : "ltr";
    }
  }

  const value = useMemo(() => {
    function t(key, fallback = "") {
      const current = readTranslation(TRANSLATIONS[language], key);
      if (current !== undefined) return current;

      const english = readTranslation(TRANSLATIONS.en, key);
      if (english !== undefined) return english;

      return fallback || key;
    }

    return {
      language,
      setLanguage,
      t,
      supportedLanguages: SUPPORTED_LANGUAGES,
    };
  }, [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }

  return context;
}