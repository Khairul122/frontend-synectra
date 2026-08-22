import { useTranslation } from 'react-i18next';

const REASONS = [
  {
    icon: 'visibility',
    iconBg: 'bg-neu-purple text-neu-white',
    title: 'Transparan 100%',
    titleEn: '100% Transparent',
    desc: 'Tidak ada biaya tersembunyi. Semua jelas dari awal hingga akhir proyek.',
    descEn: 'No hidden costs. Everything is transparent from start to finish of the project.',
  },
  {
    icon: 'speed',
    iconBg: 'bg-neu-green text-neu-black',
    title: 'Pengerjaan Cepat',
    titleEn: 'Fast Turnaround',
    desc: 'Kami menghargai waktu Anda. Proyek selesai sesuai deadline yang disepakati.',
    descEn: 'We value your time. Projects delivered on or before the agreed deadline.',
  },
  {
    icon: 'verified',
    iconBg: 'bg-secondary-container text-neu-black',
    title: 'Garansi Kualitas',
    titleEn: 'Quality Guarantee',
    desc: 'Hasil akhir dipastikan bebas bug dan sesuai dengan standar industri terbaik.',
    descEn: 'Final deliverable is bug-free and complies with top industry engineering standards.',
  },
  {
    icon: 'forum',
    iconBg: 'bg-primary-container text-neu-black',
    title: 'Komunikasi Aktif',
    titleEn: 'Active Communication',
    desc: 'Update berkala mengenai progress proyek agar Anda selalu mendapatkan informasi terkini.',
    descEn: 'Continuous real-time progress updates so you always stay fully informed.',
  },
  {
    icon: 'savings',
    iconBg: 'bg-neu-purple text-neu-white',
    title: 'Harga Terjangkau',
    titleEn: 'Affordable Pricing',
    desc: 'Solusi digital berkualitas premium dengan investasi yang masuk akal.',
    descEn: 'Premium-grade digital solutions with realistic and reasonable investments.',
  },
  {
    icon: 'history_edu',
    iconBg: 'bg-neu-green text-neu-black',
    title: '5+ Tahun Pengalaman',
    titleEn: '5+ Years Experience',
    desc: 'Tim ahli yang telah menangani puluhan proyek digital di berbagai industri.',
    descEn: 'Expert team having delivered dozens of digital projects across diverse industries.',
  },
];

export function WhyChooseUs() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === 'en';

  return (
    <section className="w-full bg-neu-black py-16 md:py-20 px-4 md:px-8 border-b-4 border-neu-black">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header Tag */}
        <div className="flex justify-center mb-10 md:mb-12">
          <div className="bg-primary-container text-neu-black font-mono text-base md:text-xl font-bold px-6 md:px-8 py-3 border-4 border-neu-black rounded-lg shadow-[8px_8px_0px_0px_#FAFAFA] transform rotate-1 uppercase tracking-wide">
            WHY_CHOOSE_US // {t('landing.why.title', 'MENGAPA MEMILIH SYNECTRA?')}
          </div>
        </div>

        {/* 6 Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {REASONS.map((r, i) => (
            <div
              key={i}
              className="bg-neu-white border-4 border-neu-black p-6 md:p-8 rounded-xl shadow-[8px_8px_0px_0px_#FFD000] hover:-translate-y-2 transition-transform select-none"
            >
              <div className={`w-14 h-14 md:w-16 md:h-16 ${r.iconBg} border-4 border-neu-black rounded-lg flex items-center justify-center mb-6`}>
                <span className="material-symbols-outlined text-2xl md:text-3xl font-bold">
                  {r.icon}
                </span>
              </div>
              <h4 className="font-display text-lg md:text-xl font-black mb-3 md:mb-4 uppercase text-neu-black">
                {isEn ? r.titleEn : r.title}
              </h4>
              <p className="font-body text-sm md:text-base text-neu-black font-medium leading-relaxed">
                {isEn ? r.descEn : r.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
