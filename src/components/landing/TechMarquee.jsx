export function TechMarquee() {
  const items = [
    {
      name: 'NEXT.JS',
      shape: <div className="w-6 h-6 md:w-8 md:h-8 bg-primary-container border-4 border-neu-black rotate-45 shrink-0" />,
    },
    {
      name: 'TYPESCRIPT',
      shape: <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-neu-purple border-4 border-neu-black shrink-0" />,
    },
    {
      name: 'NODE.JS',
      shape: <div className="w-6 h-6 md:w-8 md:h-8 bg-neu-green border-4 border-neu-black animate-pulse shrink-0" />,
    },
    {
      name: 'TAILWINDCSS',
      shape: <div className="w-6 h-6 md:w-8 md:h-8 bg-secondary-container border-4 border-neu-black rounded-lg shrink-0" />,
    },
    {
      name: 'FIGMA',
      shape: <div className="w-6 h-6 md:w-8 md:h-8 bg-primary-container border-4 border-neu-black rotate-12 shrink-0" />,
    },
    {
      name: 'REACT',
      shape: <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-neu-blue border-4 border-neu-black shrink-0" />,
    },
    {
      name: 'PYTHON',
      shape: <div className="w-6 h-6 md:w-8 md:h-8 bg-neu-gold border-4 border-neu-black rotate-45 shrink-0" />,
    },
  ];

  return (
    <section className="w-full bg-primary-container py-6 md:py-8 z-20 border-b-4 border-neu-black overflow-hidden select-none">
      <div className="flex w-full overflow-hidden items-center">
        {/* Track 1 */}
        <div className="flex shrink-0 items-center gap-6 md:gap-10 animate-marquee whitespace-nowrap py-1">
          {items.map((item, idx) => (
            <div
              key={`t1-${idx}`}
              className="inline-flex shrink-0 items-center gap-4 md:gap-6 bg-neu-white text-neu-black px-5 md:px-6 py-2.5 md:py-3 border-4 border-neu-black shadow-[6px_6px_0px_0px_#0D0D0D] rounded-xl transform hover:-translate-y-1.5 transition-transform font-mono text-lg md:text-2xl font-black uppercase tracking-widest cursor-pointer"
            >
              {item.shape}
              <span className="whitespace-nowrap font-black">{item.name}</span>
            </div>
          ))}
        </div>

        {/* Track 2 (Duplicate for seamless infinite scrolling) */}
        <div className="flex shrink-0 items-center gap-6 md:gap-10 animate-marquee whitespace-nowrap py-1 ml-6 md:ml-10" aria-hidden="true">
          {items.map((item, idx) => (
            <div
              key={`t2-${idx}`}
              className="inline-flex shrink-0 items-center gap-4 md:gap-6 bg-neu-white text-neu-black px-5 md:px-6 py-2.5 md:py-3 border-4 border-neu-black shadow-[6px_6px_0px_0px_#0D0D0D] rounded-xl transform hover:-translate-y-1.5 transition-transform font-mono text-lg md:text-2xl font-black uppercase tracking-widest cursor-pointer"
            >
              {item.shape}
              <span className="whitespace-nowrap font-black">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
