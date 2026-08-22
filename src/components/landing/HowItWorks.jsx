import { useTranslation } from 'react-i18next';

const STEPS = [
  {
    no: '1',
    bg: 'bg-primary-container text-neu-black',
    title: 'Konsultasi',
    titleEn: 'Consultation',
    desc: 'Diskusi kebutuhan dan ide proyek Anda.',
    descEn: 'Discussion on your project requirements and ideas.',
  },
  {
    no: '2',
    bg: 'bg-neu-green text-neu-black',
    title: 'Pembayaran DP',
    titleEn: 'Down Payment',
    desc: 'Tanda jadi dan komitmen dimulainya proyek.',
    descEn: 'Commitment deposit and project kick-off agreement.',
  },
  {
    no: '3',
    bg: 'bg-neu-purple text-neu-white',
    title: 'Pengerjaan',
    titleEn: 'Execution',
    desc: 'Tim mulai mengeksekusi desain dan kode.',
    descEn: 'Our engineering team executes UI design and clean code.',
  },
  {
    no: '4',
    bg: 'bg-secondary-container text-neu-black',
    title: 'Serah Terima',
    titleEn: 'Handover',
    desc: 'Revisi akhir dan penyerahan aset/source code.',
    descEn: 'Final revision approval and full asset/source code delivery.',
  },
];

export function HowItWorks() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === 'en';

  return (
    <section id="cara-kerja" className="w-full bg-surface-dim py-16 md:py-20 px-4 md:px-8 border-b-4 border-neu-black">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header Tag */}
        <div className="flex justify-center mb-16 md:mb-20">
          <div className="bg-neu-black text-neu-white font-mono text-base md:text-xl font-bold px-6 md:px-8 py-3 border-4 border-neu-black rounded-lg shadow-[8px_8px_0px_0px_#0D0D0D] transform -rotate-1 uppercase tracking-wide">
            PROCESS // {t('landing.howItWorks.title', 'CARA KAMI BEKERJA')}
          </div>
        </div>

        {/* 4 Steps Grid with -mt top floating badge */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-8">
          {STEPS.map((step) => (
            <div
              key={step.no}
              className="bg-neu-white border-4 border-neu-black p-6 md:p-8 rounded-xl shadow-[8px_8px_0px_0px_#0D0D0D] text-center relative mt-6 select-none"
            >
              <div
                className={`w-14 h-14 md:w-16 md:h-16 ${step.bg} border-4 border-neu-black rounded-xl flex items-center justify-center font-display font-black text-xl md:text-2xl mx-auto mb-4 md:mb-6 -mt-14 md:-mt-16 shadow-[4px_4px_0px_0px_#0D0D0D]`}
              >
                {step.no}
              </div>
              <h4 className="font-display text-lg md:text-xl font-black mb-3 md:mb-4 uppercase text-neu-black">
                {isEn ? step.titleEn : step.title}
              </h4>
              <p className="font-body text-sm md:text-base text-neu-black font-medium leading-relaxed">
                {isEn ? step.descEn : step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
