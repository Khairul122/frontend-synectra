export function TechMarquee() {
  const items = [
    { name: 'NEXT.JS', shape: <div className="w-6 h-6 md:w-8 md:h-8 bg-primary-container border-4 border-neu-black rotate-45" /> },
    { name: 'TYPESCRIPT', shape: <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-neu-purple border-4 border-neu-black" /> },
    { name: 'NODE.JS', shape: <div className="w-6 h-6 md:w-8 md:h-8 bg-neu-green border-4 border-neu-black animate-pulse" /> },
    { name: 'TAILWINDCSS', shape: <div className="w-6 h-6 md:w-8 md:h-8 bg-secondary-container border-4 border-neu-black rounded-lg" /> },
    { name: 'FIGMA', shape: <div className="w-6 h-6 md:w-8 md:h-8 bg-primary-container border-4 border-neu-black rotate-12" /> },
  ];

  const fullList = [...items, ...items, ...items, ...items];

  return (
    <section className="w-full bg-primary-container py-6 md:py-8 z-20 border-b-4 border-neu-black overflow-hidden select-none">
      <div className="marquee-container w-full relative z-10 flex items-center">
        <div className="marquee-content flex items-center gap-8 md:gap-12 font-mono text-xl md:text-3xl font-black text-neu-black uppercase tracking-widest">
          {fullList.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-4 md:gap-6 bg-neu-white text-neu-black px-4 md:px-6 py-2.5 md:py-3 border-4 border-neu-black shadow-[6px_6px_0px_0px_#0D0D0D] rounded-xl transform hover:-translate-y-2 transition-transform shrink-0"
            >
              {item.shape}
              <span>{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
