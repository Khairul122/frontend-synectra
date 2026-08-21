const techStack = [
  'React', 'Next.js', 'TypeScript', 'Node.js', 'NestJS',
  'PostgreSQL', 'TailwindCSS', 'Figma', 'Docker', 'Vite',
  'GSAP', 'Lenis', 'Three.js', 'Supabase'
];

export function TechMarquee() {
  return (
    <section className="border-b-2 border-t-4 border-neu-black border-t-neu-gold bg-neu-black overflow-hidden">
      <div className="flex items-stretch">
        {/* Fixed label */}
        <div className="flex-shrink-0 border-r-2 border-neu-white/10 px-4 flex items-center">
          <span className="font-mono font-bold text-[9px] text-neu-white/30 uppercase tracking-[0.2em] whitespace-nowrap">STACK</span>
        </div>
        {/* Scrolling */}
        <div className="overflow-hidden py-3 flex-1">
          <div className="flex gap-10 animate-marquee whitespace-nowrap">
            {[...techStack, ...techStack, ...techStack].map((tech, i) => (
              <span key={i} className="inline-flex items-center gap-3 font-mono text-[11px] text-neu-white/40 uppercase tracking-widest flex-shrink-0">
                <span className="w-1 h-1 bg-neu-gold inline-block flex-shrink-0" />
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
