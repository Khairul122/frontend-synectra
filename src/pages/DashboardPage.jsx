import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { cn } from '../utils/cn';
import { authService } from '../services/auth.service';
import { PageLayout } from '../components/layout/PageLayout';
import { useAlert } from '../hooks/useAlert';

const ROLE_CONFIG = {
  admin: {
    label:       'Administrator',
    accent:      'bg-neu-accent',
    accentText:  'text-neu-white',
    shadow:      'shadow-[6px_6px_0px_#FF5C5C]',
    border:      'border-neu-accent',
    description: 'Kamu memiliki akses penuh ke seluruh sistem Synectra.',
    greeting:    'Selamat datang, Admin!',
  },
  staff: {
    label:       'Staff',
    accent:      'bg-neu-blue',
    accentText:  'text-neu-white',
    shadow:      'shadow-[6px_6px_0px_#4D61FF]',
    border:      'border-neu-blue',
    description: 'Kamu dapat mengelola data client dan laporan.',
    greeting:    'Selamat datang, Staff!',
  },
  client: {
    label:       'Client',
    accent:      'bg-neu-green',
    accentText:  'text-neu-white',
    shadow:      'shadow-[6px_6px_0px_#00C48C]',
    border:      'border-neu-green',
    description: 'Kamu dapat melihat status dan data milikmu.',
    greeting:    'Selamat datang!',
  },
};

function StatCard({ label, value, accent, shadow, delay }) {
  const ref = useRef(null);
  useEffect(() => {
    gsap.from(ref.current, { y: 30, opacity: 0, duration: 0.5, delay, ease: 'power2.out' });
  }, [delay]);

  return (
    <div
      ref={ref}
      className={cn(
        'bg-neu-white border-2 border-neu-black p-5',
        shadow,
      )}
    >
      <p className="font-body text-xs text-neu-black/50 uppercase tracking-wide mb-1">{label}</p>
      <p className={cn('font-display font-bold text-2xl', accent)}>{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const navigate     = useNavigate();
  const alert        = useAlert();
  const heroRef      = useRef(null);
  const infoCardRef  = useRef(null);

  const [user, setUser]             = useState(null);
  const [isLoading, setIsLoading]   = useState(true);
  useEffect(() => {
    authService.getMe()
      .then((res) => {
        setUser(res.data);
      })
      .catch(() => {
        navigate('/login');
      })
      .finally(() => setIsLoading(false));
  }, [navigate]);

  useEffect(() => {
    if (!user) return;
    const ctx = gsap.context(() => {
      gsap.from(heroRef.current,     { y: 30, opacity: 0, duration: 0.6, ease: 'power3.out' });
      gsap.from(infoCardRef.current, { y: 30, opacity: 0, duration: 0.6, delay: 0.15, ease: 'power3.out' });
    });
    return () => ctx.revert();
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neu-bg flex items-center justify-center">
        <div className="font-display font-bold text-neu-black animate-pulse text-lg">
          Memuat...
        </div>
      </div>
    );
  }

  const cfg = ROLE_CONFIG[user?.role] ?? ROLE_CONFIG.client;
  const isAdmin = user?.role === 'admin';

  return (
    <PageLayout user={user} title="Dashboard" alert={alert}>

            {/* Hero greeting */}
            <div ref={heroRef} className={cn(
              'mb-6 p-6 bg-neu-white border-2 border-neu-black',
              cfg.shadow,
            )}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <span className={cn(
                    'inline-block px-3 py-1 border-2 border-neu-black mb-3',
                    'font-mono font-bold text-xs uppercase tracking-widest',
                    cfg.accent, cfg.accentText,
                  )}>
                    {cfg.label}
                  </span>
                  <h2 className="font-display font-bold text-3xl text-neu-black">
                    {cfg.greeting}
                  </h2>
                  <p className="font-display font-bold text-3xl text-neu-black">
                    {user?.fullName}
                  </p>
                  <p className="font-body text-sm text-neu-black/60 mt-2">
                    {cfg.description}
                  </p>
                </div>
                {/* Decorative block */}
                <div className={cn(
                  'w-20 h-20 border-2 border-neu-black flex-shrink-0',
                  'flex items-center justify-center',
                  cfg.accent,
                )}>
                  <span className="font-display font-bold text-3xl text-neu-white">
                    {user?.fullName?.charAt(0)?.toUpperCase() ?? '?'}
                  </span>
                </div>
              </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <StatCard
                label="Nama Lengkap"
                value={user?.fullName}
                accent="text-neu-black"
                shadow="shadow-neu"
                delay={0.2}
              />
              <StatCard
                label="Email"
                value={user?.email}
                accent="text-neu-black"
                shadow="shadow-neu"
                delay={0.3}
              />
              <StatCard
                label="Role"
                value={cfg.label}
                accent={cn('uppercase', isAdmin ? 'text-neu-accent' : 'text-neu-green')}
                shadow={cfg.shadow}
                delay={0.4}
              />
            </div>

            {/* Info card berbeda per role */}
            <div
              ref={infoCardRef}
              className={cn(
                'border-2 border-neu-black bg-neu-white p-6',
                'border-l-4', cfg.border,
              )}
            >
              <h3 className="font-display font-bold text-base text-neu-black uppercase tracking-wide mb-3">
                {isAdmin ? 'Panel Admin' : 'Panel Client'}
              </h3>

              {isAdmin ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    'Kelola semua user dan role',
                    'Akses laporan & statistik',
                    'Manajemen data client',
                    'Konfigurasi sistem',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2 font-body text-sm text-neu-black">
                      <span className="w-2 h-2 bg-neu-accent border border-neu-black flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    'Lihat status pengajuan',
                    'Dokumen & laporan Anda',
                    'Riwayat aktivitas',
                    'Perbarui profil',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2 font-body text-sm text-neu-black">
                      <span className="w-2 h-2 bg-neu-green border border-neu-black flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              )}
            </div>

    </PageLayout>
  );
}
