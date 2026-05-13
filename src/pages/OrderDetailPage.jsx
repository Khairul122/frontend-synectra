import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';
import { cn } from '../utils/cn';
import { authService } from '../services/auth.service';
import { orderService } from '../services/order.service';
import { paymentService } from '../services/payment.service';
import { progressReportService } from '../services/progressReport.service';
import { PageLayout } from '../components/layout/PageLayout';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { useAlert } from '../hooks/useAlert';
import { PROGRESS_ATTACH_BUCKET } from '../constants/api';
import supabase from '../lib/supabase';
import { PageLoader } from '../components/ui/PageLoader';

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

          {/* Persentase + bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs text-neu-black/50 uppercase tracking-wide">Persentase Progress</span>
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
              <p className="font-mono text-xs text-neu-black/40 uppercase mb-1">Deskripsi</p>
              <div className="bg-neu-bg border-2 border-neu-black p-3">
                <p className="font-body text-sm text-neu-black whitespace-pre-wrap leading-relaxed">{report.description}</p>
              </div>
            </div>
          ) : (
            <p className="font-body text-xs text-neu-black/40 italic">Tidak ada deskripsi.</p>
          )}

          {/* Screenshot */}
          {report.attachmentUrl && (
            <div>
              <p className="font-mono text-xs text-neu-black/40 uppercase mb-2">Screenshot</p>
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
          <img src={src} alt={caption} className="max-w-full max-h-[70vh] object-contain" />
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

/* ─── Receipt Preview Modal ──────────────────────────────────────────────── */
function ReceiptPreviewModal({ payment, onClose }) {
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

  const PAYMENT_LABEL = { dp: 'Down Payment (DP)', termin_1: 'Termin 1', pelunasan: 'Pelunasan' };
  const STATUS_LABEL  = { pending_verification: 'Menunggu Verifikasi', verified: 'Terverifikasi', rejected: 'Ditolak' };
  const STATUS_COLOR  = { pending_verification: 'bg-neu-primary text-neu-black', verified: 'bg-neu-green text-neu-white', rejected: 'bg-neu-accent text-neu-white' };

  const fmt = (val) => val ? `Rp ${Number(val).toLocaleString('id-ID')}` : '—';
  const fmtDT = (val) => val ? new Date(val).toLocaleString('id-ID', { day:'numeric', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '—';

  return createPortal(
    <div ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neu-black/70"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
      <div ref={cardRef} className="w-full max-w-lg bg-neu-white border-2 border-neu-black shadow-neu-xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b-2 border-neu-black bg-neu-black">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-neu-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
            </svg>
            <h3 className="font-display font-bold text-sm text-neu-white uppercase tracking-wide">
              Bukti Transfer — {PAYMENT_LABEL[payment.paymentType] ?? payment.paymentType}
            </h3>
          </div>
          <button onClick={handleClose}
            className="text-neu-white/60 hover:text-neu-white font-mono text-2xl leading-none transition-colors">
            ×
          </button>
        </div>

        {/* Image */}
        <div className="bg-neu-bg border-b-2 border-neu-black flex items-center justify-center min-h-48">
          <img
            src={payment.receiptImageUrl}
            alt="Bukti transfer"
            className="max-w-full max-h-[60vh] object-contain"
          />
        </div>

        {/* Info */}
        <div className="px-5 py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="space-y-1">
              <p className="font-display font-bold text-lg text-neu-black">{fmt(payment.amount)}</p>
              <p className="font-mono text-xs text-neu-black/50">{fmtDT(payment.createdAt)}</p>
              {payment.notes && (
                <p className="font-body text-xs text-neu-accent">Catatan: {payment.notes}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className={cn(
                'px-2 py-0.5 border-2 border-neu-black font-mono font-bold text-xs uppercase',
                STATUS_COLOR[payment.status] ?? 'bg-neu-black/10 text-neu-black',
              )}>
                {STATUS_LABEL[payment.status] ?? payment.status}
              </span>
              <button onClick={handleClose} className={cn(
                'px-3 py-1.5 bg-neu-black border-2 border-neu-black shadow-neu-sm',
                'font-display font-bold text-xs uppercase text-neu-white',
                'hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-150',
              )}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ─── Screenshot Uploader ────────────────────────────────────────────────── */
function ScreenshotUploader({ value, isUploading, onFile, onClear }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  };

  return (
    <div className="space-y-2">
      <div
        onClick={() => !isUploading && inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'border-2 border-dashed border-neu-black p-5 text-center cursor-pointer transition-all duration-150',
          isDragging ? 'bg-neu-primary/20 border-solid' : 'hover:bg-neu-bg',
          isUploading && 'opacity-60 cursor-not-allowed',
        )}
      >
        <input ref={inputRef} type="file" accept="image/*" className="hidden"
          onChange={e => { if (e.target.files[0]) onFile(e.target.files[0]); }} />
        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <svg className="w-7 h-7 text-neu-black/40 animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeDasharray="60" strokeDashoffset="20" />
            </svg>
            <p className="font-display font-bold text-sm text-neu-black animate-pulse">Mengupload screenshot...</p>
          </div>
        ) : (
          <>
            <svg className="w-8 h-8 mx-auto mb-2 text-neu-black/30" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6.75a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6.75v12.75A1.5 1.5 0 003.75 21z" />
            </svg>
            <p className="font-display font-bold text-sm text-neu-black">Klik atau drag screenshot ke sini</p>
            <p className="font-body text-xs text-neu-black/40 mt-0.5">PNG, JPG, WEBP — opsional</p>
          </>
        )}
      </div>

      {value && !isUploading && (
        <div className="relative border-2 border-neu-black overflow-hidden">
          <img src={value} alt="Screenshot preview" className="w-full max-h-40 object-cover" />
          <button type="button" onClick={onClear}
            className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-neu-accent border-2 border-neu-black text-neu-white text-xs font-bold shadow-neu-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-150">
            ✕
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-neu-green/90 px-3 py-1 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-neu-white flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="font-mono font-bold text-xs text-neu-white">Screenshot berhasil diupload</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Progress Form Modal ────────────────────────────────────────────────── */
function ProgressModal({ orderId, onClose, onAdded }) {
  const [form, setForm] = useState({ title: '', description: '', progressPercentage: 0, attachmentUrl: '', isLocked: false });
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const alert = useAlert();

  const handleFile = async (file) => {
    if (!file.type.startsWith('image/')) { alert.error('File harus berupa gambar.'); return; }
    setIsUploading(true);
    try {
      const url = await uploadFile(file, PROGRESS_ATTACH_BUCKET);
      setForm(p => ({ ...p, attachmentUrl: url }));
    } catch { alert.error('Gagal upload screenshot.'); }
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
            <label className="font-display font-bold text-xs text-neu-black uppercase tracking-wide">Screenshot / Lampiran</label>
            <ScreenshotUploader
              value={form.attachmentUrl}
              isUploading={isUploading}
              onFile={handleFile}
              onClear={() => setForm(p => ({ ...p, attachmentUrl: '' }))}
            />
          </div>
          <div className="border-t-2 border-neu-black/10 pt-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isLocked}
                onChange={e => setForm(p => ({ ...p, isLocked: e.target.checked }))}
                className="w-4 h-4 border-2 border-neu-black accent-neu-primary"
              />
              <span className="font-mono text-sm font-bold text-neu-black uppercase">Kunci detail untuk client</span>
            </label>
            <p className="font-body text-xs text-neu-black/50 mt-1 ml-7">
              Client hanya bisa lihat judul &amp; persentase. Detail terbuka otomatis saat pembayaran diverifikasi.
            </p>
          </div>
        </div>
        <div className="px-5 pb-5 flex gap-3">
          <button onClick={handleSubmit} disabled={isSaving || !form.title.trim()} className={cn(
            'flex-1 py-2.5 bg-neu-primary border-2 border-neu-black shadow-neu font-display font-bold text-sm uppercase text-neu-black',
            'transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm',
            (isSaving || !form.title.trim()) && 'opacity-50 cursor-not-allowed',
          )}>{isSaving ? t('common.saving') : 'Simpan Progress'}</button>
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
          )}>{isSaving ? t('common.saving') : 'Tolak'}</button>
          <button onClick={onClose} className="flex-1 py-2.5 bg-neu-white border-2 border-neu-black shadow-neu font-display font-bold text-sm uppercase text-neu-black transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm">Batal</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Detail Page ───────────────────────────────────────────────────── */
export default function OrderDetailPage() {
  const navigate = useNavigate();
  const { t }    = useTranslation();
  const { id }   = useParams();
  const alert    = useAlert();

  const [user,            setUser]            = useState(null);
  const [order,           setOrder]           = useState(null);
  const [isLoading,       setIsLoading]       = useState(true);
  const [showProgress,    setShowProgress]    = useState(false);
  const [rejectPaymentId, setRejectPaymentId] = useState(null);
  const [verifyTarget,    setVerifyTarget]    = useState(null);
  const [isVerifying,     setIsVerifying]     = useState(false);
  const [previewReceipt,    setPreviewReceipt]    = useState(null);
  const [previewAttachment, setPreviewAttachment] = useState(null);
  const [detailProgress,    setDetailProgress]    = useState(null);

  // Penetapan harga & deadline
  const [showPriceForm, setShowPriceForm] = useState(false);
  const [priceForm,     setPriceForm]     = useState({ totalPrice: '', deadline: '' });
  const [isSavingPrice, setIsSavingPrice] = useState(false);

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

  const openPriceForm = () => {
    setPriceForm({
      totalPrice: order.totalPrice ?? '',
      deadline:   order.deadline ? new Date(order.deadline).toISOString().slice(0, 16) : '',
    });
    setShowPriceForm(true);
  };

  const handleSavePrice = async () => {
    setIsSavingPrice(true);
    try {
      const payload = {
        totalPrice: priceForm.totalPrice ? Number(priceForm.totalPrice) : undefined,
        deadline:   priceForm.deadline ? new Date(priceForm.deadline).toISOString() : undefined,
      };
      const res = await orderService.updateDetails(id, payload);
      setOrder(prev => ({ ...prev, totalPrice: res.data.totalPrice, deadline: res.data.deadline }));
      setShowPriceForm(false);
      alert.success('Harga & deadline berhasil ditetapkan!');
    } catch { alert.error('Gagal menyimpan harga.'); }
    finally { setIsSavingPrice(false); }
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

  if (isLoading) return <PageLoader />;

  if (!order) return null;

  const statusCfg = STATUS_CONFIG[order.status] ?? { label: order.status, bg: 'bg-neu-black/20', text: 'text-neu-black' };

  return (
    <PageLayout user={user} title="Detail Pesanan" alert={alert}>
      {detailProgress && (
        <ProgressDetailModal
          report={detailProgress}
          onClose={() => setDetailProgress(null)}
          onViewImage={(src, caption) => setPreviewAttachment({ src, caption })}
        />
      )}
      {previewAttachment && (
        <ImageModal src={previewAttachment.src} caption={previewAttachment.caption} onClose={() => setPreviewAttachment(null)} />
      )}
      {previewReceipt && <ReceiptPreviewModal payment={previewReceipt} onClose={() => setPreviewReceipt(null)} />}
      {showProgress && <ProgressModal orderId={id} onClose={() => setShowProgress(false)} onAdded={loadOrder} />}
      {rejectPaymentId && <RejectModal paymentId={rejectPaymentId} onClose={() => setRejectPaymentId(null)} onRejected={loadOrder} />}
      <ConfirmModal
        isOpen={Boolean(verifyTarget)}
        title="Verifikasi Pembayaran"
        message={`Konfirmasi pembayaran sebesar ${fmt(verifyTarget?.amount)} (${verifyTarget?.paymentType}) sudah diterima?`}
        onConfirm={handleVerify}
        onCancel={() => setVerifyTarget(null)}
        isLoading={isVerifying}
        confirmText="Ya, Verifikasi"
        confirmColor="bg-neu-green text-neu-white"
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
                  <span className="font-mono text-xs text-neu-black/50 uppercase bg-neu-bg border border-neu-black/20 px-2 py-0.5">{order.serviceCategory.replace(/_/g,' ')}</span>
                )}
              </div>
              <h2 className="font-display font-bold text-2xl text-neu-black">{order.title}</h2>
              <p className="font-body text-sm text-neu-black/60 mt-1">
                <span className="font-bold">{order.clientName}</span> · {order.clientEmail}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={openPriceForm}
                className={cn(
                  'px-3 py-2 bg-neu-primary border-2 border-neu-black shadow-neu-sm font-display font-bold text-xs uppercase text-neu-black',
                  'hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-150',
                )}>
                {order.totalPrice ? 'Edit Harga' : '+ Tetapkan Harga'}
              </button>
              <select onChange={e => handleStatusChange(e.target.value)} value={order.status}
                className="px-3 py-2 border-2 border-neu-black bg-neu-white font-display font-bold text-xs uppercase shadow-neu-sm outline-none cursor-pointer">
                {STATUS_TRANSITIONS.map(s => (
                  <option key={s} value={s}>{STATUS_CONFIG[s]?.label ?? s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Deskripsi kebutuhan dari client */}
          {order.description && (
            <div className="mb-5 p-4 bg-neu-bg border-2 border-neu-black/20 border-l-4 border-l-neu-blue">
              <p className="font-display font-bold text-xs text-neu-blue uppercase tracking-wide mb-2">Kebutuhan dari Client</p>
              <p className="font-body text-sm text-neu-black whitespace-pre-wrap">{order.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t-2 border-neu-black pt-4">
            <div>
              <p className="font-mono text-xs text-neu-black/40 uppercase mb-1">Total Harga</p>
              <p className={cn('font-display font-bold text-lg', order.totalPrice ? 'text-neu-black' : 'text-neu-accent')}>
                {order.totalPrice ? fmt(order.totalPrice) : 'Belum ditetapkan'}
              </p>
            </div>
            <div>
              <p className="font-mono text-xs text-neu-black/40 uppercase mb-1">Deadline</p>
              <p className={cn('font-display font-bold text-sm', order.deadline ? 'text-neu-black' : 'text-neu-black/40')}>
                {order.deadline ? fmtDate(order.deadline) : '—'}
              </p>
            </div>
            <div>
              <p className="font-mono text-xs text-neu-black/40 uppercase mb-1">Dibuat</p>
              <p className="font-mono text-xs text-neu-black">{fmtDateTime(order.createdAt)}</p>
            </div>
            <div>
              <p className="font-mono text-xs text-neu-black/40 uppercase mb-1">Progress</p>
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
        </div>

        {/* ─── Section A2: Form Penetapan Harga (inline) ─────────────── */}
        {showPriceForm && (
          <div className="bg-neu-white border-2 border-neu-primary shadow-neu p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-base text-neu-black uppercase tracking-wide">
                Tetapkan Harga & Deadline
              </h3>
              <button onClick={() => setShowPriceForm(false)} className="font-mono text-neu-black/50 hover:text-neu-black text-xl leading-none">×</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-display font-bold text-xs text-neu-black uppercase tracking-wide">Total Harga (Rp)</label>
                <input type="number" value={priceForm.totalPrice}
                  onChange={e => setPriceForm(p => ({ ...p, totalPrice: e.target.value }))}
                  placeholder="Contoh: 1500000"
                  className="w-full px-4 py-2.5 bg-neu-white border-2 border-neu-black shadow-neu-sm font-body text-neu-black outline-none focus:shadow-neu transition-all duration-150" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-display font-bold text-xs text-neu-black uppercase tracking-wide">Deadline</label>
                <input type="datetime-local" value={priceForm.deadline}
                  onChange={e => setPriceForm(p => ({ ...p, deadline: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-neu-white border-2 border-neu-black shadow-neu-sm font-body text-neu-black outline-none focus:shadow-neu transition-all duration-150" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleSavePrice} disabled={isSavingPrice}
                className={cn(
                  'px-6 py-2.5 bg-neu-primary border-2 border-neu-black shadow-neu font-display font-bold text-sm uppercase text-neu-black',
                  'transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm',
                  isSavingPrice && 'opacity-60 cursor-not-allowed',
                )}>
                {isSavingPrice ? t('common.saving') : 'Simpan'}
              </button>
              <button onClick={() => setShowPriceForm(false)}
                className="px-6 py-2.5 bg-neu-white border-2 border-neu-black shadow-neu font-display font-bold text-sm uppercase text-neu-black transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm">
                Batal
              </button>
            </div>
          </div>
        )}

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
                  {/* Receipt thumbnail — klik untuk preview modal */}
                  <button
                    type="button"
                    onClick={() => setPreviewReceipt(p)}
                    title="Klik untuk memperbesar"
                    className={cn(
                      'flex-shrink-0 w-16 h-12 border-2 border-neu-black overflow-hidden bg-neu-bg',
                      'hover:border-neu-primary hover:shadow-neu-sm hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all duration-150',
                    )}
                  >
                    <img src={p.receiptImageUrl} alt="receipt" className="w-full h-full object-cover" />
                  </button>
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
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p className="font-display font-bold text-sm text-neu-black">{r.title}</p>
                      {r.isLocked && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 border border-neu-black bg-neu-primary font-mono text-[10px] font-bold uppercase">
                          🔒 Terkunci
                        </span>
                      )}
                    </div>
                    {r.description && (
                      <p className="font-body text-xs text-neu-black/60 mt-0.5 line-clamp-2">{r.description}</p>
                    )}
                    <p className="font-mono text-xs text-neu-black/40 mt-1">{fmtDateTime(r.reportedAt)}</p>
                    <div className="h-1.5 border border-neu-black bg-neu-bg mt-2">
                      <div className="h-full bg-neu-blue transition-all duration-300" style={{ width: `${r.progressPercentage}%` }} />
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    {r.attachmentUrl && (
                      <div className="w-16 h-12 border-2 border-neu-black overflow-hidden bg-neu-bg">
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
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </PageLayout>
  );
}
