import React, { useMemo, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getCreditSummary } from "../ai/creditSystem.js";

const PUBLIC_ROUTES = new Set(["about", "contact", "signup", "login"]);
const APP_ROUTES = new Set([
  "script",
  "image",
  "video",
  "merge",
  "subtitle",
  "voice",
  "music",
  "export",
  "pricing",
  "about",
  "contact",
  "signup",
  "login",
]);

const PAGE_STYLE = {
  minHeight: "100vh",
  background: "#000",
  color: "#fff",
  position: "relative",
  overflow: "hidden",
};

const WRAP_STYLE = {
  position: "relative",
  zIndex: 2,
  width: "100%",
  maxWidth: 1600,
  margin: "0 auto",
  padding: "28px 34px 40px",
  boxSizing: "border-box",
};

const TOP_LINK_STYLE = {
  height: 48,
  padding: "0 20px",
  borderRadius: 18,
  border: "1px solid rgba(255,255,255,0.16)",
  background: "rgba(10,10,10,0.24)",
  color: "#fff",
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
  backdropFilter: "blur(8px)",
};

const UPGRADE_BUTTON_STYLE = {
  height: 48,
  padding: "0 20px",
  borderRadius: 18,
  border: "none",
  background: "linear-gradient(135deg, #1ed6ff 0%, #f3d35e 100%)",
  color: "#111",
  fontSize: 15,
  fontWeight: 800,
  cursor: "pointer",
  boxShadow: "0 8px 24px rgba(30,214,255,0.25)",
};

const CHAT_WRAP_STYLE = {
  width: "100%",
  maxWidth: 940,
  borderRadius: 32,
  border: "1px solid rgba(255,255,255,0.16)",
  background: "rgba(10,10,10,0.26)",
  padding: 12,
  boxSizing: "border-box",
  backdropFilter: "blur(12px)",
  boxShadow: "0 24px 80px rgba(0,0,0,0.34)",
};

const CHAT_INPUT_STYLE = {
  flex: 1,
  height: 66,
  borderRadius: 22,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(0,0,0,0.28)",
  color: "#fff",
  outline: "none",
  padding: "0 20px",
  fontSize: 18,
};

const OPEN_BUTTON_STYLE = {
  height: 66,
  padding: "0 30px",
  borderRadius: 22,
  border: "none",
  background: "linear-gradient(135deg, #1ed6ff 0%, #f3d35e 100%)",
  color: "#111",
  fontSize: 18,
  fontWeight: 800,
  cursor: "pointer",
};

const MODULE_CARD_STYLE = {
  width: "100%",
  minHeight: 220,
  borderRadius: 22,
  border: "1px solid rgba(255,255,255,0.16)",
  background: "rgba(10,10,10,0.30)",
  color: "#fff",
  cursor: "pointer",
  overflow: "hidden",
  backdropFilter: "blur(8px)",
  boxShadow: "0 16px 40px rgba(0,0,0,0.28)",
  padding: 0,
  transition: "transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease",
};

const MODULE_GRID_STYLE = {
  marginTop: 28,
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: 18,
  maxWidth: 1100,
  width: "100%",
};

const SPECIAL_ROW_STYLE = {
  marginTop: 18,
  maxWidth: 1100,
  width: "100%",
  display: "flex",
  justifyContent: "center",
};

const ACCOUNT_CARD_STYLE = {
  position: "absolute",
  top: 62,
  right: 0,
  width: 340,
  borderRadius: 24,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(10,10,10,0.96)",
  boxShadow: "0 20px 70px rgba(0,0,0,0.45)",
  backdropFilter: "blur(14px)",
  padding: 18,
  boxSizing: "border-box",
  zIndex: 30,
};

function AccountPanel({ user, credits, planName, ownerMode, onClose, onUpgrade, onLogout, t }) {
  return (
    <div style={ACCOUNT_CARD_STYLE}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>
            {t("landing.accountBar", "Account Management")}
          </div>
          <div style={{ marginTop: 6, color: "rgba(255,255,255,0.60)", fontSize: 13 }}>
            {ownerMode ? "Creator mode is active" : t("landing.accountSubtitle", "Plan, credits, and profile controls")}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(255,255,255,0.04)",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          ×
        </button>
      </div>

      <div
        style={{
          marginTop: 18,
          borderRadius: 18,
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.03)",
          padding: 14,
        }}
      >
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.56)" }}>Mode</div>
        <div style={{ marginTop: 8, fontWeight: 800 }}>
          {ownerMode ? "Creator / Local Dev" : "User"}
        </div>

        <div style={{ marginTop: 14, fontSize: 13, color: "rgba(255,255,255,0.56)" }}>User</div>
        <div style={{ marginTop: 8, fontWeight: 800 }}>
          {ownerMode && !user ? "Afrawood Creator" : user?.fullName || user?.email || "User"}
        </div>

        <div style={{ marginTop: 14, fontSize: 13, color: "rgba(255,255,255,0.56)" }}>
          {t("landing.currentPlan", "Current Plan")}
        </div>
        <div style={{ marginTop: 8, fontWeight: 800 }}>
          {ownerMode && !user ? "Creator Access" : planName}
        </div>

        <div style={{ marginTop: 14, fontSize: 13, color: "rgba(255,255,255,0.56)" }}>
          {t("landing.credits", "Credits")}
        </div>
        <div style={{ marginTop: 8, fontWeight: 800 }}>
          {credits}
        </div>
      </div>

      <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
        <button
          type="button"
          onClick={onUpgrade}
          style={{
            height: 48,
            borderRadius: 16,
            border: "none",
            background: "linear-gradient(135deg, #1ed6ff 0%, #f3d35e 100%)",
            color: "#111",
            fontSize: 15,
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          {t("common.upgrade", "Upgrade")}
        </button>

        {!ownerMode || user ? (
          <button
            type="button"
            onClick={onLogout}
            style={{
              height: 48,
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.10)",
              background: "rgba(255,255,255,0.04)",
              color: "#fff",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {t("common.logout", "Logout")}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function ModuleCard({ title, imageSrc, onClick }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      type="button"
      style={{
        ...MODULE_CARD_STYLE,
        transform: isHovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: isHovered
          ? "0 22px 50px rgba(0,0,0,0.34)"
          : "0 16px 40px rgba(0,0,0,0.28)",
        border: isHovered
          ? "1px solid rgba(255,255,255,0.26)"
          : "1px solid rgba(255,255,255,0.16)",
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        style={{
          width: "100%",
          height: 146,
          backgroundImage: `url('${imageSrc}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      <div
        style={{
          minHeight: 74,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "14px 16px",
          boxSizing: "border-box",
          fontSize: 16,
          fontWeight: 800,
          textAlign: "center",
          background: "linear-gradient(180deg, rgba(0,0,0,0.10), rgba(0,0,0,0.38))",
        }}
      >
        {title}
      </div>
    </button>
  );
}

function SpecialModuleCard({ title, imageSrc }) {
  const [hover, setHover] = useState(false);

  return (
    <button
      type="button"
      disabled
      aria-disabled="true"
      title={title}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...MODULE_CARD_STYLE,
        cursor: "not-allowed",
        maxWidth: 460,
        width: "100%",
        border: "1px solid rgba(243,211,94,0.6)",
        background: "linear-gradient(180deg, rgba(10,10,10,0.55), rgba(0,0,0,0.85))",
        boxShadow: hover
          ? "0 30px 80px rgba(243,211,94,0.35)"
          : "0 18px 50px rgba(0,0,0,0.35)",
        transform: hover ? "scale(1.03)" : "scale(1)",
        transition: "all 0.25s ease",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at center, rgba(243,211,94,0.15), transparent 70%)",
          opacity: hover ? 1 : 0.6,
          transition: "0.3s",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          width: "100%",
          height: 150,
          backgroundImage: `url('${imageSrc}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: "brightness(0.85)",
        }}
      />

      <div
        style={{
          padding: "16px 18px",
          fontSize: 17,
          fontWeight: 900,
          textAlign: "center",
          color: "#fff7d1",
          letterSpacing: "0.3px",
          lineHeight: 1.6,
          position: "relative",
          zIndex: 1,
        }}
      >
        {title}
      </div>

      <div
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          padding: "4px 10px",
          borderRadius: 12,
          fontSize: 12,
          fontWeight: 700,
          background: "rgba(243,211,94,0.2)",
          border: "1px solid rgba(243,211,94,0.4)",
          color: "#f3d35e",
          zIndex: 2,
        }}
      >
        SOON
      </div>
    </button>
  );
}

export default function AfrawoodLanding({ onNavigate }) {
  const [query, setQuery] = useState("");
  const [accountOpen, setAccountOpen] = useState(false);

  const { language, setLanguage, t, supportedLanguages } = useLanguage();
  const { user, ownerMode, canAccessApp, logout } = useAuth();
  const creditSummary = getCreditSummary();

  const detectedMode = useMemo(() => {
    const q = String(query || "").toLowerCase();

    if (
      q.includes("script") ||
      q.includes("screenplay") ||
      q.includes("story") ||
      q.includes("dialogue") ||
      q.includes("فیلمنامه") ||
      q.includes("داستان")
    ) return "script";

    if (
      q.includes("image") ||
      q.includes("photo") ||
      q.includes("poster") ||
      q.includes("cinematic image") ||
      q.includes("عکس") ||
      q.includes("تصویر")
    ) return "image";

    if (
      q.includes("video") ||
      q.includes("animation") ||
      q.includes("text to video") ||
      q.includes("image to video") ||
      q.includes("ویدیو")
    ) return "video";

    if (
      q.includes("merge") ||
      q.includes("combine") ||
      q.includes("montage") ||
      q.includes("edit") ||
      q.includes("ادغام") ||
      q.includes("مونتاژ")
    ) return "merge";

    if (q.includes("subtitle") || q.includes("caption") || q.includes("زیرنویس")) {
      return "subtitle";
    }

    if (
      q.includes("voice") ||
      q.includes("narration") ||
      q.includes("speaker") ||
      q.includes("صدا")
    ) return "voice";

    if (
      q.includes("music") ||
      q.includes("soundtrack") ||
      q.includes("song") ||
      q.includes("موسیقی")
    ) return "music";

    if (
      q.includes("export") ||
      q.includes("render") ||
      q.includes("output") ||
      q.includes("خروجی")
    ) return "export";

    if (
      q.includes("upgrade") ||
      q.includes("price") ||
      q.includes("pricing") ||
      q.includes("plan") ||
      q.includes("اشتراک") ||
      q.includes("قیمت")
    ) return "pricing";

    return "image";
  }, [query]);

  function navigate(mode) {
    if (!APP_ROUTES.has(mode)) return;

    if (!canAccessApp && !PUBLIC_ROUTES.has(mode)) {
      onNavigate?.("signup");
      return;
    }

    onNavigate?.(mode);
  }

  function handleSubmit(e) {
    e.preventDefault();
    navigate(detectedMode);
  }

  function handleAccountClick() {
    if (!canAccessApp && !ownerMode) {
      onNavigate?.("signup");
      return;
    }
    setAccountOpen((prev) => !prev);
  }

  return (
    <div style={PAGE_STYLE}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url('/landing-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: 1,
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(0,0,0,0.24) 0%, rgba(0,0,0,0.34) 100%)",
        }}
      />

      <div style={WRAP_STYLE}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 20,
            marginBottom: 34,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <button type="button" style={TOP_LINK_STYLE} onClick={() => navigate("contact")}>
              {t("common.contactUs", "Contact Us")}
            </button>
            <button type="button" style={TOP_LINK_STYLE} onClick={() => navigate("about")}>
              {t("common.about", "About Us")}
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", position: "relative" }}>
            <button type="button" style={UPGRADE_BUTTON_STYLE} onClick={() => navigate("pricing")}>
              {t("common.upgrade", "Upgrade")}
            </button>

            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              style={{
                ...TOP_LINK_STYLE,
                padding: "0 16px",
                minWidth: 130,
              }}
            >
              {supportedLanguages.map((item) => (
                <option key={item.code} value={item.code} style={{ background: "#000" }}>
                  {item.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              style={TOP_LINK_STYLE}
              onClick={handleAccountClick}
            >
              {t("landing.accountBar", "Account Management")}
            </button>

            {accountOpen ? (
              <AccountPanel
                user={user}
                ownerMode={ownerMode}
                credits={creditSummary.creditsRemaining}
                planName={creditSummary.plan?.name || user?.planName || "Free"}
                onClose={() => setAccountOpen(false)}
                onUpgrade={() => {
                  setAccountOpen(false);
                  navigate("pricing");
                }}
                onLogout={() => {
                  setAccountOpen(false);
                  logout();
                }}
                t={t}
              />
            ) : null}
          </div>
        </div>

        <div
          style={{
            minHeight: "calc(100vh - 160px)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            padding: "16px 0 32px",
          }}
        >
          <img
            src="/logo.png"
            alt="Afrawood"
            style={{
              width: "100%",
              maxWidth: 400,
              display: "block",
              objectFit: "contain",
              marginTop: -100,
              marginBottom: 0,
              filter: "drop-shadow(0 12px 30px rgba(0,0,0,0.38))",
            }}
          />

          <div
            style={{
              fontSize: 66,
              fontWeight: 900,
              letterSpacing: "-0.05em",
              lineHeight: 1.02,
              textShadow: "0 10px 30px rgba(0,0,0,0.48)",
              marginBottom: 10,
            }}
          >
            Welcome to Afrawood
          </div>

          <div
            style={{
              maxWidth: 860,
              fontSize: 18,
              lineHeight: 1.8,
              color: "rgba(255,245,220,0.96)",
              textShadow: "0 8px 24px rgba(0,0,0,0.48)",
              marginBottom: 0,
            }}
          >
            Your cinematic AI studio for stories, scenes, images, voices, music, and final creative output.
          </div>

          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
              marginBottom: 18,
              textShadow: "0 8px 24px rgba(0,0,0,0.42)",
            }}
          >
            {t("landing.help", "How can I help you?")}
          </div>

          <form onSubmit={handleSubmit} style={CHAT_WRAP_STYLE}>
            <div style={{ display: "flex", gap: 10 }}>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("landing.placeholder", "Write what you want to create...")}
                style={CHAT_INPUT_STYLE}
              />

              <button type="submit" style={OPEN_BUTTON_STYLE}>
                {t("common.open", "Open")}
              </button>
            </div>
          </form>

          <div style={MODULE_GRID_STYLE}>
            <ModuleCard
              title="AI Script"
              imageSrc="/script-card.jpg"
              onClick={() => navigate("script")}
            />

            <ModuleCard
              title="Cinematic Image"
              imageSrc="/image-card.jpg"
              onClick={() => navigate("image")}
            />

            <ModuleCard
              title="Video Generator"
              imageSrc="/video-card.jpg"
              onClick={() => navigate("video")}
            />

            <ModuleCard
              title="Video Merge"
              imageSrc="/merge-card.jpg"
              onClick={() => navigate("merge")}
            />

            <ModuleCard
              title="Subtitle Generator"
              imageSrc="/subtitle-card.jpg"
              onClick={() => navigate("subtitle")}
            />

            <ModuleCard
              title="Voice Generator"
              imageSrc="/voice-card.jpg"
              onClick={() => navigate("voice")}
            />

            <ModuleCard
              title="Music Generator"
              imageSrc="/music-card.jpg"
              onClick={() => navigate("music")}
            />

            <ModuleCard
              title="Export"
              imageSrc="/export-card.jpg"
              onClick={() => navigate("export")}
            />
          </div>

          <div style={SPECIAL_ROW_STYLE}>
            <SpecialModuleCard
              title="Afrawood Full Studio (Coming Soon)"
              imageSrc="/full-studio-card.jpg"
            />
          </div>
        </div>
      </div>
    </div>
  );
}