import { useTranslation } from 'react-i18next';
import { supaImg } from '../../utils/imageUrl';
import { TiltCard } from './TiltCard';

const ICON_BG = ['bg-neu-green', 'bg-neu-primary', 'bg-neu-purple', 'bg-neu-accent'];

/* ─── Package Card ──────────────────────────────────────────────────── */
export function PackageCard({ pkg, onOrder }) {
  const { t, i18n } = useTranslation();
  const lang = (id, en) => i18n.language === 'en' && en ? en : id;
  const activeFeaturesText = lang(pkg.features, pkg.featuresEn);
  const featureList = activeFeaturesText
    ? activeFeaturesText.split('\n').filter(f => f.trim()).slice(0, 5)
    : [];
  const fmt = (val) => `Rp ${Number(val).toLocaleString('id-ID')}`;
  const featured = Boolean(pkg.badge);
  const iconBg = ICON_BG[((pkg._idx ?? 1) - 1) % ICON_BG.length];

  return (
    <TiltCard maxTilt={4} className="h-full">
      <div className={`relative border-4 border-neu-black rounded-neu-lg shadow-neu-solid-lg flex flex-col h-full overflow-hidden transition-transform duration-200 hover:-translate-y-2 ${featured ? 'bg-neu-black' : 'bg-neu-white'}`}>
        {/* Badge */}
        {pkg.badge && (
          <span className="absolute -top-4 left-5 px-4 py-1.5 bg-neu-primary border-4 border-neu-black rounded-neu-sm font-mono font-black text-xs uppercase z-10 -rotate-2 shadow-neu-solid-sm">
            {pkg.badge}
          </span>
        )}
        <span className={`absolute top-4 right-5 font-mono text-xs font-black z-10 ${featured ? 'text-neu-white/40' : 'text-neu-black/25'}`}>
          {String(pkg._idx ?? 1).padStart(2, '0')}
        </span>

        {/* Header */}
        <div className={`p-6 border-b-4 border-neu-black ${featured ? 'border-b-neu-white/15' : ''}`}>
          <div className={`w-14 h-14 border-4 border-neu-black rounded-neu-lg flex items-center justify-center mb-5 shadow-neu-solid-sm ${iconBg}`}>
            {pkg.iconUrl ? (
              <img src={supaImg(pkg.iconUrl, { width: 80 })} alt={pkg.name} width="32" height="32" className="w-8 h-8 object-cover rounded" loading="lazy" decoding="async" />
            ) : (
              <svg className="w-6 h-6 text-neu-black" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              </svg>
            )}
          </div>
          <p className={`font-display font-black text-xl uppercase tracking-tight mb-1 ${featured ? 'text-neu-white' : 'text-neu-black'}`}>{lang(pkg.name, pkg.nameEn)}</p>
          {pkg.category && (
            <span className={`font-mono text-xs font-bold uppercase tracking-widest ${featured ? 'text-neu-primary' : 'text-neu-black/50'}`}>{pkg.category}</span>
          )}
          <p className={`font-display font-black text-3xl tracking-tighter mt-3 ${featured ? 'text-neu-primary' : 'text-neu-black'}`}>{fmt(pkg.price)}</p>
          {pkg.duration && (
            <p className={`font-mono text-xs mt-1 ${featured ? 'text-neu-white/50' : 'text-neu-black/40'}`}>{t('landing.packages.duration')}: {lang(pkg.duration, pkg.durationEn)}</p>
          )}
        </div>

        {/* Features */}
        <div className="p-6 flex-1">
          {pkg.description && (
            <p className={`font-body text-xs mb-4 leading-relaxed font-medium ${featured ? 'text-neu-white/70' : 'text-neu-black/60'}`}>{lang(pkg.description, pkg.descriptionEn)}</p>
          )}
          {featureList.length > 0 && (
            <ul className="space-y-3">
              {featureList.map((f, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <div className="w-5 h-5 border-2 border-neu-black rounded-neu-sm bg-neu-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-neu-black" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span className={`font-body text-sm font-medium ${featured ? 'text-neu-white/90' : 'text-neu-black'}`}>{f.trim()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* CTA */}
        <button
          onClick={onOrder}
          className={`w-full py-4 border-t-4 border-neu-black font-display font-black text-sm uppercase transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] ${featured ? 'bg-neu-primary text-neu-black border-t-neu-white/15' : 'bg-neu-black text-neu-white'}`}
        >
          {t('landing.order')}
        </button>
      </div>
    </TiltCard>
  );
}
