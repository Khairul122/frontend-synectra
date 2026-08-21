import { cn } from '../../utils/cn';

/** Kartu error neubrutalist — dipakai section API-driven saat fetch gagal (bukan sekadar kosong). */
export function ErrorState({ message = 'Gagal memuat data. Coba muat ulang halaman.', dark = false }) {
  return (
    <div className={cn(
      'border-2 rounded-neu bg-neu-accent/10 px-6 py-10 text-center flex flex-col items-center gap-3',
      dark ? 'border-neu-white/20' : 'border-neu-black',
    )}>
      <svg className="w-8 h-8 text-neu-accent" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        <line x1="12" y1="8" x2="12" y2="12.5" />
        <circle cx="12" cy="16" r="0.5" fill="currentColor" />
      </svg>
      <p className={cn('font-display font-bold text-sm', dark ? 'text-neu-white' : 'text-neu-black')}>{message}</p>
    </div>
  );
}
