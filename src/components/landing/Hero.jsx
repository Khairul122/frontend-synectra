import { useTranslation } from 'react-i18next';
import { ElegantShape } from '../ui/shape-landing-hero';
import { MockIDE } from './MockIDE';
import { HeroReveal } from './helpers';

export function Hero({ transitionTo, scrollTo, portfolioRef, mousePos, isHoveredHero, setIsHoveredHero, handleHeroMouseMove }) {
  const { t } = useTranslation();

  return (
    <section
      onMouseMove={handleHeroMouseMove}
      onMouseEnter={() => setIsHoveredHero(true)}
      onMouseLeave={() => setIsHoveredHero(false)}
      className="relative min-h-[95vh] border-b-2 border-neu-black overflow-hidden bg-[#0D0D0D]"
    >

      {/* Layer 0 — Ambient color gradient */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-br from-neu-primary/[0.04] via-transparent to-white/[0.03]" />

      {/* Layer 0.5 — Cursor glow spotlight */}
      {isHoveredHero && (
        <div
          className="absolute inset-0 pointer-events-none z-[1] transition-opacity duration-300"
          style={{
            background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 208, 0, 0.08), transparent 80%)`,
          }}
        />
      )}

      {/* Layer 1 — Floating geometric shapes (monokrom: kuning + putih) */}
      <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none">
        <ElegantShape
          delay={0.3} width={600} height={140} rotate={12}
          gradient="from-neu-primary/[0.12]"
          className="left-[-8%] md:left-[-3%] top-[15%] md:top-[18%]"
        />
        <ElegantShape
          delay={0.5} width={420} height={100} rotate={-12}
          gradient="from-white/[0.05]"
          className="right-[-4%] md:right-[2%] top-[64%] md:top-[70%]"
        />
        <ElegantShape
          delay={0.4} width={220} height={60} rotate={-8}
          gradient="from-neu-primary/[0.08]"
          className="left-[6%] md:left-[10%] bottom-[10%] md:bottom-[14%]"
        />
      </div>

      {/* Layer 2 — Dot grid pattern */}
      <div className="absolute inset-0 z-[2] pointer-events-none"
           style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px)', backgroundSize: '34px 34px' }} />

      {/* Layer 3 — Left-side dark vignette so text stays readable */}
      <div className="absolute inset-0 z-[3] pointer-events-none"
           style={{ background: 'linear-gradient(to right, #0D0D0D 30%, rgba(13,13,13,0.85) 50%, rgba(13,13,13,0.35) 70%, transparent 100%)' }} />

      {/* Layer 3b — Background monumental text */}
      <div className="absolute inset-0 z-[4] pointer-events-none flex items-center justify-end overflow-hidden">
        <span className="font-display font-black text-[18vw] leading-none text-neu-white/[0.025] select-none tracking-tighter pr-4 lg:pr-8">
          SYNECTRA
        </span>
      </div>

      {/* Layer 4 — Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 lg:px-6 min-h-[95vh] flex flex-col justify-center py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center w-full">

          {/* Left Column — Text & CTAs */}
          <div className="lg:col-span-7 flex flex-col justify-center text-left">
            {/* Badge */}
            <div className="hero-badge inline-flex self-start items-center gap-2 bg-white/[0.06] border border-white/[0.12] rounded-neu-sm text-neu-white px-4 py-1.5 font-mono font-bold text-xs uppercase tracking-widest mb-6"
                 style={{ opacity: 0 }}>
              <span className="w-1.5 h-1.5 bg-neu-primary animate-pulse" />
              {t('landing.hero.badge').replace('✦ ', '').replace('✦', '')}
            </div>

            {/* Horizontal rule separator */}
            <div className="w-16 h-px bg-neu-white/20 mb-6 ml-1" />

            {/* Title — clip reveal per baris */}
            <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-neu-white leading-[0.95] mb-6">
              <HeroReveal delay={0.1}>
                <span className="block">{t('landing.hero.title1')}</span>
              </HeroReveal>
              <HeroReveal delay={0.3}>
                <span className="block">
                  <span className="relative inline-block">
                    <span className="relative z-10 text-neu-primary">{t('landing.hero.title2')}</span>
                  </span>
                </span>
              </HeroReveal>
              <HeroReveal delay={0.5}>
                <span className="block">{t('landing.hero.title3')}</span>
              </HeroReveal>
            </h1>

            {/* Subtitle */}
            <p className="hero-subtitle font-body text-sm sm:text-base lg:text-lg text-neu-white/55 mb-8 max-w-xl leading-relaxed"
               style={{ opacity: 0, transform: 'translateY(16px)' }}>
              {t('landing.hero.subtitle')}
            </p>

            {/* CTA Buttons */}
            <div className="hero-cta flex flex-wrap gap-3 mb-0" style={{ opacity: 0 }}>
              <button
                onClick={() => transitionTo('/register')}
                className="px-8 py-3.5 bg-neu-primary border-2 border-neu-primary rounded-neu-sm shadow-[2px_2px_0px_#FFD000,5px_7px_14px_-3px_rgba(255,208,0,0.25)] font-display font-bold text-sm uppercase tracking-wide text-neu-black transition-all duration-150 hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[1px_1px_0px_#FFD000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none">
                {t('landing.hero.cta')}
              </button>
              <button
                onClick={() => scrollTo(portfolioRef)}
                className="px-8 py-3.5 bg-transparent border-2 border-neu-white/40 rounded-neu-sm font-display font-bold text-sm uppercase tracking-wide text-neu-white/80 transition-all duration-150 hover:border-neu-white hover:text-neu-white hover:translate-x-[3px] hover:translate-y-[3px] active:translate-x-[4px] active:translate-y-[4px]">
                {t('landing.hero.ctaSecondary')}
              </button>
            </div>
          </div>

          {/* Right Column — Mock IDE Visual */}
          <div className="lg:col-span-5 w-full flex justify-center lg:justify-end mt-12 lg:mt-0">
            <MockIDE />
          </div>

        </div>
      </div>

      {/* Scroll indicator */}
      <div className="hero-scroll absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
           style={{ opacity: 0 }}>
        <span className="font-mono text-[9px] text-neu-white/30 uppercase tracking-widest">Scroll</span>
        <div className="w-5 h-8 border-2 border-neu-white/20 flex items-start justify-center pt-1.5">
          <div className="w-1 h-2 bg-neu-white/30 animate-bounce" />
        </div>
      </div>

      {/* Bottom fade into next section */}
      <div className="absolute bottom-0 left-0 right-0 h-24 z-[4] pointer-events-none"
           style={{ background: 'linear-gradient(to bottom, transparent, #0D0D0D)' }} />
    </section>
  );
}
