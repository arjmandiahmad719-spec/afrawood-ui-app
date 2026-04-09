import Sidebar from "../components/Sidebar";
import StudioCards from "../components/StudioCards";
import logo from "../assets/logo.png";
import assistant from "../assets/afra-assistant.png";

export default function Dashboard() {
  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,200,120,0.10),_transparent_22%),linear-gradient(180deg,_#06080f_0%,_#04060b_100%)]">
      <Sidebar />

      <main className="flex-1 px-8 py-8 lg:px-10 overflow-auto">
        <div className="max-w-[1500px] mx-auto">
          <section className="rounded-[28px] border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[0_35px_90px_rgba(0,0,0,0.45)] overflow-hidden">
            <div className="grid xl:grid-cols-[1.25fr_0.75fr]">
              <div className="p-8 lg:p-10 border-b xl:border-b-0 xl:border-r border-white/10">
                <div className="flex justify-center xl:justify-start">
                  <img
                    src={logo}
                    alt="AfraWood Logo"
                    className="w-56 sm:w-64 lg:w-72 drop-shadow-[0_0_30px_rgba(255,210,120,0.12)]"
                  />
                </div>

                <h1 className="mt-6 text-4xl md:text-5xl xl:text-6xl font-semibold leading-tight text-center xl:text-left">
                  AfraWood AI Film Studio
                </h1>

                <p className="mt-5 text-white/65 text-base md:text-lg leading-8 max-w-3xl text-center xl:text-left">
                  A cinematic production environment for building stories,
                  characters, scenes, voices, music, sound effects and final film
                  output inside one studio.
                </p>

                <div className="mt-8 flex flex-wrap gap-4 justify-center xl:justify-start">
                  <button className="rounded-2xl bg-gradient-to-r from-amber-300 to-yellow-500 text-black px-6 py-3 font-semibold shadow-[0_18px_50px_rgba(255,190,80,0.22)] hover:scale-[1.01] transition">
                    Create New Film Project
                  </button>

                  <button className="rounded-2xl border border-white/15 bg-white/5 px-6 py-3 font-medium text-white/90 hover:bg-white/10 transition">
                    Open Studio
                  </button>
                </div>

                <div className="mt-10">
                  <StudioCards />
                </div>
              </div>

              <div className="p-8 lg:p-10 bg-[radial-gradient(circle_at_top,_rgba(255,220,160,0.10),_transparent_30%)]">
                <div className="text-[11px] uppercase tracking-[0.4em] text-amber-200/70">
                  Assistant
                </div>

                <h2 className="mt-3 text-3xl font-semibold">
                  Afra Assistant
                </h2>

                <p className="mt-4 text-white/65 leading-7">
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

                <div className="mt-6 grid sm:grid-cols-2 gap-3">
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
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}