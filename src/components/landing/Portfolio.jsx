import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supaImg } from '../../utils/imageUrl';
import { useLang } from './hooks';
import { ErrorState } from './ErrorState';

function stripHtml(html) {
  if (!html) return '';
  // Replace block tags with space so words don't get glued together
  const withSpaces = html.replace(/<\/(p|div|h[1-6]|li|tr)>/gi, ' ');
  // Strip all HTML tags
  const clean = withSpaces.replace(/<[^>]*>/g, ' ');
  // Decode common HTML entities
  const decoded = clean
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
  // Collapse whitespace
  return decoded.replace(/\s+/g, ' ').trim();
}

const DEFAULT_PORTFOLIOS = [
  {
    id: 'port-1',
    title: 'PLN GridRisk — Sistem Prediksi Risiko Jaringan Distribusi',
    titleEn: 'PLN GridRisk',
    category: 'REACT',
    categorySecondary: 'PYTHON',
    hoverBtnColor: 'hover:bg-primary-container hover:text-neu-black',
    bgIcon: 'bolt',
    description: 'PLN GridRisk adalah aplikasi berbasis web yang dirancang untuk predictive grid maintenance system menggunakan machine learning guna menjaga stabilitas daya listrik.',
    descriptionEn: 'Predictive grid maintenance system using machine learning for power stability.',
    tags: ['REACT', 'PYTHON'],
  },
  {
    id: 'port-2',
    title: 'Sistem Informasi Prediksi Jalan Rusak Berbasis AI',
    titleEn: 'RoadDetect AI',
    category: 'CNN',
    categorySecondary: 'TENSORFLOW',
    hoverBtnColor: 'hover:bg-neu-green hover:text-neu-black',
    bgIcon: 'add_road',
    description: 'Sistem informasi monitoring dan deteksi kerusakan jalan otomatis berbasis Convolutional Neural Network (CNN) dan integrasi GIS spasial.',
    descriptionEn: 'CNN-based road damage detection system for automated infrastructure monitoring.',
    tags: ['CNN', 'TENSORFLOW'],
  },
  {
    id: 'port-3',
    title: 'Sistem Informasi Forecasting Stok Pangan LSTM',
    titleEn: 'FoodForecast',
    category: 'LSTM',
    categorySecondary: 'PYTORCH',
    hoverBtnColor: 'hover:bg-secondary-container hover:text-neu-black',
    bgIcon: 'inventory_2',
    description: 'Sistem informasi peramalan logistik dan kebutuhan pangan cerdas berbasis algoritma LSTM untuk mengoptimalkan supply chain serta meminimalkan waste.',
    descriptionEn: 'LSTM-based food stock forecasting to optimize supply chain and reduce waste.',
    tags: ['LSTM', 'PYTORCH'],
  },
  {
    id: 'port-4',
    title: 'Agro-Tani: POS & Manajemen Toko',
    titleEn: 'Agro-Tani',
    category: 'PHP',
    categorySecondary: 'MYSQL',
    hoverBtnColor: 'hover:bg-neu-purple hover:text-neu-white',
    bgIcon: 'agriculture',
    description: 'Sistem manajemen toko pertanian dengan POS kasir, inventaris stok, dan laporan keuangan komprehensif.',
    descriptionEn: 'Agricultural store management system with POS cashier and financial reports.',
    tags: ['PHP 8.1', 'MYSQL 8.0'],
  },
];

export function Portfolio({ portfolios, isLoading, error, portfolioRef, setActivePortfolio, transitionTo }) {
  const { t } = useTranslation();
  const lang = useLang();
  const sliderRef = useRef(null);

  // Mouse Drag to Scroll State
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const [isDragged, setIsDragged] = useState(false);

  const displayList = (!isLoading && portfolios && portfolios.length > 0)
    ? portfolios
    : DEFAULT_PORTFOLIOS;

  const handleMouseDown = (e) => {
    if (!sliderRef.current) return;
    setIsDown(true);
    setIsDragged(false);
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeftState(sliderRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDown(false);
  };

  const handleMouseUp = () => {
    setIsDown(false);
    setTimeout(() => setIsDragged(false), 50);
  };

  const handleMouseMove = (e) => {
    if (!isDown || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 1.6;
    if (Math.abs(walk) > 6) {
      setIsDragged(true);
    }
    sliderRef.current.scrollLeft = scrollLeftState - walk;
  };

  const handleOpenDetail = (item) => {
    if (isDragged) return;
    if (setActivePortfolio) {
      setActivePortfolio(item);
    } else {
      transitionTo('/register');
    }
  };

  return (
    <section id="portofolio" ref={portfolioRef} className="w-full bg-neu-white py-16 md:py-20 px-4 md:px-8 border-b-4 border-neu-black overflow-hidden select-none">
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
          /* Interactive 1-Row Mouse Drag & Touch Slider without Left/Right Navigation UI */
          <div
            ref={sliderRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            className={`flex flex-nowrap gap-6 md:gap-8 overflow-x-auto py-4 px-2 no-scrollbar scroll-smooth ${
              isDown ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {displayList.map((item, i) => {
              const fallback = DEFAULT_PORTFOLIOS[i % DEFAULT_PORTFOLIOS.length];
              const title = lang(item.title, item.titleEn);
              const rawDesc = lang(item.description, item.descriptionEn) || fallback.description;
              const cleanDesc = stripHtml(rawDesc);
              const imgs = item.images?.length ? item.images : (item.image ? [item.image] : []);
              const tags = item.techStack
                ? item.techStack.split('\n').filter(Boolean)
                : (item.tags || fallback.tags || []);
              const bgIcon = item.bgIcon || fallback.bgIcon || 'work';
              const hoverBtnColor = item.hoverBtnColor || fallback.hoverBtnColor || 'hover:bg-primary-container hover:text-neu-black';

              return (
                <div
                  key={item.id}
                  className="w-[300px] sm:w-[340px] md:w-[380px] shrink-0 bg-neu-black border-4 border-neu-black rounded-xl shadow-[10px_10px_0px_0px_#0D0D0D] overflow-hidden flex flex-col justify-between group hover:-translate-y-2 transition-transform duration-300 select-none"
                >
                  {/* Top Visual Box (Clean, without blocking center text) */}
                  <div
                    onClick={() => handleOpenDetail(item)}
                    className="h-52 sm:h-56 md:h-60 bg-surface-dim flex items-center justify-center relative overflow-hidden border-b-4 border-neu-black cursor-pointer"
                  >
                    {imgs[0] ? (
                      <img
                        src={supaImg(imgs[0], { width: 800 })}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2 text-neu-black/30">
                        <span className="material-symbols-outlined text-8xl md:text-9xl select-none">
                          {bgIcon}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-6 md:p-7 bg-neu-white flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap gap-2 mb-3 md:mb-4">
                        {tags.slice(0, 2).map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className={`${
                              tIdx === 0 ? 'bg-neu-green text-neu-black' : 'bg-neu-purple text-neu-white'
                            } border-2 border-neu-black px-2.5 py-0.5 rounded-md font-mono text-[11px] font-black uppercase shadow-[2px_2px_0px_0px_#0D0D0D]`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h3
                        onClick={() => handleOpenDetail(item)}
                        title={title}
                        className="font-display text-lg md:text-xl font-black mb-2 md:mb-3 uppercase text-neu-black break-words line-clamp-2 cursor-pointer hover:underline"
                      >
                        {title}
                      </h3>
                      <p
                        title={cleanDesc}
                        className="font-body text-sm text-neu-black mb-6 font-medium leading-relaxed break-words line-clamp-3"
                      >
                        {cleanDesc}
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                        if (isDragged) {
                          e.preventDefault();
                          return;
                        }
                        handleOpenDetail(item);
                      }}
                      className={`w-full bg-neu-black text-neu-white font-display font-black py-3.5 border-4 border-neu-black rounded-lg ${hoverBtnColor} transition-colors uppercase btn-press cursor-pointer text-sm sm:text-base text-center`}
                    >
                      {t('landing.portfolio.caseStudy', 'DETAIL')}
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
