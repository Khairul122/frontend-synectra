import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { gsap } from 'gsap';
import { cn } from '../utils/cn';
import { authService } from '../services/auth.service';
import { contactService } from '../services/contact.service';
import { PLATFORMS, getPlatform } from '../constants/platforms';
import { PageLayout } from '../components/layout/PageLayout';
import { useAlert } from '../hooks/useAlert';

/* ─── Icon Picker ────────────────────────────────────────────────────────── */
function IconPicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
      {PLATFORMS.map(({ key, label, Icon, color }) => {
        const selected = value === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={cn(
              'flex flex-col items-center gap-1.5 p-3 border-2 border-neu-black transition-all duration-150',
              selected
                ? 'bg-neu-primary shadow-none translate-x-[2px] translate-y-[2px]'
                : 'bg-neu-white shadow-neu-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none',
            )}
          >
            <Icon style={{ color: selected ? '#0D0D0D' : color }} className="w-7 h-7" />
            <span className="font-mono font-bold text-[10px] uppercase tracking-wide text-neu-black leading-none">
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ─── Toggle ─────────────────────────────────────────────────────────────── */
function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <div onClick={() => onChange(!checked)} className={cn(
        'w-12 h-6 border-2 border-neu-black relative transition-colors duration-150',
        checked ? 'bg-neu-green' : 'bg-neu-black/20',
      )}>
        <div className={cn(
          'absolute top-0.5 w-4 h-4 border-2 border-neu-black bg-neu-white transition-all duration-150',
          checked ? 'left-[22px]' : 'left-0.5',
        )} />
      </div>
      <span className="font-display font-bold text-sm text-neu-black">{label}</span>
    </label>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */
export default function ContactFormPage() {
  const navigate   = useNavigate();
  const { id }     = useParams();
  const alert      = useAlert();
  const isEditMode = Boolean(id);

  const [user,      setUser]      = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving,  setIsSaving]  = useState(false);
  const [form,      setForm]      = useState({
    nama:        '',
    platform:    '',
    contactInfo: '',
    linkUrl:     '',
    icon:        'whatsapp',
    isActive:    true,
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
          const res = await contactService.getById(id);
          const c   = res.data;
          setForm({
            nama:        c.nama        ?? '',
            platform:    c.platform    ?? '',
            contactInfo: c.contactInfo ?? '',
            linkUrl:     c.linkUrl     ?? '',
            icon:        c.icon        ?? 'whatsapp',
            isActive:    c.isActive    ?? true,
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

  const setField = (key, val) => {
    setForm(prev => ({ ...prev, [key]: val }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const handleIconChange = (key) => {
    const platform = getPlatform(key);
    setField('icon', key);
    // Auto-fill platform name jika belum diisi atau ikuti icon
    setForm(prev => ({
      ...prev,
      icon: key,
      platform: prev.platform === '' || PLATFORMS.some(p => p.label === prev.platform)
        ? platform.label
        : prev.platform,
    }));
  };

  const validate = () => {
    const e = {};
    if (!form.nama.trim())        e.nama        = 'Nama wajib diisi.';
    if (!form.platform.trim())    e.platform    = 'Nama platform wajib diisi.';
    if (!form.contactInfo.trim()) e.contactInfo = 'Info kontak wajib diisi.';
    if (!form.linkUrl.trim())     e.linkUrl     = 'Link URL wajib diisi.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setIsSaving(true);
    try {
      const payload = {
        nama:        form.nama.trim(),
        platform:    form.platform.trim(),
        contactInfo: form.contactInfo.trim(),
        linkUrl:     form.linkUrl.trim(),
        icon:        form.icon,
        isActive:    form.isActive,
      };
      if (isEditMode) {
        await contactService.update(id, payload);
        alert.success('Kontak berhasil diperbarui.');
      } else {
        await contactService.create(payload);
        alert.success('Kontak berhasil dibuat.');
      }
      setTimeout(() => navigate('/contacts'), 800);
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'Gagal menyimpan kontak.';
      alert.error(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setIsSaving(false);
    }
  };

  const inputCls = (hasError) => cn(
    'w-full px-4 py-2.5 bg-neu-white border-2 border-neu-black shadow-neu-sm',
    'font-body text-neu-black placeholder:text-gray-400',
    'outline-none focus:shadow-neu focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all duration-150',
    hasError && 'border-neu-accent shadow-[4px_4px_0px_#FF5C5C]',
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neu-bg">
        <p className="font-display font-bold text-neu-black animate-pulse">Memuat...</p>
      </div>
    );
  }

  const selectedPlatform = getPlatform(form.icon);

  return (
    <PageLayout user={user} title={isEditMode ? 'Edit Kontak' : 'Tambah Kontak'} alert={alert}>
      <div ref={formRef} className="max-w-2xl mx-auto">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 font-mono text-xs text-neu-black/50">
          <button type="button" onClick={() => navigate('/contacts')}
            className="hover:text-neu-black transition-colors">Contacts</button>
          <span>/</span>
          <span className="text-neu-black">{isEditMode ? 'Edit' : 'Tambah Baru'}</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Icon Picker */}
          <div className="flex flex-col gap-2">
            <label className="font-display font-bold text-sm text-neu-black uppercase tracking-wide">
              Pilih Platform Icon <span className="text-neu-accent">*</span>
            </label>
            {/* Preview terpilih */}
            <div className="flex items-center gap-3 p-3 bg-neu-white border-2 border-neu-black shadow-neu-sm mb-1">
              <div className="w-10 h-10 border-2 border-neu-black flex items-center justify-center"
                style={{ backgroundColor: selectedPlatform.color + '20' }}>
                <selectedPlatform.Icon style={{ color: selectedPlatform.color }} className="w-6 h-6" />
              </div>
              <div>
                <p className="font-display font-bold text-sm text-neu-black">
                  {selectedPlatform.label}
                </p>
                <p className="font-mono text-xs text-neu-black/40">icon: {form.icon}</p>
              </div>
            </div>
            <IconPicker value={form.icon} onChange={handleIconChange} />
          </div>

          {/* Nama */}
          <div className="flex flex-col gap-1.5">
            <label className="font-display font-bold text-sm text-neu-black uppercase tracking-wide">
              Nama <span className="text-neu-accent">*</span>
            </label>
            <input type="text" value={form.nama}
              onChange={e => setField('nama', e.target.value)}
              placeholder="Contoh: Customer Service, Admin, Hotline"
              className={inputCls(errors.nama)} />
            {errors.nama && <span className="text-neu-accent font-body font-semibold text-xs">{errors.nama}</span>}
          </div>

          {/* Platform name */}
          <div className="flex flex-col gap-1.5">
            <label className="font-display font-bold text-sm text-neu-black uppercase tracking-wide">
              Nama Platform <span className="text-neu-accent">*</span>
            </label>
            <input type="text" value={form.platform}
              onChange={e => setField('platform', e.target.value)}
              placeholder="Contoh: WhatsApp, Telepon CS, Email Support"
              className={inputCls(errors.platform)} />
            {errors.platform && <span className="text-neu-accent font-body font-semibold text-xs">{errors.platform}</span>}
          </div>

          {/* Contact Info */}
          <div className="flex flex-col gap-1.5">
            <label className="font-display font-bold text-sm text-neu-black uppercase tracking-wide">
              Info Kontak <span className="text-neu-accent">*</span>
            </label>
            <input type="text" value={form.contactInfo}
              onChange={e => setField('contactInfo', e.target.value)}
              placeholder="Contoh: +6281234567890, info@synectra.com, @synectra"
              className={inputCls(errors.contactInfo)} />
            {errors.contactInfo && <span className="text-neu-accent font-body font-semibold text-xs">{errors.contactInfo}</span>}
          </div>

          {/* Link URL */}
          <div className="flex flex-col gap-1.5">
            <label className="font-display font-bold text-sm text-neu-black uppercase tracking-wide">
              Link URL <span className="text-neu-accent">*</span>
            </label>
            <input type="text" value={form.linkUrl}
              onChange={e => setField('linkUrl', e.target.value)}
              placeholder="Contoh: https://wa.me/6281234567890, tel:+6281234567890"
              className={inputCls(errors.linkUrl)} />
            {errors.linkUrl && <span className="text-neu-accent font-body font-semibold text-xs">{errors.linkUrl}</span>}
            <p className="font-mono text-xs text-neu-black/40">
              Tips: wa.me/628xx • tel:+628xx • mailto:email@domain.com • https://t.me/username
            </p>
          </div>

          {/* Is Active */}
          <div className="bg-neu-white border-2 border-neu-black shadow-neu-sm p-4">
            <Toggle
              checked={form.isActive}
              onChange={val => setField('isActive', val)}
              label={form.isActive ? 'Kontak Aktif (ditampilkan)' : 'Kontak Nonaktif (disembunyikan)'}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={isSaving} className={cn(
              'px-8 py-2.5 bg-neu-primary border-2 border-neu-black shadow-neu',
              'font-display font-bold text-sm uppercase tracking-wide text-neu-black',
              'transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm active:translate-x-1 active:translate-y-1 active:shadow-none',
              isSaving && 'opacity-60 cursor-not-allowed',
            )}>
              {isSaving ? 'Menyimpan...' : isEditMode ? 'Simpan Perubahan' : 'Buat Kontak'}
            </button>
            <button type="button" onClick={() => navigate('/contacts')} disabled={isSaving} className={cn(
              'px-6 py-2.5 bg-neu-white border-2 border-neu-black shadow-neu',
              'font-display font-bold text-sm uppercase tracking-wide text-neu-black',
              'transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm active:translate-x-1 active:translate-y-1 active:shadow-none',
            )}>
              Batal
            </button>
          </div>
        </form>
      </div>
    </PageLayout>
  );
}
