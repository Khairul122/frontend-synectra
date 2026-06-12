import { cn } from '../../utils/cn';

const VARIANT_STYLES = {
  primary: 'bg-neu-primary text-neu-black',
  accent:  'bg-neu-accent text-neu-white',
  blue:    'bg-neu-blue text-neu-white',
  green:   'bg-neu-green text-neu-black',
  purple:  'bg-neu-purple text-neu-white',
};

export function Badge({ children, variant = 'primary', className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 border-2 border-neu-black shadow-neu-sm',
        'font-display font-bold text-[10px] uppercase tracking-wide',
        VARIANT_STYLES[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
