import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getAIEngineInfo } from "./afraAI";

const STORAGE_KEY = "afrawood-flow-state-v5";

const DEFAULT_STATE = {
  activeModule: "landing",
  script: {
    text: "",
    lastUpdatedAt: null,
    meta: null,
  },
  ai: {
    engine: {
      enabled: false,
      provider: "openai",
      ready: false,
      model: "",
      baseUrl: "",
      hasApiKey: false,
      temperature: 0.7,
      maxTokens: 1800,
    },
  },
};

const AfraFlowContext = createContext({
  state: DEFAULT_STATE,
  setActiveModule: () => {},
  setScriptText: () => {},
  updateScriptMeta: () => {},
  refreshAIStatus: () => {},
  resetScriptState: () => {},
});

function safeParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function loadInitialState() {
  if (typeof window === "undefined") {
    return {
      ...DEFAULT_STATE,
      ai: {
        engine: getAIEngineInfo(),
      },
    };
  }

  const stored = safeParse(window.localStorage.getItem(STORAGE_KEY), null);

  if (!stored || typeof stored !== "object") {
    return {
      ...DEFAULT_STATE,
      ai: {
        engine: getAIEngineInfo(),
      },
    };
  }

  return {
    ...DEFAULT_STATE,
    ...stored,
    script: {
      ...DEFAULT_STATE.script,
      ...(stored.script || {}),
    },
    ai: {
      ...DEFAULT_STATE.ai,
      ...(stored.ai || {}),
      engine: getAIEngineInfo(),
    },
  };
}

export function AfraFlowProvider({ children }) {
  const [state, setState] = useState(loadInitialState);

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const setActiveModule = useCallback((module) => {
    setState((prev) => ({
      ...prev,
      activeModule: String(module || "landing"),
    }));
  }, []);

  const setScriptText = useCallback((text, meta = null) => {
    setState((prev) => ({
      ...prev,
      script: {
        ...prev.script,
        text: String(text || ""),
        meta: meta ?? prev.script.meta ?? null,
        lastUpdatedAt: Date.now(),
      },
    }));
  }, []);

  const updateScriptMeta = useCallback((meta) => {
    setState((prev) => ({
      ...prev,
      script: {
        ...prev.script,
        meta: meta ?? null,
        lastUpdatedAt: Date.now(),
      },
    }));
  }, []);

  const refreshAIStatus = useCallback(() => {
    setState((prev) => ({
      ...prev,
      ai: {
        ...prev.ai,
        engine: getAIEngineInfo(),
      },
    }));
  }, []);

  const resetScriptState = useCallback(() => {
    setState((prev) => ({
      ...prev,
      script: {
        text: "",
        lastUpdatedAt: null,
        meta: null,
      },
    }));
  }, []);

  const value = useMemo(
    () => ({
      state,
      setActiveModule,
      setScriptText,
      updateScriptMeta,
      refreshAIStatus,
      resetScriptState,
    }),
    [
      state,
      setActiveModule,
      setScriptText,
      updateScriptMeta,
      refreshAIStatus,
      resetScriptState,
    ]
  );

  return (
    <AfraFlowContext.Provider value={value}>
      {children}
    </AfraFlowContext.Provider>
  );
}

export function useAfraFlow() {
  return useContext(AfraFlowContext);
}