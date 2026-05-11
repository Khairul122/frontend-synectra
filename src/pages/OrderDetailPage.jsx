import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { gsap } from 'gsap';
import { cn } from '../utils/cn';
import { authService } from '../services/auth.service';
import { orderService } from '../services/order.service';
import { paymentService } from '../services/payment.service';
import { progressReportService } from '../services/progressReport.service';
import { PageLayout } from '../components/layout/PageLayout';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { useAlert } from '../hooks/useAlert';
import { SUPABASE_URL, SUPABASE_ANON, PROGRESS_ATTACH_BUCKET } from '../constants/api';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

const STATUS_CONFIG = {
  pending:     { label: 'Pending',     bg: 'bg-neu-primary',  text: 'text-neu-black' },
  in_progress: { label: 'In Progress', bg: 'bg-neu-blue',     text: 'text-neu-white' },
  testing:     { label: 'Testing',     bg: 'bg-neu-purple',   text: 'text-neu-white' },
  revision:    { label: 'Revisi',      bg: 'bg-[#F97316]',    text: 'text-neu-white' },
  completed:   { label: 'Selesai',     bg: 'bg-neu-green',    text: 'text-neu-white' },
  canceled:    { label: 'Dibatalkan',  bg: 'bg-neu-accent',   text: 'text-neu-white' },
};
const STATUS_TRANSITIONS = ['pending','in_progress','testing','revision','completed','canceled'];

const PAYMENT_STATUS = {
  pending_verification: { label: 'Menunggu Verifikasi', bg: 'bg-neu-primary', text: 'text-neu-black' },
  verified: { label: 'Terverifikasi', bg: 'bg-neu-green', text: 'text-neu-white' },
  rejected: { label: 'Ditolak', bg: 'bg-neu-accent', text: 'text-neu-white' },
};

function StatusBadge({ status, config }) {
  const cfg = config[status] ?? { label: status, bg: 'bg-neu-black/20', text: 'text-neu-black' };
  return (
    <span className={cn('inline-block px-2 py-0.5 border-2 border-neu-black font-mono font-bold text-xs uppercase', cfg.bg, cfg.text)}>
      {cfg.label}
    </span>
  );
}

/* ─── Upload helper ──────────────────────────────────────────────────────── */
async function uploadFile(file, bucket) {
  const ext = file.name.split('.').pop();
  const filename = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(filename, file, { cacheControl: '3600', upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(filename);
  return data.publicUrl;
}

/* ─── Progress Form Modal ────────────────────────────────────────────────── */
function ProgressModal({ orderId, onClose, onAdded }) {
  const [form, setForm] = useState({ title: '', description: '', progressPercentage: 0, attachmentUrl: '' });
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const alert = useAlert();

  const handleFile = async (file) => {
    setIsUploading(true);
    try { form.attachmentUrl = await uploadFile(file, PROGRESS_ATTACH_BUCKET); setForm({ ...form }); }
    catch { alert.error('Gagal upload attachment.'); }
    finally { setIsUploading(false); }
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) return;
    setIsSaving(true);
    try {
      await progressReportService.create({ orderId, ...form, progressPercentage: Number(form.progressPercentage) });
      onAdded();
      onClose();
    } catch { alert.error('Gagal menambah progress.'); }
    finally { setIsSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neu-black/60" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-lg bg-neu-white border-2 border-neu-black shadow-neu-xl">
        <div className="flex items-center justify-between px-5 py-3 border-b-2 border-neu-black bg-neu-blue">
          <h3 className="font-display font-bold text-sm text-neu-white uppercase tracking-wide">Update Progress</h3>
          <button onClick={onClose} className="text-neu-white/60 hover:text-neu-white font-mono text-2xl leading-none">×</button>
        </div>
        <div className="px-5 py-5 space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-display font-bold text-xs text-neu-black uppercase tracking-wide">Judul Update *</label>
            <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="Contoh: Selesai fitur Login"
              className="w-full px-4 py-2.5 bg-neu-white border-2 border-neu-black shadow-neu-sm font-body text-sm text-neu-black placeholder:text-gray-400 outline-none focus:shadow-neu transition-all duration-150" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-display font-bold text-xs text-neu-black uppercase tracking-wide">Deskripsi</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              rows={3} placeholder="Detail progress..."
              className="w-full px-4 py-2.5 bg-neu-white border-2 border-neu-black shadow-neu-sm font-body text-sm text-neu-black placeholder:text-gray-400 outline-none focus:shadow-neu transition-all duration-150 resize-none" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-display font-bold text-xs text-neu-black uppercase tracking-wide">
              Persentase Progress: <strong>{form.progressPercentage}%</strong>
            </label>
            <input type="range" min="0" max="100" value={form.progressPercentage}
              onChange={e => setForm(p => ({ ...p, progressPercentage: e.target.value }))}
              className="w-full accent-neu-primary" />
            <div className="h-3 border-2 border-neu-black bg-neu-bg overflow-hidden">
              <div className="h-full bg-neu-primary transition-all duration-300" style={{ width: `${form.progressPercentage}%` }} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-display font-bold text-xs text-neu-black uppercase tracking-wide">Attachment (Screenshot)</label>
            <input type="file" accept="image/*" onChange={e => { if (e.target.files[0]) handleFile(e.target.files[0]); }}
              className="font-body text-sm" />
            {isUploading && <p className="font-mono text-xs text-neu-black/50 animate-pulse">Mengupload...</p>}
            {form.attachmentUrl && <img src={form.attachmentUrl} alt="preview" className="h-20 object-cover border-2 border-neu-black" />}
          </div>
        </div>
        <div className="px-5 pb-5 flex gap-3">
          <button onClick={handleSubmit} disabled={isSaving || !form.title.trim()} className={cn(
            'flex-1 py-2.5 bg-neu-primary border-2 border-neu-black shadow-neu font-display font-bold text-sm uppercase text-neu-black',
            'transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm',
            (isSaving || !form.title.trim()) && 'opacity-50 cursor-not-allowed',
          )}>{isSaving ? 'Menyimpan...' : 'Simpan Progress'}</button>
          <button onClick={onClose} className="flex-1 py-2.5 bg-neu-white border-2 border-neu-black shadow-neu font-display font-bold text-sm uppercase text-neu-black transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm">Batal</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Reject Modal ───────────────────────────────────────────────────────── */
function RejectModal({ paymentId, onClose, onRejected }) {
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const alert = useAlert();

  const handleSubmit = async () => {
    if (!notes.trim()) return;
    setIsSaving(true);
    try {
      await paymentService.reject(paymentId, notes);
      onRejected();
      onClose();
    } catch { alert.error('Gagal menolak pembayaran.'); }
    finally { setIsSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neu-black/60" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-sm bg-neu-white border-2 border-neu-black shadow-neu-xl">
        <div className="flex items-center justify-between px-5 py-3 border-b-2 border-neu-black bg-neu-accent">
          <h3 className="font-display font-bold text-sm text-neu-white uppercase">Tolak Pembayaran</h3>
          <button onClick={onClose} className="text-neu-white/60 hover:text-neu-white font-mono text-2xl leading-none">×</button>
        </div>
        <div className="px-5 py-5">
          <label className="font-display font-bold text-xs text-neu-black uppercase mb-2 block">Alasan Penolakan *</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
            placeholder="Contoh: Jumlah transfer tidak sesuai"
            className="w-full px-4 py-2.5 bg-neu-white border-2 border-neu-black shadow-neu-sm font-body text-sm text-neu-black outline-none focus:shadow-neu transition-all duration-150 resize-none" />
        </div>
        <div className="px-5 pb-5 flex gap-3">
          <button onClick={handleSubmit} disabled={isSaving || !notes.trim()} className={cn(
            'flex-1 py-2.5 bg-neu-accent border-2 border-neu-black shadow-neu font-display font-bold text-sm uppercase text-neu-white',
            'transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm',
            (isSaving || !notes.trim()) && 'opacity-50 cursor-not-allowed',
          )}>{isSaving ? 'Menyimpan...' : 'Tolak'}</button>
          <button onClick={onClose} className="flex-1 py-2.5 bg-neu-white border-2 border-neu-black shadow-neu font-display font-bold text-sm uppercase text-neu-black transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm">Batal</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Detail Page ───────────────────────────────────────────────────── */
export default function OrderDetailPage() {
  const navigate = useNavigate();
  const { id }   = useParams();
  const alert    = useAlert();

  const [user,           setUser]           = useState(null);
  const [order,          setOrder]          = useState(null);
  const [isLoading,      setIsLoading]      = useState(true);
  const [showProgress,   setShowProgress]   = useState(false);
  const [rejectPaymentId, setRejectPaymentId] = useState(null);
  const [verifyTarget,   setVerifyTarget]   = useState(null);
  const [isVerifying,    setIsVerifying]    = useState(false);

  const pageRef = useRef(null);

  const loadOrder = async () => {
    const res = await orderService.getDetail(id);
    setOrder(res.data);
  };

  useEffect(() => {
    const init = async () => {
      try {
        const me = await authService.getMe();
        if (me.data.role !== 'admin') { navigate('/dashboard'); return; }
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

  const handleStatusChange = async (status) => {
    try {
      await orderService.updateStatus(id, status);
      setOrder(prev => ({ ...prev, status }));
      alert.success('Status pesanan diperbarui.');
    } catch { alert.error('Gagal update status.'); }
  };

  const handleVerify = async () => {
    if (!verifyTarget) return;
    setIsVerifying(true);
    try {
      await paymentService.verify(verifyTarget.id);
      alert.success('Pembayaran terverifikasi!');
      setVerifyTarget(null);
      await loadOrder();
    } catch { alert.error('Gagal verifikasi.'); }
    finally { setIsVerifying(false); }
  };

  const fmt = (val) => val ? `Rp ${Number(val).toLocaleString('id-ID')}` : '—';
  const fmtDate = (val) => val ? new Date(val).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' }) : '—';
  const fmtDateTime = (val) => val ? new Date(val).toLocaleString('id-ID', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '—';

  if (isLoading) return (
    <div className="min-h-screen bg-neu-bg flex items-center justify-center">
      <p className="font-display font-bold text-neu-black animate-pulse">Memuat...</p>
    </div>
  );

  if (!order) return null;

  const statusCfg = STATUS_CONFIG[order.status] ?? { label: order.status, bg: 'bg-neu-black/20', text: 'text-neu-black' };

  return (
    <PageLayout user={user} title="Detail Pesanan" alert={alert}>
      {showProgress && <ProgressModal orderId={id} onClose={() => setShowProgress(false)} onAdded={loadOrder} />}
      {rejectPaymentId && <RejectModal paymentId={rejectPaymentId} onClose={() => setRejectPaymentId(null)} onRejected={loadOrder} />}
      <ConfirmModal
        isOpen={Boolean(verifyTarget)}
        title="Verifikasi Pembayaran"
        message={`Konfirmasi pembayaran sebesar ${fmt(verifyTarget?.amount)} (${verifyTarget?.paymentType}) sudah diterima?`}
        onConfirm={handleVerify}
        onCancel={() => setVerifyTarget(null)}
        isLoading={isVerifying}
      />

      <div ref={pageRef} className="max-w-4xl mx-auto space-y-6">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 font-mono text-xs text-neu-black/50">
          <button type="button" onClick={() => navigate('/orders')} className="hover:text-neu-black">Orders</button>
          <span>/</span>
          <span className="text-neu-black truncate max-w-xs">{order.title}</span>
        </div>

        {/* ─── Section A: Info Order ─────────────────────────────────── */}
        <div className="bg-neu-white border-2 border-neu-black shadow-neu p-6">
          <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <StatusBadge status={order.status} config={STATUS_CONFIG} />
                {order.serviceCategory && (
                  <span className="font-mono text-xs text-neu-black/50 uppercase">{order.serviceCategory.replace('_',' ')}</span>
                )}
              </div>
              <h2 className="font-display font-bold text-2xl text-neu-black">{order.title}</h2>
              <p className="font-body text-sm text-neu-black/60 mt-1">{order.clientName} · {order.clientEmail}</p>
            </div>
            <div className="flex items-center gap-2">
              <select onChange={e => handleStatusChange(e.target.value)} value={order.status}
                className="px-3 py-2 border-2 border-neu-black bg-neu-white font-display font-bold text-xs uppercase shadow-neu-sm outline-none cursor-pointer">
                {STATUS_TRANSITIONS.map(s => (
                  <option key={s} value={s}>{STATUS_CONFIG[s]?.label ?? s}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t-2 border-neu-black pt-4">
            <div>
              <p className="font-mono text-xs text-neu-black/40 uppercase mb-1">Total Harga</p>
              <p className="font-display font-bold text-lg text-neu-black">{fmt(order.totalPrice)}</p>
            </div>
            <div>
              <p className="font-mono text-xs text-neu-black/40 uppercase mb-1">Deadline</p>
              <p className="font-display font-bold text-sm text-neu-black">{fmtDate(order.deadline)}</p>
            </div>
            <div>
              <p className="font-mono text-xs text-neu-black/40 uppercase mb-1">Dibuat</p>
              <p className="font-mono text-xs text-neu-black">{fmtDateTime(order.createdAt)}</p>
            </div>
            <div>
              <p className="font-mono text-xs text-neu-black/40 uppercase mb-1">Progress Terakhir</p>
              {order.progressReports?.length > 0 ? (
                <div>
                  <p className="font-display font-bold text-lg text-neu-blue">
                    {order.progressReports[order.progressReports.length - 1].progressPercentage}%
                  </p>
                  <div className="h-2 border border-neu-black bg-neu-bg mt-1">
                    <div className="h-full bg-neu-blue transition-all duration-300"
                      style={{ width: `${order.progressReports[order.progressReports.length - 1].progressPercentage}%` }} />
                  </div>
                </div>
              ) : <p className="font-mono text-xs text-neu-black/40">Belum ada</p>}
            </div>
          </div>
          {order.description && (
            <p className="font-body text-sm text-neu-black/60 mt-4 pt-4 border-t-2 border-neu-black">{order.description}</p>
          )}
        </div>

        {/* ─── Section B: Payments ───────────────────────────────────── */}
        <div className="bg-neu-white border-2 border-neu-black shadow-neu">
          <div className="flex items-center justify-between px-6 py-4 border-b-2 border-neu-black">
            <h3 className="font-display font-bold text-base text-neu-black uppercase tracking-wide">
              Pembayaran ({order.payments?.length ?? 0})
            </h3>
          </div>
          {!order.payments?.length ? (
            <p className="px-6 py-8 font-body text-sm text-neu-black/40 text-center">Belum ada pembayaran.</p>
          ) : (
            <div className="divide-y-2 divide-neu-black">
              {order.payments.map(p => (
                <div key={p.id} className="px-6 py-4 flex items-start gap-4">
                  {/* Receipt thumbnail */}
                  <a href={p.receiptImageUrl} target="_blank" rel="noopener noreferrer"
                    className="flex-shrink-0 w-16 h-12 border-2 border-neu-black overflow-hidden bg-neu-bg">
                    <img src={p.receiptImageUrl} alt="receipt" className="w-full h-full object-cover" />
                  </a>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge status={p.status} config={PAYMENT_STATUS} />
                      <span className="font-mono text-xs text-neu-black/50 uppercase">{p.paymentType}</span>
                    </div>
                    <p className="font-display font-bold text-base text-neu-black">{fmt(p.amount)}</p>
                    <p className="font-mono text-xs text-neu-black/40">{fmtDateTime(p.createdAt)}</p>
                    {p.notes && <p className="font-body text-xs text-neu-accent mt-1">Catatan: {p.notes}</p>}
                    {p.verifiedAt && <p className="font-mono text-xs text-neu-green">Diverifikasi: {fmtDateTime(p.verifiedAt)}</p>}
                  </div>
                  {p.status === 'pending_verification' && (
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => setVerifyTarget(p)}
                        className="px-3 py-1.5 bg-neu-green border-2 border-neu-black font-display font-bold text-xs uppercase text-neu-white shadow-neu-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-150">
                        Verifikasi
                      </button>
                      <button onClick={() => setRejectPaymentId(p.id)}
                        className="px-3 py-1.5 bg-neu-white border-2 border-neu-black font-display font-bold text-xs uppercase text-neu-accent shadow-neu-sm hover:bg-neu-accent hover:text-neu-white hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-150">
                        Tolak
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── Section C: Progress Reports ───────────────────────────── */}
        <div className="bg-neu-white border-2 border-neu-black shadow-neu">
          <div className="flex items-center justify-between px-6 py-4 border-b-2 border-neu-black">
            <h3 className="font-display font-bold text-base text-neu-black uppercase tracking-wide">
              Progress ({order.progressReports?.length ?? 0})
            </h3>
            <button onClick={() => setShowProgress(true)}
              className={cn('px-4 py-2 bg-neu-blue border-2 border-neu-black shadow-neu-sm font-display font-bold text-xs uppercase text-neu-white',
                'transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none')}>
              + Update Progress
            </button>
          </div>
          {!order.progressReports?.length ? (
            <p className="px-6 py-8 font-body text-sm text-neu-black/40 text-center">Belum ada update progress.</p>
          ) : (
            <div className="divide-y-2 divide-neu-black">
              {[...order.progressReports].reverse().map(r => (
                <div key={r.id} className="px-6 py-4 flex items-start gap-4">
                  {/* Percentage circle */}
                  <div className="flex-shrink-0 w-14 h-14 border-2 border-neu-black bg-neu-bg flex flex-col items-center justify-center">
                    <span className="font-display font-bold text-lg text-neu-blue leading-none">{r.progressPercentage}</span>
                    <span className="font-mono text-[9px] text-neu-black/40">%</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-sm text-neu-black">{r.title}</p>
                    {r.description && <p className="font-body text-xs text-neu-black/60 mt-0.5">{r.description}</p>}
                    <p className="font-mono text-xs text-neu-black/40 mt-1">{fmtDateTime(r.reportedAt)}</p>
                    {/* Progress bar */}
                    <div className="h-1.5 border border-neu-black bg-neu-bg mt-2">
                      <div className="h-full bg-neu-blue transition-all duration-300" style={{ width: `${r.progressPercentage}%` }} />
                    </div>
                  </div>
                  {r.attachmentUrl && (
                    <a href={r.attachmentUrl} target="_blank" rel="noopener noreferrer"
                      className="flex-shrink-0 w-16 h-12 border-2 border-neu-black overflow-hidden bg-neu-bg">
                      <img src={r.attachmentUrl} alt="attachment" className="w-full h-full object-cover" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </PageLayout>
  );
}
