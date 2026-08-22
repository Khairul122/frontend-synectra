import { cn } from '../../utils/cn';

/** Blok pulsing dasar — neubrutalism: kotak, border tebal, tanpa radius. */
export function Skeleton({ className }) {
  return <div className={cn('bg-neu-black/10 border-2 border-neu-black animate-pulse', className)} />;
}

/**
 * Skeleton generik untuk konten halaman panel (dipakai PageLayout saat isLoading).
 * Meniru bentuk sidebar + navbar + toolbar + tabel agar tidak blank/flicker.
 */
export function PageSkeleton() {
  return (
    <div className="flex min-h-screen bg-neu-bg">
      {/* Sidebar placeholder */}
      <div className="hidden lg:flex flex-col w-64 border-r-2 border-neu-black bg-neu-white p-4 gap-3 flex-shrink-0">
        <Skeleton className="h-10 w-32 mb-2" />
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Navbar placeholder */}
        <div className="h-16 border-b-2 border-neu-black bg-neu-white flex items-center px-4 lg:px-6">
          <Skeleton className="h-6 w-40 border-0 bg-neu-black/10" />
        </div>

        {/* Content */}
        <div className="flex-1 p-4 lg:p-6">
          <div className="flex flex-wrap gap-3 mb-6">
            <Skeleton className="h-11 flex-1 min-w-48 max-w-md" />
            <Skeleton className="h-11 w-28" />
          </div>

          <div className="border-2 border-neu-black bg-neu-white overflow-hidden">
            <Skeleton className="h-12 w-full border-0 border-b-2 border-neu-black rounded-none bg-neu-black/20" />
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 border-b-2 border-neu-black last:border-b-0 px-4 flex items-center gap-4">
                <Skeleton className="h-9 w-9 flex-shrink-0" />
                <Skeleton className="h-4 flex-1 max-w-xs border-0 bg-neu-black/10" />
                <Skeleton className="h-4 w-24 border-0 bg-neu-black/10 hidden sm:block" />
                <Skeleton className="h-4 w-16 border-0 bg-neu-black/10 hidden md:block" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
