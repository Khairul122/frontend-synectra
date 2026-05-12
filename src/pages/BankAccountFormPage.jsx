import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { gsap } from 'gsap';
import { cn } from '../utils/cn';
import { authService } from '../services/auth.service';
import { bankAccountService } from '../services/bankAccount.service';
import { PageLayout } from '../components/layout/PageLayout';
import { useAlert } from '../hooks/useAlert';
import { BANK_LOGO_BUCKET } from '../constants/api';
import supabase from '../lib/supabase';

async function uploadBankLogo(file) {
  const ext      = file.name.split('.').pop();
  const filename = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(BANK_LOGO_BUCKET)
    .upload(filename, file, { cacheControl: '3600', upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from(BANK_LOGO_BUCKET).getPublicUrl(filename);
  return data.publicUrl;
}

/* ─── Logo Uploader ──────────────────────────────────────────────────────── */
function LogoUploader({ value, onChange }) {
  const [isDragging,  setIsDragging]  = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef(null);

  const processFile = async (file) => {
    if (!file.type.startsWith('image/')) return;
    setIsUploading(true);
    try {
      const url = await uploadBankLogo(file);
      onChange(url);
    } catch {
      // error handled by parent
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div
        onClick={() => !isUploading && inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) processFile(f); }}
        className={cn(
          'border-2 border-dashed border-neu-black p-8 text-center cursor-pointer transition-all duration-150',
          isDragging ? 'bg-neu-primary/20 border-solid' : 'hover:bg-neu-bg',
          isUploading && 'opacity-60 cursor-not-allowed',
        )}
      >
        <input ref={inputRef} type="file" accept="image/*" className="hidden"
          onChange={e => { if (e.target.files[0]) processFile(e.target.files[0]); }} />
        {isUploading ? (
          <p className="font-display font-bold text-sm text-neu-black animate-pulse">Mengupload...</p>
        ) : (
          <>
            <svg className="w-8 h-8 mx-auto mb-2 text-neu-black/40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <p className="font-display font-bold text-sm text-neu-black">Klik atau drag logo bank ke sini</p>
            <p className="font-body text-xs text-neu-black/40 mt-1">PNG, JPG, WEBP — maks 5MB</p>
          </>
        )}
      </div>

      {value && (
        <div className="relative border-2 border-neu-black shadow-neu-sm overflow-hidden bg-neu-bg flex items-center justify-center p-4">
          <img src={value} alt="Preview logo" className="max-h-32 object-contain" />
          <button type="button" onClick={() => onChange('')} className={cn(
            'absolute top-2 right-2 w-8 h-8 flex items-center justify-center',
            'bg-neu-accent border-2 border-neu-black text-neu-white font-bold text-xs',
            'shadow-neu-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-150',
          )}>✕</button>
        </div>
      )}
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
export default function BankAccountFormPage() {
  const navigate   = useNavigate();
  const { id }     = useParams();
  const alert      = useAlert();
  const isEditMode = Boolean(id);

  const [user,      setUser]      = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving,  setIsSaving]  = useState(false);
  const [form,      setForm]      = useState({ bankName: '', accountNumber: '', accountHolder: '', bankLogo: '', isActive: true });
  const [errors,    setErrors]    = useState({});

  const formRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      try {
        const me = await authService.getMe();
        if (me.data.role !== 'admin') { navigate('/dashboard'); return; }
        setUser(me.data);

        if (isEditMode) {
          const res = await bankAccountService.getById(id);
          const a   = res.data;
          setForm({
            bankName:      a.bankName      ?? '',
            accountNumber: a.accountNumber ?? '',
            accountHolder: a.accountHolder ?? '',
            bankLogo:      a.bankLogo      ?? '',
            isActive:      a.isActive      ?? true,
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
    if (!form.bankName.trim())      e.bankName      = 'Nama bank wajib diisi.';
    if (!form.accountNumber.trim()) e.accountNumber = 'Nomor rekening wajib diisi.';
    if (!form.accountHolder.trim()) e.accountHolder = 'Pemilik akun wajib diisi.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setIsSaving(true);
    try {
      const payload = {
        bankName:      form.bankName.trim(),
        accountNumber: form.accountNumber.trim(),
        accountHolder: form.accountHolder.trim(),
        bankLogo:      form.bankLogo || null,
        isActive:      form.isActive,
      };

      if (isEditMode) {
        await bankAccountService.update(id, payload);
        alert.success('Akun bank berhasil diperbarui.');
      } else {
        await bankAccountService.create(payload);
        alert.success('Akun bank berhasil dibuat.');
      }

      setTimeout(() => navigate('/bank-accounts'), 800);
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'Gagal menyimpan akun bank.';
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
    <PageLayout user={user} title={isEditMode ? 'Edit Akun Bank' : 'Tambah Akun Bank'} alert={alert}>
      <div ref={formRef} className="max-w-2xl mx-auto">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 font-mono text-xs text-neu-black/50">
          <button type="button" onClick={() => navigate('/bank-accounts')}
            className="hover:text-neu-black transition-colors">Bank Accounts</button>
          <span>/</span>
          <span className="text-neu-black">{isEditMode ? 'Edit' : 'Tambah Baru'}</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Bank Name */}
          <div className="flex flex-col gap-1.5">
            <label className="font-display font-bold text-sm text-neu-black uppercase tracking-wide">
              Nama Bank <span className="text-neu-accent">*</span>
            </label>
            <input
              type="text" value={form.bankName}
              onChange={e => setField('bankName', e.target.value)}
              placeholder="Contoh: BCA, Mandiri, BRI"
              className={cn(
                'w-full px-4 py-2.5 bg-neu-white border-2 border-neu-black shadow-neu-sm',
                'font-body text-neu-black placeholder:text-gray-400',
                'outline-none focus:shadow-neu focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all duration-150',
                errors.bankName && 'border-neu-accent shadow-[4px_4px_0px_#FF5C5C]',
              )}
            />
            {errors.bankName && <span className="text-neu-accent font-body font-semibold text-xs">{errors.bankName}</span>}
          </div>

          {/* Account Number */}
          <div className="flex flex-col gap-1.5">
            <label className="font-display font-bold text-sm text-neu-black uppercase tracking-wide">
              Nomor Rekening <span className="text-neu-accent">*</span>
            </label>
            <input
              type="text" value={form.accountNumber}
              onChange={e => setField('accountNumber', e.target.value)}
              placeholder="Contoh: 1234567890"
              className={cn(
                'w-full px-4 py-2.5 bg-neu-white border-2 border-neu-black shadow-neu-sm',
                'font-body text-neu-black placeholder:text-gray-400',
                'outline-none focus:shadow-neu focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all duration-150',
                errors.accountNumber && 'border-neu-accent shadow-[4px_4px_0px_#FF5C5C]',
              )}
            />
            {errors.accountNumber && <span className="text-neu-accent font-body font-semibold text-xs">{errors.accountNumber}</span>}
          </div>

          {/* Account Holder */}
          <div className="flex flex-col gap-1.5">
            <label className="font-display font-bold text-sm text-neu-black uppercase tracking-wide">
              Pemilik Akun <span className="text-neu-accent">*</span>
            </label>
            <input
              type="text" value={form.accountHolder}
              onChange={e => setField('accountHolder', e.target.value)}
              placeholder="Contoh: PT Synectra Indonesia"
              className={cn(
                'w-full px-4 py-2.5 bg-neu-white border-2 border-neu-black shadow-neu-sm',
                'font-body text-neu-black placeholder:text-gray-400',
                'outline-none focus:shadow-neu focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all duration-150',
                errors.accountHolder && 'border-neu-accent shadow-[4px_4px_0px_#FF5C5C]',
              )}
            />
            {errors.accountHolder && <span className="text-neu-accent font-body font-semibold text-xs">{errors.accountHolder}</span>}
          </div>

          {/* Bank Logo */}
          <div className="flex flex-col gap-1.5">
            <label className="font-display font-bold text-sm text-neu-black uppercase tracking-wide">
              Logo Bank
            </label>
            <LogoUploader value={form.bankLogo} onChange={url => setField('bankLogo', url)} />
          </div>

          {/* Is Active */}
          <div className="bg-neu-white border-2 border-neu-black shadow-neu-sm p-4">
            <Toggle
              checked={form.isActive}
              onChange={val => setField('isActive', val)}
              label={form.isActive ? 'Akun Aktif (ditampilkan)' : 'Akun Nonaktif (disembunyikan)'}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={isSaving} className={cn(
              'px-8 py-2.5 bg-neu-primary border-2 border-neu-black shadow-neu',
              'font-display font-bold text-sm uppercase tracking-wide text-neu-black',
              'transition-all duration-150',
              'hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm',
              'active:translate-x-1 active:translate-y-1 active:shadow-none',
              isSaving && 'opacity-60 cursor-not-allowed',
            )}>
              {isSaving ? 'Menyimpan...' : isEditMode ? 'Simpan Perubahan' : 'Buat Akun Bank'}
            </button>
            <button type="button" onClick={() => navigate('/bank-accounts')} disabled={isSaving} className={cn(
              'px-6 py-2.5 bg-neu-white border-2 border-neu-black shadow-neu',
              'font-display font-bold text-sm uppercase tracking-wide text-neu-black',
              'transition-all duration-150',
              'hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm',
              'active:translate-x-1 active:translate-y-1 active:shadow-none',
            )}>
              Batal
            </button>
          </div>
        </form>
      </div>
    </PageLayout>
  );
}
