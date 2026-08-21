import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { fadeUp, STAGGER } from './animations';
import { SectionTag } from './helpers';

const ICON_BG = ['bg-neu-purple text-neu-white', 'bg-neu-green text-neu-black', 'bg-neu-accent text-neu-black', 'bg-neu-primary text-neu-black'];
const ICONS = [
  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>,
  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" /></svg>,
  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>,
  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.5 0-3 1-3 3s1.5 3 3 5c1.5-2 3-3.5 3-5s-1.5-3-3-3z" /><path strokeLinecap="round" d="M12 2v2M12 20v2M2 12h2M20 12h2" /></svg>,
  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.42A12.083 12.083 0 0112 21a12.083 12.083 0 01-6.16-10.42L12 14z" /></svg>,
];

export function WhyChooseUs() {
  const { t } = useTranslation();
  const items = t('landing.why.items', { returnObjects: true });

  return (
    <section className="module-card max-w-7xl mx-auto w-full bg-neu-black">
      {/* Static value-prop strip */}
      <div className="bg-neu-primary border-b-4 border-neu-black py-3 px-6 lg:px-12">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {items.map((w, i) => (
            <span key={w.title} className="inline-flex items-center gap-6 font-mono font-black text-[11px] uppercase tracking-widest text-neu-black">
              {i > 0 && <span className="text-neu-black/30">/</span>}
              {w.title}
            </span>
          ))}
        </div>
      </div>

      <div className="p-6 sm:p-8 lg:p-12">
        <motion.div className="flex justify-center mb-12" {...fadeUp()}>
          <SectionTag tone="primary" rotate="rotate-1">{t('landing.why.title')}</SectionTag>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((w, i) => (
            <motion.div
              key={w.title}
              {...fadeUp(Math.min(i * STAGGER, 0.42))}
              className="bg-neu-white border-4 border-neu-black rounded-neu-lg p-7 shadow-neu-solid-lg hover:-translate-y-2 transition-transform duration-200"
            >
              <div className={`w-14 h-14 border-4 border-neu-black rounded-neu-lg flex items-center justify-center mb-5 ${ICON_BG[i % ICON_BG.length]}`}>
                {ICONS[i % ICONS.length]}
              </div>
              <h3 className="font-display font-black text-lg text-neu-black mb-2 uppercase">{w.title}</h3>
              <p className="font-body text-sm text-neu-black/60 leading-relaxed font-medium">{w.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
