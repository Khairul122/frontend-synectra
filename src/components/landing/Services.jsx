import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { fadeLeft, fadeUp, STAGGER } from './animations';

const svcIcons = [
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="0"/><path d="M9 9h6M9 13h4"/></svg>,
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="0"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>,
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>,
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/></svg>,
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>,
];

export function Services({ services }) {
  const { t } = useTranslation();

  return (
    <section id="layanan" className="border-b-2 border-neu-black py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="flex items-start justify-between gap-6 mb-12 flex-wrap">
          <motion.div {...fadeLeft()}>
            <span className="font-mono text-[10px] text-neu-black/50 uppercase tracking-widest block mb-2">{t('landing.services.tag')}</span>
            <div className="h-px w-8 bg-neu-primary mb-4" />
            <h2 className="font-display font-bold text-3xl lg:text-4xl text-neu-black max-w-md leading-tight">{t('landing.services.title').split('\n').map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}</h2>
          </motion.div>
          <motion.p {...fadeUp(0.1)} className="font-mono text-[10px] text-neu-black/30 uppercase tracking-widest self-end hidden lg:block">
            — {services.length} {t('landing.services.tag').toLowerCase()}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-2 border-neu-black rounded-neu overflow-hidden">
          {services.map((svc, i) => (
            <motion.div
              key={svc.title}
              {...fadeUp(Math.min(i * STAGGER, 0.42))}
              className={cn(
                'relative p-7 lg:p-8 group border-b-2 border-r-0 sm:border-r-2 border-neu-black transition-colors duration-150 hover:bg-neu-bg',
                // Remove right border on last item of each row
                (i + 1) % 3 === 0 ? 'lg:border-r-0' : '',
                (i + 1) % 2 === 0 ? 'sm:border-r-0 lg:border-r-2' : '',
                // Last two rows: drop bottom border so the wrapper border closes cleanly
                i >= services.length - (services.length % 3 === 0 ? 3 : services.length % 3) ? 'lg:border-b-0' : '',
              )}
            >
              {/* Index number */}
              <span className="absolute top-5 right-5 font-mono text-xs font-bold text-neu-black/20">
                {String(i + 1).padStart(2, '0')}
              </span>

              <div className="w-10 h-10 border-2 border-neu-black rounded-neu-sm bg-neu-primary text-neu-black flex items-center justify-center mb-5">
                {svcIcons[i % svcIcons.length]}
              </div>

              <h3 className="font-display font-bold text-base text-neu-black mb-2">{svc.title}</h3>
              <p className="font-body text-sm leading-relaxed text-neu-black/55">{svc.desc}</p>

              <div className="mt-5 h-px w-full bg-neu-primary origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
