import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { gsap } from 'gsap';
import { cn } from '../utils/cn';
import { authService } from '../services/auth.service';
import { bannerService } from '../services/banner.service';
import { PageLayout } from '../components/layout/PageLayout';
import { RichTextEditor } from '../components/ui/RichTextEditor';
import { useAlert } from '../hooks/useAlert';
import { SUPABASE_URL, SUPABASE_ANON, BANNER_BUCKET } from '../constants/api';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

async function uploadBannerImage(file) {
  const ext      = file.name.split('.').pop();
  const filename = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(BANNER_BUCKET)
    .upload(filename, file, { cacheControl: '3600', upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from(BANNER_BUCKET).getPublicUrl(filename);
  return data.publicUrl;
}

/* ─── Single image uploader ─────────────────────────────────────────────── */
function ImageUploader({ value, onChange }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef(null);

  const processFile = async (file) => {
    if (!file.type.startsWith('image/')) return;
    setIsUploading(true);
    try {
      const url = await uploadBannerImage(file);
      onChange(url);
    } catch {
      // parent component handles error display
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onClick={() => !isUploading && inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'border-2 border-dashed border-neu-black p-8 text-center cursor-pointer transition-all duration-150',
          isDragging ? 'bg-neu-primary/20 border-solid' : 'hover:bg-neu-bg',
          isUploading && 'opacity-60 cursor-not-allowed',
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => { if (e.target.files[0]) processFile(e.target.files[0]); }}
        />
        {isUploading ? (
          <p className="font-display font-bold text-sm text-neu-black animate-pulse">Mengupload...</p>
        ) : (
          <>
            <svg className="w-8 h-8 mx-auto mb-2 text-neu-black/40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <p className="font-display font-bold text-sm text-neu-black">Klik atau drag gambar ke sini</p>
            <p className="font-body text-xs text-neu-black/40 mt-1">PNG, JPG, WEBP — maks 5MB</p>
          </>
        )}
      </div>

      {/* Preview */}
      {value && (
        <div className="relative border-2 border-neu-black shadow-neu-sm overflow-hidden">
          <img src={value} alt="Preview banner" className="w-full h-48 object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className={cn(
              'absolute top-2 right-2 w-8 h-8 flex items-center justify-center',
              'bg-neu-accent border-2 border-neu-black text-neu-white font-bold text-xs',
              'shadow-neu-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-150',
            )}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Toggle switch ──────────────────────────────────────────────────────── */
function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <div
        onClick={() => onChange(!checked)}
        className={cn(
          'w-12 h-6 border-2 border-neu-black relative transition-colors duration-150',
          checked ? 'bg-neu-green' : 'bg-neu-black/20',
        )}
      >
        <div className={cn(
          'absolute top-0.5 w-4 h-4 border-2 border-neu-black bg-neu-white transition-all duration-150',
          checked ? 'left-[22px]' : 'left-0.5',
        )} />
      </div>
      <span className="font-display font-bold text-sm text-neu-black">{label}</span>
    </label>
  );
}

/* ─── Main page ──────────────────────────────────────────────────────────── */
export default function BannerFormPage() {
  const navigate   = useNavigate();
  const { id }     = useParams();
  const alert      = useAlert();
  const isEditMode = Boolean(id);

  const [user,       setUser]       = useState(null);
  const [isLoading,  setIsLoading]  = useState(true);
  const [isSaving,   setIsSaving]   = useState(false);
  const [form, setForm] = useState({ title: '', description: '', image: '', isActive: true });
  const [errors, setErrors] = useState({});

  const formRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      try {
        const me = await authService.getMe();
        if (me.data.role !== 'admin') { navigate('/dashboard'); return; }
        setUser(me.data);

        if (isEditMode) {
          const res = await bannerService.getById(id);
          const b   = res.data;
          setForm({
            title:       b.title       ?? '',
            description: b.description ?? '',
            image:       b.image       ?? '',
            isActive:    b.isActive    ?? true,
          });
        }
      } catch {
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [id, isEditMode, navigate]);

  useEffect(() => {
    if (!isLoading && formRef.current) {
      gsap.from(formRef.current, { y: 30, opacity: 0, duration: 0.5, ease: 'power2.out' });
    }
  }, [isLoading]);

  const setField = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Judul banner wajib diisi.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setIsSaving(true);
    try {
      const payload = {
        title:       form.title.trim(),
        description: form.description || null,
        image:       form.image || null,
        isActive:    form.isActive,
      };

      if (isEditMode) {
        await bannerService.update(id, payload);
        alert.success('Banner berhasil diperbarui.');
      } else {
        await bannerService.create(payload);
        alert.success('Banner berhasil dibuat.');
      }

      setTimeout(() => navigate('/banners'), 800);
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'Gagal menyimpan banner.';
      alert.error(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setIsSaving(false);
    }
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neu-bg">
        <p className="font-display font-bold text-neu-black animate-pulse">Memuat...</p>
      </div>
    );
  }

  return (
    <PageLayout user={user} title={isEditMode ? 'Edit Banner' : 'Tambah Banner'} alert={alert}>
      <div ref={formRef} className="max-w-2xl mx-auto">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 font-mono text-xs text-neu-black/50">
          <button type="button" onClick={() => navigate('/banners')}
            className="hover:text-neu-black transition-colors">Banner</button>
          <span>/</span>
          <span className="text-neu-black">{isEditMode ? 'Edit' : 'Tambah Baru'}</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="font-display font-bold text-sm text-neu-black uppercase tracking-wide">
              Judul Banner <span className="text-neu-accent">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={e => setField('title', e.target.value)}
              placeholder="Contoh: Banner Promo Lebaran 2025"
              className={cn(
                'w-full px-4 py-2.5 bg-neu-white border-2 border-neu-black shadow-neu-sm',
                'font-body text-neu-black placeholder:text-gray-400',
                'outline-none focus:shadow-neu focus:translate-x-[-2px] focus:translate-y-[-2px]',
                'transition-all duration-150',
                errors.title && 'border-neu-accent shadow-[4px_4px_0px_#FF5C5C]',
              )}
            />
            {errors.title && (
              <span className="text-neu-accent font-body font-semibold text-xs">{errors.title}</span>
            )}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="font-display font-bold text-sm text-neu-black uppercase tracking-wide">
              Deskripsi
            </label>
            <RichTextEditor
              value={form.description}
              onChange={val => setField('description', val)}
              placeholder="Tulis deskripsi banner..."
            />
          </div>

          {/* Image */}
          <div className="flex flex-col gap-1.5">
            <label className="font-display font-bold text-sm text-neu-black uppercase tracking-wide">
              Gambar Banner
            </label>
            <ImageUploader
              value={form.image}
              onChange={url => setField('image', url)}
            />
          </div>

          {/* Is Active */}
          <div className="bg-neu-white border-2 border-neu-black shadow-neu-sm p-4">
            <Toggle
              checked={form.isActive}
              onChange={val => setField('isActive', val)}
              label={form.isActive ? 'Banner Aktif (ditampilkan)' : 'Banner Nonaktif (disembunyikan)'}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className={cn(
                'px-8 py-2.5 bg-neu-primary border-2 border-neu-black shadow-neu',
                'font-display font-bold text-sm uppercase tracking-wide text-neu-black',
                'transition-all duration-150',
                'hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm',
                'active:translate-x-1 active:translate-y-1 active:shadow-none',
                isSaving && 'opacity-60 cursor-not-allowed',
              )}
            >
              {isSaving ? 'Menyimpan...' : isEditMode ? 'Simpan Perubahan' : 'Buat Banner'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/banners')}
              disabled={isSaving}
              className={cn(
                'px-6 py-2.5 bg-neu-white border-2 border-neu-black shadow-neu',
                'font-display font-bold text-sm uppercase tracking-wide text-neu-black',
                'transition-all duration-150',
                'hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm',
                'active:translate-x-1 active:translate-y-1 active:shadow-none',
              )}
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </PageLayout>
  );
}
