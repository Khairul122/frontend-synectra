import { useTranslation } from 'react-i18next';

export function PackageCard({ pkg, onOrder }) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  const name = isEn && pkg.nameEn ? pkg.nameEn : pkg.name;
  const description = isEn && pkg.descriptionEn ? pkg.descriptionEn : pkg.description;
  const duration = isEn && pkg.durationEn ? pkg.durationEn : pkg.duration;
  const featuresText = isEn && pkg.featuresEn ? pkg.featuresEn : pkg.features;

  const featureList = featuresText
    ? (Array.isArray(featuresText) ? featuresText : featuresText.split('\n')).filter(f => f && f.trim()).slice(0, 5)
    : [];

  const fmt = (val) => `Rp ${Number(val).toLocaleString('id-ID')}`;
  const idxStr = String(pkg._idx || 1).padStart(2, '0');
  const isFeatured = pkg.isFeatured || pkg._idx === 2 || pkg.badge === 'TERLARIS';
  const isPopular = pkg.badge === 'POPULER' || pkg._idx === 4;

  const category = (pkg.category || 'WEB').toUpperCase();
  const icon = pkg.icon || (idxStr === '01' ? 'web' : idxStr === '02' ? 'domain' : idxStr === '03' ? 'smartphone' : 'school');

  // Accent color styles per card type
  const theme = isFeatured
    ? {
        cardBg: 'bg-neu-black text-neu-white',
        border: 'border-neu-black',
        shadow: 'shadow-[12px_12px_0px_0px_#0D0D0D]',
        headerBorder: 'border-b-4 border-neu-black',
        iconBg: 'bg-primary-container',
        iconColor: 'text-neu-black',
        catColor: 'text-primary-container',
        priceColor: 'text-primary-container',
        durColor: 'text-surface-dim',
        bodyBg: 'bg-neu-black text-neu-white',
        checkColor: 'text-primary-container',
        btnBg: 'bg-primary-container text-neu-black hover:bg-neu-white',
      }
    : idxStr === '03'
    ? {
        cardBg: 'bg-neu-white',
        border: 'border-neu-black',
        shadow: 'shadow-[8px_8px_0px_0px_#0D0D0D]',
        headerBorder: 'border-b-4 border-neu-black',
        iconBg: 'bg-neu-purple',
        iconColor: 'text-neu-white',
        catColor: 'text-neu-purple',
        priceColor: 'text-neu-black',
        durColor: 'text-outline-variant',
        bodyBg: 'bg-surface-bright',
        checkColor: 'text-neu-purple',
        btnBg: 'bg-neu-purple text-neu-white hover:bg-neu-black hover:text-neu-purple',
      }
    : isPopular || idxStr === '04'
    ? {
        cardBg: 'bg-neu-white',
        border: 'border-neu-black',
        shadow: 'shadow-[8px_8px_0px_0px_#0D0D0D]',
        headerBorder: 'border-b-4 border-neu-black',
        iconBg: 'bg-secondary-container',
        iconColor: 'text-neu-black',
        catColor: 'text-secondary-container',
        priceColor: 'text-neu-black',
        durColor: 'text-outline-variant',
        bodyBg: 'bg-surface-bright',
        checkColor: 'text-secondary-container',
        btnBg: 'bg-secondary-container text-neu-black hover:bg-neu-black hover:text-secondary-container',
      }
    : {
        cardBg: 'bg-neu-white',
        border: 'border-neu-black',
        shadow: 'shadow-[8px_8px_0px_0px_#0D0D0D]',
        headerBorder: 'border-b-4 border-neu-black',
        iconBg: 'bg-neu-green',
        iconColor: 'text-neu-black',
        catColor: 'text-neu-green',
        priceColor: 'text-neu-black',
        durColor: 'text-outline-variant',
        bodyBg: 'bg-surface-bright',
        checkColor: 'text-neu-green',
        btnBg: 'bg-neu-green text-neu-black hover:bg-neu-black hover:text-neu-green',
      };

  return (
    <div
      className={`${theme.cardBg} border-4 ${theme.border} rounded-xl ${theme.shadow} flex flex-col relative h-full group hover:-translate-y-2 transition-transform select-none ${isFeatured ? 'md:-translate-y-4 z-10' : ''}`}
    >
      {/* Top Badges */}
      {pkg.badge ? (
        <div
          className={`absolute -top-5 left-6 ${isFeatured ? 'bg-primary-container text-neu-black shadow-[4px_4px_0px_0px_#0D0D0D] rotate-3' : 'bg-secondary-container text-neu-black shadow-[4px_4px_0px_0px_#0D0D0D] -rotate-2'} border-4 border-neu-black px-4 py-1.5 font-mono font-black text-xs uppercase rounded-md z-20`}
        >
          {pkg.badge}
        </div>
      ) : null}

      <div
        className={`absolute -top-4 ${pkg.badge ? 'right-6' : 'left-6'} ${isFeatured ? 'bg-neu-white text-neu-black' : 'bg-neu-black text-neu-white'} border-4 border-neu-black px-4 py-1 font-mono font-black text-xs uppercase rounded-md z-20`}
      >
        {idxStr}
      </div>

      {/* Header Info */}
      <div className={`p-6 md:p-8 ${theme.headerBorder}`}>
        <div className={`w-14 h-14 md:w-16 md:h-16 ${theme.iconBg} border-4 border-neu-black rounded-xl flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_#0D0D0D]`}>
          <span className={`material-symbols-outlined ${theme.iconColor} font-black text-2xl md:text-3xl`}>
            {icon}
          </span>
        </div>
        <h3 title={name} className={`font-display text-xl md:text-2xl font-black uppercase tracking-tight mb-2 break-words line-clamp-2 ${isFeatured ? 'text-neu-white' : 'text-neu-black'}`}>
          {name}
        </h3>
        <p className={`${theme.catColor} text-xs md:text-sm font-bold uppercase tracking-widest mb-4 font-mono`}>
          {category}
        </p>
        <div className={`${theme.priceColor} font-display text-3xl md:text-4xl font-black tracking-tighter`}>
          {fmt(pkg.price)}
        </div>
        {duration && (
          <p className={`${theme.durColor} text-xs md:text-sm font-bold mt-2 truncate`}>
            {t('landing.packages.duration', 'Durasi')}: {duration}
          </p>
        )}
      </div>

      {/* Body Features */}
      <div className={`p-6 md:p-8 flex-1 ${theme.bodyBg}`}>
        {description && (
          <p title={description} className={`font-body text-sm ${isFeatured ? 'opacity-90' : 'text-neu-black'} font-medium mb-6 leading-relaxed break-words line-clamp-3`}>
            {description}
          </p>
        )}
        {featureList.length > 0 && (
          <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8">
            {featureList.map((f, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className={`material-symbols-outlined ${theme.checkColor} font-black text-xl shrink-0 mt-0.5`}>
                  check_box
                </span>
                <span className="font-body text-xs md:text-sm font-bold leading-snug break-words">
                  {f}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* CTA Button */}
      <button
        onClick={onOrder}
        className={`w-full ${theme.btnBg} font-display font-black text-base md:text-lg py-4 md:py-5 border-t-4 border-neu-black rounded-b-lg transition-colors uppercase btn-press cursor-pointer`}
      >
        {t('landing.order', 'PESAN SEKARANG')}
      </button>
    </div>
  );
}
