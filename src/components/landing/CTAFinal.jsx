import { useTranslation } from 'react-i18next';

export function CTAFinal({ transitionTo }) {
  const { t } = useTranslation();

  return (
    <section className="w-full bg-primary-container py-16 md:py-24 px-4 md:px-8 text-center border-b-4 border-neu-black">
      <div className="max-w-7xl mx-auto w-full">
        <h2 className="font-display text-4xl sm:text-5xl md:text-7xl font-black mb-8 md:mb-12 uppercase tracking-tighter max-w-4xl mx-auto text-neu-black leading-tight">
          {t('landing.cta.title', 'MULAI PROYEKMU SEKARANG JUGA')}
        </h2>
        <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-8">
          <button
            onClick={() => {
              const el = document.getElementById('kontak');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
              else transitionTo('/register');
            }}
            className="bg-neu-black text-primary-container font-display font-black px-8 md:px-12 py-4 md:py-6 border-4 border-neu-black rounded-xl shadow-[8px_8px_0px_0px_#0D0D0D] hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_#0D0D0D] transition-all uppercase text-lg md:text-xl btn-press cursor-pointer"
          >
            {t('landing.cta.primary', 'HUBUNGI KAMI')}
          </button>
          <button
            onClick={() => {
              const el = document.getElementById('paket');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
              else transitionTo('/login');
            }}
            className="bg-neu-white text-neu-black font-display font-black px-8 md:px-12 py-4 md:py-6 border-4 border-neu-black rounded-xl shadow-[8px_8px_0px_0px_#0D0D0D] hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_#0D0D0D] transition-all uppercase text-lg md:text-xl btn-press cursor-pointer"
          >
            {t('landing.cta.secondary', 'LIHAT PAKET')}
          </button>
        </div>
      </div>
    </section>
  );
}
