import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';
import { cn } from '../../utils/cn';

const EMPTY = { title: '', description: '', image: '', category: '' };

export function PortfolioModal({ isOpen, item, onSave, onClose, isSaving }) {
  const backdropRef = useRef(null);
  const cardRef     = useRef(null);
  const [form, setForm]     = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const isEdit = Boolean(item);

  useEffect(() => {
    if (!isOpen) return;
    setForm(item
      ? { title: item.title ?? '', description: item.description ?? '', image: item.image ?? '', category: item.category ?? '' }
      : EMPTY,
    );
    setErrors({});
    gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 });
    gsap.fromTo(cardRef.current, { y: -40, opacity: 0, scale: 0.95 }, { y: 0, opacity: 1, scale: 1, duration: 0.35, ease: 'power3.out' });
  }, [isOpen, item]);

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Judul wajib diisi';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleClose = () => {
    gsap.to(cardRef.current,     { y: -20, opacity: 0, scale: 0.95, duration: 0.2, ease: 'power2.in' });
    gsap.to(backdropRef.current, { opacity: 0, duration: 0.2, onComplete: onClose });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({ title: form.title, description: form.description || undefined, image: form.image || undefined, category: form.category || undefined });
  };

  if (!isOpen) return null;

  const inputCls = (k) => cn(
    'w-full px-4 py-2.5 bg-neu-white border-2 border-neu-black shadow-neu-sm',
    'font-body text-sm text-neu-black placeholder:text-neu-black/30',
    'outline-none focus:shadow-neu focus:-translate-x-0.5 focus:-translate-y-0.5 transition-all duration-150',
    errors[k] && 'border-neu-accent shadow-[4px_4px_0px_#FF5C5C]',
  );

  return createPortal(
    <div ref={backdropRef} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neu-black/50"
      onClick={e => { if (e.target === e.currentTarget) handleClose(); }}>
      <div ref={cardRef} className="w-full max-w-lg bg-neu-white border-2 border-neu-black shadow-neu-xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b-2 border-neu-black bg-neu-primary">
          <h3 className="font-display font-bold text-sm text-neu-black uppercase tracking-wide">
            {isEdit ? 'Edit Portfolio' : 'Tambah Portfolio'}
          </h3>
          <button onClick={handleClose} className="text-neu-black/60 hover:text-neu-black font-mono text-xl leading-none">×</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          {/* Title */}
          <div className="flex flex-col gap-1">
            <label className="font-display font-bold text-xs text-neu-black uppercase tracking-wider">Judul *</label>
            <input type="text" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Nama proyek" className={inputCls('title')} />
            {errors.title && <span className="font-body text-xs text-neu-accent font-semibold">{errors.title}</span>}
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1">
            <label className="font-display font-bold text-xs text-neu-black uppercase tracking-wider">Kategori</label>
            <input type="text" value={form.category} onChange={e => set('category', e.target.value)} placeholder="Web App, Mobile, Design..." className={inputCls('category')} />
          </div>

          {/* Image URL */}
          <div className="flex flex-col gap-1">
            <label className="font-display font-bold text-xs text-neu-black uppercase tracking-wider">URL Gambar</label>
            <input type="text" value={form.image} onChange={e => set('image', e.target.value)} placeholder="https://..." className={inputCls('image')} />
            {form.image && (
              <img src={form.image} alt="preview" onError={e => e.target.style.display='none'}
                className="mt-1 h-28 w-full object-cover border-2 border-neu-black" />
            )}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1">
            <label className="font-display font-bold text-xs text-neu-black uppercase tracking-wider">Deskripsi</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="Deskripsi singkat proyek..."
              rows={3}
              className={cn(inputCls('description'), 'resize-none')}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={handleClose} disabled={isSaving}
              className={cn('flex-1 py-2.5 font-display font-bold text-xs uppercase tracking-wide bg-neu-white text-neu-black border-2 border-neu-black shadow-neu transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm active:translate-x-1 active:translate-y-1 active:shadow-none', isSaving && 'opacity-50 cursor-not-allowed')}>
              Batal
            </button>
            <button type="submit" disabled={isSaving}
              className={cn('flex-1 py-2.5 font-display font-bold text-xs uppercase tracking-wide bg-neu-primary text-neu-black border-2 border-neu-black shadow-neu transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm active:translate-x-1 active:translate-y-1 active:shadow-none', isSaving && 'opacity-60 cursor-not-allowed')}>
              {isSaving ? <span className="inline-flex items-center gap-1 justify-center"><span className="animate-spin">⟳</span> Menyimpan...</span> : (isEdit ? 'Simpan' : 'Tambah')}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
