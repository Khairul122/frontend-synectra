import { useRef, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { cn } from '../../utils/cn';
import { authService } from '../../services/auth.service';
import { ConfirmModal } from '../ui/ConfirmModal';

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    label: 'Portfolio',
    path: '/portfolio',
    roles: ['admin'],
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="3" width="20" height="14" rx="0" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
  {
    label: 'Banners',
    path: '/banners',
    roles: ['admin'],
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="5" width="20" height="14" /><line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
  },
  {
    label: 'Bank Accounts',
    path: '/bank-accounts',
    roles: ['admin'],
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="5" width="20" height="16" /><polyline points="2 10 12 10 22 10" /><line x1="7" y1="15" x2="7" y2="15" strokeWidth="3" strokeLinecap="round" /><line x1="12" y1="15" x2="17" y2="15" />
      </svg>
    ),
  },
  {
    label: 'Social Media',
    path: '/social-media',
    roles: ['admin'],
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
    ),
  },
  {
    label: 'Orders',
    path: '/orders',
    roles: ['admin'],
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" /><line x1="9" y1="12" x2="15" y2="12" /><line x1="9" y1="16" x2="13" y2="16" />
      </svg>
    ),
  },
  {
    label: 'My Orders',
    path: '/my-orders',
    roles: ['client', 'staff'],
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" /><line x1="9" y1="12" x2="15" y2="12" /><line x1="9" y1="16" x2="13" y2="16" />
      </svg>
    ),
  },
  {
    label: 'Contacts',
    path: '/contacts',
    roles: ['admin'],
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.86 10.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012.77 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.16 6.16l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
      </svg>
    ),
  },
];

const ROLE_CONFIG = {
  admin:  { label: 'Administrator', bg: 'bg-neu-accent', text: 'text-neu-white' },
  staff:  { label: 'Staff',         bg: 'bg-neu-blue',   text: 'text-neu-white' },
  client: { label: 'Client',        bg: 'bg-neu-green',  text: 'text-neu-white' },
};

export function Sidebar({ user }) {
  const location   = useLocation();
  const navigate   = useNavigate();
  const sidebarRef = useRef(null);
  const role       = ROLE_CONFIG[user?.role] ?? ROLE_CONFIG.client;

  const [showConfirm,  setShowConfirm]  = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    gsap.from(sidebarRef.current, { x: -60, opacity: 0, duration: 0.5, ease: 'power3.out' });
  }, []);

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
      />

      <aside
        ref={sidebarRef}
        className="fixed left-0 top-0 h-screen w-64 bg-neu-white border-r-2 border-neu-black flex flex-col z-40"
      >
        {/* Brand */}
        <div className="px-5 py-5 border-b-2 border-neu-black">
          <div className="inline-block bg-neu-primary border-2 border-neu-black px-3 py-1 shadow-neu-sm mb-3">
            <span className="font-mono font-bold text-xs text-neu-black uppercase tracking-widest">
              Synectra
            </span>
          </div>
          <h2 className="font-display font-bold text-xl text-neu-black leading-tight">
            Panel
          </h2>
        </div>

        {/* User info */}
        <div className="px-5 py-4 border-b-2 border-neu-black bg-neu-bg">
          <p className="font-display font-bold text-sm text-neu-black truncate">
            {user?.fullName ?? '—'}
          </p>
          <p className="font-body text-xs text-neu-black/50 truncate mb-2">
            {user?.email ?? '—'}
          </p>
          <span className={cn(
            'inline-block px-2 py-0.5 border-2 border-neu-black shadow-neu-sm',
            'font-mono font-bold text-xs uppercase tracking-wide',
            role.bg, role.text,
          )}>
            {role.label}
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {NAV_ITEMS.filter(item => !item.roles || item.roles.includes(user?.role)).map((item) => {
            const active = location.pathname === item.path ||
              location.pathname.startsWith(item.path + '/');
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-4 py-3',
                  'font-display font-bold text-sm uppercase tracking-wide',
                  'border-2 transition-all duration-150',
                  active
                    ? 'bg-neu-primary border-neu-black shadow-neu text-neu-black'
                    : 'border-transparent text-neu-black/60 hover:bg-neu-bg hover:border-neu-black hover:text-neu-black',
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-5 pt-2 border-t-2 border-neu-black">
          <button
            onClick={() => setShowConfirm(true)}
            disabled={isLoggingOut}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3',
              'font-display font-bold text-sm uppercase tracking-wide text-neu-black',
              'border-2 border-neu-black shadow-neu bg-neu-white',
              'transition-all duration-150',
              'hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm',
              'active:translate-x-1 active:translate-y-1 active:shadow-none',
              isLoggingOut && 'opacity-50 cursor-not-allowed',
            )}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            {isLoggingOut ? 'Keluar...' : 'Keluar'}
          </button>
        </div>
      </aside>
    </>
  );
}
