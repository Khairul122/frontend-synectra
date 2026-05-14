import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { gsap } from 'gsap';
import { cn } from '../utils/cn';
import { authService } from '../services/auth.service';
import { softwareProductService } from '../services/softwareProduct.service';
import { PageLayout } from '../components/layout/PageLayout';
import { useAlert } from '../hooks/useAlert';
import { SOFTWARE_THUMBNAIL_BUCKET } from '../constants/api';
import supabase from '../lib/supabase';
import { PageLoader } from '../components/ui/PageLoader';

const CATEGORIES = ['Web App', 'Mobile App', 'Desktop App', 'SaaS', 'Template', 'Script'];

async function uploadThumbnail(file) {
  const ext = file.name.split('.').pop();
  const filename = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(SOFTWARE_THUMBNAIL_BUCKET)
    .upload(filename, file, { cacheControl: '3600', upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from(SOFTWARE_THUMBNAIL_BUCKET).getPublicUrl(filename);
  return data.publicUrl;
}

function ImageUploader({ value, onChange }) {
  const [isDragging,  setIsDragging]  = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef(null);

  const processFile = async (file) => {
    if (!file.type.startsWith('image/')) return;
    setIsUploading(true);
    try { const url = await uploadThumbnail(file); onChange(url); }
    catch { /* parent handles */ }
    finally { setIsUploading(false); }
  };

  return (
    <div className="space-y-3">
      <div
        onClick={() => !isUploading && inputRef.current.click()}
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={e => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) processFile(f); }}
        className={cn('border-2 border-dashed border-neu-black p-8 text-center cursor-pointer transition-all duration-150', isDragging ? 'bg-neu-primary/20 border-solid' : 'hover:bg-neu-bg', isUploading && 'opacity-60 cursor-not-allowed')}
      >
        <input ref={inputRef} type="file" accept="image/*" className="hidden"
          onChange={e => { if (e.target.files[0]) processFile(e.target.files[0]); }} />
        {isUploading
          ? <p className="font-display font-bold text-sm text-neu-black animate-pulse">Mengupload...</p>
          : <>
              <svg className="w-8 h-8 mx-auto mb-2 text-neu-black/40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <p className="font-display font-bold text-sm text-neu-black">Klik atau drag thumbnail ke sini</p>
              <p className="font-body text-xs text-neu-black/40 mt-1">PNG, JPG, WEBP — opsional</p>
            </>
        }
      </div>
      {value && (
        <div className="relative border-2 border-neu-black shadow-neu-sm overflow-hidden">
          <img src={value} alt="Thumbnail" className="w-full h-40 object-cover" />
          <button type="button" onClick={() => onChange('')}
            className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-neu-accent border-2 border-neu-black text-neu-white font-bold text-xs shadow-neu-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-150">✕</button>
        </div>
      )}
    </div>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <div onClick={() => onChange(!checked)}
        className={cn('w-12 h-6 border-2 border-neu-black relative transition-colors duration-150', checked ? 'bg-neu-green' : 'bg-neu-black/20')}>
        <div className={cn('absolute top-0.5 w-4 h-4 border-2 border-neu-black bg-neu-white transition-all duration-150', checked ? 'left-[22px]' : 'left-0.5')} />
      </div>
      <span className="font-display font-bold text-sm text-neu-black">{label}</span>
    </label>
  );
}

export default function SoftwareProductFormPage() {
  const navigate   = useNavigate();
  const { id }     = useParams();
  const alert      = useAlert();
  const isEditMode = Boolean(id);

  const [user,      setUser]      = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving,  setIsSaving]  = useState(false);
  const [form, setForm] = useState({
    name: '', nameEn: '', description: '', descriptionEn: '', category: '', price: '',
    demoUrl: '', softcopyUrl: '', thumbnailUrl: '', techStack: '', features: '', featuresEn: '',
    sortOrder: '0', isActive: true,
  });
  const [errors, setErrors] = useState({});
  const formRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      try {
        const me = await authService.getMe();
        if (me.data.role !== 'admin') { navigate('/dashboard'); return; }
        setUser(me.data);
        if (isEditMode) {
          const res = await softwareProductService.getById(id);
          const p   = res.data;
          setForm({
            name:          p.name          ?? '',
            nameEn:        p.nameEn        ?? '',
            description:   p.description   ?? '',
            descriptionEn: p.descriptionEn ?? '',
            category:      p.category      ?? '',
            price:         String(p.price  ?? ''),
            demoUrl:       p.demoUrl       ?? '',
            softcopyUrl:   p.softcopyUrl   ?? '',
            thumbnailUrl:  p.thumbnailUrl  ?? '',
            techStack:     p.techStack     ?? '',
            features:      p.features      ?? '',
            featuresEn:    p.featuresEn    ?? '',
            sortOrder:     String(p.sortOrder ?? '0'),
            isActive:      p.isActive      ?? true,
          });
        }
      } catch { navigate('/login'); }
      finally { setIsLoading(false); }
    };
    init();
  }, [id, isEditMode, navigate]);

  useEffect(() => {
    if (!isLoading && formRef.current)
      gsap.from(formRef.current, { y: 30, opacity: 0, duration: 0.5, ease: 'power2.out' });
  }, [isLoading]);

  const setField = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Nama software wajib diisi.';
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0)
      e.price = 'Harga wajib diisi dan harus berupa angka positif.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setIsSaving(true);
    try {
      const payload = {
        name:          form.name.trim(),
        nameEn:        form.nameEn.trim()        || null,
        description:   form.description.trim()   || null,
        descriptionEn: form.descriptionEn.trim() || null,
        category:      form.category             || null,
        price:         Number(form.price),
        demoUrl:       form.demoUrl.trim()       || null,
        softcopyUrl:   form.softcopyUrl.trim()   || null,
        thumbnailUrl:  form.thumbnailUrl         || null,
        techStack:     form.techStack.trim()     || null,
        features:      form.features.trim()      || null,
        featuresEn:    form.featuresEn.trim()    || null,
        sortOrder:     Number(form.sortOrder)    || 0,
        isActive:      form.isActive,
      };
      if (isEditMode) {
        await softwareProductService.update(id, payload);
        alert.success('Software berhasil diperbarui.');
      } else {
        await softwareProductService.create(payload);
        alert.success('Software berhasil ditambahkan.');
      }
      setTimeout(() => navigate('/software-products'), 800);
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'Gagal menyimpan software.';
      alert.error(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <PageLoader />;

  const inputClass = (err) => cn(
    'w-full px-4 py-2.5 bg-neu-white border-2 border-neu-black shadow-neu-sm font-body text-neu-black placeholder:text-gray-400',
    'outline-none focus:shadow-neu focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all duration-150',
    err && 'border-neu-accent shadow-[4px_4px_0px_#FF5C5C]',
  );

  return (
    <PageLayout user={user} title={isEditMode ? 'Edit Software' : 'Tambah Software'} alert={alert}>
      <div ref={formRef} className="max-w-2xl mx-auto">

        <div className="flex items-center gap-2 mb-6 font-mono text-xs text-neu-black/50">
          <button type="button" onClick={() => navigate('/software-products')} className="hover:text-neu-black transition-colors">
            Manajemen Software
          </button>
          <span>/</span>
          <span className="text-neu-black">{isEditMode ? 'Edit' : 'Tambah Baru'}</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Nama */}
          <div className="flex flex-col gap-1.5">
            <label className="font-display font-bold text-sm text-neu-black uppercase tracking-wide">
              Nama Software <span className="text-neu-accent">*</span>
            </label>
            <input type="text" value={form.name} onChange={e => setField('name', e.target.value)}
              placeholder="Contoh: POS Kasir UMKM" className={inputClass(errors.name)} />
            {errors.name && <span className="text-neu-accent font-body font-semibold text-xs">{errors.name}</span>}
          </div>

          {/* Kategori & Harga */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-display font-bold text-sm text-neu-black uppercase tracking-wide">Kategori</label>
              <select value={form.category} onChange={e => setField('category', e.target.value)}
                className="w-full px-4 py-2.5 bg-neu-white border-2 border-neu-black shadow-neu-sm font-body text-neu-black outline-none cursor-pointer focus:shadow-neu transition-all duration-150">
                <option value="">-- Pilih Kategori --</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-display font-bold text-sm text-neu-black uppercase tracking-wide">
                Harga (Rp) <span className="text-neu-accent">*</span>
              </label>
              <input type="number" min="0" value={form.price} onChange={e => setField('price', e.target.value)}
                placeholder="1500000" className={inputClass(errors.price)} />
              {errors.price && <span className="text-neu-accent font-body font-semibold text-xs">{errors.price}</span>}
            </div>
          </div>

          {/* Demo URL & Softcopy URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-display font-bold text-sm text-neu-black uppercase tracking-wide">Link Demo</label>
              <input type="url" value={form.demoUrl} onChange={e => setField('demoUrl', e.target.value)}
                placeholder="https://demo.example.com" className={inputClass(false)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-display font-bold text-sm text-neu-black uppercase tracking-wide">
                Link Softcopy
                <span className="font-body font-normal normal-case text-neu-black/40 ml-2 text-xs">dikirim setelah verifikasi</span>
              </label>
              <input type="url" value={form.softcopyUrl} onChange={e => setField('softcopyUrl', e.target.value)}
                placeholder="https://drive.google.com/..." className={inputClass(false)} />
            </div>
          </div>

          {/* Deskripsi */}
          <div className="flex flex-col gap-1.5">
            <label className="font-display font-bold text-sm text-neu-black uppercase tracking-wide">Deskripsi</label>
            <textarea value={form.description} onChange={e => setField('description', e.target.value)}
              rows={3} placeholder="Deskripsi singkat software..."
              className="w-full px-4 py-2.5 bg-neu-white border-2 border-neu-black shadow-neu-sm font-body text-neu-black placeholder:text-gray-400 outline-none focus:shadow-neu transition-all duration-150 resize-none" />
          </div>

          {/* Tech Stack */}
          <div className="flex flex-col gap-1.5">
            <label className="font-display font-bold text-sm text-neu-black uppercase tracking-wide">
              Tech Stack
              <span className="font-body font-normal normal-case text-neu-black/40 ml-2 text-xs">(satu per baris)</span>
            </label>
            <textarea value={form.techStack} onChange={e => setField('techStack', e.target.value)}
              rows={4} placeholder={"React\nNestJS\nPostgreSQL\nDocker"}
              className="w-full px-4 py-2.5 bg-neu-white border-2 border-neu-black shadow-neu-sm font-body text-neu-black placeholder:text-gray-400 outline-none focus:shadow-neu transition-all duration-150 resize-none" />
          </div>

          {/* Fitur */}
          <div className="flex flex-col gap-1.5">
            <label className="font-display font-bold text-sm text-neu-black uppercase tracking-wide">
              Fitur-fitur
              <span className="font-body font-normal normal-case text-neu-black/40 ml-2 text-xs">(satu per baris)</span>
            </label>
            <textarea value={form.features} onChange={e => setField('features', e.target.value)}
              rows={4} placeholder={"Multi kasir\nLaporan harian\nManajemen stok\nLogin multi-user"}
              className="w-full px-4 py-2.5 bg-neu-white border-2 border-neu-black shadow-neu-sm font-body text-neu-black placeholder:text-gray-400 outline-none focus:shadow-neu transition-all duration-150 resize-none" />
          </div>

          {/* Thumbnail */}
          <div className="flex flex-col gap-1.5">
            <label className="font-display font-bold text-sm text-neu-black uppercase tracking-wide">Thumbnail</label>
            <ImageUploader value={form.thumbnailUrl} onChange={url => setField('thumbnailUrl', url)} />
          </div>

          {/* ── English Version ── */}
          <div className="border-2 border-dashed border-neu-black/30 p-5 space-y-4">
            <span className="font-mono text-xs text-neu-black/40 uppercase tracking-wide">🌐 Versi English (opsional)</span>
            <div className="flex flex-col gap-1.5">
              <label className="font-display font-bold text-xs text-neu-black uppercase tracking-wide">Nama Software (EN)</label>
              <input type="text" value={form.nameEn} onChange={e => setField('nameEn', e.target.value)}
                placeholder="e.g. POS Cashier System" className={inputClass(false)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-display font-bold text-xs text-neu-black uppercase tracking-wide">Deskripsi (EN)</label>
              <textarea value={form.descriptionEn} onChange={e => setField('descriptionEn', e.target.value)}
                rows={2} placeholder="Description in English..."
                className="w-full px-4 py-2.5 bg-neu-white border-2 border-neu-black shadow-neu-sm font-body text-neu-black placeholder:text-gray-400 outline-none focus:shadow-neu transition-all duration-150 resize-none" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-display font-bold text-xs text-neu-black uppercase tracking-wide">Fitur (EN) <span className="font-body normal-case text-neu-black/40 text-xs">(satu per baris)</span></label>
              <textarea value={form.featuresEn} onChange={e => setField('featuresEn', e.target.value)}
                rows={4} placeholder={"Multi cashier\nDaily reports\nInventory management"}
                className="w-full px-4 py-2.5 bg-neu-white border-2 border-neu-black shadow-neu-sm font-body text-neu-black placeholder:text-gray-400 outline-none focus:shadow-neu transition-all duration-150 resize-none" />
            </div>
          </div>

          {/* Urutan & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-display font-bold text-sm text-neu-black uppercase tracking-wide">Urutan Tampil</label>
              <input type="number" min="0" value={form.sortOrder} onChange={e => setField('sortOrder', e.target.value)}
                className={inputClass(false)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-display font-bold text-sm text-neu-black uppercase tracking-wide">Status</label>
              <div className="bg-neu-white border-2 border-neu-black shadow-neu-sm p-4">
                <Toggle checked={form.isActive} onChange={val => setField('isActive', val)}
                  label={form.isActive ? 'Aktif (ditampilkan)' : 'Nonaktif (disembunyikan)'} />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={isSaving}
              className={cn('px-8 py-2.5 bg-neu-primary border-2 border-neu-black shadow-neu font-display font-bold text-sm uppercase tracking-wide text-neu-black transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm active:translate-x-1 active:translate-y-1 active:shadow-none', isSaving && 'opacity-60 cursor-not-allowed')}>
              {isSaving ? 'Menyimpan...' : isEditMode ? 'Simpan Perubahan' : 'Tambah Software'}
            </button>
            <button type="button" onClick={() => navigate('/software-products')} disabled={isSaving}
              className="px-6 py-2.5 bg-neu-white border-2 border-neu-black shadow-neu font-display font-bold text-sm uppercase tracking-wide text-neu-black transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm active:translate-x-1 active:translate-y-1 active:shadow-none">
              Batal
            </button>
          </div>
        </form>
      </div>
    </PageLayout>
  );
}
