import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';
import { cn } from '../utils/cn';
import { authService } from '../services/auth.service';
import { orderService } from '../services/order.service';
import { paymentService } from '../services/payment.service';
import { PageLayout } from '../components/layout/PageLayout';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { useAlert } from '../hooks/useAlert';
import { PAYMENT_RECEIPT_BUCKET } from '../constants/api';
import supabase from '../lib/supabase';

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

/* ─── Progress Detail Modal ──────────────────────────────────────────────── */
function ProgressDetailModal({ report, onClose, onViewImage }) {
  const backdropRef = useRef(null);
  const cardRef     = useRef(null);

  useEffect(() => {
    gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 });
    gsap.fromTo(cardRef.current,
      { y: -30, opacity: 0, scale: 0.95 },
      { y: 0, opacity: 1, scale: 1, duration: 0.3, ease: 'power3.out' },
    );
    const handleKey = (e) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleClose = () => {
    gsap.to(cardRef.current,     { y: -20, opacity: 0, scale: 0.95, duration: 0.2, ease: 'power2.in' });
    gsap.to(backdropRef.current, { opacity: 0, duration: 0.2, onComplete: onClose });
  };

  const fmtDT = (val) => val ? new Date(val).toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

  return createPortal(
    <div ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neu-black/70"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
      <div ref={cardRef} className="w-full max-w-lg bg-neu-white border-2 border-neu-black shadow-neu-xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b-2 border-neu-black bg-neu-blue">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-neu-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            <h3 className="font-display font-bold text-sm text-neu-white uppercase tracking-wide">Detail Progress</h3>
          </div>
          <button onClick={handleClose} className="text-neu-white/60 hover:text-neu-white font-mono text-2xl leading-none">×</button>
        </div>

        {/* Content */}
        <div className="px-5 py-5 space-y-4">

          {/* Persentase */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs text-neu-black/50 uppercase">Progress Pengerjaan</span>
              <span className="font-display font-bold text-2xl text-neu-blue">{report.progressPercentage}%</span>
            </div>
            <div className="h-4 border-2 border-neu-black bg-neu-bg overflow-hidden">
              <div className="h-full bg-neu-blue transition-all duration-500" style={{ width: `${report.progressPercentage}%` }} />
            </div>
          </div>

          {/* Judul */}
          <div>
            <p className="font-mono text-xs text-neu-black/40 uppercase mb-1">Judul Update</p>
            <p className="font-display font-bold text-base text-neu-black">{report.title}</p>
          </div>

          {/* Deskripsi */}
          {report.description ? (
            <div>
              <p className="font-mono text-xs text-neu-black/40 uppercase mb-1">Deskripsi dari Admin</p>
              <div className="bg-neu-bg border-2 border-neu-black p-3">
                <p className="font-body text-sm text-neu-black whitespace-pre-wrap leading-relaxed">{report.description}</p>
              </div>
            </div>
          ) : (
            <p className="font-body text-xs text-neu-black/40 italic">Tidak ada deskripsi tambahan.</p>
          )}

          {/* Screenshot */}
          {report.attachmentUrl && (
            <div>
              <p className="font-mono text-xs text-neu-black/40 uppercase mb-2">Screenshot Pengerjaan</p>
              <button type="button"
                onClick={() => { handleClose(); setTimeout(() => onViewImage(report.attachmentUrl, report.title), 300); }}
                className="relative w-full border-2 border-neu-black overflow-hidden group">
                <img src={report.attachmentUrl} alt="screenshot" className="w-full max-h-48 object-cover" />
                <div className="absolute inset-0 bg-neu-black/0 group-hover:bg-neu-black/30 transition-all duration-150 flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 font-display font-bold text-xs text-neu-white bg-neu-black/80 px-3 py-1.5 border border-neu-white/30">
                    Klik untuk memperbesar
                  </span>
                </div>
              </button>
            </div>
          )}

          {/* Waktu */}
          <p className="font-mono text-xs text-neu-black/40">Dilaporkan: {fmtDT(report.reportedAt)}</p>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5">
          <button onClick={handleClose} className={cn(
            'w-full py-2.5 bg-neu-white border-2 border-neu-black shadow-neu',
            'font-display font-bold text-sm uppercase tracking-wide text-neu-black',
            'transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm',
          )}>Tutup</button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ─── Generic Image Modal ────────────────────────────────────────────────── */
function ImageModal({ src, caption, onClose }) {
  const backdropRef = useRef(null);
  const cardRef     = useRef(null);

  useEffect(() => {
    gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 });
    gsap.fromTo(cardRef.current,
      { y: -30, opacity: 0, scale: 0.95 },
      { y: 0, opacity: 1, scale: 1, duration: 0.3, ease: 'power3.out' },
    );
    const handleKey = (e) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleClose = () => {
    gsap.to(cardRef.current,     { y: -20, opacity: 0, scale: 0.95, duration: 0.2, ease: 'power2.in' });
    gsap.to(backdropRef.current, { opacity: 0, duration: 0.2, onComplete: onClose });
  };

  return createPortal(
    <div ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neu-black/80"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
      <div ref={cardRef} className="w-full max-w-2xl bg-neu-white border-2 border-neu-black shadow-neu-xl">
        <div className="flex items-center justify-between px-5 py-3 border-b-2 border-neu-black bg-neu-black">
          <p className="font-display font-bold text-sm text-neu-white truncate">{caption}</p>
          <button onClick={handleClose} className="text-neu-white/60 hover:text-neu-white font-mono text-2xl leading-none ml-4">×</button>
        </div>
        <div className="bg-neu-bg border-b-2 border-neu-black flex items-center justify-center">
          <img src={src} alt={caption} className="max-w-full max-h-[65vh] object-contain" />
        </div>
        <div className="px-5 py-3 flex justify-end">
          <button onClick={handleClose} className={cn(
            'px-5 py-2 bg-neu-black border-2 border-neu-black font-display font-bold text-xs uppercase text-neu-white',
            'shadow-neu-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-150',
          )}>Tutup</button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ─── Receipt Uploader ───────────────────────────────────────────────────── */
function ReceiptUploader({ value, onChange, isUploading, onFile }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  };

  return (
    <div className="space-y-3">
      <div
        onClick={() => !isUploading && inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'border-2 border-dashed border-neu-black p-6 text-center cursor-pointer transition-all duration-150',
          isDragging ? 'bg-neu-primary/20 border-solid' : 'hover:bg-neu-bg',
          isUploading && 'opacity-60 cursor-not-allowed',
        )}
      >
        <input ref={inputRef} type="file" accept="image/*" className="hidden"
          onChange={e => { if (e.target.files[0]) onFile(e.target.files[0]); }} />

        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <svg className="w-8 h-8 text-neu-black/40 animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeDasharray="60" strokeDashoffset="20" />
            </svg>
            <p className="font-display font-bold text-sm text-neu-black animate-pulse">Mengupload gambar...</p>
          </div>
        ) : (
          <>
            <svg className="w-10 h-10 mx-auto mb-3 text-neu-black/30" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <p className="font-display font-bold text-sm text-neu-black">Klik atau drag foto bukti transfer ke sini</p>
            <p className="font-body text-xs text-neu-black/40 mt-1">PNG, JPG, WEBP — maks 5MB</p>
          </>
        )}
      </div>

      {value && !isUploading && (
        <div className="relative border-2 border-neu-black shadow-neu-sm overflow-hidden">
          <img src={value} alt="Bukti transfer" className="w-full max-h-48 object-contain bg-neu-bg" />
          <button type="button" onClick={() => onChange('')}
            className={cn(
              'absolute top-2 right-2 w-8 h-8 flex items-center justify-center',
              'bg-neu-accent border-2 border-neu-black text-neu-white font-bold text-xs',
              'shadow-neu-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-150',
            )}>
            ✕
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-neu-green/90 px-3 py-1.5 flex items-center gap-2">
            <svg className="w-4 h-4 text-neu-white flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="font-mono font-bold text-xs text-neu-white">Foto berhasil diupload</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Upload Payment Modal ───────────────────────────────────────────────── */
function UploadPaymentModal({ orderId, onClose, onUploaded }) {
  const [form, setForm] = useState({ paymentType: 'dp', amount: '', receiptImageUrl: '' });
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const alert = useAlert();

  const handleFile = async (file) => {
    if (!file.type.startsWith('image/')) {
      alert.error('File harus berupa gambar (JPG, PNG, WEBP).');
      return;
    }
    setIsUploading(true);
    setForm(p => ({ ...p, receiptImageUrl: '' }));
    try {
      const url = await uploadReceipt(file);
      setForm(p => ({ ...p, receiptImageUrl: url }));
    } catch { alert.error('Gagal upload bukti. Coba lagi.'); }
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
            <label className="font-display font-bold text-xs text-neu-black uppercase">
              Foto Bukti Transfer * {!form.receiptImageUrl && !isUploading && <span className="text-neu-accent normal-case font-body font-normal">(wajib)</span>}
            </label>
            <ReceiptUploader
              value={form.receiptImageUrl}
              onChange={url => setForm(p => ({ ...p, receiptImageUrl: url }))}
              isUploading={isUploading}
              onFile={handleFile}
            />
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
  const [showPayment,    setShowPayment]    = useState(false);
  const [showComplete,   setShowComplete]   = useState(false);
  const [isCompleting,   setIsCompleting]   = useState(false);
  const [previewImage,   setPreviewImage]   = useState(null);
  const [detailProgress, setDetailProgress] = useState(null);

  const pageRef = useRef(null);

  const loadOrder = async () => {
    const res = await orderService.getDetail(id);
    setOrder(res.data);
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      await orderService.completeOrder(id);
      setOrder(prev => ({ ...prev, status: 'completed' }));
      setShowComplete(false);
      alert.success('Pesanan berhasil diselesaikan! Terima kasih telah menggunakan layanan Synectra.');
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'Gagal menyelesaikan pesanan.';
      alert.error(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setIsCompleting(false);
    }
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
    <PageLayout user={user} title="Detail Pesanan" alert={alert}>
      {detailProgress && (
        <ProgressDetailModal
          report={detailProgress}
          onClose={() => setDetailProgress(null)}
          onViewImage={(src, caption) => setPreviewImage({ src, caption })}
        />
      )}
      {previewImage && <ImageModal src={previewImage.src} caption={previewImage.caption} onClose={() => setPreviewImage(null)} />}
      {showPayment && <UploadPaymentModal orderId={id} onClose={() => setShowPayment(false)} onUploaded={loadOrder} />}
      <ConfirmModal
        isOpen={showComplete}
        title="Selesaikan Pesanan"
        message={`Apakah kamu yakin ingin menyelesaikan pesanan "${order?.title}"? Pastikan kamu sudah menerima semua hasil pengerjaan sebelum menekan konfirmasi.`}
        onConfirm={handleComplete}
        onCancel={() => setShowComplete(false)}
        isLoading={isCompleting}
        confirmText="Ya, Selesaikan"
        confirmColor="bg-neu-green text-neu-white"
      />

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
            <div className="flex flex-wrap gap-2">
              {!['completed', 'canceled'].includes(order.status) && (
                <button onClick={() => setShowPayment(true)}
                  className="px-4 py-2 bg-neu-primary border-2 border-neu-black shadow-neu font-display font-bold text-xs uppercase text-neu-black hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm transition-all duration-150">
                  Upload Bukti Bayar
                </button>
              )}
              {['in_progress', 'testing', 'revision'].includes(order.status) && (
                <button onClick={() => setShowComplete(true)}
                  className={cn(
                    'px-4 py-2 bg-neu-green border-2 border-neu-black shadow-neu',
                    'font-display font-bold text-xs uppercase text-neu-white',
                    'hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm transition-all duration-150',
                  )}>
                  ✓ Selesaikan Pesanan
                </button>
              )}
            </div>
          </div>
          <h2 className="font-display font-bold text-xl text-neu-black mb-2">{order.title}</h2>
          {order.description && <p className="font-body text-sm text-neu-black/60 mb-4">{order.description}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t-2 border-neu-black pt-4">
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
                    <button type="button"
                      onClick={() => setPreviewImage({ src: p.receiptImageUrl, caption: `Bukti ${p.paymentType} — Rp ${Number(p.amount).toLocaleString('id-ID')}` })}
                      title="Klik untuk memperbesar"
                      className="w-12 h-10 border-2 border-neu-black overflow-hidden bg-neu-bg flex-shrink-0 hover:border-neu-primary hover:shadow-neu-sm hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all duration-150">
                      <img src={p.receiptImageUrl} alt="receipt" className="w-full h-full object-cover" />
                    </button>
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
                  {/* Percentage circle */}
                  <div className={cn(
                    'w-12 h-12 border-2 border-neu-black flex flex-col items-center justify-center flex-shrink-0',
                    r.isLocked ? 'bg-neu-black/5' : 'bg-neu-blue/10',
                  )}>
                    <span className={cn('font-display font-bold text-base leading-none', r.isLocked ? 'text-neu-black/40' : 'text-neu-blue')}>
                      {r.progressPercentage}
                    </span>
                    <span className={cn('font-mono text-[9px]', r.isLocked ? 'text-neu-black/30' : 'text-neu-blue/60')}>%</span>
                  </div>

                  {r.isLocked ? (
                    /* ── Locked card ── */
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-display font-bold text-sm text-neu-black">{r.title}</p>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 border border-neu-black bg-neu-primary font-mono text-[10px] font-bold uppercase">
                          🔒 Terkunci
                        </span>
                      </div>
                      <p className="font-body text-xs text-neu-black/50 bg-neu-bg border border-neu-black/20 px-3 py-2">
                        Detail progress terkunci. Lakukan pembayaran dan tunggu verifikasi admin untuk membuka akses.
                      </p>
                      <div className="h-1.5 border border-neu-black/20 bg-neu-bg mt-2">
                        <div className="h-full bg-neu-black/20" style={{ width: `${r.progressPercentage}%` }} />
                      </div>
                    </div>
                  ) : (
                    /* ── Normal card ── */
                    <>
                      <div className="flex-1 min-w-0">
                        <p className="font-display font-bold text-sm text-neu-black">{r.title}</p>
                        {r.description && (
                          <p className="font-body text-xs text-neu-black/60 mt-0.5 line-clamp-2">{r.description}</p>
                        )}
                        <p className="font-mono text-xs text-neu-black/40 mt-1">{fmtDateTime(r.reportedAt)}</p>
                        <div className="h-1.5 border border-neu-black bg-neu-bg mt-2">
                          <div className="h-full bg-neu-blue" style={{ width: `${r.progressPercentage}%` }} />
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        {r.attachmentUrl && (
                          <div className="w-14 h-12 border-2 border-neu-black overflow-hidden bg-neu-bg">
                            <img src={r.attachmentUrl} alt="screenshot" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => setDetailProgress(r)}
                          className={cn(
                            'px-3 py-1.5 bg-neu-blue border-2 border-neu-black shadow-neu-sm',
                            'font-display font-bold text-xs uppercase tracking-wide text-neu-white whitespace-nowrap',
                            'transition-all duration-150 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none',
                          )}
                        >
                          Lihat Detail
                        </button>
                      </div>
                    </>
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
