import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';
import { cn } from '../../utils/cn';
import { uploadService } from '../../services/upload.service';

const CATEGORIES = ['Web App', 'Mobile', 'Design', 'Backend'];
const EMPTY      = { title: '', description: '', images: [], category: '' };

function MultiImageUploader({ values, onChange, error }) {
  const [isDragging, setIsDragging]   = useState(false);
  const [uploading, setUploading]     = useState([]);
  const [uploadError, setUploadError] = useState('');
  const inputRef = useRef(null);

  const handleFiles = useCallback(async (files) => {
    const list = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (!list.length) return;

    const oversized = list.find(f => f.size > 5 * 1024 * 1024);
    if (oversized) { setUploadError(`"${oversized.name}" melebihi 5 MB`); return; }

    setUploadError('');
    const ids = list.map(() => crypto.randomUUID());
    setUploading(ids);

    try {
      const urls = await Promise.all(list.map(f => uploadService.uploadImage(f)));
      onChange([...values, ...urls]);
    } catch {
      setUploadError('Gagal mengunggah. Coba lagi.');
    } finally {
      setUploading([]);
    }
  }, [values, onChange]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const removeAt = (idx) => onChange(values.filter((_, i) => i !== idx));
  const moveLeft  = (idx) => {
    if (idx === 0) return;
    const next = [...values];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    onChange(next);
  };
  const moveRight = (idx) => {
    if (idx === values.length - 1) return;
    const next = [...values];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    onChange(next);
  };

  const isUploading = uploading.length > 0;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="font-display font-bold text-xs text-neu-black uppercase tracking-wider">
          Gambar
        </label>
        {values.length > 0 && (
          <span className="font-mono text-[10px] text-neu-black/40">{values.length} gambar</span>
        )}
      </div>

      {/* Grid preview gambar yang sudah diupload */}
      {values.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {values.map((url, idx) => (
            <div key={url} className="relative border-2 border-neu-black group">
              {idx === 0 && (
                <span className="absolute top-1 left-1 z-10 px-1.5 py-0.5 bg-neu-primary border border-neu-black font-mono font-bold text-[9px] uppercase">
                  Cover
                </span>
              )}
              <img src={url} alt={`img-${idx}`}
                className="w-full h-20 object-cover" />

              {/* Overlay aksi */}
              <div className="absolute inset-0 bg-neu-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                <button type="button" onClick={() => moveLeft(idx)} disabled={idx === 0}
                  className="w-6 h-6 bg-neu-white border border-neu-black font-mono text-xs disabled:opacity-30 flex items-center justify-center hover:bg-neu-primary transition-colors">
                  ←
                </button>
                <button type="button" onClick={() => removeAt(idx)}
                  className="w-6 h-6 bg-neu-accent text-neu-white border border-neu-black font-mono text-xs flex items-center justify-center hover:opacity-90 transition-opacity">
                  ×
                </button>
                <button type="button" onClick={() => moveRight(idx)} disabled={idx === values.length - 1}
                  className="w-6 h-6 bg-neu-white border border-neu-black font-mono text-xs disabled:opacity-30 flex items-center justify-center hover:bg-neu-primary transition-colors">
                  →
                </button>
              </div>
            </div>
          ))}

          {/* Slot upload tambahan */}
          {!isUploading && (
            <button type="button" onClick={() => inputRef.current?.click()}
              className="h-20 border-2 border-dashed border-neu-black/40 bg-neu-bg flex flex-col items-center justify-center gap-1 hover:border-neu-black hover:bg-neu-primary/10 transition-all duration-150">
              <span className="font-mono text-lg text-neu-black/40">+</span>
              <span className="font-mono text-[9px] text-neu-black/30 uppercase">Tambah</span>
            </button>
          )}
        </div>
      )}

      {/* Drop zone — tampil saat belum ada gambar */}
      {values.length === 0 && (
        <div
          onDrop={onDrop}
          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => !isUploading && inputRef.current?.click()}
          className={cn(
            'w-full border-2 border-dashed border-neu-black bg-neu-bg',
            'flex flex-col items-center justify-center gap-2 py-8 cursor-pointer',
            'transition-all duration-150',
            isDragging  && 'bg-neu-primary/20 border-solid',
            isUploading && 'opacity-60 cursor-not-allowed',
            error        && 'border-neu-accent',
          )}
        >
          {isUploading ? (
            <>
              <span className="animate-spin font-mono text-2xl">⟳</span>
              <span className="font-display font-bold text-xs text-neu-black/60 uppercase">
                Mengunggah {uploading.length} gambar...
              </span>
            </>
          ) : (
            <>
              <svg className="w-8 h-8 text-neu-black/40" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="font-display font-bold text-xs text-neu-black/50 uppercase tracking-wider text-center px-4">
                {isDragging ? 'Lepas gambar di sini' : 'Klik atau drag & drop gambar'}
              </p>
              <p className="font-mono text-[10px] text-neu-black/30">Bisa pilih lebih dari 1 — maks. 5 MB/gambar</p>
            </>
          )}
        </div>
      )}

      {/* Progress upload saat ada gambar sebelumnya */}
      {values.length > 0 && isUploading && (
        <div className="flex items-center gap-2 px-3 py-2 border-2 border-neu-black bg-neu-bg">
          <span className="animate-spin font-mono text-sm">⟳</span>
          <span className="font-display font-bold text-xs text-neu-black/60 uppercase">
            Mengunggah {uploading.length} gambar...
          </span>
        </div>
      )}

      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
        onChange={e => handleFiles(e.target.files)} />

      {(uploadError || error) && (
        <span className="font-body text-xs text-neu-accent font-semibold">{uploadError || error}</span>
      )}

      {values.length > 0 && (
        <p className="font-mono text-[10px] text-neu-black/30">
          Hover gambar untuk pindah urutan (←→) atau hapus (×). Gambar pertama jadi cover.
        </p>
      )}
    </div>
  );
}

export function PortfolioModal({ isOpen, item, onSave, onClose, isSaving }) {
  const backdropRef = useRef(null);
  const cardRef     = useRef(null);
  const [form, setForm]     = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const isEdit = Boolean(item);

  useEffect(() => {
    if (!isOpen) return;
    setForm(item
      ? {
          title:       item.title       ?? '',
          description: item.description ?? '',
          images:      item.images      ?? (item.image ? [item.image] : []),
          category:    item.category    ?? '',
        }
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
    onSave({
      title:       form.title,
      description: form.description || undefined,
      image:       form.images[0]   || undefined,
      images:      form.images,
      category:    form.category    || undefined,
    });
  };

  if (!isOpen) return null;

  const inputCls = (k) => cn(
    'w-full px-4 py-2.5 bg-neu-white border-2 border-neu-black shadow-neu-sm',
    'font-body text-sm text-neu-black placeholder:text-neu-black/30',
    'outline-none focus:shadow-neu focus:-translate-x-0.5 focus:-translate-y-0.5 transition-all duration-150',
    errors[k] && 'border-neu-accent shadow-[4px_4px_0px_#FF5C5C]',
  );

  return createPortal(
    <div ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neu-black/50 overflow-y-auto"
      onClick={e => { if (e.target === e.currentTarget) handleClose(); }}>

      <div ref={cardRef} className="w-full max-w-lg bg-neu-white border-2 border-neu-black shadow-neu-xl my-auto">

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
            <input type="text" value={form.title} onChange={e => set('title', e.target.value)}
              placeholder="Nama proyek" className={inputCls('title')} />
            {errors.title && <span className="font-body text-xs text-neu-accent font-semibold">{errors.title}</span>}
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1">
            <label className="font-display font-bold text-xs text-neu-black uppercase tracking-wider">Kategori</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button key={cat} type="button"
                  onClick={() => set('category', form.category === cat ? '' : cat)}
                  className={cn(
                    'px-3 py-1.5 font-display font-bold text-[11px] uppercase tracking-wide border-2 border-neu-black transition-all duration-150',
                    'hover:translate-x-[1px] hover:translate-y-[1px]',
                    form.category === cat
                      ? 'bg-neu-black text-neu-white shadow-none translate-x-[2px] translate-y-[2px]'
                      : 'bg-neu-white text-neu-black shadow-neu-sm',
                  )}>
                  {cat}
                </button>
              ))}
            </div>
            <input type="text" value={form.category} onChange={e => set('category', e.target.value)}
              placeholder="Atau ketik kategori lain..." className={cn(inputCls('category'), 'mt-1 text-xs')} />
          </div>

          {/* Multi Image Upload */}
          <MultiImageUploader
            values={form.images}
            onChange={urls => set('images', urls)}
            error={errors.images}
          />

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
              className={cn(
                'flex-1 py-2.5 font-display font-bold text-xs uppercase tracking-wide',
                'bg-neu-white text-neu-black border-2 border-neu-black shadow-neu',
                'transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm',
                'active:translate-x-1 active:translate-y-1 active:shadow-none',
                isSaving && 'opacity-50 cursor-not-allowed',
              )}>
              Batal
            </button>
            <button type="submit" disabled={isSaving}
              className={cn(
                'flex-1 py-2.5 font-display font-bold text-xs uppercase tracking-wide',
                'bg-neu-primary text-neu-black border-2 border-neu-black shadow-neu',
                'transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm',
                'active:translate-x-1 active:translate-y-1 active:shadow-none',
                isSaving && 'opacity-60 cursor-not-allowed',
              )}>
              {isSaving
                ? <span className="inline-flex items-center gap-1 justify-center"><span className="animate-spin">⟳</span> Menyimpan...</span>
                : (isEdit ? 'Simpan Perubahan' : 'Tambah Portfolio')}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
