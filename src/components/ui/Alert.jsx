import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';

const CONFIG = {
  success: {
    bgStyle: { backgroundColor: '#00C48C', color: '#FFFFFF' },
    icon: '✓',
    label: 'Berhasil',
  },
  error: {
    bgStyle: { backgroundColor: '#FF5C5C', color: '#FFFFFF' },
    icon: '✕',
    label: 'Error',
  },
  warning: {
    bgStyle: { backgroundColor: '#FFD000', color: '#0D0D0D' },
    icon: '!',
    label: 'Perhatian',
  },
  info: {
    bgStyle: { backgroundColor: '#4D61FF', color: '#FFFFFF' },
    icon: 'ℹ',
    label: 'Info',
  },
};

function AlertItem({ alert, onDismiss }) {
  const ref = useRef(null);
  const c = CONFIG[alert.type] ?? CONFIG.info;

  useEffect(() => {
    gsap.from(ref.current, { y: 30, opacity: 0, duration: 0.35, ease: 'power3.out' });
  }, []);

  const handleDismiss = () => {
    gsap.to(ref.current, {
      y: 30,
      opacity: 0,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: () => onDismiss(alert.id),
    });
  };

  return (
    <div
      ref={ref}
      style={{
        backgroundColor: '#FFFFFF',
        color: '#0D0D0D',
        border: '3px solid #0D0D0D',
        boxShadow: '5px 5px 0px 0px #0D0D0D',
        opacity: 1,
      }}
      className="flex items-start gap-3.5 w-80 md:w-96 p-4 rounded-xl select-none"
    >
      <span
        style={c.bgStyle}
        className="flex-shrink-0 w-8 h-8 rounded-lg border-2 border-[#0D0D0D] flex items-center justify-center font-display font-black text-sm shadow-sm"
      >
        {c.icon}
      </span>
      <div className="flex-1 min-w-0">
        <p style={{ color: '#0D0D0D' }} className="font-display font-black text-xs uppercase tracking-wider">
          {c.label}
        </p>
        <p style={{ color: '#0D0D0D' }} className="font-body font-bold text-sm leading-snug mt-1 break-words">
          {alert.message}
        </p>
      </div>
      <button
        onClick={handleDismiss}
        style={{ color: '#0D0D0D' }}
        className="flex-shrink-0 hover:opacity-60 font-mono text-2xl leading-none font-black transition-opacity cursor-pointer px-1 -mt-1"
        aria-label="Tutup"
      >
        ×
      </button>
    </div>
  );
}

export function AlertContainer({ alerts, onDismiss }) {
  return createPortal(
    <div className="fixed bottom-6 right-6 z-[99999] flex flex-col gap-3 pointer-events-none">
      {alerts.map((a) => (
        <div key={a.id} className="pointer-events-auto">
          <AlertItem alert={a} onDismiss={onDismiss} />
        </div>
      ))}
    </div>,
    document.body
  );
}
