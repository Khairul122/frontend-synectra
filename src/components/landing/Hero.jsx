import { useTranslation } from 'react-i18next';

export function Hero({ transitionTo, scrollTo, portfolioRef }) {
  const { t } = useTranslation();

  return (
    <section className="w-full bg-neu-white py-16 md:py-24 px-4 md:px-8 flex flex-col items-center z-20 border-b-4 border-neu-black">
      <div className="w-full max-w-7xl mx-auto flex flex-col items-center relative">
        {/* Minimal Top Label as floating 3D panel */}
        <div className="font-mono text-sm md:text-base uppercase tracking-widest border-4 border-neu-black px-6 py-3 bg-primary-container mb-8 md:mb-12 deep-shadow transform rotate-x-12 rotate-y-[-5deg] floating-3d font-black hover:rotate-0 transition-transform duration-500 cursor-crosshair rounded-lg text-neu-black">
          [ {t('landing.hero.badge', 'Platform Jasa Digital Terpercaya').replace(/[✦[\]]/g, '').trim()} ]
        </div>

        {/* Massive Breaking Grid Headline */}
        <h1 className="font-display text-[clamp(3.2rem,9.5vw,9.5rem)] leading-[0.9] font-black text-center uppercase tracking-tighter w-full max-w-none relative z-20 break-words hyphens-auto preserve-3d mb-12 md:mb-16">
          <span className="inline-block transform hover:translate-z-20 hover:-translate-y-4 transition-transform duration-300 drop-shadow-[6px_6px_0px_#0D0D0D] text-neu-white mr-3">
            {t('landing.hero.title1', 'IDE')}
          </span>
          <span className="inline-block transform hover:translate-z-20 hover:-translate-y-4 transition-transform duration-300 drop-shadow-[6px_6px_0px_#0D0D0D] text-neu-green">
            {t('landing.hero.title2', 'DIGITAL')}
          </span>
          <br />
          <div className="relative inline-block mt-2 preserve-3d">
            <span className="absolute inset-0 text-neu-black translate-x-3 translate-y-3 z-[-1]">
              {t('landing.hero.title3', 'REALITA')}
            </span>
            <span
              className="relative text-transparent bg-clip-text bg-gradient-to-r from-neu-purple to-secondary-container"
              style={{ WebkitTextStroke: '6px rgb(13, 13, 13)' }}
            >
              {t('landing.hero.title3', 'REALITA')}
            </span>
          </div>
        </h1>

        {/* Content Row */}
        <div className="flex flex-col md:flex-row justify-center items-center w-full max-w-5xl gap-8 md:gap-12 preserve-3d mt-4 md:mt-8">
          <div className="bg-surface-dim p-6 md:p-8 border-4 border-neu-black deep-shadow transform -rotate-1 hover:rotate-1 transition-all duration-300 z-10 rounded-lg max-w-2xl">
            <p className="font-mono text-base sm:text-lg md:text-xl text-neu-black leading-relaxed font-bold">
              {t('landing.hero.subtitle', 'Kami membangun website, aplikasi mobile, dan identitas digital dengan standar tinggi. Desain presisi, performa tinggi, hasil nyata.')}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 z-20 transform translate-z-10 w-full sm:w-auto">
            <button
              onClick={() => transitionTo('/register')}
              className="w-full sm:w-auto font-display text-lg md:text-xl uppercase font-black text-neu-black bg-primary-container px-8 md:px-12 py-5 md:py-6 border-4 border-neu-black deep-shadow rounded-lg btn-press flex items-center justify-center gap-4 group cursor-pointer"
            >
              {t('landing.hero.cta', 'MULAI PROYEK')}
              <span className="material-symbols-outlined text-3xl md:text-4xl font-black group-hover:translate-x-3 transition-transform">
                arrow_forward
              </span>
            </button>
          </div>
        </div>

        {/* Abstract Badges / Stickers 3D */}
        <div className="absolute top-[15%] left-[6%] z-30 transform -rotate-6 translate-z-30 floating-3d cursor-pointer hidden lg:block">
          <div className="bg-neu-purple text-neu-white border-4 border-neu-black px-6 py-4 rounded-xl font-mono text-xl uppercase font-black deep-shadow-sm hover:scale-110 transition-transform">
            WEB.DEV
          </div>
        </div>
        <div
          className="absolute top-[35%] right-[6%] z-30 transform rotate-12 translate-z-20 floating-3d cursor-pointer hidden lg:block"
          style={{ animationDelay: '-3s' }}
        >
          <div className="bg-secondary-container text-neu-black border-4 border-neu-black px-6 py-4 rounded-[20%_80%_80%_20%/20%_20%_80%_80%] font-mono text-xl uppercase font-black deep-shadow-sm hover:rounded-xl transition-all duration-500">
            * UI/UX *
          </div>
        </div>
      </div>
    </section>
  );
}
