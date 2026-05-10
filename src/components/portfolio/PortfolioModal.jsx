import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';
import { cn } from '../../utils/cn';
import { uploadService } from '../../services/upload.service';

const CATEGORIES = ['Web App', 'Mobile', 'Design', 'Backend'];
const EMPTY      = { title: '', description: '', image: '', category: '' };

function ImageUploader({ value, onChange, error }) {
  const [isDragging, setIsDragging]   = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const inputRef = useRef(null);

  const handleFile = useCallback(async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadError('File harus berupa gambar (JPG, PNG, WebP, GIF)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Ukuran file maksimal 5 MB');
      return;
    }
    setUploadError('');
    setIsUploading(true);
    try {
      const url = await uploadService.uploadImage(file);
      onChange(url);
    } catch {
      setUploadError('Gagal mengunggah gambar. Coba lagi.');
    } finally {
      setIsUploading(false);
    }
  }, [onChange]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);

  const handleRemove = () => onChange('');

  return (
    <div className="flex flex-col gap-2">
      <label className="font-display font-bold text-xs text-neu-black uppercase tracking-wider">
        Gambar
      </label>

      {/* Preview */}
      {value && (
        <div className="relative border-2 border-neu-black">
          <img src={value} alt="preview"
            className="w-full h-40 object-cover"
            onError={e => { e.target.style.display = 'none'; }} />
          <button type="button" onClick={handleRemove}
            className="absolute top-2 right-2 w-7 h-7 bg-neu-accent text-neu-white border-2 border-neu-black font-mono font-bold text-sm flex items-center justify-center hover:opacity-90 transition-opacity">
            ×
          </button>
        </div>
      )}

      {/* Drop zone — hanya tampil jika belum ada gambar */}
      {!value && (
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => !isUploading && inputRef.current?.click()}
          className={cn(
            'w-full border-2 border-dashed border-neu-black bg-neu-bg',
            'flex flex-col items-center justify-center gap-2 py-8 cursor-pointer',
            'transition-all duration-150',
            isDragging  && 'bg-neu-primary/20 border-solid',
            isUploading && 'opacity-60 cursor-not-allowed',
            error && 'border-neu-accent',
          )}
        >
          {isUploading ? (
            <>
              <span className="animate-spin font-mono text-2xl">⟳</span>
              <span className="font-display font-bold text-xs text-neu-black/60 uppercase">Mengunggah...</span>
            </>
          ) : (
            <>
              <svg className="w-8 h-8 text-neu-black/40" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="font-display font-bold text-xs text-neu-black/50 uppercase tracking-wider text-center px-4">
                {isDragging ? 'Lepas gambar di sini' : 'Klik atau drag & drop gambar'}
              </p>
              <p className="font-mono text-[10px] text-neu-black/30">JPG, PNG, WebP, GIF — maks. 5 MB</p>
            </>
          )}
        </div>
      )}

      {/* Ganti gambar button jika sudah ada */}
      {value && !isUploading && (
        <button type="button" onClick={() => inputRef.current?.click()}
          className="self-start px-3 py-1.5 font-display font-bold text-[10px] uppercase tracking-wide border-2 border-neu-black bg-neu-white shadow-neu-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-150">
          Ganti Gambar
        </button>
      )}

      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={e => handleFile(e.target.files[0])} />

      {(uploadError || error) && (
        <span className="font-body text-xs text-neu-accent font-semibold">{uploadError || error}</span>
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
    onSave({
      title:       form.title,
      description: form.description || undefined,
      image:       form.image       || undefined,
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

          {/* Image Upload */}
          <ImageUploader
            value={form.image}
            onChange={url => set('image', url)}
            error={errors.image}
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
