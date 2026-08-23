import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getPlatform } from '../../constants/platforms';
import { useLang } from './hooks';

export function Footer({ socialMedia, services, transitionTo }) {
  const { t } = useTranslation();
  const lang = useLang();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSent, setNewsletterSent] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterSent(true);
    setNewsletterEmail('');
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const defaultServices = [
    { title: 'Web Development', id: 'layanan' },
    { title: 'Mobile App', id: 'layanan' },
    { title: 'UI/UX Design', id: 'layanan' },
    { title: 'Backend & API', id: 'layanan' },
    { title: 'Data Science', id: 'layanan' },
    { title: 'Joki Tugas', id: 'paket' },
  ];

  return (
    <footer className="w-full bg-neu-black text-neu-white py-12 md:py-16 px-4 md:px-8 select-none">
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-12">
          {/* Column 1: Brand */}
          <div className="flex flex-col gap-6">
            <div className="font-display text-3xl md:text-4xl font-black text-primary-container tracking-tighter uppercase">
              Synectra
            </div>
            <p className="text-[#D4D4D8] text-sm leading-relaxed font-body font-medium">
              {t('landing.footer.desc', 'Platform jasa digital terpercaya untuk website, mobile app, UI/UX, dan pengerjaan tugas akademik.')}
            </p>
            <div className="inline-flex items-center gap-2 bg-neu-green/10 text-neu-green border-2 border-neu-green px-3 py-1 rounded-full text-xs font-bold w-fit">
              <span className="w-2 h-2 bg-neu-green rounded-full animate-pulse" />
              Tersedia untuk Project Baru
            </div>
            <div className="flex gap-3">
              {(socialMedia && socialMedia.length > 0) ? (
                socialMedia.slice(0, 4).map((s) => {
                  const { Icon } = getPlatform(s.icon ?? s.platformName?.toLowerCase());
                  return (
                    <a
                      key={s.id}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-11 h-11 border-4 border-neu-white rounded-lg flex items-center justify-center hover:bg-primary-container hover:border-neu-black hover:text-neu-black transition-all group cursor-pointer"
                    >
                      <Icon className="w-5 h-5 text-neu-white group-hover:text-neu-black transition-colors" />
                    </a>
                  );
                })
              ) : (
                <>
                  <a
                    href="https://github.com/synectra"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 border-4 border-neu-white rounded-lg flex items-center justify-center hover:bg-primary-container hover:border-neu-black hover:text-neu-black transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-2xl font-bold">code</span>
                  </a>
                  <a
                    href="#kontak"
                    className="w-11 h-11 border-4 border-neu-white rounded-lg flex items-center justify-center hover:bg-primary-container hover:border-neu-black hover:text-neu-black transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-2xl font-bold">person</span>
                  </a>
                  <a
                    href="#portofolio"
                    className="w-11 h-11 border-4 border-neu-white rounded-lg flex items-center justify-center hover:bg-primary-container hover:border-neu-black hover:text-neu-black transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-2xl font-bold">photo_camera</span>
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Column 2: Layanan */}
          <div className="flex flex-col gap-5">
            <h5 className="font-display text-primary-container font-black uppercase tracking-widest text-base md:text-lg">
              LAYANAN
            </h5>
            <nav className="flex flex-col gap-3.5">
              {(services && services.length > 0) ? (
                services.slice(0, 6).map((svc) => (
                  <button
                    key={svc.id}
                    onClick={() => scrollToSection('layanan')}
                    className="text-[#D4D4D8] text-sm font-bold hover:text-primary-container transition-colors text-left cursor-pointer"
                  >
                    {lang(svc.title, svc.titleEn)}
                  </button>
                ))
              ) : (
                defaultServices.map((ds, i) => (
                  <button
                    key={i}
                    onClick={() => scrollToSection(ds.id)}
                    className="text-[#D4D4D8] text-sm font-bold hover:text-primary-container transition-colors text-left cursor-pointer"
                  >
                    {ds.title}
                  </button>
                ))
              )}
            </nav>
          </div>

          {/* Column 3: Perusahaan */}
          <div className="flex flex-col gap-5">
            <h5 className="font-display text-primary-container font-black uppercase tracking-widest text-base md:text-lg">
              PERUSAHAAN
            </h5>
            <nav className="flex flex-col gap-3.5">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-[#D4D4D8] text-sm font-bold hover:text-primary-container transition-colors text-left cursor-pointer"
              >
                Beranda
              </button>
              <button
                onClick={() => scrollToSection('portofolio')}
                className="text-[#D4D4D8] text-sm font-bold hover:text-primary-container transition-colors text-left cursor-pointer"
              >
                Portofolio
              </button>
              <button
                onClick={() => scrollToSection('cara-kerja')}
                className="text-[#D4D4D8] text-sm font-bold hover:text-primary-container transition-colors text-left cursor-pointer"
              >
                Cara Kerja
              </button>
              <button
                onClick={() => scrollToSection('paket')}
                className="text-[#D4D4D8] text-sm font-bold hover:text-primary-container transition-colors text-left cursor-pointer"
              >
                Harga & Paket
              </button>
            </nav>
          </div>

          {/* Column 4: Newsletter */}
          <div className="flex flex-col gap-5">
            <h5 className="font-display text-primary-container font-black uppercase tracking-widest text-base md:text-lg">
              NEWSLETTER
            </h5>
            <p className="text-[#D4D4D8] text-sm font-bold">
              Dapatkan update terbaru mengenai promo dan teknologi.
            </p>
            {newsletterSent ? (
              <div className="bg-primary-container text-neu-black p-4 rounded-lg font-display font-black text-sm text-center">
                Terima kasih telah berlangganan!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
                <input
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="bg-neu-white text-neu-black border-4 border-neu-white rounded-lg px-4 py-2.5 font-bold focus:outline-none focus:border-primary-container text-sm"
                  placeholder="Email Anda"
                  type="email"
                />
                <button
                  type="submit"
                  className="bg-primary-container text-neu-black font-display font-black py-3 border-4 border-primary-container rounded-lg shadow-[4px_4px_0px_0px_#FAFAFA] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all uppercase text-sm btn-press cursor-pointer"
                >
                  Berlangganan
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t-4 border-neu-white/20 pt-8 flex justify-center items-center">
          <p className="font-mono font-bold text-xs md:text-sm text-[#D4D4D8] text-center">
            © 2026 Synectra. Semua hak dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
}
