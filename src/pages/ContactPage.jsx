import React, { useState } from "react";

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
  background: "linear-gradient(180deg, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0.56) 100%)",
};

const WRAP_STYLE = {
  position: "relative",
  zIndex: 2,
  width: "100%",
  maxWidth: 1240,
  margin: "0 auto",
  padding: "110px 24px 40px",
  boxSizing: "border-box",
};

const CARD_STYLE = {
  borderRadius: 28,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(10,10,10,0.34)",
  boxShadow: "0 20px 80px rgba(0,0,0,0.35)",
  backdropFilter: "blur(10px)",
  overflow: "hidden",
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

const TEXTAREA_STYLE = {
  width: "100%",
  minHeight: 180,
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(0,0,0,0.28)",
  color: "#fff",
  outline: "none",
  padding: 16,
  fontSize: 16,
  boxSizing: "border-box",
  resize: "vertical",
};

const BUTTON_STYLE = {
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

const CHIP_STYLE = {
  display: "inline-flex",
  alignItems: "center",
  height: 34,
  padding: "0 14px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.04)",
  color: "rgba(255,255,255,0.82)",
  fontSize: 13,
  fontWeight: 700,
};

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [successText, setSuccessText] = useState("");
  const [errorText, setErrorText] = useState("");

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setSuccessText("");
    setErrorText("");

    try {
      const res = await fetch("http://127.0.0.1:4242/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || "Failed to send message");
      }

      setSuccessText("Your message was sent successfully.");
      setForm({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      setErrorText(error?.message || "Failed to send message");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={PAGE_STYLE}>
      <div style={OVERLAY_STYLE} />

      <div style={WRAP_STYLE}>
        <div style={CARD_STYLE}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "0.92fr 1.08fr",
              minHeight: 680,
            }}
          >
            <div
              style={{
                padding: 34,
                boxSizing: "border-box",
                borderRight: "1px solid rgba(255,255,255,0.10)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={CHIP_STYLE}>Contact Us</div>
                <div style={{ fontSize: 48, fontWeight: 900, marginTop: 18, marginBottom: 14 }}>
                  Let’s talk about Afrawood
                </div>
                <div style={{ fontSize: 18, lineHeight: 1.9, color: "rgba(255,255,255,0.88)" }}>
                  For support, partnerships, production, technical questions, or business inquiries,
                  send us a message and we will get back to you.
                </div>
              </div>

              <div
                style={{
                  marginTop: 30,
                  borderRadius: 24,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(10,10,10,0.28)",
                  minHeight: 260,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 18,
                  boxSizing: "border-box",
                }}
              >
                <img
                  src="/logo.png"
                  alt="Afrawood"
                  style={{
                    width: "100%",
                    maxWidth: 300,
                    objectFit: "contain",
                    display: "block",
                  }}
                />
              </div>
            </div>

            <div style={{ padding: 34, boxSizing: "border-box" }}>
              <div style={{ fontSize: 34, fontWeight: 900, marginBottom: 14 }}>
                Send Message
              </div>

              <div style={{ fontSize: 17, lineHeight: 1.9, color: "rgba(255,255,255,0.84)", marginBottom: 20 }}>
                Fill in the form below. Your message goes directly to Afrawood email.
              </div>

              <form onSubmit={handleSubmit}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: 14,
                    marginBottom: 14,
                  }}
                >
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    style={INPUT_STYLE}
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    style={INPUT_STYLE}
                  />
                  <input
                    type="text"
                    placeholder="Subject"
                    value={form.subject}
                    onChange={(e) => updateField("subject", e.target.value)}
                    style={{ ...INPUT_STYLE, gridColumn: "1 / span 2" }}
                  />
                </div>

                <textarea
                  placeholder="Write your message..."
                  value={form.message}
                  onChange={(e) => updateField("message", e.target.value)}
                  style={TEXTAREA_STYLE}
                />

                <div style={{ marginTop: 18 }}>
                  <button type="submit" style={BUTTON_STYLE} disabled={loading}>
                    {loading ? "Sending..." : "Send Message"}
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
      </div>
    </div>
  );
}