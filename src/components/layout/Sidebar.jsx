import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '../../utils/cn';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';

const NAV_GROUPS = [
  {
    type: 'item',
    tKey: 'sidebar.dashboard',
    path: '/dashboard',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    type: 'item',
    tKey: 'sidebar.todos',
    path: '/todos',
    roles: ['admin'],
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="9 11 12 14 22 4" />
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
      </svg>
    ),
  },

  /* ── BISNIS ────────────────────────────────────────── */
  {
    type: 'group',
    tKey: 'sidebar.group.bisnis',
    roles: ['admin'],
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="7" width="20" height="14" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
        <line x1="12" y1="12" x2="12" y2="17" /><line x1="9" y1="14.5" x2="15" y2="14.5" />
      </svg>
    ),
    children: [
      {
        tKey: 'sidebar.clients',
        path: '/clients',
        icon: (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        ),
      },
      {
        tKey: 'sidebar.orders',
        path: '/orders',
        icon: (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
            <rect x="9" y="3" width="6" height="4" /><line x1="9" y1="12" x2="15" y2="12" /><line x1="9" y1="16" x2="13" y2="16" />
          </svg>
        ),
      },
      {
        tKey: 'sidebar.income',
        path: '/income',
        icon: (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        ),
      },
      {
        tKey: 'sidebar.feedback',
        path: '/feedback',
        icon: (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        ),
      },
    ],
  },

  /* ── KONTEN ────────────────────────────────────────── */
  {
    type: 'group',
    tKey: 'sidebar.group.konten',
    roles: ['admin'],
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" />
        <line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" />
        <line x1="9" y1="9" x2="9" y2="21" />
      </svg>
    ),
    children: [
      {
        tKey: 'sidebar.portfolio',
        path: '/portfolio',
        icon: (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" rx="0" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
          </svg>
        ),
      },
      {
        tKey: 'sidebar.banners',
        path: '/banners',
        icon: (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="5" width="20" height="14" /><line x1="2" y1="10" x2="22" y2="10" />
          </svg>
        ),
      },
    ],
  },

  /* ── KATALOG ───────────────────────────────────────── */
  {
    type: 'group',
    tKey: 'sidebar.group.katalog',
    roles: ['admin'],
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
    children: [
      {
        tKey: 'sidebar.servicePackages',
        path: '/service-packages',
        icon: (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
        ),
      },
      {
        tKey: 'sidebar.softwareProducts',
        path: '/software-products',
        icon: (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" /><polyline points="8 21 12 17 16 21" />
            <line x1="7" y1="8" x2="7" y2="8" strokeWidth="3" strokeLinecap="round" />
            <line x1="11" y1="8" x2="17" y2="8" /><line x1="11" y1="11" x2="17" y2="11" />
          </svg>
        ),
      },
      {
        tKey: 'sidebar.softwarePurchases',
        path: '/software-purchases',
        icon: (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
            <rect x="9" y="3" width="6" height="4" />
            <line x1="9" y1="12" x2="15" y2="12" /><line x1="9" y1="16" x2="11" y2="16" />
            <circle cx="18" cy="18" r="3" /><path d="M18 16v2l1 1" />
          </svg>
        ),
      },
    ],
  },

  /* ── PENGATURAN ────────────────────────────────────── */
  {
    type: 'group',
    tKey: 'sidebar.group.pengaturan',
    roles: ['admin'],
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
    children: [
      {
        tKey: 'sidebar.bankAccounts',
        path: '/bank-accounts',
        icon: (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="5" width="20" height="16" /><polyline points="2 10 12 10 22 10" />
            <line x1="7" y1="15" x2="7" y2="15" strokeWidth="3" strokeLinecap="round" />
            <line x1="12" y1="15" x2="17" y2="15" />
          </svg>
        ),
      },
      {
        tKey: 'sidebar.socialMedia',
        path: '/social-media',
        icon: (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        ),
      },
      {
        tKey: 'sidebar.contacts',
        path: '/contacts',
        icon: (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.86 10.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012.77 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.16 6.16l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
          </svg>
        ),
      },
      {
        tKey: 'sidebar.signature',
        path: '/profile',
        icon: (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 17s2-1 4-1 3 1 5 1 3-1 5-1 4 1 4 1" />
            <path d="M4 14L14 4a2 2 0 0 1 3 3L7 17l-4 1 1-4z" />
          </svg>
        ),
      },
    ],
  },

  /* ── CLIENT / STAFF ────────────────────────────────── */
  {
    type: 'label',
    tKey: 'sidebar.myMenu',
    roles: ['client', 'staff'],
  },
  {
    type: 'item',
    tKey: 'sidebar.myOrders',
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
    type: 'item',
    tKey: 'sidebar.software',
    path: '/my-software',
    roles: ['client', 'staff'],
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="3" width="20" height="14" /><polyline points="8 21 12 17 16 21" />
        <line x1="7" y1="8" x2="7" y2="8" strokeWidth="3" strokeLinecap="round" />
        <line x1="11" y1="8" x2="17" y2="8" /><line x1="11" y1="11" x2="17" y2="11" />
      </svg>
    ),
  },
  {
    type: 'item',
    tKey: 'sidebar.profile',
    path: '/profile',
    roles: ['client', 'staff'],
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export function Sidebar({ user, isOpen, onClose }) {
  const location        = useLocation();
  const { t }           = useTranslation();
  const [openGroups, setOpenGroups] = useState({});

  const handleNavClick = () => { if (onClose) onClose(); };

  function toggleGroup(tKey) {
    setOpenGroups(prev => ({ ...prev, [tKey]: !prev[tKey] }));
  }

  useEffect(() => {
    const autoOpen = {};
    NAV_GROUPS.forEach(g => {
      if (g.type === 'group') {
        const hasActive = g.children.some(c =>
          location.pathname === c.path || location.pathname.startsWith(c.path + '/'),
        );
        if (hasActive) autoOpen[g.tKey] = true;
      }
    });
    setOpenGroups(prev => ({ ...prev, ...autoOpen }));
  }, [location.pathname]);

  return (
    <>
      {/* Mobile overlay */}
      <div
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-30 bg-neu-black/50 lg:hidden',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
      />

      <aside
        className={cn(
          'fixed left-0 top-0 h-screen w-64 bg-neu-white border-r-2 border-neu-black flex flex-col z-40',
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Brand */}
        <div className="px-5 py-5 border-b-2 border-neu-black flex items-center justify-between">
          <div className="flex items-center gap-3">
            <picture>
              <source srcSet="/logo-synectra.webp" type="image/webp" />
              <img src="/logo-synectra.jpeg" alt="Synectra" width="110" height="40"
                className="h-10 w-auto max-w-[110px] border-2 border-neu-black object-contain shadow-neu-sm flex-shrink-0" />
            </picture>
            <h2 className="font-display font-bold text-sm text-neu-black/60 uppercase tracking-widest leading-tight">{t('admin.panel')}</h2>
          </div>
          <button onClick={onClose} className="lg:hidden w-8 h-8 flex items-center justify-center border-2 border-neu-black hover:bg-neu-bg">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
          {NAV_GROUPS
            .filter(entry => !entry.roles || entry.roles.some(r => r === user?.role))
            .map(entry => {
              if (entry.type === 'label') {
                return (
                  <div key={entry.tKey} className="px-4 pt-4 pb-1">
                    <span className="font-mono font-bold text-[9px] text-neu-black/35 uppercase tracking-[0.18em]">
                      {t(entry.tKey)}
                    </span>
                  </div>
                );
              }

              if (entry.type === 'item') {
                const active = location.pathname === entry.path || location.pathname.startsWith(entry.path + '/');
                return (
                  <Link key={entry.path} to={entry.path} onClick={handleNavClick}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 font-display font-bold text-sm uppercase tracking-wide border-2',
                      active
                        ? 'bg-neu-primary border-neu-black shadow-neu text-neu-black'
                        : 'border-transparent text-neu-black/60 hover:bg-neu-bg hover:border-neu-black hover:text-neu-black',
                    )}>
                    {entry.icon}
                    {t(entry.tKey)}
                  </Link>
                );
              }

              /* type === 'group' */
              const isOpen      = !!openGroups[entry.tKey];
              const hasActive   = entry.children.some(c =>
                location.pathname === c.path || location.pathname.startsWith(c.path + '/'),
              );

              return (
                <div key={entry.tKey}>
                  <button
                    onClick={() => toggleGroup(entry.tKey)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 border-2 font-display font-bold text-sm uppercase tracking-wide',
                      isOpen || hasActive
                        ? 'bg-neu-primary border-neu-black shadow-neu text-neu-black'
                        : 'border-transparent text-neu-black/60 hover:bg-neu-bg hover:border-neu-black hover:text-neu-black',
                    )}
                  >
                    {entry.icon}
                    <span className="flex-1 text-left">{t(entry.tKey)}</span>
                    <svg
                      className={cn('w-4 h-4 flex-shrink-0 transition-transform duration-200', isOpen && 'rotate-90')}
                      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>

                  {isOpen && (
                    <div className="flex flex-col gap-0.5 mt-0.5 mb-0.5">
                      {entry.children.map(child => {
                        const childActive = location.pathname === child.path || location.pathname.startsWith(child.path + '/');
                        return (
                          <Link key={child.path} to={child.path} onClick={handleNavClick}
                            className={cn(
                              'flex items-center gap-3 pl-8 pr-4 py-2.5 border-2 font-display font-bold text-xs uppercase tracking-wide',
                              childActive
                                ? 'bg-neu-black text-neu-white border-neu-black'
                                : 'border-transparent text-neu-black/50 hover:bg-neu-bg hover:border-neu-black hover:text-neu-black',
                            )}>
                            {child.icon}
                            {t(child.tKey)}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
        </nav>


        {/* Language switcher */}
        <div className="px-5 py-4 border-t-2 border-neu-black flex items-center justify-between">
          <span className="font-mono text-xs text-neu-black/40 uppercase tracking-wide">Language</span>
          <LanguageSwitcher variant="light" />
        </div>
      </aside>
    </>
  );
}
