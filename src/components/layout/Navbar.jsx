import { cn } from '../../utils/cn';

const ROLE_CONFIG = {
  admin:  { label: 'Administrator', bg: 'bg-neu-accent',  text: 'text-neu-white' },
  staff:  { label: 'Staff',         bg: 'bg-neu-blue',    text: 'text-neu-white' },
  client: { label: 'Client',        bg: 'bg-neu-green',   text: 'text-neu-white' },
};

export function Navbar({ title, user, onMenuClick }) {
  const role = ROLE_CONFIG[user?.role] ?? ROLE_CONFIG.client;

  return (
    <header className="h-16 bg-neu-white border-b-2 border-neu-black flex items-center justify-between px-4 lg:px-6 shrink-0">
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          className="lg:hidden w-9 h-9 flex items-center justify-center border-2 border-neu-black shadow-neu-sm hover:bg-neu-bg hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-150"
          aria-label="Buka menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <line x1="3" y1="6"  x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <h1 className="font-display font-bold text-base lg:text-lg text-neu-black uppercase tracking-wide truncate max-w-[200px] sm:max-w-none">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2 lg:gap-3">
        <span className={cn(
          'hidden sm:inline-block px-2.5 py-1 border-2 border-neu-black shadow-neu-sm',
          'font-mono font-bold text-xs uppercase tracking-wide',
          role.bg, role.text,
        )}>
          {role.label}
        </span>
        <span className="font-display font-bold text-sm text-neu-black hidden md:block truncate max-w-32 lg:max-w-none">
          {user?.fullName}
        </span>
      </div>
    </header>
  );
}
