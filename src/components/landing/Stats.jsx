import { useTranslation } from 'react-i18next';
import { AnimatedCounter } from './helpers';
import { ErrorState } from './ErrorState';

const STAT_CONFIGS = [
  {
    key: 'projects',
    chip: 'PROJECTS',
    chipBg: 'bg-primary-container text-neu-black',
    titleKey: 'landing.stats.projects',
    fallbackTitle: 'Proyek Selesai',
    fallbackVal: 3,
    suffix: '+',
  },
  {
    key: 'clients',
    chip: 'CLIENTS',
    chipBg: 'bg-neu-green text-neu-black',
    titleKey: 'landing.stats.clients',
    fallbackTitle: 'Klien Puas',
    fallbackVal: 50,
    suffix: '+',
  },
  {
    key: 'experience',
    chip: 'EXPERIENCE',
    chipBg: 'bg-neu-purple text-neu-white',
    titleKey: 'landing.stats.experience',
    fallbackTitle: 'Tahun Pengalaman',
    fallbackVal: 5,
    suffix: '+',
  },
  {
    key: 'satisfaction',
    chip: 'QUALITY',
    chipBg: 'bg-secondary-container text-neu-black',
    titleKey: 'landing.stats.satisfaction',
    fallbackTitle: 'Rating Kualitas',
    fallbackVal: 98,
    suffix: '%',
  },
];

export function Stats({ stats, isLoading, error }) {
  const { t } = useTranslation();

  return (
    <section className="w-full bg-neu-black text-neu-white py-12 md:py-16 px-4 md:px-8 z-20 border-b-4 border-neu-black">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 md:gap-12">
        <div className="lg:w-1/4">
          <div className="bg-primary-container text-neu-black border-4 border-neu-black px-6 py-3 shadow-[6px_6px_0px_0px_#FAFAFA] transform -rotate-2 rounded-lg inline-block">
            <span className="text-lg md:text-xl font-mono font-black tracking-tighter">SYNECTRA_METRICS</span>
          </div>
        </div>

        {error ? (
          <div className="flex-1 w-full">
            <ErrorState message="Gagal memuat statistik." dark />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 lg:w-3/4 w-full">
            {STAT_CONFIGS.map((cfg, i) => {
              const matchedStat = stats?.find(s => s.labelKey?.includes(cfg.key));
              const displayVal = matchedStat?.value || cfg.fallbackVal;
              const displaySuffix = matchedStat?.suffix || cfg.suffix;

              return (
                <div
                  key={cfg.key}
                  className="bg-neu-white border-4 border-neu-black p-5 md:p-6 shadow-[6px_6px_0px_0px_#FFD000] hover:-translate-y-2 transition-transform rounded-xl relative group"
                >
                  <div
                    className={`absolute -top-4 left-4 border-4 border-neu-black px-3 md:px-4 py-1 font-mono font-black text-[10px] md:text-xs uppercase tracking-wider rounded-md ${cfg.chipBg}`}
                  >
                    {cfg.chip}
                  </div>
                  <div className="flex items-baseline justify-between mb-2 mt-3 md:mt-4">
                    <span className="text-3xl md:text-4xl font-display font-black text-neu-black drop-shadow-[2px_2px_0px_#FFD000]">
                      {isLoading ? (
                        '...'
                      ) : (
                        <AnimatedCounter target={displayVal} suffix={displaySuffix} />
                      )}
                    </span>
                  </div>
                  <div className="border-t-4 border-neu-black pt-2">
                    <p className="font-display text-xs uppercase font-black text-neu-black tracking-tight">
                      {t(cfg.titleKey, cfg.fallbackTitle)}
                    </p>
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
