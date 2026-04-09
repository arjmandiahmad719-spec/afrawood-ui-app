import React, { useMemo, useState } from "react";
import { useAfraFlow } from "../../ai/core/AfraFlowContext";
import runDirectorCommand from "../../ai/core/directorCommandEngine";
import { generateImageForShot } from "../../ai/imageAI";

const rootStyle = {
  display: "flex",
  flexDirection: "column",
  height: "100%",
  minHeight: 0,
  background: "transparent",
};

const topBarStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  padding: "12px 14px",
  borderBottom: "1px solid rgba(0,255,200,0.08)",
};

const badgeRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  flexWrap: "wrap",
};

const badgeStyle = {
  background: "rgba(0,255,208,0.08)",
  border: "1px solid rgba(0,255,208,0.16)",
  color: "#aefef3",
  fontSize: 11,
  padding: "6px 10px",
  borderRadius: 999,
  fontWeight: 700,
};

const clearButtonStyle = {
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.02)",
  color: "#ffffff",
  borderRadius: 12,
  padding: "10px 14px",
  cursor: "pointer",
  fontWeight: 800,
  fontSize: 13,
};

const messagesStyle = {
  flex: 1,
  minHeight: 0,
  overflowY: "auto",
  padding: 14,
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const emptyStyle = {
  border: "1px dashed rgba(0,255,200,0.12)",
  background: "rgba(255,255,255,0.015)",
  color: "rgba(234,255,251,0.72)",
  borderRadius: 18,
  padding: 16,
  lineHeight: 1.9,
  fontSize: 13,
};

const bubbleBaseStyle = {
  maxWidth: "90%",
  padding: "12px 14px",
  borderRadius: 16,
  fontSize: 13,
  lineHeight: 1.9,
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
};

const userBubbleStyle = {
  ...bubbleBaseStyle,
  alignSelf: "flex-end",
  background:
    "linear-gradient(135deg, rgba(0,255,208,0.18), rgba(0,183,255,0.12))",
  border: "1px solid rgba(0,255,208,0.18)",
  color: "#eafffb",
};

const assistantBubbleStyle = {
  ...bubbleBaseStyle,
  alignSelf: "flex-start",
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.07)",
  color: "#f3fffd",
};

const composerStyle = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: 14,
  borderTop: "1px solid rgba(0,255,200,0.08)",
};

const inputStyle = {
  flex: 1,
  height: 42,
  borderRadius: 12,
  border: "1px solid rgba(0,255,200,0.14)",
  background: "rgba(255,255,255,0.02)",
  color: "#eafffb",
  padding: "0 14px",
  outline: "none",
  fontSize: 14,
};

function getToggleButtonStyle(active) {
  return {
    background: active
      ? "linear-gradient(135deg, rgba(0,255,208,0.22), rgba(0,183,255,0.18))"
      : "rgba(255,255,255,0.02)",
    border: active
      ? "1px solid rgba(0,255,208,0.28)"
      : "1px solid rgba(255,255,255,0.08)",
    color: active ? "#dffff9" : "#d2ebe7",
    fontSize: 11,
    padding: "6px 10px",
    borderRadius: 999,
    fontWeight: 800,
    cursor: "pointer",
  };
}

function getSendButtonStyle(enabled, busy) {
  return {
    height: 42,
    minWidth: 86,
    border: "none",
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 800,
    cursor: enabled && !busy ? "pointer" : "not-allowed",
    background:
      enabled && !busy
        ? "linear-gradient(135deg, #00ffd0, #00b7ff)"
        : "rgba(255,255,255,0.06)",
    color: enabled && !busy ? "#001713" : "rgba(255,255,255,0.4)",
  };
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function safeText(value, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function readAutoImageMode() {
  try {
    return localStorage.getItem("afrawood_auto_image_mode") === "true";
  } catch {
    return false;
  }
}

function writeAutoImageMode(value) {
  try {
    localStorage.setItem("afrawood_auto_image_mode", value ? "true" : "false");
  } catch {
    // ignore
  }
}

export default function AfraChatPanel() {
  const {
    project,
    setProject,
    setShotImage,
    chatHistory,
    addChatMessage,
    clearChatHistory,
    setSelectedSceneId,
    setSelectedShotId,
  } = useAfraFlow();

  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [autoImage, setAutoImage] = useState(readAutoImageMode());

  const messages = useMemo(() => safeArray(chatHistory), [chatHistory]);
  const canSend = input.trim().length > 0 && !busy;

  function handleToggleAutoImage() {
    const nextValue = !autoImage;
    setAutoImage(nextValue);
    writeAutoImageMode(nextValue);
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || busy) return;

    setBusy(true);

    addChatMessage({
      role: "user",
      content: text,
    });

    setInput("");

    try {
      const result = await runDirectorCommand(text, project);
      const nextProject = result && result.project ? result.project : project;
      const createdScene = result && result.createdScene ? result.createdScene : null;
      const createdShots =
        result && Array.isArray(result.createdShots) ? result.createdShots : [];

      setProject(nextProject);

      if (createdScene && createdScene.id) {
        setSelectedSceneId(createdScene.id);
      }

      if (createdShots.length > 0 && createdShots[0] && createdShots[0].id) {
        setSelectedShotId(createdShots[0].id);
      }

      let generatedCount = 0;

      if (autoImage && createdScene && createdShots.length > 0) {
        for (let i = 0; i < createdShots.length; i += 1) {
          const shot = createdShots[i];

          try {
            const imageResult = await generateImageForShot({
              project: nextProject,
              scene: createdScene,
              shot,
            });

            setShotImage(shot.id, imageResult);
            generatedCount += 1;
          } catch (imageError) {
            addChatMessage({
              role: "assistant",
              content:
                "خطا در ساخت تصویر برای " +
                safeText(shot && shot.title, "Shot") +
                ": " +
                safeText(imageError && imageError.message, "Image error"),
            });
          }
        }
      }

      addChatMessage({
        role: "assistant",
        content: autoImage
          ? safeText(result && result.reply, "دستور انجام شد.") +
            "\nتصویرسازی خودکار: " +
            String(generatedCount) +
            " شات ساخته شد."
          : safeText(
              result && result.reply,
              "دستور انجام شد و Scene / Shot به پروژه اضافه شد."
            ),
      });
    } catch (error) {
      addChatMessage({
        role: "assistant",
        content:
          "خطا: " + safeText(error && error.message, "اجرای دستور انجام نشد."),
      });
    } finally {
      setBusy(false);
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  return (
    <div style={rootStyle}>
      <div style={topBarStyle}>
        <div style={badgeRowStyle}>
          <span style={badgeStyle}>{messages.length} پیام</span>

          <button
            type="button"
            style={getToggleButtonStyle(autoImage)}
            onClick={handleToggleAutoImage}
          >
            Auto Image: {autoImage ? "ON" : "OFF"}
          </button>

          <span style={badgeStyle}>
            {busy ? "در حال پردازش..." : "چت ذخیره می‌شود"}
          </span>
        </div>

        <button
          type="button"
          style={clearButtonStyle}
          onClick={clearChatHistory}
        >
          پاک کردن چت
        </button>
      </div>

      <div style={messagesStyle}>
        {messages.length === 0 ? (
          <div style={emptyStyle}>
            ایده‌ات را بنویس.
            {"\n"}
            مثال:
            {"\n"}
            یک صحنه عاشقانه در باغ در زمان غروب بساز
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={message.id || "msg-" + index}
              style={message.role === "user" ? userBubbleStyle : assistantBubbleStyle}
            >
              {safeText(message.content)}
            </div>
          ))
        )}
      </div>

      <div style={composerStyle}>
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="مثلاً: یک صحنه عاشقانه در خیابان خلوت شب بساز"
          style={inputStyle}
        />

        <button
          type="button"
          style={getSendButtonStyle(canSend, busy)}
          onClick={handleSend}
          disabled={!canSend}
        >
          {busy ? "..." : "ارسال"}
        </button>
      </div>
    </div>
  );
}