import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';
import { cn } from '../utils/cn';
import { authService } from '../services/auth.service';
import { orderService } from '../services/order.service';
import { paymentService } from '../services/payment.service';
import { PageLayout } from '../components/layout/PageLayout';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { useAlert } from '../hooks/useAlert';
import { PAYMENT_RECEIPT_BUCKET, REVISION_IMAGE_BUCKET } from '../constants/api';
import supabase from '../lib/supabase';
import { PageLoader } from '../components/ui/PageLoader';

const STATUS_BG = {
  pending:     { bg: 'bg-neu-primary', text: 'text-neu-black' },
  in_progress: { bg: 'bg-neu-blue',    text: 'text-neu-white' },
  testing:     { bg: 'bg-neu-purple',  text: 'text-neu-white' },
  revision:    { bg: 'bg-[#F97316]',   text: 'text-neu-white' },
  completed:   { bg: 'bg-neu-green',   text: 'text-neu-white' },
  canceled:    { bg: 'bg-neu-accent',  text: 'text-neu-white' },
};

const PAYMENT_STATUS_BG = {
  pending_verification: { bg: 'bg-neu-primary', text: 'text-neu-black' },
  verified:             { bg: 'bg-neu-green',   text: 'text-neu-white' },
  rejected:             { bg: 'bg-neu-accent',  text: 'text-neu-white' },
};

async function uploadReceipt(file) {
  const ext = file.name.split('.').pop();
  const filename = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(PAYMENT_RECEIPT_BUCKET).upload(filename, file, { cacheControl: '3600', upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from(PAYMENT_RECEIPT_BUCKET).getPublicUrl(filename);
  return data.publicUrl;
}

function ProgressDetailModal({ report, onClose, onViewImage }) {
  const { t }       = useTranslation();
  const backdropRef = useRef(null);
  const cardRef     = useRef(null);

  useEffect(() => {
    gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 });
    gsap.fromTo(cardRef.current, { y: -30, opacity: 0, scale: 0.95 }, { y: 0, opacity: 1, scale: 1, duration: 0.3, ease: 'power3.out' });
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
    <div ref={backdropRef} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neu-black/70"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
      <div ref={cardRef} className="w-full max-w-lg bg-neu-white border-2 border-neu-black shadow-neu-xl">
        <div className="flex items-center justify-between px-5 py-3 border-b-2 border-neu-black bg-neu-blue">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-neu-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            <h3 className="font-display font-bold text-sm text-neu-white uppercase tracking-wide">{t('orderDetail.progressDetail')}</h3>
          </div>
          <button onClick={handleClose} className="text-neu-white/60 hover:text-neu-white font-mono text-2xl leading-none">×</button>
        </div>
        <div className="px-5 py-5 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs text-neu-black/50 uppercase">{t('orderDetail.progressPct')}</span>
              <span className="font-display font-bold text-2xl text-neu-blue">{report.progressPercentage}%</span>
            </div>
            <div className="h-4 border-2 border-neu-black bg-neu-bg overflow-hidden">
              <div className="h-full bg-neu-blue transition-all duration-500" style={{ width: `${report.progressPercentage}%` }} />
            </div>
          </div>
          <div>
            <p className="font-mono text-xs text-neu-black/40 uppercase mb-1">{t('orderDetail.progressTitle')}</p>
            <p className="font-display font-bold text-base text-neu-black">{report.title}</p>
          </div>
          {report.description ? (
            <div>
              <p className="font-mono text-xs text-neu-black/40 uppercase mb-1">{t('orderDetail.description')}</p>
              <div className="bg-neu-bg border-2 border-neu-black p-3">
                <p className="font-body text-sm text-neu-black whitespace-pre-wrap leading-relaxed">{report.description}</p>
              </div>
            </div>
          ) : <p className="font-body text-xs text-neu-black/40 italic">{t('common.noDescription')}</p>}
          {report.attachmentUrl && (
            <div>
              <p className="font-mono text-xs text-neu-black/40 uppercase mb-2">{t('orderDetail.screenshot')}</p>
              <button type="button" onClick={() => { handleClose(); setTimeout(() => onViewImage(report.attachmentUrl, report.title), 300); }}
                className="relative w-full border-2 border-neu-black overflow-hidden group">
                <img src={report.attachmentUrl} alt="screenshot" className="w-full max-h-48 object-cover" />
                <div className="absolute inset-0 bg-neu-black/0 group-hover:bg-neu-black/30 transition-all duration-150 flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 font-display font-bold text-xs text-neu-white bg-neu-black/80 px-3 py-1.5 border border-neu-white/30">{t('orderDetail.zoomIn')}</span>
                </div>
              </button>
            </div>
          )}
          <p className="font-mono text-xs text-neu-black/40">{t('orderDetail.reportedAt')} {fmtDT(report.reportedAt)}</p>
        </div>
        <div className="px-5 pb-5">
          <button onClick={handleClose} className="w-full py-2.5 bg-neu-white border-2 border-neu-black shadow-neu font-display font-bold text-sm uppercase tracking-wide text-neu-black transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm">
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function ImageModal({ src, caption, onClose }) {
  const { t }       = useTranslation();
  const backdropRef = useRef(null);
  const cardRef     = useRef(null);

  useEffect(() => {
    gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 });
    gsap.fromTo(cardRef.current, { y: -30, opacity: 0, scale: 0.95 }, { y: 0, opacity: 1, scale: 1, duration: 0.3, ease: 'power3.out' });
    const handleKey = (e) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleClose = () => {
    gsap.to(cardRef.current,     { y: -20, opacity: 0, scale: 0.95, duration: 0.2, ease: 'power2.in' });
    gsap.to(backdropRef.current, { opacity: 0, duration: 0.2, onComplete: onClose });
  };

  return createPortal(
    <div ref={backdropRef} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neu-black/80"
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
          <button onClick={handleClose} className="px-5 py-2 bg-neu-black border-2 border-neu-black font-display font-bold text-xs uppercase text-neu-white shadow-neu-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-150">
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function ReceiptUploader({ value, onChange, isUploading, onFile }) {
  const { t }        = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  return (
    <div className="space-y-3">
      <div onClick={() => !isUploading && inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) onFile(f); }}
        className={cn('border-2 border-dashed border-neu-black p-6 text-center cursor-pointer transition-all duration-150', isDragging ? 'bg-neu-primary/20 border-solid' : 'hover:bg-neu-bg', isUploading && 'opacity-60 cursor-not-allowed')}>
        <input ref={inputRef} type="file" accept="image/*" className="hidden"
          onChange={e => { if (e.target.files[0]) onFile(e.target.files[0]); }} />
        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <svg className="w-8 h-8 text-neu-black/40 animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeDasharray="60" strokeDashoffset="20" />
            </svg>
            <p className="font-display font-bold text-sm text-neu-black animate-pulse">{t('client.uploadReceipt.uploading')}</p>
          </div>
        ) : (
          <>
            <svg className="w-10 h-10 mx-auto mb-3 text-neu-black/30" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <p className="font-display font-bold text-sm text-neu-black">{t('client.uploadReceipt.dragOrClick')}</p>
            <p className="font-body text-xs text-neu-black/40 mt-1">{t('client.uploadReceipt.formats')}</p>
          </>
        )}
      </div>
      {value && !isUploading && (
        <div className="relative border-2 border-neu-black shadow-neu-sm overflow-hidden">
          <img src={value} alt={t('client.uploadReceipt.title')} className="w-full max-h-48 object-contain bg-neu-bg" />
          <button type="button" onClick={() => onChange('')}
            className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-neu-accent border-2 border-neu-black text-neu-white font-bold text-xs shadow-neu-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-150">✕</button>
          <div className="absolute bottom-0 left-0 right-0 bg-neu-green/90 px-3 py-1.5 flex items-center gap-2">
            <svg className="w-4 h-4 text-neu-white flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
            <span className="font-mono font-bold text-xs text-neu-white">{t('client.uploadReceipt.title')}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function UploadPaymentModal({ orderId, onClose, onUploaded }) {
  const { t }    = useTranslation();
  const alert    = useAlert();
  const [form, setForm]               = useState({ paymentType: 'dp', amount: '', receiptImageUrl: '' });
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving,    setIsSaving]    = useState(false);

  const handleFile = async (file) => {
    if (!file.type.startsWith('image/')) { alert.error(t('client.uploadReceipt.failUpload')); return; }
    setIsUploading(true);
    setForm(p => ({ ...p, receiptImageUrl: '' }));
    try { const url = await uploadReceipt(file); setForm(p => ({ ...p, receiptImageUrl: url })); }
    catch { alert.error(t('client.uploadReceipt.failUpload')); }
    finally { setIsUploading(false); }
  };

  const handleSubmit = async () => {
    if (!form.amount || !form.receiptImageUrl) return;
    setIsSaving(true);
    try {
      await paymentService.create({ orderId, paymentType: form.paymentType, amount: Number(form.amount), receiptImageUrl: form.receiptImageUrl });
      onUploaded();
      onClose();
    } catch { alert.error(t('client.uploadReceipt.failSend')); }
    finally { setIsSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neu-black/60"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-md bg-neu-white border-2 border-neu-black shadow-neu-xl">
        <div className="flex items-center justify-between px-5 py-3 border-b-2 border-neu-black bg-neu-primary">
          <h3 className="font-display font-bold text-sm text-neu-black uppercase">{t('client.uploadReceipt.title')}</h3>
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
            <label className="font-display font-bold text-xs text-neu-black uppercase">{t('common.price')} (Rp) *</label>
            <input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
              placeholder="750000"
              className="w-full px-4 py-2.5 bg-neu-white border-2 border-neu-black shadow-neu-sm font-body text-sm text-neu-black outline-none focus:shadow-neu transition-all duration-150" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-display font-bold text-xs text-neu-black uppercase">{t('client.uploadReceipt.title')} *</label>
            <ReceiptUploader value={form.receiptImageUrl} onChange={url => setForm(p => ({ ...p, receiptImageUrl: url }))} isUploading={isUploading} onFile={handleFile} />
          </div>
        </div>
        <div className="px-5 pb-5 flex gap-3">
          <button onClick={handleSubmit} disabled={isSaving || !form.amount || !form.receiptImageUrl}
            className={cn('flex-1 py-2.5 bg-neu-primary border-2 border-neu-black shadow-neu font-display font-bold text-sm uppercase text-neu-black transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm', (isSaving || !form.amount || !form.receiptImageUrl) && 'opacity-50 cursor-not-allowed')}>
            {isSaving ? t('client.uploadReceipt.sending') : t('client.uploadReceipt.send')}
          </button>
          <button onClick={onClose} className="flex-1 py-2.5 bg-neu-white border-2 border-neu-black shadow-neu font-display font-bold text-sm uppercase text-neu-black transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm">
            {t('common.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}

function RevisionDetailModal({ batch, batchIndex, onClose, onViewImage }) {
  const { t }        = useTranslation();
  const backdropRef  = useRef(null);
  const cardRef      = useRef(null);

  useEffect(() => {
    gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 });
    gsap.fromTo(cardRef.current, { y: -30, opacity: 0, scale: 0.95 }, { y: 0, opacity: 1, scale: 1, duration: 0.3, ease: 'power3.out' });
    const onKey = (e) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleClose = () => {
    gsap.to(cardRef.current,     { y: -20, opacity: 0, scale: 0.95, duration: 0.2, ease: 'power2.in' });
    gsap.to(backdropRef.current, { opacity: 0, duration: 0.2, onComplete: onClose });
  };

  const fmtDT = (val) => new Date(val).toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return createPortal(
    <div ref={backdropRef} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neu-black/70"
      onClick={e => { if (e.target === e.currentTarget) handleClose(); }}>
      <div ref={cardRef} className="w-full max-w-lg bg-neu-white border-2 border-neu-black shadow-neu-xl flex flex-col max-h-[85vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b-2 border-neu-black bg-[#F97316] flex-shrink-0">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-neu-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <div>
              <h3 className="font-display font-bold text-sm text-neu-white uppercase tracking-wide">
                {t('myOrderDetail.revisionNotes')} #{batchIndex + 1}
              </h3>
              <p className="font-mono text-[10px] text-neu-white/70 mt-0.5">{fmtDT(batch.createdAt)}</p>
            </div>
          </div>
          <button onClick={handleClose} className="text-neu-white/70 hover:text-neu-white font-mono text-2xl leading-none">×</button>
        </div>

        {/* Scrollable items */}
        <div className="overflow-y-auto flex-1 divide-y-2 divide-[#F97316]/30">
          {batch.items.map((item, idx) => (
            <div key={idx} className="px-5 py-4 space-y-2">
              <p className="font-mono text-[10px] text-[#F97316] font-bold uppercase tracking-widest">
                {t('myOrderDetail.revisionModal.itemLabel', { n: idx + 1 })}
              </p>
              <p className="font-body text-sm text-neu-black leading-relaxed whitespace-pre-wrap">{item.notes}</p>
              {item.images?.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {item.images.map((url, imgIdx) => (
                    <button key={imgIdx} type="button"
                      onClick={() => { handleClose(); setTimeout(() => onViewImage(url, `Revisi #${batchIndex + 1} Poin ${idx + 1}`), 300); }}
                      className="relative w-20 h-16 border-2 border-neu-black overflow-hidden group hover:border-[#F97316] hover:shadow-neu-sm hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all duration-150">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-neu-black/0 group-hover:bg-neu-black/25 transition-all duration-150 flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 font-mono text-[9px] text-neu-white bg-neu-black/70 px-1.5 py-0.5">
                          Perbesar
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t-2 border-neu-black flex-shrink-0">
          <button onClick={handleClose}
            className="w-full py-2.5 bg-neu-white border-2 border-neu-black shadow-neu font-display font-bold text-sm uppercase text-neu-black transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm">
            {t('common.close') || 'Tutup'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function RevisionModal({ onClose, onSubmit }) {
  const { t }        = useTranslation();
  const alert        = useAlert();
  const [items, setItems]       = useState([{ id: crypto.randomUUID(), notes: '', images: [] }]);
  const [uploadingIdx, setUploadingIdx] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const addItem = () =>
    setItems(prev => [...prev, { id: crypto.randomUUID(), notes: '', images: [] }]);

  const removeItem = (idx) =>
    setItems(prev => prev.filter((_, i) => i !== idx));

  const updateNotes = (idx, val) =>
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, notes: val } : it));

  const handleImageFiles = async (idx, files) => {
    if (!files?.length) return;
    setUploadingIdx(idx);
    try {
      const urls = await Promise.all(
        Array.from(files).filter(f => f.type.startsWith('image/')).map(async (file) => {
          const ext      = file.name.split('.').pop();
          const filename = `${crypto.randomUUID()}.${ext}`;
          const { error } = await supabase.storage
            .from(REVISION_IMAGE_BUCKET)
            .upload(filename, file, { cacheControl: '3600', upsert: false });
          if (error) throw error;
          return supabase.storage.from(REVISION_IMAGE_BUCKET).getPublicUrl(filename).data.publicUrl;
        })
      );
      setItems(prev => prev.map((it, i) => i === idx ? { ...it, images: [...it.images, ...urls] } : it));
    } catch { alert.error('Gagal upload gambar.'); }
    finally { setUploadingIdx(null); }
  };

  const removeImage = (itemIdx, imgIdx) =>
    setItems(prev => prev.map((it, i) =>
      i === itemIdx ? { ...it, images: it.images.filter((_, j) => j !== imgIdx) } : it
    ));

  const canSubmit = items.every(it => it.notes.trim()) && uploadingIdx === null && !isSaving;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSaving(true);
    try {
      await onSubmit(items.map(it => ({ notes: it.notes.trim(), images: it.images })));
      onClose();
    } catch { alert.error('Gagal mengirim permintaan revisi.'); }
    finally { setIsSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neu-black/70"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-lg bg-neu-white border-2 border-neu-black shadow-neu-xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b-2 border-neu-black bg-[#F97316] flex-shrink-0">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-neu-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <h3 className="font-display font-bold text-sm text-neu-white uppercase tracking-wide">
              {t('myOrderDetail.revisionModal.title')}
            </h3>
          </div>
          <button onClick={onClose} className="text-neu-white/70 hover:text-neu-white font-mono text-2xl leading-none">×</button>
        </div>

        {/* Scrollable items */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          {items.map((item, idx) => (
            <div key={item.id} className="border-2 border-neu-black bg-neu-bg p-4 space-y-3">

              {/* Item header */}
              <div className="flex items-center justify-between">
                <span className="font-display font-bold text-xs text-[#F97316] uppercase tracking-wide">
                  {t('myOrderDetail.revisionModal.itemLabel', { n: idx + 1 })}
                </span>
                {items.length > 1 && (
                  <button type="button" onClick={() => removeItem(idx)}
                    className="w-6 h-6 flex items-center justify-center bg-neu-accent border-2 border-neu-black text-neu-white font-bold text-xs hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-150">
                    ✕
                  </button>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="font-mono text-[10px] text-neu-black/50 uppercase tracking-widest block mb-1">
                  {t('myOrderDetail.revisionModal.notesLabel')}
                </label>
                <textarea
                  value={item.notes} onChange={e => updateNotes(idx, e.target.value)} rows={3}
                  placeholder={t('myOrderDetail.revisionModal.notesPlaceholder')}
                  className="w-full px-3 py-2.5 bg-neu-white border-2 border-neu-black shadow-neu-sm font-body text-sm text-neu-black placeholder:text-gray-400 outline-none focus:shadow-neu transition-all duration-150 resize-none" />
              </div>

              {/* Images */}
              <div>
                <label className="font-mono text-[10px] text-neu-black/50 uppercase tracking-widest block mb-1">
                  {t('myOrderDetail.revisionModal.imagesLabel')}
                </label>

                {/* Uploaded thumbnails */}
                {item.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {item.images.map((url, imgIdx) => (
                      <div key={imgIdx} className="relative group">
                        <img src={url} alt="" className="w-16 h-14 object-cover border-2 border-neu-black" />
                        <button type="button" onClick={() => removeImage(idx, imgIdx)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center bg-neu-accent border border-neu-black text-neu-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload zone */}
                <label className={cn('flex items-center justify-center gap-2 border-2 border-dashed border-neu-black px-4 py-3 cursor-pointer transition-colors duration-150',
                  uploadingIdx === idx ? 'opacity-60 cursor-not-allowed bg-neu-black/5' : 'hover:bg-neu-white')}>
                  <input type="file" accept="image/*" multiple className="hidden"
                    disabled={uploadingIdx !== null}
                    onChange={e => { if (e.target.files) handleImageFiles(idx, e.target.files); e.target.value = ''; }} />
                  {uploadingIdx === idx ? (
                    <span className="font-display font-bold text-xs text-neu-black animate-pulse">
                      {t('myOrderDetail.revisionModal.uploading')}
                    </span>
                  ) : (
                    <>
                      <svg className="w-4 h-4 text-neu-black/40" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      <span className="font-display font-bold text-xs text-neu-black/50">
                        {t('myOrderDetail.revisionModal.uploadImages')}
                      </span>
                    </>
                  )}
                </label>
              </div>
            </div>
          ))}

          {/* Add item button */}
          <button type="button" onClick={addItem}
            className="w-full py-2.5 border-2 border-dashed border-[#F97316] bg-[#F97316]/5 font-display font-bold text-xs uppercase text-[#F97316] transition-all duration-150 hover:bg-[#F97316]/10">
            {t('myOrderDetail.revisionModal.addItem')}
          </button>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t-2 border-neu-black flex gap-3 flex-shrink-0">
          <button onClick={handleSubmit} disabled={!canSubmit}
            className={cn('flex-1 py-2.5 bg-[#F97316] border-2 border-neu-black shadow-neu font-display font-bold text-sm uppercase text-neu-white transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm',
              !canSubmit && 'opacity-50 cursor-not-allowed')}>
            {isSaving ? t('myOrderDetail.revisionModal.submitting') : t('myOrderDetail.revisionModal.submit')}
          </button>
          <button onClick={onClose}
            className="flex-1 py-2.5 bg-neu-white border-2 border-neu-black shadow-neu font-display font-bold text-sm uppercase text-neu-black transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm">
            {t('common.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MyOrderDetailPage() {
  const navigate = useNavigate();
  const { id }   = useParams();
  const { t }    = useTranslation();
  const alert    = useAlert();

  const [user,           setUser]           = useState(null);
  const [order,          setOrder]          = useState(null);
  const [isLoading,      setIsLoading]      = useState(true);
  const [showPayment,    setShowPayment]    = useState(false);
  const [showComplete,   setShowComplete]   = useState(false);
  const [isCompleting,   setIsCompleting]   = useState(false);
  const [showRevision,         setShowRevision]         = useState(false);
  const [revisionDetailTarget, setRevisionDetailTarget] = useState(null);
  const [previewImage,         setPreviewImage]         = useState(null);
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
      alert.success('Pesanan berhasil diselesaikan!');
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'Gagal menyelesaikan pesanan.';
      alert.error(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally { setIsCompleting(false); }
  };

  const handleRequestRevision = async (items) => {
    await orderService.requestRevision(id, items);
    await loadOrder();
    alert.success(t('myOrderDetail.requestRevision') + ' berhasil dikirim.');
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
    if (!isLoading && pageRef.current) gsap.from(pageRef.current, { y: 20, opacity: 0, duration: 0.5, ease: 'power2.out' });
  }, [isLoading]);

  const fmt         = (val) => val ? `Rp ${Number(val).toLocaleString('id-ID')}` : '—';
  const fmtDateTime = (val) => val ? new Date(val).toLocaleString('id-ID', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '—';

  if (isLoading) return <PageLoader />;
  if (!order) return null;

  const statusCfg    = STATUS_BG[order.status] ?? { bg: 'bg-neu-black/20', text: 'text-neu-black' };
  const lastProgress = order.progressReports?.length ? order.progressReports[order.progressReports.length - 1].progressPercentage : 0;

  return (
    <PageLayout user={user} title={t('myOrderDetail.breadcrumb')} alert={alert}>
      {detailProgress && (
        <ProgressDetailModal report={detailProgress} onClose={() => setDetailProgress(null)}
          onViewImage={(src, caption) => setPreviewImage({ src, caption })} />
      )}
      {previewImage && <ImageModal src={previewImage.src} caption={previewImage.caption} onClose={() => setPreviewImage(null)} />}
      {revisionDetailTarget && (
        <RevisionDetailModal
          batch={revisionDetailTarget.batch}
          batchIndex={revisionDetailTarget.index}
          onClose={() => setRevisionDetailTarget(null)}
          onViewImage={(src, caption) => setPreviewImage({ src, caption })}
        />
      )}
      {showRevision && <RevisionModal onClose={() => setShowRevision(false)} onSubmit={handleRequestRevision} />}
      {showPayment && <UploadPaymentModal orderId={id} onClose={() => setShowPayment(false)} onUploaded={loadOrder} />}
      <ConfirmModal
        isOpen={showComplete}
        title={t('myOrderDetail.completeOrder')}
        message={t('myOrderDetail.confirmComplete', { title: order?.title })}
        onConfirm={handleComplete}
        onCancel={() => setShowComplete(false)}
        isLoading={isCompleting}
        confirmText={t('myOrderDetail.yesComplete')}
        confirmColor="bg-neu-green text-neu-white"
      />

      <div ref={pageRef} className="max-w-3xl mx-auto space-y-6">

        <div className="flex items-center gap-2 font-mono text-xs text-neu-black/50">
          <button onClick={() => navigate('/my-orders')} className="hover:text-neu-black">{t('myOrderDetail.breadcrumb')}</button>
          <span>/</span>
          <span className="text-neu-black truncate">{order.title}</span>
        </div>

        {/* Info */}
        <div className="bg-neu-white border-2 border-neu-black shadow-neu p-6">
          <div className="flex items-center justify-between mb-4">
            <span className={cn('inline-block px-3 py-1 border-2 border-neu-black font-mono font-bold text-sm uppercase', statusCfg.bg, statusCfg.text)}>
              {t(`status.${order.status}`, { defaultValue: order.status })}
            </span>
            <div className="flex flex-wrap gap-2">
              {!['completed', 'canceled'].includes(order.status) && (
                <button onClick={() => setShowPayment(true)}
                  className="px-4 py-2 bg-neu-primary border-2 border-neu-black shadow-neu font-display font-bold text-xs uppercase text-neu-black hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm transition-all duration-150">
                  {t('myOrderDetail.uploadReceipt')}
                </button>
              )}
              {order.status === 'testing' && (
                <button onClick={() => setShowRevision(true)}
                  className="px-4 py-2 bg-[#F97316] border-2 border-neu-black shadow-neu font-display font-bold text-xs uppercase text-neu-white hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm transition-all duration-150">
                  {t('myOrderDetail.requestRevision')}
                </button>
              )}
              {['in_progress', 'testing', 'revision'].includes(order.status) && (
                <button onClick={() => setShowComplete(true)}
                  className="px-4 py-2 bg-neu-green border-2 border-neu-black shadow-neu font-display font-bold text-xs uppercase text-neu-white hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm transition-all duration-150">
                  {t('myOrderDetail.completeOrder')}
                </button>
              )}
            </div>
          </div>
          <h2 className="font-display font-bold text-xl text-neu-black mb-2">{order.title}</h2>
          {order.description && <p className="font-body text-sm text-neu-black/60 mb-4">{order.description}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t-2 border-neu-black pt-4">
            <div>
              <p className="font-mono text-xs text-neu-black/40 uppercase">{t('myOrderDetail.totalPrice')}</p>
              <p className="font-display font-bold text-lg">{fmt(order.totalPrice)}</p>
            </div>
            <div>
              <p className="font-mono text-xs text-neu-black/40 uppercase">{t('myOrderDetail.deadline')}</p>
              <p className="font-display font-bold text-sm">{fmtDateTime(order.deadline)}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t-2 border-neu-black">
            <div className="flex justify-between mb-1">
              <span className="font-mono text-xs text-neu-black/50 uppercase">{t('myOrderDetail.overallProgress')}</span>
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
            <h3 className="font-display font-bold text-base uppercase">{t('myOrderDetail.paymentHistory')}</h3>
          </div>
          {!order.payments?.length ? (
            <p className="px-6 py-6 text-center font-body text-sm text-neu-black/40">{t('myOrderDetail.noPayments')}</p>
          ) : (
            <div className="divide-y-2 divide-neu-black">
              {order.payments.map(p => {
                const pcfg = PAYMENT_STATUS_BG[p.status] ?? { bg: 'bg-neu-black/20', text: 'text-neu-black' };
                return (
                  <div key={p.id} className="px-6 py-4 flex items-center gap-4">
                    <button type="button"
                      onClick={() => setPreviewImage({ src: p.receiptImageUrl, caption: `Bukti ${p.paymentType} — Rp ${Number(p.amount).toLocaleString('id-ID')}` })}
                      className="w-12 h-10 border-2 border-neu-black overflow-hidden bg-neu-bg flex-shrink-0 hover:border-neu-primary hover:shadow-neu-sm hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all duration-150">
                      <img src={p.receiptImageUrl} alt="receipt" className="w-full h-full object-cover" />
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={cn('px-2 py-0.5 border-2 border-neu-black font-mono font-bold text-xs uppercase', pcfg.bg, pcfg.text)}>
                          {t(`status.${p.status}`, { defaultValue: p.status })}
                        </span>
                        <span className="font-mono text-xs text-neu-black/50 uppercase">{p.paymentType}</span>
                      </div>
                      <p className="font-display font-bold text-sm">{fmt(p.amount)}</p>
                      <p className="font-mono text-xs text-neu-black/40">{fmtDateTime(p.createdAt)}</p>
                      {p.notes && <p className="font-body text-xs text-neu-accent mt-0.5">{t('myOrderDetail.adminNote')} {p.notes}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="bg-neu-white border-2 border-neu-black shadow-neu">
          <div className="px-6 py-4 border-b-2 border-neu-black">
            <h3 className="font-display font-bold text-base uppercase">{t('myOrderDetail.progressTimeline')}</h3>
          </div>
          {!order.progressReports?.length ? (
            <p className="px-6 py-6 text-center font-body text-sm text-neu-black/40">{t('myOrderDetail.noProgress')}</p>
          ) : (
            <div className="divide-y-2 divide-neu-black">
              {[...order.progressReports].reverse().map(r => (
                <div key={r.id} className="px-6 py-4 flex gap-4">
                  <div className={cn('w-12 h-12 border-2 border-neu-black flex flex-col items-center justify-center flex-shrink-0', r.isLocked ? 'bg-neu-black/5' : 'bg-neu-blue/10')}>
                    <span className={cn('font-display font-bold text-base leading-none', r.isLocked ? 'text-neu-black/40' : 'text-neu-blue')}>{r.progressPercentage}</span>
                    <span className={cn('font-mono text-[9px]', r.isLocked ? 'text-neu-black/30' : 'text-neu-blue/60')}>%</span>
                  </div>
                  {r.isLocked ? (
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-display font-bold text-sm text-neu-black">{r.title}</p>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 border border-neu-black bg-neu-primary font-mono text-[10px] font-bold uppercase">{t('myOrderDetail.locked')}</span>
                      </div>
                      <p className="font-body text-xs text-neu-black/50 bg-neu-bg border border-neu-black/20 px-3 py-2">{t('myOrderDetail.lockedMsg')}</p>
                      <div className="h-1.5 border border-neu-black/20 bg-neu-bg mt-2">
                        <div className="h-full bg-neu-black/20" style={{ width: `${r.progressPercentage}%` }} />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 min-w-0">
                        <p className="font-display font-bold text-sm text-neu-black">{r.title}</p>
                        {r.description && <p className="font-body text-xs text-neu-black/60 mt-0.5 line-clamp-2">{r.description}</p>}
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
                        <button type="button" onClick={() => setDetailProgress(r)}
                          className="px-3 py-1.5 bg-neu-blue border-2 border-neu-black shadow-neu-sm font-display font-bold text-xs uppercase tracking-wide text-neu-white whitespace-nowrap transition-all duration-150 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none">
                          {t('orderDetail.viewDetail')}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── Section: Revisi ─────────────────────────────────────── */}
        <div className="bg-neu-white border-2 border-neu-black shadow-neu">
          <div className="flex items-center gap-3 px-6 py-4 border-b-2 border-neu-black bg-[#F97316]">
            <svg className="w-4 h-4 text-neu-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <h3 className="font-display font-bold text-base text-neu-white uppercase tracking-wide">
              {t('myOrderDetail.revisionNotes')} ({order.revisions?.length ?? 0})
            </h3>
          </div>
          {!order.revisions?.length ? (
            <p className="px-6 py-8 text-center font-body text-sm text-neu-black/40">
              {t('myOrderDetail.noRevisions') || 'Belum ada permintaan revisi.'}
            </p>
          ) : (
            <div className="divide-y-2 divide-neu-black">
              {order.revisions.map((batch, batchIdx) => (
                <div key={batch.id} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-10 h-10 border-2 border-[#F97316] bg-[#F97316]/10 flex items-center justify-center">
                      <span className="font-display font-bold text-base text-[#F97316] leading-none">#{batchIdx + 1}</span>
                    </div>
                    <div>
                      <p className="font-display font-bold text-sm text-neu-black">
                        {batch.items.length} {batch.items.length === 1 ? 'poin' : 'poin'} revisi
                      </p>
                      <p className="font-mono text-xs text-neu-black/40 mt-0.5">
                        {new Date(batch.createdAt).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {batch.items[0]?.notes && (
                        <p className="font-body text-xs text-neu-black/60 mt-0.5 line-clamp-1 max-w-xs">
                          {batch.items[0].notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <button onClick={() => setRevisionDetailTarget({ batch, index: batchIdx })}
                    className="px-3 py-1.5 bg-[#F97316] border-2 border-neu-black shadow-neu-sm font-display font-bold text-xs uppercase text-neu-white hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-150 whitespace-nowrap flex-shrink-0">
                    {t('orderDetail.viewDetail')}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </PageLayout>
  );
}
