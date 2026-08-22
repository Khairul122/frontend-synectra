import { useTranslation } from 'react-i18next';
import { useLang } from './hooks';

export function Banners({ banners, setBannerModal, setBannerModalExp }) {
  const { t } = useTranslation();
  const lang = useLang();

  const activeBanner = (banners && banners.length > 0) ? banners[0] : null;

  const title = activeBanner ? lang(activeBanner.title, activeBanner.titleEn) : 'Jasa Pembuatan Alat IoT & Android';
  const desc = activeBanner
    ? (activeBanner.description ? activeBanner.description.replace(/<[^>]*>/g, ' ') : 'Solusi hardware & software terintegrasi untuk otomasi industri dan personal.')
    : 'Solusi hardware & software terintegrasi untuk otomasi industri dan personal.';

  return (
    <section className="w-full bg-neu-white overflow-hidden border-b-4 border-neu-black">
      <div className="flex transition-transform duration-500 ease-in-out">
        <div className="w-full max-w-7xl mx-auto shrink-0 bg-primary-container p-8 md:p-12 relative flex flex-col md:flex-row items-center gap-8 md:gap-12 md:border-x-4 border-neu-black">
          <div className="w-24 h-24 md:w-32 md:h-32 bg-neu-white border-4 border-neu-black rounded-full flex items-center justify-center shadow-[6px_6px_0px_0px_#0D0D0D] shrink-0">
            <span className="material-symbols-outlined text-4xl md:text-6xl text-neu-black font-black">
              memory
            </span>
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="bg-neu-black text-neu-white font-mono text-xs md:text-sm font-bold px-4 py-2 border-4 border-neu-black rounded-lg shadow-[4px_4px_0px_0px_#FAFAFA] inline-block mb-4 uppercase">
              {t('landing.banner.title', 'ANNOUNCEMENTS')} // RECENT_UPDATES
            </div>
            <h3 className="font-display text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tighter mb-4 text-neu-black">
              {title}
            </h3>
            <p className="font-body font-bold text-neu-black mb-6 md:mb-8 text-base md:text-xl leading-relaxed">
              {desc}
            </p>
            <button
              onClick={() => {
                if (activeBanner) {
                  setBannerModal(activeBanner);
                  setBannerModalExp(false);
                } else {
                  const contactEl = document.getElementById('kontak');
                  if (contactEl) contactEl.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="bg-neu-black text-primary-container font-display font-black text-base md:text-lg px-8 md:px-10 py-4 md:py-5 border-4 border-neu-black shadow-[6px_6px_0px_0px_#FAFAFA] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all uppercase rounded-lg btn-press cursor-pointer"
            >
              {t('landing.banner.consultNow', 'Konsultasi Sekarang')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
