import { cn } from '../../utils/cn';

const ROLE_CONFIG = {
  admin:  { label: 'Administrator', bg: 'bg-neu-accent',  text: 'text-neu-white' },
  staff:  { label: 'Staff',         bg: 'bg-neu-blue',    text: 'text-neu-white' },
  client: { label: 'Client',        bg: 'bg-neu-green',   text: 'text-neu-white' },
};

export function Navbar({ title, user }) {
  const role = ROLE_CONFIG[user?.role] ?? ROLE_CONFIG.client;

  return (
    <header className="h-16 bg-neu-white border-b-2 border-neu-black flex items-center justify-between px-6">
      <h1 className="font-display font-bold text-lg text-neu-black uppercase tracking-wide">
        {title}
      </h1>

      <div className="flex items-center gap-3">
        <span className={cn(
          'px-2.5 py-1 border-2 border-neu-black shadow-neu-sm',
          'font-mono font-bold text-xs uppercase tracking-wide',
          role.bg, role.text,
        )}>
          {role.label}
        </span>
        <span className="font-display font-bold text-sm text-neu-black hidden sm:block">
          {user?.fullName}
        </span>
      </div>
    </header>
  );
}
