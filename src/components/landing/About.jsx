import { useTranslation } from 'react-i18next';
import { Zap, Layers, Activity } from 'lucide-react';

export function About() {
  const { t } = useTranslation();

  return (
    <section className="w-full bg-neu-white py-16 md:py-20 px-4 md:px-8 border-b-4 border-neu-black">
      <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-10 md:gap-12 items-center">
        {/* Left column: Text & Vision */}
        <div className="flex-1">
          <div className="bg-neu-black text-neu-white font-mono text-xs md:text-sm font-bold px-4 py-2 border-4 border-neu-black rounded-lg shadow-[4px_4px_0px_0px_#FFD000] inline-block mb-6 transform -rotate-2 uppercase">
            {t('landing.about.tag', 'ABOUT')} // THE_FOUNDATION
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black mb-6 uppercase tracking-tighter text-neu-black">
            SYNECTRA DIGITAL LAB
          </h2>
          <p className="font-body text-base md:text-xl text-neu-black leading-relaxed font-medium">
            {t('landing.about.subtitle', 'Sebagai pionir dalam solusi digital inovatif, kami menggabungkan keahlian teknis dengan desain mutakhir. Visi kami adalah memberdayakan bisnis untuk berkembang di era digital melalui kode yang bersih, arsitektur yang kuat, dan desain yang berpusat pada pengguna.')}
          </p>
        </div>

        {/* Right column: 3 Feature highlights */}
        <div className="flex-1 flex flex-col gap-4 md:gap-6 w-full">
          <div className="flex items-center gap-4 md:gap-6 bg-primary-container border-4 border-neu-black rounded-xl p-4 md:p-6 shadow-[6px_6px_0px_0px_#0D0D0D] transform hover:translate-x-2 transition-transform">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-neu-white border-4 border-neu-black rounded-lg flex items-center justify-center shrink-0">
              <Zap className="text-neu-green w-8 h-8 md:w-9 md:h-9 stroke-[2.5]" />
            </div>
            <span className="font-mono font-black text-lg md:text-xl uppercase text-neu-black">FAST DELIVERY</span>
          </div>

          <div className="flex items-center gap-4 md:gap-6 bg-neu-purple text-neu-white border-4 border-neu-black rounded-xl p-4 md:p-6 shadow-[6px_6px_0px_0px_#0D0D0D] transform hover:translate-x-2 transition-transform">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-neu-white border-4 border-neu-black rounded-lg flex items-center justify-center shrink-0">
              <Layers className="text-neu-purple w-8 h-8 md:w-9 md:h-9 stroke-[2.5]" />
            </div>
            <span className="font-mono font-black text-lg md:text-xl uppercase">SCALABLE CODE</span>
          </div>

          <div className="flex items-center gap-4 md:gap-6 bg-surface-dim border-4 border-neu-black rounded-xl p-4 md:p-6 shadow-[6px_6px_0px_0px_#0D0D0D] transform hover:translate-x-2 transition-transform">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-neu-white border-4 border-neu-black rounded-lg flex items-center justify-center shrink-0">
              <Activity className="text-secondary-container w-8 h-8 md:w-9 md:h-9 stroke-[2.5]" />
            </div>
            <span className="font-mono font-black text-lg md:text-xl uppercase text-neu-black">24/7 MONITORING</span>
          </div>
        </div>
      </div>
    </section>
  );
}
