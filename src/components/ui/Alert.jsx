import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';
import { cn } from '../../utils/cn';

const CONFIG = {
  success: { bg: 'bg-neu-green',   border: 'border-neu-green',   shadow: 'shadow-[4px_4px_0px_#00C48C]', icon: '✓', label: 'Berhasil' },
  error:   { bg: 'bg-neu-accent',  border: 'border-neu-accent',  shadow: 'shadow-[4px_4px_0px_#FF5C5C]', icon: '✕', label: 'Error'    },
  warning: { bg: 'bg-neu-primary', border: 'border-neu-primary', shadow: 'shadow-[4px_4px_0px_#FFD000]', icon: '!', label: 'Perhatian' },
  info:    { bg: 'bg-neu-blue',    border: 'border-neu-blue',    shadow: 'shadow-[4px_4px_0px_#4D61FF]', icon: 'i', label: 'Info'      },
};

function AlertItem({ alert, onDismiss }) {
  const ref = useRef(null);
  const c   = CONFIG[alert.type] ?? CONFIG.info;

  useEffect(() => {
    gsap.from(ref.current, { x: 80, opacity: 0, duration: 0.35, ease: 'power3.out' });
  }, []);

  const handleDismiss = () => {
    gsap.to(ref.current, {
      x: 80, opacity: 0, duration: 0.25, ease: 'power2.in',
      onComplete: () => onDismiss(alert.id),
    });
  };

  return (
    <div
      ref={ref}
      className={cn(
        'flex items-start gap-3 w-80 p-4 bg-neu-white',
        'border-2 border-neu-black',
        c.shadow,
      )}
    >
      <span className={cn('flex-shrink-0 w-6 h-6 flex items-center justify-center text-neu-white font-display font-bold text-xs', c.bg)}>
        {c.icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-display font-bold text-xs text-neu-black uppercase tracking-wide">{c.label}</p>
        <p className="font-body text-sm text-neu-black mt-0.5 break-words">{alert.message}</p>
      </div>
      <button
        onClick={handleDismiss}
        className="flex-shrink-0 text-neu-black/40 hover:text-neu-black font-mono text-lg leading-none transition-colors"
        aria-label="Tutup"
      >
        ×
      </button>
    </div>
  );
}

export function AlertContainer({ alerts, onDismiss }) {
  return createPortal(
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
      {alerts.map((a) => (
        <div key={a.id} className="pointer-events-auto">
          <AlertItem alert={a} onDismiss={onDismiss} />
        </div>
      ))}
    </div>,
    document.body,
  );
}
