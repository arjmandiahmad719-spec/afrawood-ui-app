import React, { useEffect, useRef, useState } from "react";
import { useAfraFlow } from "../../core/AfraFlowContext";
import { runCopilotDirectorCommand } from "./CopilotEngine.js";

/* =========================
   🎬 TYPEWRITER
========================= */

function useTypewriter(text, speed = 12) {
  const [output, setOutput] = useState("");

  useEffect(() => {
    let i = 0;
    setOutput("");

    const interval = setInterval(() => {
      i++;
      setOutput(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return output;
}

/* =========================
   💬 MESSAGE
========================= */

function Message({ role, text, typing }) {
  const displayText = typing ? useTypewriter(text) : text;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: role === "user" ? "flex-end" : "flex-start",
        marginBottom: 10,
      }}
    >
      <div
        style={{
          maxWidth: "85%",
          padding: "10px 12px",
          borderRadius: 14,
          background:
            role === "user"
              ? "rgba(87,221,210,0.18)"
              : "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)",
          fontSize: 13,
          lineHeight: 1.7,
          color: "white",
          whiteSpace: "pre-wrap",
        }}
      >
        {displayText}
      </div>
    </div>
  );
}

/* =========================
   🚀 MAIN
========================= */

export default function FloatingCopilot() {
  const afra = useAfraFlow();

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      text: "من Copilot افراوود هستم. دستور بده 🎬",
    },
  ]);
  const [typing, setTyping] = useState(false);

  const scrollRef = useRef();

  const append = (msg) =>
    setMessages((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), ...msg },
    ]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop =
        scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!draft.trim() || typing) return;

    const input = draft;

    append({ role: "user", text: input });
    setDraft("");
    setTyping(true);

    try {
      const res = await runCopilotDirectorCommand({
        input,
        context: { sceneState: afra?.state || {} },
        afra,
      });

      append({
        role: "assistant",
        text: res?.reply || "پاسخی دریافت نشد",
      });
    } catch (err) {
      append({
        role: "assistant",
        text: "خطا در اجرای Copilot",
      });
    }

    setTyping(false);
  };

  return (
    <>
      {/* BUTTON */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        style={{
          position: "fixed",
          bottom: 24,
          left: 24,
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: "#05070c",
          color: "#57ddd2",
          border: "1px solid rgba(87,221,210,0.3)",
          cursor: "pointer",
          zIndex: 99999,
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          fontWeight: "bold",
        }}
      >
        AI
      </button>

      {/* PANEL */}
      <div
        style={{
          position: "fixed",
          bottom: 100,
          left: 24,
          width: 360,
          height: open ? 500 : 0,
          opacity: open ? 1 : 0,
          transform: open ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.25s ease",
          pointerEvents: open ? "auto" : "none",
          overflow: "hidden",
          zIndex: 99998,
          background: "rgba(10,14,20,0.85)",
          backdropFilter: "blur(20px)",
          borderRadius: 18,
          border: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            padding: "10px 14px",
            fontSize: 12,
            color: "#57ddd2",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          Afrawood Copilot
        </div>

        {/* CHAT */}
        <div
          ref={scrollRef}
          style={{
            flex: 1,
            padding: 12,
            overflowY: "auto",
          }}
        >
          {messages.map((m, i) => (
            <Message
              key={m.id}
              role={m.role}
              text={m.text}
              typing={
                m.role === "assistant" &&
                typing &&
                i === messages.length - 1
              }
            />
          ))}
        </div>

        {/* INPUT */}
        <div
          style={{
            padding: 10,
            borderTop: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255,255,255,0.05)",
              borderRadius: 12,
              padding: "6px 8px",
            }}
          >
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="مثلاً: دیالوگ سینمایی بساز..."
              rows={1}
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                color: "white",
                outline: "none",
                resize: "none",
                fontSize: 13,
              }}
            />

            <button
              onClick={handleSend}
              style={{
                background: "#57ddd2",
                border: "none",
                padding: "6px 10px",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 12,
                fontWeight: "bold",
              }}
            >
              →
            </button>
          </div>
        </div>
      </div>
    </>
  );
}