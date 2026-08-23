import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const CONFIG = {
  success: {
    badgeBg: '#00C48C',
    badgeText: '#FFFFFF',
    icon: '✓',
    label: 'Berhasil',
  },
  error: {
    badgeBg: '#FF5C5C',
    badgeText: '#FFFFFF',
    icon: '✕',
    label: 'Error',
  },
  warning: {
    badgeBg: '#FFD000',
    badgeText: '#0D0D0D',
    icon: '!',
    label: 'Perhatian',
  },
  info: {
    badgeBg: '#4D61FF',
    badgeText: '#FFFFFF',
    icon: 'ℹ',
    label: 'Info',
  },
};

function AlertItem({ alert, onDismiss }) {
  const [exiting, setExiting] = useState(false);
  const c = CONFIG[alert.type] ?? CONFIG.info;

  const handleDismiss = () => {
    setExiting(true);
    setTimeout(() => {
      onDismiss(alert.id);
    }, 200);
  };

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        color: '#0D0D0D',
        border: '3px solid #0D0D0D',
        boxShadow: '5px 5px 0px 0px #0D0D0D',
        opacity: exiting ? 0 : 1,
        transform: exiting ? 'translateY(-20px)' : 'translateY(0)',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      className="flex items-start gap-3.5 w-80 md:w-96 p-4 rounded-xl select-none relative z-[999999]"
    >
      <span
        style={{ backgroundColor: c.badgeBg, color: c.badgeText, border: '2px solid #0D0D0D' }}
        className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-display font-black text-sm shadow-sm"
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
  if (!alerts || alerts.length === 0) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: '24px',
        right: '24px',
        zIndex: 999999,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        pointerEvents: 'none',
      }}
    >
      {alerts.map((a) => (
        <div key={a.id} style={{ pointerEvents: 'auto' }}>
          <AlertItem alert={a} onDismiss={onDismiss} />
        </div>
      ))}
    </div>,
    document.body
  );
}
