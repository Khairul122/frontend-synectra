import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { gsap } from 'gsap';
import { cn } from '../utils/cn';
import { authService } from '../services/auth.service';
import { orderService } from '../services/order.service';
import { paymentService } from '../services/payment.service';
import { Sidebar } from '../components/layout/Sidebar';
import { Navbar } from '../components/layout/Navbar';
import { AlertContainer } from '../components/ui/Alert';
import { useAlert } from '../hooks/useAlert';
import { SUPABASE_URL, SUPABASE_ANON, PAYMENT_RECEIPT_BUCKET } from '../constants/api';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

const STATUS_CONFIG = {
  pending:     { label: 'Pending',     bg: 'bg-neu-primary', text: 'text-neu-black' },
  in_progress: { label: 'In Progress', bg: 'bg-neu-blue',    text: 'text-neu-white' },
  testing:     { label: 'Testing',     bg: 'bg-neu-purple',  text: 'text-neu-white' },
  revision:    { label: 'Revisi',      bg: 'bg-[#F97316]',   text: 'text-neu-white' },
  completed:   { label: 'Selesai',     bg: 'bg-neu-green',   text: 'text-neu-white' },
  canceled:    { label: 'Dibatalkan',  bg: 'bg-neu-accent',  text: 'text-neu-white' },
};
const PAYMENT_STATUS = {
  pending_verification: { label: 'Menunggu Verifikasi', bg: 'bg-neu-primary', text: 'text-neu-black' },
  verified: { label: 'Terverifikasi', bg: 'bg-neu-green', text: 'text-neu-white' },
  rejected: { label: 'Ditolak', bg: 'bg-neu-accent', text: 'text-neu-white' },
};

async function uploadReceipt(file) {
  const ext = file.name.split('.').pop();
  const filename = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(PAYMENT_RECEIPT_BUCKET).upload(filename, file, { cacheControl: '3600', upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from(PAYMENT_RECEIPT_BUCKET).getPublicUrl(filename);
  return data.publicUrl;
}

/* ─── Upload Payment Modal ───────────────────────────────────────────────── */
function UploadPaymentModal({ orderId, onClose, onUploaded }) {
  const [form, setForm] = useState({ paymentType: 'dp', amount: '', receiptImageUrl: '' });
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const alert = useAlert();

  const handleFile = async (file) => {
    setIsUploading(true);
    try { setForm(p => ({ ...p, receiptImageUrl: '' }));
      const url = await uploadReceipt(file);
      setForm(p => ({ ...p, receiptImageUrl: url }));
    } catch { alert.error('Gagal upload bukti.'); }
    finally { setIsUploading(false); }
  };

  const handleSubmit = async () => {
    if (!form.amount || !form.receiptImageUrl) return;
    setIsSaving(true);
    try {
      await paymentService.create({ orderId, paymentType: form.paymentType, amount: Number(form.amount), receiptImageUrl: form.receiptImageUrl });
      onUploaded();
      onClose();
    } catch { alert.error('Gagal mengirim bukti pembayaran.'); }
    finally { setIsSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neu-black/60" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-md bg-neu-white border-2 border-neu-black shadow-neu-xl">
        <div className="flex items-center justify-between px-5 py-3 border-b-2 border-neu-black bg-neu-primary">
          <h3 className="font-display font-bold text-sm text-neu-black uppercase">Upload Bukti Pembayaran</h3>
          <button onClick={onClose} className="text-neu-black/60 hover:text-neu-black font-mono text-2xl leading-none">×</button>
        </div>
        <div className="px-5 py-5 space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-display font-bold text-xs text-neu-black uppercase">Tipe Pembayaran</label>
            <select value={form.paymentType} onChange={e => setForm(p => ({ ...p, paymentType: e.target.value }))}
              className="px-4 py-2.5 bg-neu-white border-2 border-neu-black shadow-neu-sm font-body text-sm text-neu-black outline-none cursor-pointer">
              <option value="dp">DP (Down Payment)</option>
              <option value="termin_1">Termin 1</option>
              <option value="pelunasan">Pelunasan</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-display font-bold text-xs text-neu-black uppercase">Jumlah Transfer (Rp) *</label>
            <input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
              placeholder="750000"
              className="w-full px-4 py-2.5 bg-neu-white border-2 border-neu-black shadow-neu-sm font-body text-sm text-neu-black outline-none focus:shadow-neu transition-all duration-150" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-display font-bold text-xs text-neu-black uppercase">Foto Bukti Transfer *</label>
            <input type="file" accept="image/*" onChange={e => { if (e.target.files[0]) handleFile(e.target.files[0]); }}
              className="font-body text-sm" />
            {isUploading && <p className="font-mono text-xs text-neu-black/50 animate-pulse">Mengupload...</p>}
            {form.receiptImageUrl && <img src={form.receiptImageUrl} alt="preview" className="h-24 object-cover border-2 border-neu-black mt-1" />}
          </div>
        </div>
        <div className="px-5 pb-5 flex gap-3">
          <button onClick={handleSubmit} disabled={isSaving || !form.amount || !form.receiptImageUrl} className={cn(
            'flex-1 py-2.5 bg-neu-primary border-2 border-neu-black shadow-neu font-display font-bold text-sm uppercase text-neu-black',
            'transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm',
            (isSaving || !form.amount || !form.receiptImageUrl) && 'opacity-50 cursor-not-allowed',
          )}>{isSaving ? 'Mengirim...' : 'Kirim Bukti'}</button>
          <button onClick={onClose} className="flex-1 py-2.5 bg-neu-white border-2 border-neu-black shadow-neu font-display font-bold text-sm uppercase text-neu-black transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm">Batal</button>
        </div>
      </div>
    </div>
  );
}

export default function MyOrderDetailPage() {
  const navigate = useNavigate();
  const { id }   = useParams();
  const alert    = useAlert();

  const [user,         setUser]         = useState(null);
  const [order,        setOrder]        = useState(null);
  const [isLoading,    setIsLoading]    = useState(true);
  const [showPayment,  setShowPayment]  = useState(false);

  const pageRef = useRef(null);

  const loadOrder = async () => {
    const res = await orderService.getDetail(id);
    setOrder(res.data);
  };

  useEffect(() => {
    const init = async () => {
      try {
        const me = await authService.getMe();
        setUser(me.data);
        await loadOrder();
      } catch { navigate('/login'); }
      finally { setIsLoading(false); }
    };
    init();
  }, [id]);

  useEffect(() => {
    if (!isLoading && pageRef.current) {
      gsap.from(pageRef.current, { y: 20, opacity: 0, duration: 0.5, ease: 'power2.out' });
    }
  }, [isLoading]);

  const fmt = (val) => val ? `Rp ${Number(val).toLocaleString('id-ID')}` : '—';
  const fmtDateTime = (val) => val ? new Date(val).toLocaleString('id-ID', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '—';

  if (isLoading) return (
    <div className="min-h-screen bg-neu-bg flex items-center justify-center">
      <p className="font-display font-bold text-neu-black animate-pulse">Memuat...</p>
    </div>
  );
  if (!order) return null;

  const statusCfg = STATUS_CONFIG[order.status] ?? { label: order.status, bg: 'bg-neu-black/20', text: 'text-neu-black' };
  const lastProgress = order.progressReports?.length
    ? order.progressReports[order.progressReports.length - 1].progressPercentage
    : 0;

  return (
    <>
      <AlertContainer alerts={alert.alerts} onDismiss={alert.dismiss} />
      {showPayment && <UploadPaymentModal orderId={id} onClose={() => setShowPayment(false)} onUploaded={loadOrder} />}

      <div className="flex min-h-screen bg-neu-bg">
        <Sidebar user={user} />
        <div className="flex-1 ml-64 flex flex-col">
          <Navbar title="Detail Pesanan" user={user} />
          <main className="flex-1 p-6 overflow-y-auto">
            <div ref={pageRef} className="max-w-3xl mx-auto space-y-6">

              <div className="flex items-center gap-2 font-mono text-xs text-neu-black/50">
                <button onClick={() => navigate('/my-orders')} className="hover:text-neu-black">Pesanan Saya</button>
                <span>/</span>
                <span className="text-neu-black truncate">{order.title}</span>
              </div>

              {/* Info */}
              <div className="bg-neu-white border-2 border-neu-black shadow-neu p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className={cn('inline-block px-3 py-1 border-2 border-neu-black font-mono font-bold text-sm uppercase', statusCfg.bg, statusCfg.text)}>
                    {statusCfg.label}
                  </span>
                  <button onClick={() => setShowPayment(true)}
                    className="px-4 py-2 bg-neu-primary border-2 border-neu-black shadow-neu font-display font-bold text-xs uppercase text-neu-black hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm transition-all duration-150">
                    Upload Bukti Bayar
                  </button>
                </div>
                <h2 className="font-display font-bold text-xl text-neu-black mb-2">{order.title}</h2>
                {order.description && <p className="font-body text-sm text-neu-black/60 mb-4">{order.description}</p>}
                <div className="grid grid-cols-2 gap-4 border-t-2 border-neu-black pt-4">
                  <div>
                    <p className="font-mono text-xs text-neu-black/40 uppercase">Total Harga</p>
                    <p className="font-display font-bold text-lg">{fmt(order.totalPrice)}</p>
                  </div>
                  <div>
                    <p className="font-mono text-xs text-neu-black/40 uppercase">Deadline</p>
                    <p className="font-display font-bold text-sm">{fmtDateTime(order.deadline)}</p>
                  </div>
                </div>

                {/* Overall progress */}
                <div className="mt-4 pt-4 border-t-2 border-neu-black">
                  <div className="flex justify-between mb-1">
                    <span className="font-mono text-xs text-neu-black/50 uppercase">Progress Keseluruhan</span>
                    <span className="font-mono text-sm font-bold text-neu-blue">{lastProgress}%</span>
                  </div>
                  <div className="h-4 border-2 border-neu-black bg-neu-bg overflow-hidden">
                    <div className="h-full bg-neu-blue transition-all duration-500" style={{ width: `${lastProgress}%` }} />
                  </div>
                </div>
              </div>

              {/* Payments */}
              <div className="bg-neu-white border-2 border-neu-black shadow-neu">
                <div className="px-6 py-4 border-b-2 border-neu-black">
                  <h3 className="font-display font-bold text-base uppercase">Riwayat Pembayaran</h3>
                </div>
                {!order.payments?.length ? (
                  <p className="px-6 py-6 text-center font-body text-sm text-neu-black/40">Belum ada pembayaran.</p>
                ) : (
                  <div className="divide-y-2 divide-neu-black">
                    {order.payments.map(p => {
                      const pcfg = PAYMENT_STATUS[p.status] ?? { label: p.status, bg: 'bg-neu-black/20', text: 'text-neu-black' };
                      return (
                        <div key={p.id} className="px-6 py-4 flex items-center gap-4">
                          <a href={p.receiptImageUrl} target="_blank" rel="noopener noreferrer"
                            className="w-12 h-10 border-2 border-neu-black overflow-hidden bg-neu-bg flex-shrink-0">
                            <img src={p.receiptImageUrl} alt="receipt" className="w-full h-full object-cover" />
                          </a>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className={cn('px-2 py-0.5 border-2 border-neu-black font-mono font-bold text-xs uppercase', pcfg.bg, pcfg.text)}>
                                {pcfg.label}
                              </span>
                              <span className="font-mono text-xs text-neu-black/50 uppercase">{p.paymentType}</span>
                            </div>
                            <p className="font-display font-bold text-sm">{fmt(p.amount)}</p>
                            <p className="font-mono text-xs text-neu-black/40">{fmtDateTime(p.createdAt)}</p>
                            {p.notes && <p className="font-body text-xs text-neu-accent mt-0.5">Catatan Admin: {p.notes}</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Progress Timeline */}
              <div className="bg-neu-white border-2 border-neu-black shadow-neu">
                <div className="px-6 py-4 border-b-2 border-neu-black">
                  <h3 className="font-display font-bold text-base uppercase">Timeline Progress</h3>
                </div>
                {!order.progressReports?.length ? (
                  <p className="px-6 py-6 text-center font-body text-sm text-neu-black/40">Belum ada update progress dari admin.</p>
                ) : (
                  <div className="divide-y-2 divide-neu-black">
                    {[...order.progressReports].reverse().map(r => (
                      <div key={r.id} className="px-6 py-4 flex gap-4">
                        <div className="w-12 h-12 border-2 border-neu-black bg-neu-blue/10 flex flex-col items-center justify-center flex-shrink-0">
                          <span className="font-display font-bold text-base text-neu-blue leading-none">{r.progressPercentage}</span>
                          <span className="font-mono text-[9px] text-neu-blue/60">%</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-display font-bold text-sm text-neu-black">{r.title}</p>
                          {r.description && <p className="font-body text-xs text-neu-black/60 mt-0.5">{r.description}</p>}
                          <p className="font-mono text-xs text-neu-black/40 mt-1">{fmtDateTime(r.reportedAt)}</p>
                          <div className="h-1.5 border border-neu-black bg-neu-bg mt-2">
                            <div className="h-full bg-neu-blue" style={{ width: `${r.progressPercentage}%` }} />
                          </div>
                        </div>
                        {r.attachmentUrl && (
                          <a href={r.attachmentUrl} target="_blank" rel="noopener noreferrer"
                            className="w-16 h-12 border-2 border-neu-black overflow-hidden bg-neu-bg flex-shrink-0">
                            <img src={r.attachmentUrl} alt="screenshot" className="w-full h-full object-cover" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </main>
        </div>
      </div>
    </>
  );
}
