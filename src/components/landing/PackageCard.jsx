import { useTranslation } from 'react-i18next';
import { supaImg } from '../../utils/imageUrl';
import { TiltCard } from './TiltCard';

/* ─── Package Card ──────────────────────────────────────────────────── */
export function PackageCard({ pkg, onOrder }) {
  const { t, i18n } = useTranslation();
  const lang = (id, en) => i18n.language === 'en' && en ? en : id;
  const activeFeaturesText = lang(pkg.features, pkg.featuresEn);
  const featureList = activeFeaturesText
    ? activeFeaturesText.split('\n').filter(f => f.trim()).slice(0, 5)
    : [];
  const fmt = (val) => `Rp ${Number(val).toLocaleString('id-ID')}`;

  return (
    <TiltCard maxTilt={4} className="h-full">
      <div className="relative border-2 border-neu-black rounded-neu-lg shadow-neu-solid bg-neu-white flex flex-col h-full overflow-hidden transition-shadow duration-200 hover:shadow-neu-solid-lg">
        {/* Badge */}
        {pkg.badge && (
          <span className="absolute -top-3 left-4 px-3 py-0.5 bg-neu-gold border-2 border-neu-black rounded-neu-sm font-mono font-bold text-[10px] uppercase z-10">
            {pkg.badge}
          </span>
        )}

        {/* Header */}
        <div className="border-b-2 border-neu-black p-5 bg-neu-black relative">
          {/* Index label */}
          <span className="absolute top-4 right-4 font-mono text-[10px] text-neu-white/30 select-none pointer-events-none">
            {String(pkg._idx ?? 1).padStart(2, '0')}
          </span>
          <div className="flex items-center gap-3 mb-3">
            {pkg.iconUrl ? (
              <div className="w-10 h-10 border-2 border-neu-white/30 rounded-neu-sm overflow-hidden flex-shrink-0">
                <img src={supaImg(pkg.iconUrl, { width: 80 })} alt={pkg.name} width="40" height="40" className="w-full h-full object-cover" loading="lazy" decoding="async" />
              </div>
            ) : (
              <div className="w-10 h-10 border-2 border-neu-white/30 rounded-neu-sm bg-neu-white/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-neu-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                </svg>
              </div>
            )}
            <div>
              <p className="font-display font-bold text-base text-neu-white leading-tight">{lang(pkg.name, pkg.nameEn)}</p>
              {pkg.category && (
                <span className="font-mono text-[10px] text-neu-white/50 uppercase">{pkg.category}</span>
              )}
            </div>
          </div>
          <p className="font-mono font-bold text-2xl text-neu-gold tracking-tight">{fmt(pkg.price)}</p>
          {pkg.duration && (
            <p className="font-mono text-xs text-neu-white/50 mt-1">{t('landing.packages.duration')}: {lang(pkg.duration, pkg.durationEn)}</p>
          )}
        </div>

        {/* Features */}
        <div className="p-5 flex-1">
          {pkg.description && (
            <p className="font-body text-xs text-neu-black/60 mb-4 leading-relaxed">{lang(pkg.description, pkg.descriptionEn)}</p>
          )}
          {featureList.length > 0 && (
            <ul className="space-y-2">
              {featureList.map((f, i) => (
                <li key={i} className="flex items-start gap-2">
                  <div className="w-4 h-4 border-2 border-neu-black rounded-neu-sm bg-neu-gold flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-2.5 h-2.5 text-neu-black" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span className="font-body text-sm text-neu-black">{f.trim()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* CTA */}
        <div className="p-5 border-t-2 border-neu-black">
          <button
            onClick={onOrder}
            className="w-full py-2.5 bg-neu-gold border-2 border-neu-black rounded-neu-sm shadow-neu-solid-sm font-display font-bold text-sm uppercase text-neu-black transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            {t('landing.order')}
          </button>
        </div>
      </div>
    </TiltCard>
  );
}
