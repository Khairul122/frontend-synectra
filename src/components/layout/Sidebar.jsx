import { useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { gsap } from 'gsap';
import { cn } from '../../utils/cn';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';

const NAV_ITEMS = [
  {
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
    tKey: 'sidebar.clients',
    path: '/clients',
    roles: ['admin'],
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    tKey: 'sidebar.orders',
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
    tKey: 'sidebar.portfolio',
    path: '/portfolio',
    roles: ['admin'],
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="3" width="20" height="14" rx="0" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
  {
    tKey: 'sidebar.banners',
    path: '/banners',
    roles: ['admin'],
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="5" width="20" height="14" /><line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
  },
  {
    tKey: 'sidebar.servicePackages',
    path: '/service-packages',
    roles: ['admin'],
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
  },
  {
    tKey: 'sidebar.softwarePurchases',
    path: '/software-purchases',
    roles: ['admin'],
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" />
        <line x1="9" y1="12" x2="15" y2="12" /><line x1="9" y1="16" x2="11" y2="16" />
        <circle cx="18" cy="18" r="3" /><path d="M18 16v2l1 1" />
      </svg>
    ),
  },
  {
    tKey: 'sidebar.software',
    path: '/software-products',
    roles: ['admin'],
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="3" width="20" height="14" /><polyline points="8 21 12 17 16 21" />
        <line x1="7" y1="8" x2="7" y2="8" strokeWidth="3" strokeLinecap="round" />
        <line x1="11" y1="8" x2="17" y2="8" /><line x1="11" y1="11" x2="17" y2="11" />
      </svg>
    ),
  },
  {
    tKey: 'sidebar.feedback',
    path: '/feedback',
    roles: ['admin'],
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  },
  {
    tKey: 'sidebar.bankAccounts',
    path: '/bank-accounts',
    roles: ['admin'],
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="5" width="20" height="16" /><polyline points="2 10 12 10 22 10" />
        <line x1="7" y1="15" x2="7" y2="15" strokeWidth="3" strokeLinecap="round" />
        <line x1="12" y1="15" x2="17" y2="15" />
      </svg>
    ),
  },
  {
    tKey: 'sidebar.socialMedia',
    path: '/social-media',
    roles: ['admin'],
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
    ),
  },
  {
    tKey: 'sidebar.contacts',
    path: '/contacts',
    roles: ['admin'],
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.86 10.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012.77 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.16 6.16l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
      </svg>
    ),
  },
];

export function Sidebar({ user, isOpen, onClose }) {
  const location   = useLocation();
  const sidebarRef = useRef(null);
  const { t }      = useTranslation();

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    if (mq.matches && sidebarRef.current) {
      gsap.set(sidebarRef.current, { clearProps: 'transform' });
      gsap.from(sidebarRef.current, { opacity: 0, duration: 0.4, ease: 'power3.out' });
    }
  }, []);

  const handleNavClick = () => { if (onClose) onClose(); };

  return (
    <>
      {/* Mobile overlay */}
      <div
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-30 bg-neu-black/50 lg:hidden transition-opacity duration-300',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
      />

      <aside
        ref={sidebarRef}
        className={cn(
          'fixed left-0 top-0 h-screen w-64 bg-neu-white border-r-2 border-neu-black flex flex-col z-40',
          'transition-transform duration-300 ease-in-out',
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Brand */}
        <div className="px-5 py-5 border-b-2 border-neu-black flex items-center justify-between">
          <div>
            <div className="inline-block bg-neu-primary border-2 border-neu-black px-3 py-1 shadow-neu-sm mb-2">
              <span className="font-mono font-bold text-xs text-neu-black uppercase tracking-widest">Synectra</span>
            </div>
            <h2 className="font-display font-bold text-xl text-neu-black leading-tight">{t('admin.panel')}</h2>
          </div>
          <button onClick={onClose} className="lg:hidden w-8 h-8 flex items-center justify-center border-2 border-neu-black hover:bg-neu-bg transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
          {NAV_ITEMS.filter(item => !item.roles || item.roles.includes(user?.role)).map((item) => {
            const active = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <Link key={item.path} to={item.path} onClick={handleNavClick}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 font-display font-bold text-sm uppercase tracking-wide border-2 transition-all duration-150',
                  active
                    ? 'bg-neu-primary border-neu-black shadow-neu text-neu-black'
                    : 'border-transparent text-neu-black/60 hover:bg-neu-bg hover:border-neu-black hover:text-neu-black',
                )}>
                {item.icon}
                {t(item.tKey)}
              </Link>
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
