import { useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { cn } from '../../utils/cn';

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
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="3" width="20" height="14" rx="0" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
];

const ROLE_CONFIG = {
  admin: { label: 'Administrator', bg: 'bg-neu-accent', text: 'text-neu-white' },
  staff: { label: 'Staff',         bg: 'bg-neu-blue',   text: 'text-neu-white' },
  client:{ label: 'Client',        bg: 'bg-neu-green',  text: 'text-neu-white' },
};

export function Sidebar({ user, onLogout }) {
  const location = useLocation();
  const sidebarRef = useRef(null);
  const role = ROLE_CONFIG[user?.role] ?? ROLE_CONFIG.client;

  useEffect(() => {
    gsap.from(sidebarRef.current, { x: -60, opacity: 0, duration: 0.5, ease: 'power3.out' });
  }, []);

  return (
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
        {NAV_ITEMS.map((item) => {
          const active = location.pathname === item.path;
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
          onClick={onLogout}
          className={cn(
            'w-full flex items-center gap-3 px-4 py-3',
            'font-display font-bold text-sm uppercase tracking-wide text-neu-black',
            'border-2 border-neu-black shadow-neu bg-neu-white',
            'transition-all duration-150',
            'hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm',
            'active:translate-x-1 active:translate-y-1 active:shadow-none',
          )}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Keluar
        </button>
      </div>
    </aside>
  );
}
