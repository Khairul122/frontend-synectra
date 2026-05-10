import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { gsap } from 'gsap';
import { cn } from '../utils/cn';
import { authService } from '../services/auth.service';
import { portfolioService } from '../services/portfolio.service';
import { uploadService } from '../services/upload.service';
import { Sidebar } from '../components/layout/Sidebar';
import { Navbar } from '../components/layout/Navbar';
import { AlertContainer } from '../components/ui/Alert';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { useAlert } from '../hooks/useAlert';

const CATEGORIES = ['Web App', 'Mobile', 'Design', 'Backend'];
const EMPTY      = { title: '', description: '', images: [], category: '' };

/* ─── Multi-image uploader ─────────────────────────────────────────────── */
function MultiImageUploader({ values, onChange }) {
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
    e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const removeAt  = (idx) => onChange(values.filter((_, i) => i !== idx));
  const moveLeft  = (idx) => { if (idx === 0) return; const n = [...values]; [n[idx-1],n[idx]]=[n[idx],n[idx-1]]; onChange(n); };
  const moveRight = (idx) => { if (idx === values.length-1) return; const n = [...values]; [n[idx],n[idx+1]]=[n[idx+1],n[idx]]; onChange(n); };
  const isUploading = uploading.length > 0;

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between">
        <label className="font-display font-bold text-xs text-neu-black uppercase tracking-wider">Gambar</label>
        {values.length > 0 && (
          <span className="font-mono text-[10px] text-neu-black/40">{values.length} gambar · pertama jadi cover</span>
        )}
      </div>

      {/* Drop zone utama (kalau belum ada gambar) */}
      {values.length === 0 && (
        <div
          onDrop={onDrop}
          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => !isUploading && inputRef.current?.click()}
          className={cn(
            'flex-1 min-h-64 border-2 border-dashed border-neu-black bg-neu-bg cursor-pointer',
            'flex flex-col items-center justify-center gap-4',
            'transition-all duration-150',
            isDragging  && 'bg-neu-primary/20 border-solid border-neu-black',
            isUploading && 'opacity-60 cursor-not-allowed',
          )}
        >
          {isUploading ? (
            <>
              <span className="animate-spin font-mono text-4xl text-neu-black/40">⟳</span>
              <span className="font-display font-bold text-sm text-neu-black/50 uppercase">
                Mengunggah {uploading.length} gambar...
              </span>
            </>
          ) : (
            <>
              <svg className="w-14 h-14 text-neu-black/20" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div className="text-center px-6">
                <p className="font-display font-bold text-base text-neu-black/40 uppercase tracking-wide">
                  {isDragging ? 'Lepas gambar di sini' : 'Klik atau drag & drop'}
                </p>
                <p className="font-mono text-xs text-neu-black/25 mt-1">
                  Pilih lebih dari 1 sekaligus · JPG PNG WebP GIF · maks 5 MB
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Grid preview + slot tambah */}
      {values.length > 0 && (
        <div className="flex flex-col gap-3">
          {/* Cover besar */}
          <div className="relative border-2 border-neu-black group">
            <span className="absolute top-2 left-2 z-10 px-2 py-0.5 bg-neu-primary border-2 border-neu-black font-mono font-bold text-[10px] uppercase shadow-neu-sm">
              Cover
            </span>
            <img src={values[0]} alt="cover"
              className="w-full h-56 object-cover" />
            <div className="absolute inset-0 bg-neu-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button type="button" onClick={() => removeAt(0)}
                className="px-3 py-1.5 bg-neu-accent text-neu-white border-2 border-neu-white font-display font-bold text-xs uppercase hover:opacity-90 transition-opacity">
                Hapus
              </button>
            </div>
          </div>

          {/* Grid gambar lainnya */}
          {values.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {values.slice(1).map((url, i) => {
                const idx = i + 1;
                return (
                  <div key={url} className="relative border-2 border-neu-black group">
                    <img src={url} alt={`img-${idx}`} className="w-full h-20 object-cover" />
                    <div className="absolute inset-0 bg-neu-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                      <button type="button" onClick={() => moveLeft(idx)}
                        className="w-6 h-6 bg-neu-white border border-neu-black font-mono text-[10px] flex items-center justify-center hover:bg-neu-primary">←</button>
                      <button type="button" onClick={() => removeAt(idx)}
                        className="w-6 h-6 bg-neu-accent text-neu-white border border-neu-black font-mono text-xs flex items-center justify-center">×</button>
                      <button type="button" onClick={() => moveRight(idx)} disabled={idx === values.length - 1}
                        className="w-6 h-6 bg-neu-white border border-neu-black font-mono text-[10px] flex items-center justify-center hover:bg-neu-primary disabled:opacity-30">→</button>
                    </div>
                  </div>
                );
              })}

              {/* Slot tambah */}
              {!isUploading && (
                <button type="button" onClick={() => inputRef.current?.click()}
                  className="h-20 border-2 border-dashed border-neu-black/40 bg-neu-bg flex flex-col items-center justify-center gap-1 hover:border-neu-black hover:bg-neu-primary/10 transition-all">
                  <span className="font-mono text-xl text-neu-black/30">+</span>
                  <span className="font-mono text-[9px] text-neu-black/25 uppercase">Tambah</span>
                </button>
              )}
            </div>
          )}

          {/* Progress */}
          {isUploading && (
            <div className="flex items-center gap-2 px-4 py-2.5 border-2 border-neu-black bg-neu-bg">
              <span className="animate-spin font-mono">⟳</span>
              <span className="font-display font-bold text-xs uppercase text-neu-black/60">
                Mengunggah {uploading.length} gambar...
              </span>
            </div>
          )}

          {/* Tombol tambah gambar (kalau hanya 1 gambar, belum ada grid) */}
          {values.length === 1 && !isUploading && (
            <button type="button" onClick={() => inputRef.current?.click()}
              className="self-start px-4 py-2 font-display font-bold text-xs uppercase border-2 border-neu-black bg-neu-white shadow-neu-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
              + Tambah Gambar Lain
            </button>
          )}
        </div>
      )}

      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
        onChange={e => handleFiles(e.target.files)} />

      {uploadError && (
        <span className="font-body text-xs text-neu-accent font-semibold">{uploadError}</span>
      )}
    </div>
  );
}

/* ─── Full Screen Form Page ─────────────────────────────────────────────── */
export default function PortfolioFormPage() {
  const navigate = useNavigate();
  const { id }   = useParams();
  const isEdit   = Boolean(id);
  const alert    = useAlert();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving]   = useState(false);
  const [form, setForm]           = useState(EMPTY);
  const [errors, setErrors]       = useState({});

  const leftRef   = useRef(null);
  const rightRef  = useRef(null);
  const topbarRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      try {
        const me = await authService.getMe();
        if (me.data?.role !== 'admin') { navigate('/dashboard'); return; }
      } catch {
        navigate('/login'); return;
      }

      if (isEdit) {
        try {
          const res = await portfolioService.getById(id);
          const p   = res.data;
          setForm({
            title:       p.title       ?? '',
            description: p.description ?? '',
            images:      p.images?.length ? p.images : (p.image ? [p.image] : []),
            category:    p.category    ?? '',
          });
        } catch {
          alert.error('Portfolio tidak ditemukan.');
          navigate('/portfolio'); return;
        }
      }
      setIsLoading(false);
    };
    init();
  }, [id, isEdit, navigate]);

  useEffect(() => {
    if (isLoading) return;
    gsap.from(topbarRef.current, { y: -30, opacity: 0, duration: 0.35, ease: 'power2.out' });
    gsap.from(leftRef.current,   { x: -40, opacity: 0, duration: 0.45, delay: 0.1, ease: 'power2.out' });
    gsap.from(rightRef.current,  { x:  40, opacity: 0, duration: 0.45, delay: 0.15, ease: 'power2.out' });
  }, [isLoading]);

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Judul wajib diisi';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSaving(true);
    try {
      const payload = {
        title:       form.title,
        description: form.description || undefined,
        image:       form.images[0]   || undefined,
        images:      form.images,
        category:    form.category    || undefined,
      };
      if (isEdit) {
        await portfolioService.update(id, payload);
        alert.success('Portfolio berhasil diperbarui.');
      } else {
        await portfolioService.create(payload);
        alert.success('Portfolio berhasil ditambahkan.');
      }
      setTimeout(() => navigate('/portfolio'), 700);
    } catch (err) {
      alert.error(err?.response?.data?.message ?? 'Gagal menyimpan portfolio.');
      setIsSaving(false);
    }
  };

  const inputCls = (k) => cn(
    'w-full px-4 py-3 bg-neu-white border-2 border-neu-black',
    'font-body text-sm text-neu-black placeholder:text-neu-black/30',
    'outline-none focus:shadow-neu focus:-translate-x-0.5 focus:-translate-y-0.5 transition-all duration-150',
    errors[k] && 'border-neu-accent shadow-[4px_4px_0px_#FF5C5C]',
  );

  if (isLoading) return (
    <div className="fixed inset-0 bg-neu-bg flex items-center justify-center">
      <p className="font-display font-bold text-neu-black text-xl animate-pulse uppercase tracking-widest">
        Memuat...
      </p>
    </div>
  );

  return (
    <>
      <AlertContainer alerts={alert.alerts} onDismiss={alert.dismiss} />

      <div className="fixed inset-0 bg-neu-bg flex flex-col overflow-hidden">

        {/* ── Top bar ── */}
        <header ref={topbarRef}
          className="shrink-0 h-14 border-b-2 border-neu-black bg-neu-white flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => navigate('/portfolio')}
              className="flex items-center gap-2 px-4 py-1.5 font-display font-bold text-xs uppercase border-2 border-neu-black bg-neu-white shadow-neu-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-150">
              ← Kembali
            </button>
            <div className="w-px h-5 bg-neu-black/20" />
            <h1 className="font-display font-bold text-sm uppercase tracking-wide text-neu-black">
              {isEdit ? 'Edit Portfolio' : 'Tambah Portfolio Baru'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button type="button" onClick={() => navigate('/portfolio')} disabled={isSaving}
              className={cn(
                'px-5 py-1.5 font-display font-bold text-xs uppercase border-2 border-neu-black bg-neu-white shadow-neu-sm',
                'hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-150',
                isSaving && 'opacity-40 cursor-not-allowed',
              )}>
              Batal
            </button>
            <button form="portfolio-form" type="submit" disabled={isSaving}
              className={cn(
                'px-6 py-1.5 font-display font-bold text-xs uppercase border-2 border-neu-black bg-neu-primary shadow-neu',
                'hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm transition-all duration-150',
                'active:translate-x-1 active:translate-y-1 active:shadow-none',
                isSaving && 'opacity-60 cursor-not-allowed',
              )}>
              {isSaving
                ? <span className="inline-flex items-center gap-1.5"><span className="animate-spin">⟳</span> Menyimpan...</span>
                : (isEdit ? 'Simpan Perubahan' : 'Tambah Portfolio')}
            </button>
          </div>
        </header>

        {/* ── Body: dua kolom ── */}
        <div className="flex-1 flex overflow-hidden">

          {/* Kolom kiri — field teks */}
          <div ref={leftRef} className="w-1/2 border-r-2 border-neu-black overflow-y-auto">
            <form id="portfolio-form" onSubmit={handleSubmit}
              className="p-8 flex flex-col gap-7 min-h-full">

              {/* Label strip */}
              <div className="pb-4 border-b-2 border-neu-black">
                <p className="font-mono text-[10px] text-neu-black/40 uppercase tracking-widest">
                  {isEdit ? `Mengedit · ${id}` : 'Proyek baru'}
                </p>
              </div>

              {/* Title */}
              <div className="flex flex-col gap-2">
                <label className="font-display font-bold text-xs uppercase tracking-wider text-neu-black">
                  Judul <span className="text-neu-accent">*</span>
                </label>
                <input type="text" value={form.title}
                  onChange={e => set('title', e.target.value)}
                  placeholder="Nama proyek" className={inputCls('title')}
                  autoFocus />
                {errors.title && (
                  <span className="font-body text-xs text-neu-accent font-semibold">{errors.title}</span>
                )}
              </div>

              {/* Category */}
              <div className="flex flex-col gap-2">
                <label className="font-display font-bold text-xs uppercase tracking-wider text-neu-black">
                  Kategori
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button key={cat} type="button"
                      onClick={() => set('category', form.category === cat ? '' : cat)}
                      className={cn(
                        'px-4 py-2 font-display font-bold text-xs uppercase tracking-wide border-2 border-neu-black transition-all duration-150',
                        form.category === cat
                          ? 'bg-neu-black text-neu-white translate-x-[2px] translate-y-[2px] shadow-none'
                          : 'bg-neu-white text-neu-black shadow-neu-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none',
                      )}>
                      {cat}
                    </button>
                  ))}
                </div>
                <input type="text" value={form.category}
                  onChange={e => set('category', e.target.value)}
                  placeholder="Atau ketik kategori lain..."
                  className={cn(inputCls('category'), 'text-xs')} />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-2 flex-1">
                <label className="font-display font-bold text-xs uppercase tracking-wider text-neu-black">
                  Deskripsi
                </label>
                <textarea value={form.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder="Deskripsi singkat proyek..."
                  className={cn(inputCls('description'), 'resize-none flex-1 min-h-48')}
                />
              </div>
            </form>
          </div>

          {/* Kolom kanan — upload gambar */}
          <div ref={rightRef} className="w-1/2 overflow-y-auto">
            <div className="p-8 flex flex-col gap-4 min-h-full">
              <div className="pb-4 border-b-2 border-neu-black">
                <p className="font-mono text-[10px] text-neu-black/40 uppercase tracking-widest">
                  Gambar proyek
                </p>
              </div>
              <MultiImageUploader
                values={form.images}
                onChange={urls => set('images', urls)}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
