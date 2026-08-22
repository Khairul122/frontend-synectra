import { useTranslation } from 'react-i18next';
import { useLang } from './hooks';

const DEFAULT_SERVICES = [
  {
    id: 'default-web',
    tag: 'WEB_DEV',
    tagBg: 'bg-neu-green text-neu-black',
    icon: 'data_object',
    title: 'PENGEMBANGAN WEBSITE',
    titleEn: 'WEB DEVELOPMENT',
    desc: 'Kami membangun website yang cepat, responsif, dan mudah dikelola dengan teknologi terkini untuk pengalaman pengguna terbaik.',
    descEn: 'We build fast, responsive, and easy-to-manage websites with the latest technology for the best user experience.',
  },
  {
    id: 'default-mobile',
    tag: 'MOBILE_DEV',
    tagBg: 'bg-primary-container text-neu-black',
    icon: 'smartphone',
    title: 'APLIKASI MOBILE',
    titleEn: 'MOBILE APPS',
    desc: 'Aplikasi native dan cross-platform berkualitas tinggi untuk iOS dan Android yang memberikan performa optimal di genggaman Anda.',
    descEn: 'High quality native and cross-platform applications for iOS and Android delivering optimal performance.',
  },
  {
    id: 'default-uiux',
    tag: 'UI_UX',
    tagBg: 'bg-neu-purple text-neu-white',
    icon: 'design_services',
    title: 'DESAIN UI/UX',
    titleEn: 'UI/UX DESIGN',
    desc: 'Desain antarmuka yang intuitif dan menarik dengan riset pengguna mendalam untuk meningkatkan konversi dan kepuasan pelanggan.',
    descEn: 'Intuitive and engaging user interfaces designed with deep user research to boost conversion and satisfaction.',
  },
];

const ICON_MAP = {
  code: { icon: 'data_object', tag: 'WEB_DEV', tagBg: 'bg-neu-green text-neu-black' },
  mobile: { icon: 'smartphone', tag: 'MOBILE_DEV', tagBg: 'bg-primary-container text-neu-black' },
  design: { icon: 'design_services', tag: 'UI_UX', tagBg: 'bg-neu-purple text-neu-white' },
  api: { icon: 'api', tag: 'BACKEND_API', tagBg: 'bg-secondary-container text-neu-black' },
  cloud: { icon: 'cloud', tag: 'CLOUD_INFRA', tagBg: 'bg-neu-blue text-neu-white' },
  chat: { icon: 'support_agent', tag: 'CONSULTATION', tagBg: 'bg-primary-container text-neu-black' },
};

export function Services({ services, isLoading, error }) {
  const { t } = useTranslation();
  const lang = useLang();

  const displayList = (!isLoading && services && services.length > 0)
    ? services.map((svc, i) => {
        const meta = ICON_MAP[svc.iconKey] || DEFAULT_SERVICES[i % DEFAULT_SERVICES.length];
        return {
          id: svc.id,
          tag: meta.tag || 'SERVICES',
          tagBg: meta.tagBg || 'bg-primary-container text-neu-black',
          icon: meta.icon || 'terminal',
          title: lang(svc.title, svc.titleEn),
          desc: lang(svc.description, svc.descriptionEn),
        };
      })
    : DEFAULT_SERVICES;

  return (
    <section id="layanan" className="w-full bg-surface-dim py-16 md:py-20 px-4 md:px-8 border-b-4 border-neu-black">
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex justify-center mb-10 md:mb-12">
          <div className="bg-neu-black text-neu-white font-mono text-base md:text-xl font-bold px-6 md:px-8 py-3 border-4 border-neu-black rounded-lg shadow-[8px_8px_0px_0px_#FFD000] transform rotate-1 uppercase tracking-wide">
            {t('landing.services.tag', 'SERVICES')} // WHAT_WE_DO
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {displayList.map((item) => (
            <div
              key={item.id}
              className="bg-neu-white border-4 border-neu-black p-6 md:p-8 rounded-xl shadow-[8px_8px_0px_0px_#0D0D0D] hover:-translate-y-2 transition-transform duration-300 flex flex-col items-start"
            >
              <div className={`${item.tagBg} border-4 border-neu-black px-4 py-1.5 md:py-2 rounded-lg font-mono font-bold text-xs md:text-sm mb-6 inline-block uppercase`}>
                {item.tag}
              </div>
              <span className="material-symbols-outlined text-4xl md:text-5xl mb-4 text-neu-black font-medium">
                {item.icon}
              </span>
              <h3 className="font-display text-xl md:text-2xl font-black mb-3 md:mb-4 uppercase text-neu-black">
                {item.title}
              </h3>
              <p className="font-body text-sm md:text-base text-neu-black leading-relaxed font-medium">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
