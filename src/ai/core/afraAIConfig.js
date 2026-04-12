const DEFAULT_PROVIDER = "openai";
const DEFAULT_OPENAI_BASE_URL = "https://api.openai.com/v1";
const DEFAULT_OPENAI_MODEL = "gpt-4.1-mini";
const DEFAULT_LOCAL_BASE_URL = "http://127.0.0.1:11434";
const DEFAULT_LOCAL_MODEL = "tinyllama";
const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_MAX_TOKENS = 1800;

function readEnv(key, fallback = "") {
  const env = import.meta?.env ?? {};
  const value = env[key];

  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  return String(value).trim();
}

function toBoolean(value, fallback = false) {
  if (typeof value === "boolean") return value;
  if (value === undefined || value === null || value === "") return fallback;

  const normalized = String(value).trim().toLowerCase();

  if (["1", "true", "yes", "on", "enabled"].includes(normalized)) return true;
  if (["0", "false", "no", "off", "disabled"].includes(normalized)) return false;

  return fallback;
}

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clampTemperature(value) {
  const num = toNumber(value, DEFAULT_TEMPERATURE);
  if (num < 0) return 0;
  if (num > 2) return 2;
  return num;
}

function clampMaxTokens(value) {
  const num = Math.floor(toNumber(value, DEFAULT_MAX_TOKENS));
  if (num < 1) return DEFAULT_MAX_TOKENS;
  if (num > 16000) return 16000;
  return num;
}

function normalizeBaseUrl(url, fallback) {
  return String(url || fallback).replace(/\/+$/, "");
}

function normalizeProvider(provider) {
  const normalized = String(provider || DEFAULT_PROVIDER).trim().toLowerCase();

  if (normalized === "openai") return "openai";
  if (normalized === "local") return "local";
  if (normalized === "ollama") return "local";

  return DEFAULT_PROVIDER;
}

export function getAfraAIConfig() {
  const enabled = toBoolean(readEnv("VITE_AFRA_AI_ENABLED", "true"), true);
  const provider = normalizeProvider(readEnv("VITE_AFRA_AI_PROVIDER", DEFAULT_PROVIDER));

  const config = {
    enabled,
    provider,
    openai: {
      baseUrl: normalizeBaseUrl(
        readEnv("VITE_AFRA_AI_BASE_URL", DEFAULT_OPENAI_BASE_URL),
        DEFAULT_OPENAI_BASE_URL
      ),
      apiKey: readEnv("VITE_AFRA_AI_API_KEY", ""),
      model: readEnv("VITE_AFRA_AI_MODEL", DEFAULT_OPENAI_MODEL),
    },
    local: {
      baseUrl: normalizeBaseUrl(
        readEnv("VITE_OLLAMA_BASE_URL", DEFAULT_LOCAL_BASE_URL),
        DEFAULT_LOCAL_BASE_URL
      ),
      model: readEnv("VITE_OLLAMA_MODEL", DEFAULT_LOCAL_MODEL),
    },
    temperature: clampTemperature(readEnv("VITE_AFRA_AI_TEMPERATURE", DEFAULT_TEMPERATURE)),
    maxTokens: clampMaxTokens(readEnv("VITE_AFRA_AI_MAX_TOKENS", DEFAULT_MAX_TOKENS)),
  };

  return config;
}

export function getAfraAIEngineInfo() {
  const config = getAfraAIConfig();
  const isOpenAI = config.provider === "openai";
  const isLocal = config.provider === "local";

  return {
    enabled: config.enabled,
    provider: config.provider,
    ready:
      config.enabled &&
      ((isOpenAI && !!config.openai.apiKey) || (isLocal && !!config.local.baseUrl)),
    model: isOpenAI ? config.openai.model : config.local.model,
    baseUrl: isOpenAI ? config.openai.baseUrl : config.local.baseUrl,
    hasApiKey: !!config.openai.apiKey,
    temperature: config.temperature,
    maxTokens: config.maxTokens,
  };
}

export function isAfraAIEnabled() {
  return getAfraAIConfig().enabled;
}

export function hasOpenAIConfig() {
  return !!getAfraAIConfig().openai.apiKey;
}

export function hasLocalAIConfig() {
  return !!getAfraAIConfig().local.baseUrl;
}

export function getActiveAIModel() {
  const config = getAfraAIConfig();
  return config.provider === "openai" ? config.openai.model : config.local.model;
}