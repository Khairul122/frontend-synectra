import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { cn } from '../utils/cn';
import { authService } from '../services/auth.service';
import { softwareProductService } from '../services/softwareProduct.service';
import { softwarePurchaseService } from '../services/softwarePurchase.service';
import { PageLayout } from '../components/layout/PageLayout';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { useAlert } from '../hooks/useAlert';
import { PAYMENT_RECEIPT_BUCKET } from '../constants/api';
import supabase from '../lib/supabase';

const fmt = (val) => `Rp ${Number(val).toLocaleString('id-ID')}`;

const STATUS_CONFIG = {
  pending_payment:      { label: 'Menunggu Pembayaran', bg: 'bg-neu-primary',    text: 'text-neu-black' },
  pending_verification: { label: 'Menunggu Verifikasi', bg: 'bg-neu-blue',       text: 'text-neu-white' },
  verified:             { label: 'Terverifikasi',        bg: 'bg-neu-green',      text: 'text-neu-white' },
  rejected:             { label: 'Ditolak',              bg: 'bg-neu-accent',     text: 'text-neu-white' },
};

async function uploadReceipt(file) {
  const ext = file.name.split('.').pop();
  const filename = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(PAYMENT_RECEIPT_BUCKET)
    .upload(filename, file, { cacheControl: '3600', upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from(PAYMENT_RECEIPT_BUCKET).getPublicUrl(filename);
  return data.publicUrl;
}

/* ─── Upload Receipt Modal ───────────────────────────────────────────────── */
function UploadReceiptModal({ purchaseId, onClose, onUploaded }) {
  const [receiptUrl,  setReceiptUrl]  = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving,    setIsSaving]    = useState(false);
  const [isDragging,  setIsDragging]  = useState(false);
  const inputRef = useRef(null);
  const alert    = useAlert();

  const processFile = async (file) => {
    if (!file.type.startsWith('image/')) return;
    setIsUploading(true);
    setReceiptUrl('');
    try { const url = await uploadReceipt(file); setReceiptUrl(url); }
    catch { alert.error('Gagal upload bukti. Coba lagi.'); }
    finally { setIsUploading(false); }
  };

  const handleSubmit = async () => {
    if (!receiptUrl) return;
    setIsSaving(true);
    try {
      await softwarePurchaseService.uploadReceipt(purchaseId, { receiptImageUrl: receiptUrl });
      onUploaded();
      onClose();
    } catch { alert.error('Gagal mengirim bukti bayar.'); }
    finally { setIsSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neu-black/60"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-md bg-neu-white border-2 border-neu-black shadow-neu-xl">
        <div className="flex items-center justify-between px-5 py-3 border-b-2 border-neu-black bg-neu-primary">
          <h3 className="font-display font-bold text-sm text-neu-black uppercase">Upload Bukti Pembayaran</h3>
          <button onClick={onClose} className="text-neu-black/60 hover:text-neu-black font-mono text-2xl leading-none">×</button>
        </div>
        <div className="px-5 py-5 space-y-4">
          <div
            onClick={() => !isUploading && inputRef.current.click()}
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={e => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) processFile(f); }}
            className={cn('border-2 border-dashed border-neu-black p-6 text-center cursor-pointer transition-all duration-150', isDragging ? 'bg-neu-primary/20 border-solid' : 'hover:bg-neu-bg', isUploading && 'opacity-60 cursor-not-allowed')}
          >
            <input ref={inputRef} type="file" accept="image/*" className="hidden"
              onChange={e => { if (e.target.files[0]) processFile(e.target.files[0]); }} />
            {isUploading
              ? <p className="font-display font-bold text-sm text-neu-black animate-pulse">Mengupload...</p>
              : <><p className="font-display font-bold text-sm text-neu-black">Klik atau drag foto bukti transfer</p>
                 <p className="font-body text-xs text-neu-black/40 mt-1">PNG, JPG, WEBP</p></>
            }
          </div>
          {receiptUrl && !isUploading && (
            <div className="relative border-2 border-neu-black overflow-hidden">
              <img src={receiptUrl} alt="Bukti" className="w-full max-h-48 object-contain bg-neu-bg" />
              <button type="button" onClick={() => setReceiptUrl('')}
                className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-neu-accent border-2 border-neu-black text-neu-white font-bold text-xs">✕</button>
            </div>
          )}
        </div>
        <div className="px-5 pb-5 flex gap-3">
          <button onClick={handleSubmit} disabled={isSaving || !receiptUrl || isUploading}
            className={cn('flex-1 py-2.5 bg-neu-primary border-2 border-neu-black shadow-neu font-display font-bold text-sm uppercase text-neu-black transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm', (isSaving || !receiptUrl || isUploading) && 'opacity-50 cursor-not-allowed')}>
            {isSaving ? 'Mengirim...' : 'Kirim Bukti'}
          </button>
          <button onClick={onClose} className="flex-1 py-2.5 bg-neu-white border-2 border-neu-black shadow-neu font-display font-bold text-sm uppercase text-neu-black transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm">
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */
export default function MySoftwarePage() {
  const navigate = useNavigate();
  const alert    = useAlert();

  const [user,          setUser]          = useState(null);
  const [software,      setSoftware]      = useState([]);
  const [purchases,     setPurchases]     = useState([]);
  const [isLoading,     setIsLoading]     = useState(true);
  const [buyTarget,     setBuyTarget]     = useState(null);
  const [isBuying,      setIsBuying]      = useState(false);
  const [uploadTarget,  setUploadTarget]  = useState(null);

  const pageRef = useRef(null);

  const loadData = async () => {
    const [swRes, purRes] = await Promise.all([
      softwareProductService.getPublic(),
      softwarePurchaseService.getAll(),
    ]);
    setSoftware(swRes.data ?? []);
    setPurchases(purRes.data ?? []);
  };

  useEffect(() => {
    const init = async () => {
      try {
        const me = await authService.getMe();
        setUser(me.data);
        await loadData();
      } catch { navigate('/login'); }
      finally { setIsLoading(false); }
    };
    init();
  }, [navigate]);

  useEffect(() => {
    if (!isLoading && pageRef.current)
      gsap.from(pageRef.current, { y: 20, opacity: 0, duration: 0.5, ease: 'power2.out' });
  }, [isLoading]);

  const handleBuy = async () => {
    if (!buyTarget) return;
    setIsBuying(true);
    try {
      await softwarePurchaseService.create({ softwareId: buyTarget.id });
      await loadData();
      alert.success(`Pembelian "${buyTarget.name}" berhasil dibuat! Silakan upload bukti pembayaran.`);
      setBuyTarget(null);
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'Gagal membuat pembelian.';
      alert.error(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setIsBuying(false);
    }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-neu-bg flex items-center justify-center">
      <p className="font-display font-bold text-neu-black animate-pulse">Memuat...</p>
    </div>
  );

  const purchasedIds = new Set(purchases.map(p => p.softwareId));

  return (
    <PageLayout user={user} title="Software" alert={alert}>
      <ConfirmModal
        isOpen={Boolean(buyTarget)}
        title="Konfirmasi Pembelian"
        message={`Beli "${buyTarget?.name}" seharga ${fmt(buyTarget?.price ?? 0)}? Kamu akan diminta upload bukti transfer setelah konfirmasi.`}
        onConfirm={handleBuy}
        onCancel={() => setBuyTarget(null)}
        isLoading={isBuying}
        confirmText="Ya, Beli Sekarang"
        confirmColor="bg-neu-primary text-neu-black"
      />

      {uploadTarget && (
        <UploadReceiptModal
          purchaseId={uploadTarget}
          onClose={() => setUploadTarget(null)}
          onUploaded={async () => { await loadData(); alert.success('Bukti berhasil dikirim!'); }}
        />
      )}

      <div ref={pageRef} className="space-y-10">

        {/* ── Katalog Software ── */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-1 w-6 bg-neu-black" />
            <h2 className="font-display font-bold text-xl uppercase tracking-wide">Katalog Software</h2>
          </div>

          {software.length === 0 ? (
            <div className="border-2 border-dashed border-neu-black p-12 text-center">
              <p className="font-body text-neu-black/40">Belum ada software tersedia.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {software.map(sw => (
                <div key={sw.id} className="border-2 border-neu-black shadow-neu bg-neu-white flex flex-col">
                  {/* Thumbnail */}
                  <div className="border-b-2 border-neu-black bg-neu-bg h-40 overflow-hidden flex items-center justify-center">
                    {sw.thumbnailUrl
                      ? <img src={sw.thumbnailUrl} alt={sw.name} className="w-full h-full object-cover" loading="lazy" />
                      : <svg className="w-12 h-12 text-neu-black/15" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <rect x="2" y="3" width="20" height="14" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
                        </svg>
                    }
                  </div>

                  {/* Info */}
                  <div className="p-4 flex-1">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="font-display font-bold text-base text-neu-black leading-tight">{sw.name}</p>
                      {sw.category && (
                        <span className="flex-shrink-0 font-mono text-[10px] text-neu-black/50 uppercase border border-neu-black/20 px-1.5 py-0.5">{sw.category}</span>
                      )}
                    </div>
                    {sw.description && (
                      <p className="font-body text-xs text-neu-black/60 mb-3 line-clamp-2">{sw.description}</p>
                    )}
                    <p className="font-display font-bold text-xl text-neu-black mb-3">{fmt(sw.price)}</p>
                    {sw.techStack && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {sw.techStack.split('\n').filter(t => t.trim()).slice(0, 4).map(t => (
                          <span key={t} className="font-mono text-[10px] bg-neu-black text-neu-white px-2 py-0.5">{t.trim()}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  <div className="px-4 pb-4 flex gap-2">
                    {sw.demoUrl && (
                      <a href={sw.demoUrl} target="_blank" rel="noopener noreferrer"
                        className="flex-1 py-2 border-2 border-neu-black bg-neu-white font-display font-bold text-xs uppercase text-neu-black text-center transition-all duration-150 hover:bg-neu-bg hover:translate-x-[1px] hover:translate-y-[1px]">
                        Demo
                      </a>
                    )}
                    <button onClick={() => setBuyTarget(sw)}
                      className={cn('flex-1 py-2 border-2 border-neu-black font-display font-bold text-xs uppercase transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none',
                        purchasedIds.has(sw.id)
                          ? 'bg-neu-green text-neu-white shadow-neu-sm'
                          : 'bg-neu-primary text-neu-black shadow-neu',
                      )}>
                      {purchasedIds.has(sw.id) ? 'Beli Lagi' : 'Beli Sekarang'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Riwayat Pembelian ── */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-1 w-6 bg-neu-black" />
            <h2 className="font-display font-bold text-xl uppercase tracking-wide">Riwayat Pembelian</h2>
          </div>

          {purchases.length === 0 ? (
            <div className="border-2 border-dashed border-neu-black p-12 text-center">
              <p className="font-body text-neu-black/40">Belum ada riwayat pembelian.</p>
            </div>
          ) : (
            <div className="border-2 border-neu-black shadow-neu bg-neu-white overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-neu-black text-neu-white">
                      {['No', 'Software', 'Harga', 'Status', 'Tanggal', 'Aksi'].map((h, i) => (
                        <th key={h} className={cn('px-4 py-3 font-display font-bold text-xs uppercase tracking-wide text-left', i < 5 && 'border-r-2 border-neu-white/20')}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {purchases.map((p, idx) => {
                      const cfg = STATUS_CONFIG[p.paymentStatus] ?? { label: p.paymentStatus, bg: 'bg-neu-black/10', text: 'text-neu-black' };
                      return (
                        <tr key={p.id} className="border-b-2 border-neu-black bg-neu-white hover:bg-neu-bg transition-colors">
                          <td className="px-4 py-3 border-r-2 border-neu-black font-mono text-xs text-neu-black/50 text-center w-10">{idx + 1}</td>
                          <td className="px-4 py-3 border-r-2 border-neu-black">
                            <p className="font-display font-bold text-sm text-neu-black">{p.softwareName}</p>
                          </td>
                          <td className="px-4 py-3 border-r-2 border-neu-black font-display font-bold text-sm text-neu-black whitespace-nowrap">
                            {fmt(p.totalPrice)}
                          </td>
                          <td className="px-4 py-3 border-r-2 border-neu-black">
                            <span className={cn('inline-block px-2 py-0.5 border-2 border-neu-black font-mono font-bold text-xs uppercase', cfg.bg, cfg.text)}>
                              {cfg.label}
                            </span>
                            {p.paymentStatus === 'rejected' && p.notes && (
                              <p className="font-body text-xs text-neu-accent mt-1">Catatan: {p.notes}</p>
                            )}
                          </td>
                          <td className="px-4 py-3 border-r-2 border-neu-black font-mono text-xs text-neu-black/50 whitespace-nowrap">
                            {new Date(p.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-4 py-3">
                            {p.paymentStatus === 'pending_payment' && (
                              <button onClick={() => setUploadTarget(p.id)}
                                className="px-3 py-1.5 bg-neu-primary border-2 border-neu-black font-display font-bold text-xs uppercase text-neu-black shadow-neu-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-150 whitespace-nowrap">
                                Upload Bukti
                              </button>
                            )}
                            {p.paymentStatus === 'verified' && (
                              <span className="font-mono text-xs text-neu-green font-bold">✓ Selesai</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

      </div>
    </PageLayout>
  );
}
