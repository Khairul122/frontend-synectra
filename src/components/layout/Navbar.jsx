import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { authService } from '../../services/auth.service';
import { ConfirmModal } from '../ui/ConfirmModal';

const ROLE_CONFIG = {
  admin:  { label: 'Administrator', bg: 'bg-neu-accent',  text: 'text-neu-white' },
  staff:  { label: 'Staff',         bg: 'bg-neu-blue',    text: 'text-neu-white' },
  client: { label: 'Client',        bg: 'bg-neu-green',   text: 'text-neu-white' },
};

/* ─── Avatar Dropdown ────────────────────────────────────────────────────── */
function AvatarDropdown({ user }) {
  const navigate        = useNavigate();
  const ref             = useRef(null);
  const [open,         setOpen]         = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const role    = ROLE_CONFIG[user?.role] ?? ROLE_CONFIG.client;
  const initial = (user?.fullName ?? user?.email ?? '?').charAt(0).toUpperCase();

  // Click outside → close
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Escape → close
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authService.logout();
      navigate('/login');
    } catch {
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      <ConfirmModal
        isOpen={showConfirm}
        title="Konfirmasi Keluar"
        message="Apakah kamu yakin ingin keluar dari Synectra? Sesi kamu akan diakhiri."
        onConfirm={handleLogout}
        onCancel={() => setShowConfirm(false)}
        isLoading={isLoggingOut}
        confirmText="Ya, Keluar"
      />

      <div ref={ref} className="relative">
        {/* Avatar button */}
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className={cn(
            'w-9 h-9 border-2 border-neu-black flex items-center justify-center overflow-hidden flex-shrink-0',
            'shadow-neu-sm transition-all duration-150',
            'hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none',
            open && 'translate-x-[1px] translate-y-[1px] shadow-none',
          )}
          aria-label="Menu pengguna"
          aria-expanded={open}
        >
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.fullName ?? ''} className="w-full h-full object-cover" />
          ) : (
            <span className="bg-neu-primary w-full h-full flex items-center justify-center font-display font-bold text-sm text-neu-black">
              {initial}
            </span>
          )}
        </button>

        {/* Dropdown panel */}
        {open && (
          <div className="absolute right-0 top-full mt-2 w-56 bg-neu-white border-2 border-neu-black shadow-neu z-50">

            {/* Header — user info */}
            <div className="px-4 py-3 border-b-2 border-neu-black bg-neu-bg">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 border-2 border-neu-black overflow-hidden flex-shrink-0">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="bg-neu-primary w-full h-full flex items-center justify-center font-display font-bold text-xs text-neu-black">
                      {initial}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-display font-bold text-sm text-neu-black truncate leading-tight">
                    {user?.fullName ?? '—'}
                  </p>
                  <p className="font-mono text-[10px] text-neu-black/50 truncate">{user?.email ?? '—'}</p>
                </div>
              </div>
              <span className={cn(
                'inline-block px-2 py-0.5 border-2 border-neu-black font-mono font-bold text-[10px] uppercase tracking-wide',
                role.bg, role.text,
              )}>
                {role.label}
              </span>
            </div>

            {/* Profil Saya */}
            <button
              type="button"
              onClick={() => { setOpen(false); navigate('/profile'); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 font-display font-bold text-xs uppercase tracking-wide text-neu-black hover:bg-neu-bg transition-colors duration-150 border-b-2 border-neu-black"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profil Saya
            </button>

            {/* Keluar */}
            <button
              type="button"
              onClick={() => { setOpen(false); setShowConfirm(true); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 font-display font-bold text-xs uppercase tracking-wide text-neu-accent hover:bg-neu-accent hover:text-neu-white transition-colors duration-150"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Keluar
            </button>
          </div>
        )}
      </div>
    </>
  );
}

/* ─── Navbar ─────────────────────────────────────────────────────────────── */
export function Navbar({ title, user, onMenuClick }) {
  return (
    <header className="h-16 bg-neu-white border-b-2 border-neu-black flex items-center justify-between px-4 lg:px-6 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          className="lg:hidden w-9 h-9 flex-shrink-0 flex items-center justify-center border-2 border-neu-black shadow-neu-sm hover:bg-neu-bg hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-150"
          aria-label="Buka menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <line x1="3" y1="6"  x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <img src="/logo-synectra.jpeg" alt="Synectra"
          className="hidden lg:block h-8 w-auto max-w-[120px] object-contain border border-neu-black/20 flex-shrink-0" />
        <h1 className="font-display font-bold text-base lg:text-lg text-neu-black uppercase tracking-wide truncate">
          {title}
        </h1>
      </div>

      {/* Avatar dropdown */}
      {user && <AvatarDropdown user={user} />}
    </header>
  );
}
