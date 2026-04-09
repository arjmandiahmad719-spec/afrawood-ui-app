export default function StudioCards() {
  const cards = [
    {
      title: "Character Studio",
      desc: "Create recurring characters for films and series.",
    },
    {
      title: "Scene Builder",
      desc: "Design cinematic scenes with direction and mood.",
    },
    {
      title: "Story Generator",
      desc: "Turn ideas into structured film narratives.",
    },
    {
      title: "Voice Studio",
      desc: "Generate dialogue and narration with AI voice tools.",
    },
    {
      title: "Music Studio",
      desc: "Create soundtrack, background score and themes.",
    },
    {
      title: "Video Generator",
      desc: "Transform visual ideas into moving cinematic outputs.",
    },
  ];

  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
      {cards.map((card) => (
        <div
          key={card.title}
          className="rounded-[24px] border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.25)] hover:border-amber-300/30 transition"
        >
          <div className="h-28 rounded-[20px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(255,230,180,0.12),_transparent_28%),linear-gradient(180deg,_rgba(255,255,255,0.02),_rgba(0,0,0,0.18))] mb-5" />
          <div className="text-xl font-semibold">{card.title}</div>
          <div className="mt-3 text-sm text-white/62 leading-6">
            {card.desc}
          </div>
        </div>
      ))}
    </div>
  );
}