import { useTranslation } from 'react-i18next';
import { useLang } from './hooks';
import { ErrorState } from './ErrorState';

const DEFAULT_SOFTWARE = [
  {
    id: 'sw-1',
    category: 'WEB APP',
    name: 'Sistem Koperasi Syariah',
    nameEn: 'Sharia Cooperative System',
    description: 'Manajemen koperasi berbasis syariah dengan fitur bagi hasil otomatis.',
    descriptionEn: 'Sharia-based cooperative management with automated profit sharing features.',
    price: 2500000,
  },
  {
    id: 'sw-2',
    category: 'WEB APP',
    name: 'Agro-Tani',
    nameEn: 'Agro-Tani',
    description: 'Manajemen stok & kasir toko pertanian terintegrasi laporan harian.',
    descriptionEn: 'Agricultural inventory & cashier POS with integrated daily reporting.',
    price: 1500000,
  },
  {
    id: 'sw-3',
    category: 'WEB APP',
    name: 'Sistem Keuangan',
    nameEn: 'Financial System',
    description: 'Pencatatan transaksi & laporan keuangan standar akuntansi.',
    descriptionEn: 'Transaction recording & financial reporting compliant with accounting standards.',
    price: 2000000,
  },
  {
    id: 'sw-4',
    category: 'WEB APP',
    name: 'SIMONTANA',
    nameEn: 'SIMONTANA',
    description: 'Sistem monitoring bencana hirarkis dengan notifikasi real-time.',
    descriptionEn: 'Hierarchical disaster monitoring system with real-time notifications.',
    price: 3000000,
  },
];

export function Software({ softwareProducts, isLoading, error, setActiveSoftware, navigateProtected }) {
  const { t } = useTranslation();
  const lang = useLang();

  const displayList = (!isLoading && softwareProducts && softwareProducts.length > 0)
    ? softwareProducts
    : DEFAULT_SOFTWARE;

  const fmt = (val) => `Rp ${Number(val).toLocaleString('id-ID')}`;

  return (
    <section id="software" className="w-full bg-surface-dim py-16 md:py-20 px-4 md:px-8 border-b-4 border-neu-black">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header Tag */}
        <div className="flex justify-center mb-10 md:mb-12">
          <div className="bg-neu-black text-neu-white font-mono text-base md:text-xl font-bold px-6 md:px-8 py-3 border-4 border-neu-black rounded-lg shadow-[8px_8px_0px_0px_#00C48C] transform rotate-1 uppercase tracking-wide">
            {t('landing.software.title', 'SOFTWARE')} // READY_TO_DEPLOY
          </div>
        </div>

        {error ? (
          <ErrorState message="Gagal memuat daftar software." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {displayList.map((sw) => {
              const swName = lang(sw.name, sw.nameEn);
              const swDesc = lang(sw.description, sw.descriptionEn);
              const category = sw.category || 'WEB APP';

              return (
                <div
                  key={sw.id}
                  className="bg-neu-white border-4 border-neu-black p-6 md:p-8 rounded-xl shadow-[8px_8px_0px_0px_#0D0D0D] hover:-translate-y-2 transition-transform flex flex-col select-none"
                >
                  <div className="bg-neu-purple text-neu-white border-4 border-neu-black px-3 py-1 rounded-md font-mono font-bold text-xs uppercase mb-6 self-start">
                    {category}
                  </div>
                  <h4 className="font-display text-xl font-black mb-3 md:mb-4 uppercase text-neu-black">
                    {swName}
                  </h4>
                  <p className="font-body text-sm md:text-base text-neu-black mb-6 md:mb-8 flex-1 font-medium leading-relaxed">
                    {swDesc}
                  </p>
                  <div className="text-2xl md:text-3xl font-display font-black text-neu-black mb-6">
                    {fmt(sw.price)}
                  </div>
                  <button
                    onClick={() => {
                      if (setActiveSoftware) setActiveSoftware(sw);
                      else navigateProtected('/my-software');
                    }}
                    className="w-full bg-primary-container text-neu-black font-display font-black text-sm md:text-base py-3.5 md:py-4 border-4 border-neu-black rounded-lg shadow-[4px_4px_0px_0px_#0D0D0D] btn-press cursor-pointer uppercase"
                  >
                    {t('landing.software.demo', 'LIHAT DEMO')}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
