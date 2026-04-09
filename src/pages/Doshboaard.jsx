import { useMemo, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import StudioCards from "../components/StudioCards";
import logo from "../assets/logo.png";
import assistant from "../assets/afra-assistant.png";
import { useAfraFlow } from "../ai/core/AfraFlowContext";
import { runCopilotDirectorCommand } from "../ai/components/copilot/CopilotEngine.js";

const QUICK_PROMPTS = [
  "یک ایده برای فیلم عاشقانه بساز",
  "یک صحنه دراماتیک شبانه طراحی کن",
  "از ایده تا فیلمنامه شروع کن",
  "برای یوتیوب یک پروژه سینمایی بچین",
];

function detectAutoProjectPatch(input = "") {
  const text = String(input).trim();

  if (/فرهاد/.test(text) && /شیرین/.test(text)) {
    return {
      projectTitle: "فرهاد و شیرین",
      projectType: "cinema",
      sceneNumber: "1",
      estimatedDuration: "20 دقیقه",
      outputLanguage: "فارسی",
      sceneTitle: "آغاز عشق فرهاد",
      location: "دامنه کوه و اطراف قصر شیرین",
      timeOfDay: "غروب",
      mood: "عاشقانه حماسی تراژیک",
      visualStyle: "سینمایی تاریخی ایرانی",
      cameraStyle: "حرکت نرم و باشکوه",
      lightingStyle: "نور دراماتیک تاریخی با کنتراست طلایی",
      shotDensity: "متوسط",
      characters: `فرهاد
شیرین
خسرو`,
      actionSummary:
        "فرهاد برای اولین بار شیرین را می‌بیند و در همان نگاه اول عاشق می‌شود، اما حضور خسرو از همان ابتدا سایه‌ای از تهدید و تراژدی بر این عشق می‌اندازد.",
      dialogueTone: "احساسی شاعرانه",
      soundDesign:
        "باد کوهستان، سکوت احساسی، صدای دوردست طبیعت، بافت صوتی تاریخی",
      musicStyle: "موسیقی سنتی ایرانی با حال‌وهوای حماسی و تراژیک",
      directorIntent:
        "نمایش شکوه عشق، رنج، وفاداری و سرنوشت تراژیک در بستری تاریخی و سینمایی",
    };
  }

  if (/عاشقانه/.test(text) && /فیلم|پروژه|داستان|صحنه/.test(text)) {
    return {
      mood: "عاشقانه",
      visualStyle: "سینمایی شاعرانه",
      dialogueTone: "احساسی",
      musicStyle: "ملودیک احساسی",
    };
  }

  if (/تاریخی/.test(text)) {
    return {
      visualStyle: "تاریخی واقع‌گرا",
      lightingStyle: "نور دراماتیک تاریخی",
    };
  }

  if (/شب|شبانه|بارانی/.test(text)) {
    return {
      timeOfDay: /غروب/.test(text) ? "غروب" : "شب",
    };
  }

  if (/یوتیوب/.test(text)) {
    return {
      projectType: "cinema",
      outputLanguage: "فارسی",
    };
  }

  return {};
}

function buildFallbackReply(input, patch = {}) {
  const text = String(input || "").trim();

  if (/فرهاد/.test(text) && /شیرین/.test(text)) {
    return [
      "پروژه ثبت شد.",
      "",
      "من ایده را به‌عنوان یک فیلم 20 دقیقه‌ای تاریخی-عاشقانه وارد استودیو کردم.",
      "فیلدهای اصلی پروژه هم به‌صورت خودکار تنظیم شدند:",
      "• عنوان پروژه: فرهاد و شیرین",
      "• عنوان صحنه: آغاز عشق فرهاد",
      "• مود: عاشقانه حماسی تراژیک",
      "• شخصیت‌ها: فرهاد، شیرین، خسرو",
      "",
      "حالا می‌توانی وارد Director Studio شوی و مرحله بعد را بدهی:",
      "• برای این پروژه ساختار صحنه‌ها را بنویس",
      "• برای این پروژه دیالوگ سینمایی بساز",
    ].join("\n");
  }

  if (Object.keys(patch).length > 0) {
    return [
      "ایده دریافت شد.",
      "",
      "بخشی از اطلاعات پروژه به‌صورت هوشمند وارد استودیو شد.",
      "برای مرحله بعد می‌توانی از من بخواهی صحنه، فیلمنامه یا دیالوگ بسازم.",
    ].join("\n");
  }

  return [
    "ایده دریافت شد.",
    "",
    "از همین‌جا می‌توانیم آن را به پروژه، صحنه، شخصیت و دیالوگ تبدیل کنیم.",
    "برای نتیجه بهتر، موضوع، ژانر، زمان، فضا یا شخصیت‌های اصلی را هم بنویس.",
  ].join("\n");
}

export default function Dashboard() {
  const {
    state,
    directorStudioForm,
    bulkUpdateDirectorForm,
    addCopilotMessage,
  } = useAfraFlow();

  const [heroInput, setHeroInput] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      text: "به Afrawood خوش آمدی. ایده‌ات را بنویس تا از همین صفحه وارد مسیر ساخت فیلم شویم.",
    },
  ]);
  const [busy, setBusy] = useState(false);

  const chatRef = useRef(null);

  const canSend = heroInput.trim().length > 0 && !busy;

  const helperText = useMemo(() => {
    return "از ایده، صحنه، شخصیت، دیالوگ و خروجی نهایی در یک جریان واحد.";
  }, []);

  const appendMessage = (message) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        ...message,
      },
    ]);

    requestAnimationFrame(() => {
      if (chatRef.current) {
        chatRef.current.scrollTop = chatRef.current.scrollHeight;
      }
    });
  };

  const applyProjectPatch = (patch) => {
    if (!patch || Object.keys(patch).length === 0) return;
    bulkUpdateDirectorForm(patch);
  };

  const sendMessage = async (forcedText) => {
    const input = String(forcedText ?? heroInput).trim();
    if (!input || busy) return;

    appendMessage({
      role: "user",
      text: input,
    });

    addCopilotMessage?.({
      role: "user",
      text: input,
    });

    setHeroInput("");
    setBusy(true);

    const inferredPatch = detectAutoProjectPatch(input);
    applyProjectPatch(inferredPatch);

    try {
      const result = await runCopilotDirectorCommand({
        input,
        context: {
          sceneState: {
            ...(state || {}),
            ...(directorStudioForm || {}),
            ...inferredPatch,
          },
        },
        afra: {
          state: {
            ...(state || {}),
            ...(directorStudioForm || {}),
            ...inferredPatch,
          },
          setSceneData: bulkUpdateDirectorForm,
          updateScene: bulkUpdateDirectorForm,
        },
      });

      const hasUsefulReply =
        typeof result?.reply === "string" &&
        result.reply.trim() &&
        !/دستور واضح نیست/.test(result.reply);

      const replyText = hasUsefulReply
        ? result.reply
        : buildFallbackReply(input, inferredPatch);

      appendMessage({
        role: "assistant",
        text: replyText,
      });

      addCopilotMessage?.({
        role: "assistant",
        text: replyText,
      });
    } catch (error) {
      console.error("Dashboard AI Error:", error);

      const replyText = buildFallbackReply(input, inferredPatch);

      appendMessage({
        role: "assistant",
        text: replyText,
      });

      addCopilotMessage?.({
        role: "assistant",
        text: replyText,
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,200,120,0.10),_transparent_22%),linear-gradient(180deg,_#06080f_0%,_#04060b_100%)] text-white">
      <Sidebar />

      <main className="flex-1 overflow-auto px-8 py-8 lg:px-10">
        <div className="mx-auto max-w-[1500px]">
          <section className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03] shadow-[0_35px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <div className="grid xl:grid-cols-[1.1fr_0.9fr]">
              <div className="border-b border-white/10 p-8 xl:border-b-0 xl:border-r lg:p-10">
                <div className="flex justify-center xl:justify-start">
                  <img
                    src={logo}
                    alt="AfraWood Logo"
                    className="w-56 drop-shadow-[0_0_30px_rgba(255,210,120,0.12)] sm:w-64 lg:w-72"
                  />
                </div>

                <h1 className="mt-6 text-center text-4xl font-semibold leading-tight xl:text-left md:text-5xl xl:text-6xl">
                  AfraWood AI Film Studio
                </h1>

                <p className="mx-auto mt-5 max-w-3xl text-center text-base leading-8 text-white/65 xl:mx-0 xl:text-left md:text-lg">
                  A cinematic production environment for building stories,
                  characters, scenes, voices, music, sound effects and final film
                  output inside one studio.
                </p>

                <div className="mt-8 flex flex-wrap justify-center gap-4 xl:justify-start">
                  <button className="rounded-2xl bg-gradient-to-r from-amber-300 to-yellow-500 px-6 py-3 font-semibold text-black shadow-[0_18px_50px_rgba(255,190,80,0.22)] transition hover:scale-[1.01]">
                    Create New Film Project
                  </button>

                  <button className="rounded-2xl border border-white/15 bg-white/5 px-6 py-3 font-medium text-white/90 transition hover:bg-white/10">
                    Open Studio
                  </button>
                </div>

                <div className="mt-8 rounded-[26px] border border-white/10 bg-black/25 p-4 shadow-[0_22px_60px_rgba(0,0,0,0.28)]">
                  <div className="mb-3 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.35em] text-cyan-300/70">
                        AI entry point
                      </div>
                      <h2 className="mt-2 text-2xl font-semibold">
                        Start with an idea
                      </h2>
                    </div>

                    <div className="hidden rounded-2xl border border-amber-200/10 bg-amber-200/5 px-4 py-2 text-xs text-amber-100/80 sm:block">
                      Premium creative flow
                    </div>
                  </div>

                  <p className="mb-5 max-w-3xl text-sm leading-7 text-white/60 md:text-base">
                    {helperText}
                  </p>

                  <div className="mb-4 flex flex-wrap gap-3">
                    {QUICK_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => sendMessage(prompt)}
                        className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/80 transition hover:border-cyan-300/25 hover:bg-cyan-300/[0.08] hover:text-white"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>

                  <div className="rounded-[22px] border border-white/10 bg-[#060a12]/90">
                    <div
                      ref={chatRef}
                      className="max-h-[280px] min-h-[190px] space-y-3 overflow-auto p-4"
                    >
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.role === "user"
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-7 md:text-[15px] ${
                              message.role === "user"
                                ? "border border-cyan-300/20 bg-cyan-300/[0.14] text-white"
                                : "border border-white/10 bg-white/[0.04] text-white/85"
                            }`}
                          >
                            {message.text}
                          </div>
                        </div>
                      ))}

                      {busy && (
                        <div className="flex justify-start">
                          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/60">
                            Afrawood AI is thinking...
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-white/10 p-3">
                      <div className="flex flex-col gap-3">
                        <textarea
                          value={heroInput}
                          onChange={(e) => setHeroInput(e.target.value)}
                          placeholder="مثلاً: می‌خواهم زندگی فرهاد کوه‌کن و شیرین را در یک فیلم 20 دقیقه‌ای بسازم..."
                          rows={3}
                          className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-right text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-300/30 focus:bg-white/[0.05] md:text-[15px]"
                        />

                        <div className="flex items-center justify-between gap-3">
                          <div className="text-xs text-white/40 md:text-sm">
                            Idea → Scene → Dialogue → Film Output
                          </div>

                          <button
                            onClick={() => sendMessage()}
                            disabled={!canSend}
                            className={`rounded-2xl px-5 py-3 text-sm font-semibold transition md:text-base ${
                              canSend
                                ? "bg-gradient-to-r from-cyan-300 to-amber-300 text-black shadow-[0_14px_40px_rgba(87,221,210,0.16)] hover:scale-[1.01]"
                                : "cursor-not-allowed border border-white/10 bg-white/[0.04] text-white/35"
                            }`}
                          >
                            {busy ? "Thinking..." : "Start with AI"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-10">
                  <StudioCards />
                </div>
              </div>

              <div className="bg-[radial-gradient(circle_at_top,_rgba(255,220,160,0.10),_transparent_30%)] p-8 lg:p-10">
                <div className="text-[11px] uppercase tracking-[0.4em] text-amber-200/70">
                  Assistant
                </div>

                <h2 className="mt-3 text-3xl font-semibold">Afra Assistant</h2>

                <p className="mt-4 leading-7 text-white/65">
                  Your studio production guide for planning, continuity, creative
                  direction and project flow.
                </p>

                <div className="mt-8 rounded-[26px] border border-white/10 bg-black/25 p-4 shadow-[0_25px_60px_rgba(0,0,0,0.35)]">
                  <img
                    src={assistant}
                    alt="Afra Assistant"
                    className="w-full rounded-[20px] object-cover"
                  />
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {[
                    "Story planning",
                    "Character consistency",
                    "Audio workflow",
                    "Final export support",
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-sm text-white/75"
                    >
                      {item}
                    </div>
                  ))}
                </div>

                <div className="mt-8 rounded-[24px] border border-amber-200/10 bg-amber-200/[0.05] p-5">
                  <div className="text-[11px] uppercase tracking-[0.35em] text-amber-200/60">
                    About
                  </div>
                  <p className="mt-3 text-sm leading-7 text-white/70 md:text-base">
                    Afrawood is designed as a premium AI cinema workspace for
                    filmmakers, storytellers and creators who want to move from
                    concept to production inside one elegant studio.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}