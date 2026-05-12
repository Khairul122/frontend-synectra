import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';
import { cn } from '../../utils/cn';

export function ConfirmModal({
  isOpen, title, message,
  onConfirm, onCancel, isLoading,
  confirmText = 'Ya, Konfirmasi',
  confirmColor = 'bg-neu-accent text-neu-white',
}) {
  const backdropRef = useRef(null);
  const cardRef     = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 });
    gsap.fromTo(cardRef.current,
      { y: -30, opacity: 0, scale: 0.95 },
      { y: 0, opacity: 1, scale: 1, duration: 0.3, ease: 'power3.out' },
    );
  }, [isOpen]);

  const handleCancel = () => {
    gsap.to(cardRef.current,     { y: -20, opacity: 0, scale: 0.95, duration: 0.2, ease: 'power2.in' });
    gsap.to(backdropRef.current, { opacity: 0, duration: 0.2, onComplete: onCancel });
  };

  if (!isOpen) return null;

  return createPortal(
    <div ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neu-black/50"
      onClick={(e) => { if (e.target === e.currentTarget) handleCancel(); }}>
      <div ref={cardRef} className="w-full max-w-sm bg-neu-white border-2 border-neu-black shadow-neu-xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b-2 border-neu-black bg-neu-accent">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-neu-white text-lg">!</span>
            <h3 className="font-display font-bold text-sm text-neu-white uppercase tracking-wide">{title}</h3>
          </div>
          <button onClick={handleCancel}
            className="text-neu-white/70 hover:text-neu-white font-mono text-xl leading-none transition-colors"
            aria-label="Tutup">×</button>
        </div>

        {/* Body */}
        <div className="px-5 py-5">
          <p className="font-body text-sm text-neu-black">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-5 pb-5">
          <button onClick={handleCancel} disabled={isLoading}
            className={cn(
              'flex-1 py-2.5 font-display font-bold text-xs uppercase tracking-wide',
              'bg-neu-white text-neu-black border-2 border-neu-black shadow-neu transition-all duration-150',
              'hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm active:translate-x-1 active:translate-y-1 active:shadow-none',
              isLoading && 'opacity-50 cursor-not-allowed',
            )}>
            Batal
          </button>
          <button onClick={onConfirm} disabled={isLoading}
            className={cn(
              'flex-1 py-2.5 font-display font-bold text-xs uppercase tracking-wide',
              'border-2 border-neu-black shadow-neu transition-all duration-150',
              'hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm active:translate-x-1 active:translate-y-1 active:shadow-none',
              confirmColor,
              isLoading && 'opacity-60 cursor-not-allowed',
            )}>
            {isLoading
              ? <span className="inline-flex items-center gap-1 justify-center"><span className="animate-spin">⟳</span> Memproses...</span>
              : confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
