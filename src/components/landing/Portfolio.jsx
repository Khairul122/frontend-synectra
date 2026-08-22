import { useTranslation } from 'react-i18next';
import { supaImg } from '../../utils/imageUrl';
import { useLang } from './hooks';
import { ErrorState } from './ErrorState';

const DEFAULT_PORTFOLIOS = [
  {
    id: 'port-1',
    title: 'PLN GridRisk',
    titleEn: 'PLN GridRisk',
    category: 'REACT',
    categorySecondary: 'PYTHON',
    iconBg: 'bg-primary-container',
    iconRot: '-rotate-6',
    hoverBtnColor: 'hover:bg-primary-container hover:text-neu-black',
    bgIcon: 'bolt',
    description: 'Predictive grid maintenance system using machine learning for power stability.',
    descriptionEn: 'Predictive grid maintenance system using machine learning for power stability.',
    tags: ['REACT', 'PYTHON'],
  },
  {
    id: 'port-2',
    title: 'Sistem Prediksi Jalan Rusak',
    titleEn: 'RoadDetect AI',
    cardBadgeTitle: 'RoadDetect AI',
    category: 'CNN',
    categorySecondary: 'TENSORFLOW',
    iconBg: 'bg-neu-green',
    iconRot: 'rotate-3',
    hoverBtnColor: 'hover:bg-neu-green hover:text-neu-black',
    bgIcon: 'add_road',
    description: 'CNN-based road damage detection system for automated infrastructure monitoring.',
    descriptionEn: 'CNN-based road damage detection system for automated infrastructure monitoring.',
    tags: ['CNN', 'TENSORFLOW'],
  },
  {
    id: 'port-3',
    title: 'Forecasting Stok Pangan',
    titleEn: 'FoodForecast',
    cardBadgeTitle: 'FoodForecast',
    category: 'LSTM',
    categorySecondary: 'PYTORCH',
    iconBg: 'bg-secondary-container',
    iconRot: '-rotate-3',
    hoverBtnColor: 'hover:bg-secondary-container hover:text-neu-black',
    bgIcon: 'inventory_2',
    description: 'LSTM-based food stock forecasting to optimize supply chain and reduce waste.',
    descriptionEn: 'LSTM-based food stock forecasting to optimize supply chain and reduce waste.',
    tags: ['LSTM', 'PYTORCH'],
  },
];

export function Portfolio({ portfolios, isLoading, error, portfolioRef, setActivePortfolio, transitionTo }) {
  const { t } = useTranslation();
  const lang = useLang();

  const displayList = (!isLoading && portfolios && portfolios.length > 0)
    ? portfolios
    : DEFAULT_PORTFOLIOS;

  return (
    <section id="portofolio" ref={portfolioRef} className="w-full bg-neu-white py-16 md:py-20 px-4 md:px-8 border-b-4 border-neu-black">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header Tag */}
        <div className="flex justify-center mb-10 md:mb-12">
          <div className="bg-neu-black text-neu-white font-mono text-base md:text-xl font-bold px-6 md:px-8 py-3 border-4 border-neu-black rounded-lg shadow-[8px_8px_0px_0px_#A855F7] transform -rotate-2 uppercase tracking-wide">
            {t('landing.portfolio.tag', 'PORTFOLIO')} // SELECTED_WORKS
          </div>
        </div>

        {error ? (
          <ErrorState message="Gagal memuat portofolio." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {displayList.map((item, i) => {
              const fallback = DEFAULT_PORTFOLIOS[i % DEFAULT_PORTFOLIOS.length];
              const title = lang(item.title, item.titleEn);
              const desc = lang(item.description, item.descriptionEn) || fallback.description;
              const imgs = item.images?.length ? item.images : (item.image ? [item.image] : []);
              const tags = item.techStack ? item.techStack.split('\n').filter(Boolean) : (item.tags || fallback.tags);
              const badgeTitle = item.cardBadgeTitle || title;
              const bgIcon = item.bgIcon || fallback.bgIcon;
              const iconBg = item.iconBg || fallback.iconBg;
              const iconRot = item.iconRot || fallback.iconRot;
              const hoverBtnColor = item.hoverBtnColor || fallback.hoverBtnColor;

              return (
                <div
                  key={item.id}
                  className="bg-neu-black border-4 border-neu-black rounded-xl shadow-[12px_12px_0px_0px_#0D0D0D] overflow-hidden flex flex-col group hover:-translate-y-4 transition-transform duration-300"
                >
                  {/* Top Visual Box with 3D Center Pill */}
                  <div className="h-56 md:h-64 bg-surface-dim flex items-center justify-center relative overflow-hidden border-b-4 border-neu-black">
                    {imgs[0] ? (
                      <img
                        src={supaImg(imgs[0], { width: 800 })}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <span className="material-symbols-outlined text-8xl md:text-9xl text-neu-black opacity-10 select-none">
                        {bgIcon}
                      </span>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-neu-black/10">
                      <div className={`${iconBg} border-4 border-neu-black px-5 md:px-6 py-2.5 md:py-3 rounded-lg font-display font-black text-xl md:text-2xl transform ${iconRot} shadow-[6px_6px_0px_0px_#0D0D0D] text-neu-black max-w-[85%] text-center truncate`}>
                        {badgeTitle}
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 md:p-8 bg-neu-white flex-1 flex flex-col">
                    <div className="flex flex-wrap gap-2 md:gap-3 mb-4 md:mb-6">
                      {tags.slice(0, 2).map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className={`${tIdx === 0 ? 'bg-neu-green text-neu-black' : 'bg-neu-purple text-neu-white'} border-4 border-neu-black px-3 py-1 rounded-md font-mono text-xs font-black uppercase`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="font-display text-xl md:text-2xl font-black mb-3 md:mb-4 uppercase text-neu-black">
                      {title}
                    </h3>
                    <p className="font-body text-sm md:text-base text-neu-black mb-6 md:mb-8 flex-1 font-medium leading-relaxed">
                      {desc}
                    </p>
                    <button
                      onClick={() => {
                        if (item.images || item.image || item.client) {
                          setActivePortfolio(item);
                        } else {
                          transitionTo('/register');
                        }
                      }}
                      className={`w-full bg-neu-black text-neu-white font-display font-black py-3.5 md:py-4 rounded-lg border-4 border-neu-black ${hoverBtnColor} transition-colors uppercase btn-press cursor-pointer text-sm md:text-base`}
                    >
                      {t('landing.portfolio.viewStudy', 'VIEW CASE STUDY')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
