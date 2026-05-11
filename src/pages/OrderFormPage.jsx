import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { cn } from '../utils/cn';
import { authService } from '../services/auth.service';
import { orderService } from '../services/order.service';
import apiClient from '../services/apiClient';
import { API_ENDPOINTS } from '../constants/api';
import { PageLayout } from '../components/layout/PageLayout';
import { useAlert } from '../hooks/useAlert';

const SERVICE_CATEGORIES = [
  'software_development', 'ui_ux', 'joki', 'mobile_app',
  'web_design', 'backend', 'data_science', 'other',
];

export default function OrderFormPage() {
  const navigate   = useNavigate();
  const alert      = useAlert();

  const [user,      setUser]      = useState(null);
  const [clients,   setClients]   = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving,  setIsSaving]  = useState(false);
  const [form,      setForm]      = useState({
    clientId:        '',
    title:           '',
    serviceCategory: '',
    description:     '',
    totalPrice:      '',
    deadline:        '',
  });
  const [errors, setErrors] = useState({});
  const formRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      try {
        const me = await authService.getMe();
        if (me.data.role !== 'admin') { navigate('/dashboard'); return; }
        setUser(me.data);
        // Fetch users dengan role client
        const res = await apiClient.get(`${API_ENDPOINTS.ME.replace('/auth/me', '/auth/users') || ''}`)
          .catch(() => ({ data: { data: [] } }));
        // Fallback: gunakan endpoint users jika ada, atau biarkan kosong
        setClients(res?.data?.data ?? []);
      } catch {
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [navigate]);

  useEffect(() => {
    if (!isLoading && formRef.current) {
      gsap.from(formRef.current, { y: 30, opacity: 0, duration: 0.5, ease: 'power2.out' });
    }
  }, [isLoading]);

  const setField = (key, val) => {
    setForm(prev => ({ ...prev, [key]: val }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.clientId.trim()) e.clientId = 'Client wajib dipilih.';
    if (!form.title.trim())    e.title    = 'Judul pesanan wajib diisi.';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setIsSaving(true);
    try {
      const payload = {
        clientId:        form.clientId,
        title:           form.title.trim(),
        serviceCategory: form.serviceCategory || null,
        description:     form.description || null,
        totalPrice:      form.totalPrice ? Number(form.totalPrice) : null,
        deadline:        form.deadline ? new Date(form.deadline).toISOString() : null,
      };
      const res = await orderService.create(payload);
      alert.success('Pesanan berhasil dibuat!');
      setTimeout(() => navigate(`/orders/${res.data.id}`), 800);
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'Gagal membuat pesanan.';
      alert.error(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setIsSaving(false);
    }
  };

  const inputCls = (hasError) => cn(
    'w-full px-4 py-2.5 bg-neu-white border-2 border-neu-black shadow-neu-sm font-body text-neu-black placeholder:text-gray-400',
    'outline-none focus:shadow-neu focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all duration-150',
    hasError && 'border-neu-accent shadow-[4px_4px_0px_#FF5C5C]',
  );

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-neu-bg">
      <p className="font-display font-bold text-neu-black animate-pulse">Memuat...</p>
    </div>
  );

  return (
    <PageLayout user={user} title="Buat Pesanan Baru" alert={alert}>
      <div ref={formRef} className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-6 font-mono text-xs text-neu-black/50">
          <button type="button" onClick={() => navigate('/orders')} className="hover:text-neu-black transition-colors">Orders</button>
          <span>/</span>
          <span className="text-neu-black">Buat Baru</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Client ID — input manual jika belum ada endpoint list users */}
          <div className="flex flex-col gap-1.5">
            <label className="font-display font-bold text-sm text-neu-black uppercase tracking-wide">
              Client ID <span className="text-neu-accent">*</span>
            </label>
            <input type="text" value={form.clientId}
              onChange={e => setField('clientId', e.target.value)}
              placeholder="UUID client (dari tabel users)"
              className={inputCls(errors.clientId)} />
            {errors.clientId && <span className="text-neu-accent font-body font-semibold text-xs">{errors.clientId}</span>}
            <p className="font-mono text-xs text-neu-black/40">Isi dengan UUID user yang memiliki role 'client'</p>
          </div>

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="font-display font-bold text-sm text-neu-black uppercase tracking-wide">
              Judul Pesanan <span className="text-neu-accent">*</span>
            </label>
            <input type="text" value={form.title}
              onChange={e => setField('title', e.target.value)}
              placeholder="Contoh: Pembuatan Web Company Profile"
              className={inputCls(errors.title)} />
            {errors.title && <span className="text-neu-accent font-body font-semibold text-xs">{errors.title}</span>}
          </div>

          {/* Service Category */}
          <div className="flex flex-col gap-1.5">
            <label className="font-display font-bold text-sm text-neu-black uppercase tracking-wide">Kategori Layanan</label>
            <select value={form.serviceCategory} onChange={e => setField('serviceCategory', e.target.value)}
              className="px-4 py-2.5 bg-neu-white border-2 border-neu-black shadow-neu-sm font-body text-neu-black outline-none focus:shadow-neu transition-all duration-150 cursor-pointer">
              <option value="">-- Pilih Kategori --</option>
              {SERVICE_CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
            </select>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="font-display font-bold text-sm text-neu-black uppercase tracking-wide">Deskripsi</label>
            <textarea value={form.description} onChange={e => setField('description', e.target.value)}
              rows={4} placeholder="Detail kebutuhan client..."
              className="w-full px-4 py-2.5 bg-neu-white border-2 border-neu-black shadow-neu-sm font-body text-neu-black placeholder:text-gray-400 outline-none focus:shadow-neu focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all duration-150 resize-none" />
          </div>

          {/* Total Price & Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-display font-bold text-sm text-neu-black uppercase tracking-wide">Total Harga (Rp)</label>
              <input type="number" value={form.totalPrice}
                onChange={e => setField('totalPrice', e.target.value)}
                placeholder="1500000"
                className={inputCls(false)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-display font-bold text-sm text-neu-black uppercase tracking-wide">Deadline</label>
              <input type="datetime-local" value={form.deadline}
                onChange={e => setField('deadline', e.target.value)}
                className={inputCls(false)} />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={isSaving} className={cn(
              'px-8 py-2.5 bg-neu-primary border-2 border-neu-black shadow-neu font-display font-bold text-sm uppercase tracking-wide text-neu-black',
              'transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm active:translate-x-1 active:translate-y-1 active:shadow-none',
              isSaving && 'opacity-60 cursor-not-allowed',
            )}>
              {isSaving ? 'Menyimpan...' : 'Buat Pesanan'}
            </button>
            <button type="button" onClick={() => navigate('/orders')} disabled={isSaving} className={cn(
              'px-6 py-2.5 bg-neu-white border-2 border-neu-black shadow-neu font-display font-bold text-sm uppercase tracking-wide text-neu-black',
              'transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm active:translate-x-1 active:translate-y-1 active:shadow-none',
            )}>Batal</button>
          </div>
        </form>
      </div>
    </PageLayout>
  );
}
