import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

const PAGE_STYLE = {
  minHeight: "100vh",
  backgroundImage: "url('/studio-bg.jpg')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  position: "relative",
  color: "#fff",
  overflow: "hidden",
};

const OVERLAY_STYLE = {
  position: "absolute",
  inset: 0,
  background: "linear-gradient(180deg, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.52) 100%)",
};

const WRAP_STYLE = {
  position: "relative",
  zIndex: 2,
  width: "100%",
  maxWidth: 860,
  margin: "0 auto",
  padding: "120px 24px 40px",
  boxSizing: "border-box",
};

const CARD_STYLE = {
  borderRadius: 28,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(10,10,10,0.34)",
  boxShadow: "0 20px 80px rgba(0,0,0,0.35)",
  backdropFilter: "blur(10px)",
  padding: 34,
  boxSizing: "border-box",
};

const INPUT_STYLE = {
  width: "100%",
  height: 56,
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(0,0,0,0.28)",
  color: "#fff",
  outline: "none",
  padding: "0 16px",
  fontSize: 16,
  boxSizing: "border-box",
};

const PRIMARY_BUTTON_STYLE = {
  height: 54,
  padding: "0 24px",
  borderRadius: 16,
  border: "none",
  background: "linear-gradient(135deg, #1ed6ff 0%, #f3d35e 100%)",
  color: "#111",
  cursor: "pointer",
  fontSize: 16,
  fontWeight: 800,
};

const SECONDARY_BUTTON_STYLE = {
  height: 48,
  padding: "0 18px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.04)",
  color: "#fff",
  cursor: "pointer",
  fontSize: 15,
  fontWeight: 700,
};

function goToRoute(route) {
  const finalRoute = route.startsWith("/") ? route : `/${route}`;
  window.history.pushState({}, "", finalRoute);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export default function SignUpPage() {
  const { signup, login } = useAuth();
  const [mode, setMode] = useState("signup");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [successText, setSuccessText] = useState("");

  function updateField(key, value) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErrorText("");
    setSuccessText("");

    try {
      if (mode === "signup") {
        await signup(form);
        setSuccessText("Account created successfully. Welcome to Afrawood.");
      } else {
        await login({
          email: form.email,
          password: form.password,
        });
        setSuccessText("Signed in successfully.");
      }

      goToRoute("/");
    } catch (error) {
      setErrorText(error?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={PAGE_STYLE}>
      <div style={OVERLAY_STYLE} />

      <div style={WRAP_STYLE}>
        <div style={CARD_STYLE}>
          <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
            <button
              type="button"
              onClick={() => setMode("signup")}
              style={{
                ...SECONDARY_BUTTON_STYLE,
                background: mode === "signup" ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)",
              }}
            >
              Sign Up
            </button>

            <button
              type="button"
              onClick={() => setMode("login")}
              style={{
                ...SECONDARY_BUTTON_STYLE,
                background: mode === "login" ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)",
              }}
            >
              Login
            </button>
          </div>

          <div style={{ fontSize: 38, fontWeight: 800, marginBottom: 10 }}>
            {mode === "signup" ? "Create your Afrawood account" : "Login to Afrawood"}
          </div>

          <div style={{ color: "rgba(255,255,255,0.80)", lineHeight: 1.9, marginBottom: 24, fontSize: 17 }}>
            Registration is required before using the app.
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gap: 14 }}>
              {mode === "signup" ? (
                <input
                  type="text"
                  placeholder="Full Name"
                  value={form.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  style={INPUT_STYLE}
                />
              ) : null}

              <input
                type="email"
                placeholder="Email Address"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                style={INPUT_STYLE}
              />

              <input
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) => updateField("password", e.target.value)}
                style={INPUT_STYLE}
              />
            </div>

            <div style={{ marginTop: 18 }}>
              <button type="submit" style={PRIMARY_BUTTON_STYLE} disabled={loading}>
                {loading ? "Please wait..." : mode === "signup" ? "Create Account" : "Login"}
              </button>
            </div>
          </form>

          {successText ? (
            <div
              style={{
                marginTop: 18,
                borderRadius: 16,
                border: "1px solid rgba(62,199,109,0.22)",
                background: "rgba(62,199,109,0.10)",
                padding: "14px 16px",
                color: "#c7ffd9",
              }}
            >
              {successText}
            </div>
          ) : null}

          {errorText ? (
            <div
              style={{
                marginTop: 18,
                borderRadius: 16,
                border: "1px solid rgba(255,82,82,0.22)",
                background: "rgba(255,82,82,0.10)",
                padding: "14px 16px",
                color: "#ffd7d7",
              }}
            >
              {errorText}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}