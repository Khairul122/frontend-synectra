const techStack = [
  'React', 'Next.js', 'TypeScript', 'Node.js', 'NestJS',
  'PostgreSQL', 'TailwindCSS', 'Figma', 'Docker', 'Vite',
  'GSAP', 'Lenis', 'Three.js', 'Supabase'
];

export function TechMarquee() {
  return (
    <section className="module-card max-w-7xl mx-auto w-full bg-neu-primary py-6 lg:py-8 overflow-hidden">
      <div className="overflow-hidden">
        <div className="flex gap-6 animate-marquee whitespace-nowrap w-max">
          {[...techStack, ...techStack, ...techStack].map((tech, i) => (
            <span key={i} className="inline-flex items-center gap-3 bg-neu-white text-neu-black px-5 py-3 border-4 border-neu-black shadow-neu-solid-lg rounded-neu-lg font-mono font-black text-lg lg:text-xl uppercase tracking-widest flex-shrink-0">
              <span className="w-3 h-3 bg-neu-primary border-2 border-neu-black rounded-full flex-shrink-0" />
              {tech}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
