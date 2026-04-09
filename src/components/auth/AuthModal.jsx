import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLanguage } from "../../i18n/LanguageContext.jsx";

const BACKDROP =
  "fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm";
const PANEL =
  "w-full max-w-[560px] rounded-[32px] border border-white/10 bg-[#070707] p-5 text-white shadow-[0_30px_120px_rgba(0,0,0,0.55)] md:p-7";
const INPUT =
  "w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35";
const LABEL = "mb-2 block text-sm font-medium text-white/75";
const PRIMARY =
  "inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-400 to-amber-300 px-4 py-3 text-sm font-semibold text-black transition hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed";
const SECONDARY =
  "inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:border-cyan-400/40 hover:bg-white/10 disabled:opacity-60 disabled:cursor-not-allowed";

export default function AuthModal() {
  const {
    isAuthOpen,
    authMode,
    closeAuth,
    switchAuthMode,
    loginWithEmail,
    signupWithEmail,
    loginWithGoogleMock,
    isSubmitting,
  } = useAuth();
  const { t } = useLanguage();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!isAuthOpen) {
      setFullName("");
      setEmail("");
      setPassword("");
      setStatus("");
    }
  }, [isAuthOpen, authMode]);

  if (!isAuthOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();

    const result =
      authMode === "signup"
        ? await signupWithEmail({ fullName, email, password })
        : await loginWithEmail({ email, password });

    if (!result.ok) {
      setStatus(result.message || "Authentication failed.");
      return;
    }

    setStatus("");
  }

  async function handleGoogle() {
    const result = await loginWithGoogleMock();
    if (!result.ok) {
      setStatus(result.message || "Google login failed.");
    }
  }

  return (
    <div className={BACKDROP} onClick={closeAuth}>
      <div className={PANEL} onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <div className="text-2xl font-black text-white">
              {authMode === "signup"
                ? t("auth.createAccount", "Create Account")
                : t("auth.loginTitle", "Login")}
            </div>
            <div className="mt-1 text-sm text-white/55">
              {authMode === "signup"
                ? t("auth.signupDesc", "Create your Afrawood account to continue.")
                : t("auth.loginDesc", "Login to your Afrawood account.")}
            </div>
          </div>

          <button type="button" className={SECONDARY} onClick={closeAuth} disabled={isSubmitting}>
            {t("common.close", "Close")}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {authMode === "signup" ? (
            <div>
              <label className={LABEL}>{t("auth.fullName", "Full Name")}</label>
              <input
                className={INPUT}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t("auth.fullNamePlaceholder", "Your full name")}
                disabled={isSubmitting}
              />
            </div>
          ) : null}

          <div>
            <label className={LABEL}>{t("auth.email", "Email")}</label>
            <input
              className={INPUT}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className={LABEL}>{t("auth.password", "Password")}</label>
            <input
              className={INPUT}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="******"
              disabled={isSubmitting}
            />
          </div>

          {status ? (
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
              {status}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <button type="submit" className={PRIMARY} disabled={isSubmitting}>
              {isSubmitting
                ? t("auth.working", "Please wait...")
                : authMode === "signup"
                  ? t("auth.signUp", "Sign Up")
                  : t("auth.loginButton", "Login")}
            </button>

            <button type="button" className={SECONDARY} onClick={handleGoogle} disabled={isSubmitting}>
              {t("auth.google", "Continue with Google")}
            </button>
          </div>
        </form>

        <div className="mt-5 border-t border-white/10 pt-5 text-sm text-white/65">
          {authMode === "signup" ? (
            <div className="flex flex-wrap items-center gap-2">
              <span>{t("auth.haveAccount", "Already have an account?")}</span>
              <button
                type="button"
                className="text-cyan-300 transition hover:text-cyan-200"
                onClick={() => switchAuthMode("login")}
                disabled={isSubmitting}
              >
                {t("auth.loginButton", "Login")}
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <span>{t("auth.noAccount", "Don’t have an account?")}</span>
              <button
                type="button"
                className="text-cyan-300 transition hover:text-cyan-200"
                onClick={() => switchAuthMode("signup")}
                disabled={isSubmitting}
              >
                {t("auth.signUp", "Sign Up")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}