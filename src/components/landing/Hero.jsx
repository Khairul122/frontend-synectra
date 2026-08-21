import { useTranslation } from 'react-i18next';
import { HeroReveal } from './helpers';
import { TactileButton } from './TactileButton';

export function Hero({ transitionTo, scrollTo, portfolioRef }) {
  const { t } = useTranslation();

  return (
    <section className="module-card max-w-7xl mx-auto w-full bg-neu-white pt-16 lg:pt-24 pb-16 lg:pb-20 px-6 lg:px-12 flex flex-col items-center">

      {/* Badge mono-label */}
      <div className="hero-badge font-mono text-xs sm:text-sm uppercase tracking-widest border-4 border-neu-black px-5 sm:px-6 py-2.5 sm:py-3 bg-neu-primary mb-10 lg:mb-14 font-black rounded-neu-sm shadow-neu-module-sm"
           style={{ opacity: 0 }}>
        [ {t('landing.hero.badge').replace('✦ ', '').replace('✦', '')} ]
      </div>

      {/* Headline raksasa, breaking grid */}
      <h1 className="font-display text-[clamp(2.75rem,9vw,7rem)] leading-[0.92] font-black text-center uppercase tracking-tighter w-full max-w-4xl relative z-20 mb-12 lg:mb-16">
        <HeroReveal delay={0.1}>
          <span className="block drop-shadow-[4px_4px_0px_rgba(13,13,13,0.15)] text-neu-black">{t('landing.hero.title1')}</span>
        </HeroReveal>
        <HeroReveal delay={0.3}>
          <span className="block text-neu-green drop-shadow-[4px_4px_0px_#0D0D0D]">{t('landing.hero.title2')}</span>
        </HeroReveal>
        <HeroReveal delay={0.5}>
          <span className="relative inline-block mt-1">
            <span className="absolute inset-0 text-neu-black translate-x-2 translate-y-2 -z-10">{t('landing.hero.title3')}</span>
            <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-neu-purple to-neu-accent" style={{ WebkitTextStroke: '2px #0D0D0D' }}>
              {t('landing.hero.title3')}
            </span>
          </span>
        </HeroReveal>
      </h1>

      {/* Paragraf + CTA */}
      <div className="hero-cta flex flex-col md:flex-row justify-center items-center w-full max-w-4xl gap-6 lg:gap-10" style={{ opacity: 0 }}>
        <div className="hero-subtitle bg-neu-bg p-6 lg:p-7 border-4 border-neu-black shadow-neu-solid-lg rounded-neu-lg max-w-xl">
          <p className="font-mono text-sm sm:text-base text-neu-black leading-relaxed font-bold">
            {t('landing.hero.subtitle')}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <TactileButton variant="gold" className="!px-8 !py-4 !text-base whitespace-nowrap" onClick={() => transitionTo('/register')}>
            {t('landing.hero.cta')}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 5l7 7-7 7" /></svg>
          </TactileButton>
          <TactileButton variant="ghost" className="!px-6 !py-4 whitespace-nowrap" onClick={() => scrollTo(portfolioRef)}>
            {t('landing.hero.ctaSecondary')}
          </TactileButton>
        </div>
      </div>

      {/* Badge sticker mengambang */}
      <div className="hidden lg:block absolute top-[14%] left-[4%] z-30 -rotate-6 animate-float-badge" style={{ '--float-rot': '-6deg' }}>
        <div className="bg-neu-purple text-neu-white border-4 border-neu-black px-5 py-3 rounded-neu-lg font-mono text-base uppercase font-black shadow-neu-module-sm">
          WEB.DEV
        </div>
      </div>
      <div className="hidden lg:block absolute bottom-[10%] right-[4%] z-30 rotate-6 animate-float-badge" style={{ '--float-rot': '8deg', animationDelay: '-2.5s' }}>
        <div className="bg-neu-accent text-neu-black border-4 border-neu-black px-5 py-3 rounded-neu-lg font-mono text-base uppercase font-black shadow-neu-module-sm">
          UI/UX
        </div>
      </div>
    </section>
  );
}
