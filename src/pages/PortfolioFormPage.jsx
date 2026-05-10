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
import { useAlert } from '../hooks/useAlert';
import { ConfirmModal } from '../components/ui/ConfirmModal';

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
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="font-display font-bold text-xs text-neu-black uppercase tracking-wider">
          Gambar
        </label>
        {values.length > 0 && (
          <span className="font-mono text-xs text-neu-black/40">{values.length} gambar · gambar pertama jadi cover</span>
        )}
      </div>

      {/* Grid preview */}
      {values.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {values.map((url, idx) => (
            <div key={url} className="relative border-2 border-neu-black group shadow-neu-sm">
              {idx === 0 && (
                <span className="absolute top-1.5 left-1.5 z-10 px-1.5 py-0.5 bg-neu-primary border border-neu-black font-mono font-bold text-[9px] uppercase">
                  Cover
                </span>
              )}
              <img src={url} alt={`img-${idx}`} className="w-full h-28 object-cover" />
              <div className="absolute inset-0 bg-neu-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                <button type="button" onClick={() => moveLeft(idx)} disabled={idx === 0}
                  className="w-7 h-7 bg-neu-white border-2 border-neu-black font-mono text-xs disabled:opacity-30 flex items-center justify-center hover:bg-neu-primary transition-colors">←</button>
                <button type="button" onClick={() => removeAt(idx)}
                  className="w-7 h-7 bg-neu-accent text-neu-white border-2 border-neu-black font-mono text-sm flex items-center justify-center hover:opacity-90">×</button>
                <button type="button" onClick={() => moveRight(idx)} disabled={idx === values.length - 1}
                  className="w-7 h-7 bg-neu-white border-2 border-neu-black font-mono text-xs disabled:opacity-30 flex items-center justify-center hover:bg-neu-primary transition-colors">→</button>
              </div>
            </div>
          ))}

          {/* Slot tambah */}
          {!isUploading && (
            <button type="button" onClick={() => inputRef.current?.click()}
              className="h-28 border-2 border-dashed border-neu-black/40 bg-neu-bg flex flex-col items-center justify-center gap-1.5 hover:border-neu-black hover:bg-neu-primary/10 transition-all duration-150">
              <span className="font-mono text-2xl text-neu-black/40">+</span>
              <span className="font-mono text-[10px] text-neu-black/30 uppercase">Tambah</span>
            </button>
          )}
        </div>
      )}

      {/* Drop zone awal */}
      {values.length === 0 && (
        <div
          onDrop={onDrop}
          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => !isUploading && inputRef.current?.click()}
          className={cn(
            'w-full border-2 border-dashed border-neu-black bg-neu-bg cursor-pointer',
            'flex flex-col items-center justify-center gap-3 py-14',
            'transition-all duration-150',
            isDragging  && 'bg-neu-primary/20 border-solid',
            isUploading && 'opacity-60 cursor-not-allowed',
          )}
        >
          {isUploading ? (
            <>
              <span className="animate-spin font-mono text-3xl">⟳</span>
              <span className="font-display font-bold text-sm text-neu-black/60 uppercase">
                Mengunggah {uploading.length} gambar...
              </span>
            </>
          ) : (
            <>
              <svg className="w-10 h-10 text-neu-black/30" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div className="text-center">
                <p className="font-display font-bold text-sm text-neu-black/50 uppercase tracking-wider">
                  {isDragging ? 'Lepas gambar di sini' : 'Klik atau drag & drop gambar'}
                </p>
                <p className="font-mono text-xs text-neu-black/30 mt-1">Bisa pilih lebih dari 1 — JPG, PNG, WebP, GIF — maks. 5 MB/gambar</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Progress saat ada gambar */}
      {values.length > 0 && isUploading && (
        <div className="flex items-center gap-2 px-4 py-2.5 border-2 border-neu-black bg-neu-bg">
          <span className="animate-spin font-mono">⟳</span>
          <span className="font-display font-bold text-xs uppercase text-neu-black/60">
            Mengunggah {uploading.length} gambar...
          </span>
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

/* ─── Form Page ─────────────────────────────────────────────────────────── */
export default function PortfolioFormPage() {
  const navigate   = useNavigate();
  const { id }     = useParams();
  const isEdit     = Boolean(id);
  const alert      = useAlert();

  const [user, setUser]           = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving]   = useState(false);
  const [showLogout, setShowLogout]   = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [form, setForm]   = useState(EMPTY);
  const [errors, setErrors] = useState({});

  const headerRef = useRef(null);
  const cardRef   = useRef(null);

  useEffect(() => {
    const init = async () => {
      try {
        const me = await authService.getMe();
        const u  = me.data;
        if (u.role !== 'admin') { navigate('/dashboard'); return; }
        setUser(u);
      } catch {
        navigate('/login');
        return;
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
          navigate('/portfolio');
          return;
        }
      }

      setIsLoading(false);
    };
    init();
  }, [id, isEdit, navigate]);

  useEffect(() => {
    if (isLoading) return;
    gsap.from(headerRef.current, { y: -20, opacity: 0, duration: 0.4, ease: 'power2.out' });
    gsap.from(cardRef.current,   { y: 30,  opacity: 0, duration: 0.5, delay: 0.1, ease: 'power2.out' });
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
    const payload = {
      title:       form.title,
      description: form.description || undefined,
      image:       form.images[0]   || undefined,
      images:      form.images,
      category:    form.category    || undefined,
    };
    try {
      if (isEdit) {
        await portfolioService.update(id, payload);
        alert.success('Portfolio berhasil diperbarui.');
      } else {
        await portfolioService.create(payload);
        alert.success('Portfolio berhasil ditambahkan.');
      }
      setTimeout(() => navigate('/portfolio'), 800);
    } catch (err) {
      alert.error(err?.response?.data?.message ?? 'Gagal menyimpan portfolio.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authService.logout();
      navigate('/login');
    } catch {
      alert.error('Gagal keluar.');
      setIsLoggingOut(false);
      setShowLogout(false);
    }
  };

  const inputCls = (k) => cn(
    'w-full px-4 py-3 bg-neu-white border-2 border-neu-black shadow-neu-sm',
    'font-body text-sm text-neu-black placeholder:text-neu-black/30',
    'outline-none focus:shadow-neu focus:-translate-x-0.5 focus:-translate-y-0.5 transition-all duration-150',
    errors[k] && 'border-neu-accent shadow-[4px_4px_0px_#FF5C5C]',
  );

  if (isLoading) return (
    <div className="min-h-screen bg-neu-bg flex items-center justify-center">
      <p className="font-display font-bold text-neu-black animate-pulse">Memuat...</p>
    </div>
  );

  return (
    <>
      <AlertContainer alerts={alert.alerts} onDismiss={alert.dismiss} />
      <ConfirmModal isOpen={showLogout} title="Konfirmasi Keluar"
        message="Apakah kamu yakin ingin keluar dari Synectra?"
        onConfirm={handleLogout} onCancel={() => setShowLogout(false)} isLoading={isLoggingOut} />

      <div className="flex min-h-screen bg-neu-bg">
        <Sidebar user={user} onLogout={() => setShowLogout(true)} />

        <div className="flex-1 ml-64 flex flex-col">
          <Navbar title={isEdit ? 'Edit Portfolio' : 'Tambah Portfolio'} user={user} />

          <main className="flex-1 p-6">
            {/* Header */}
            <div ref={headerRef} className="flex items-center gap-3 mb-6">
              <button onClick={() => navigate('/portfolio')}
                className="px-4 py-2 font-display font-bold text-xs uppercase border-2 border-neu-black bg-neu-white shadow-neu-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-150">
                ← Kembali
              </button>
              <div className="h-0.5 w-6 bg-neu-black/20" />
              <h1 className="font-display font-bold text-lg text-neu-black uppercase tracking-wide">
                {isEdit ? 'Edit Portfolio' : 'Tambah Portfolio Baru'}
              </h1>
            </div>

            {/* Form card */}
            <div ref={cardRef} className="max-w-2xl">
              <form onSubmit={handleSubmit}
                className="bg-neu-white border-2 border-neu-black shadow-neu-lg flex flex-col">

                {/* Form header strip */}
                <div className="px-6 py-4 border-b-2 border-neu-black bg-neu-primary">
                  <p className="font-mono text-xs text-neu-black/60 uppercase tracking-wider">
                    {isEdit ? `ID: ${id}` : 'Portfolio baru'}
                  </p>
                </div>

                <div className="p-6 flex flex-col gap-6">
                  {/* Title */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-display font-bold text-xs text-neu-black uppercase tracking-wider">
                      Judul <span className="text-neu-accent">*</span>
                    </label>
                    <input type="text" value={form.title} onChange={e => set('title', e.target.value)}
                      placeholder="Nama proyek" className={inputCls('title')} autoFocus />
                    {errors.title && <span className="font-body text-xs text-neu-accent font-semibold">{errors.title}</span>}
                  </div>

                  {/* Category */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-display font-bold text-xs text-neu-black uppercase tracking-wider">Kategori</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {CATEGORIES.map(cat => (
                        <button key={cat} type="button"
                          onClick={() => set('category', form.category === cat ? '' : cat)}
                          className={cn(
                            'px-4 py-2 font-display font-bold text-xs uppercase tracking-wide border-2 border-neu-black transition-all duration-150',
                            form.category === cat
                              ? 'bg-neu-black text-neu-white shadow-none translate-x-[2px] translate-y-[2px]'
                              : 'bg-neu-white text-neu-black shadow-neu-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none',
                          )}>
                          {cat}
                        </button>
                      ))}
                    </div>
                    <input type="text" value={form.category} onChange={e => set('category', e.target.value)}
                      placeholder="Atau ketik kategori lain..." className={inputCls('category')} />
                  </div>

                  {/* Images */}
                  <MultiImageUploader
                    values={form.images}
                    onChange={urls => set('images', urls)}
                  />

                  {/* Description */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-display font-bold text-xs text-neu-black uppercase tracking-wider">Deskripsi</label>
                    <textarea value={form.description} onChange={e => set('description', e.target.value)}
                      placeholder="Deskripsi singkat proyek..."
                      rows={5}
                      className={cn(inputCls('description'), 'resize-none')}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 px-6 py-4 border-t-2 border-neu-black bg-neu-bg">
                  <button type="button" onClick={() => navigate('/portfolio')} disabled={isSaving}
                    className={cn(
                      'flex-1 py-3 font-display font-bold text-xs uppercase tracking-wide',
                      'bg-neu-white text-neu-black border-2 border-neu-black shadow-neu',
                      'transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm',
                      'active:translate-x-1 active:translate-y-1 active:shadow-none',
                      isSaving && 'opacity-50 cursor-not-allowed',
                    )}>
                    Batal
                  </button>
                  <button type="submit" disabled={isSaving}
                    className={cn(
                      'flex-[2] py-3 font-display font-bold text-sm uppercase tracking-wide',
                      'bg-neu-primary text-neu-black border-2 border-neu-black shadow-neu',
                      'transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm',
                      'active:translate-x-1 active:translate-y-1 active:shadow-none',
                      isSaving && 'opacity-60 cursor-not-allowed',
                    )}>
                    {isSaving
                      ? <span className="inline-flex items-center gap-2 justify-center"><span className="animate-spin">⟳</span> Menyimpan...</span>
                      : (isEdit ? 'Simpan Perubahan' : 'Tambah Portfolio')}
                  </button>
                </div>
              </form>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
