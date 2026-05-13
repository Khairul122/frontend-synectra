import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { cn } from '../utils/cn';
import { authService } from '../services/auth.service';
import { softwarePurchaseService } from '../services/softwarePurchase.service';
import { PageLayout } from '../components/layout/PageLayout';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { useAlert } from '../hooks/useAlert';

const fmt = (val) => `Rp ${Number(val).toLocaleString('id-ID')}`;

const STATUS_CONFIG = {
  pending_payment:      { label: 'Belum Bayar',          bg: 'bg-neu-black/10',  text: 'text-neu-black/60' },
  pending_verification: { label: 'Menunggu Verifikasi',  bg: 'bg-neu-primary',   text: 'text-neu-black' },
  verified:             { label: 'Terverifikasi',         bg: 'bg-neu-green',     text: 'text-neu-white' },
  rejected:             { label: 'Ditolak',               bg: 'bg-neu-accent',    text: 'text-neu-white' },
};

const FILTER_OPTIONS = [
  { value: 'all',                  label: 'Semua' },
  { value: 'pending_payment',      label: 'Belum Bayar' },
  { value: 'pending_verification', label: 'Menunggu Verifikasi' },
  { value: 'verified',             label: 'Terverifikasi' },
  { value: 'rejected',             label: 'Ditolak' },
];

/* ─── Receipt Preview Modal ──────────────────────────────────────────────── */
function ReceiptModal({ url, name, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neu-black/80"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-xl bg-neu-white border-2 border-neu-black shadow-neu-xl">
        <div className="flex items-center justify-between px-5 py-3 border-b-2 border-neu-black bg-neu-black">
          <p className="font-display font-bold text-sm text-neu-white truncate">{name}</p>
          <button onClick={onClose} className="text-neu-white/60 hover:text-neu-white font-mono text-2xl leading-none ml-4">×</button>
        </div>
        <div className="bg-neu-bg flex items-center justify-center border-b-2 border-neu-black">
          <img src={url} alt="Bukti transfer" className="max-w-full max-h-[65vh] object-contain" />
        </div>
        <div className="px-5 py-3 flex justify-end">
          <button onClick={onClose} className="px-5 py-2 bg-neu-black border-2 border-neu-black font-display font-bold text-xs uppercase text-neu-white shadow-neu-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-150">Tutup</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Reject Modal ───────────────────────────────────────────────────────── */
function RejectModal({ onClose, onReject }) {
  const [notes,    setNotes]    = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const alert = useAlert();

  const handleSubmit = async () => {
    if (!notes.trim()) return;
    setIsSaving(true);
    try { await onReject(notes); onClose(); }
    catch { alert.error('Gagal menolak pembelian.'); }
    finally { setIsSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neu-black/60"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-sm bg-neu-white border-2 border-neu-black shadow-neu-xl">
        <div className="flex items-center justify-between px-5 py-3 border-b-2 border-neu-black bg-neu-accent">
          <h3 className="font-display font-bold text-sm text-neu-white uppercase">Tolak Pembelian</h3>
          <button onClick={onClose} className="text-neu-white/60 hover:text-neu-white font-mono text-2xl leading-none">×</button>
        </div>
        <div className="px-5 py-5">
          <label className="font-display font-bold text-xs text-neu-black uppercase mb-2 block">Alasan Penolakan *</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
            placeholder="Contoh: Bukti transfer tidak jelas atau jumlah tidak sesuai"
            className="w-full px-4 py-2.5 bg-neu-white border-2 border-neu-black shadow-neu-sm font-body text-sm text-neu-black outline-none focus:shadow-neu transition-all duration-150 resize-none" />
        </div>
        <div className="px-5 pb-5 flex gap-3">
          <button onClick={handleSubmit} disabled={isSaving || !notes.trim()}
            className={cn('flex-1 py-2.5 bg-neu-accent border-2 border-neu-black shadow-neu font-display font-bold text-sm uppercase text-neu-white transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm', (isSaving || !notes.trim()) && 'opacity-50 cursor-not-allowed')}>
            {isSaving ? 'Menyimpan...' : 'Tolak'}
          </button>
          <button onClick={onClose} className="flex-1 py-2.5 bg-neu-white border-2 border-neu-black shadow-neu font-display font-bold text-sm uppercase text-neu-black transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm">Batal</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */
export default function SoftwarePurchasePage() {
  const navigate = useNavigate();
  const alert    = useAlert();

  const [user,          setUser]          = useState(null);
  const [purchases,     setPurchases]     = useState([]);
  const [isLoading,     setIsLoading]     = useState(true);
  const [filter,        setFilter]        = useState('all');
  const [verifyTarget,  setVerifyTarget]  = useState(null);
  const [isVerifying,   setIsVerifying]   = useState(false);
  const [rejectTarget,  setRejectTarget]  = useState(null);
  const [receiptModal,  setReceiptModal]  = useState(null);

  const headerRef = useRef(null);
  const tableRef  = useRef(null);

  const loadData = async () => {
    const res = await softwarePurchaseService.getAll();
    setPurchases(res.data ?? []);
  };

  useEffect(() => {
    authService.getMe()
      .then(res => {
        const u = res.data;
        if (u.role !== 'admin') { navigate('/dashboard'); return; }
        setUser(u);
        return loadData();
      })
      .catch(() => navigate('/login'))
      .finally(() => setIsLoading(false));
  }, [navigate]);

  useEffect(() => {
    if (!isLoading && headerRef.current)
      gsap.from(headerRef.current, { y: -20, opacity: 0, duration: 0.4, ease: 'power2.out' });
    if (!isLoading && tableRef.current)
      gsap.from(tableRef.current, { y: 20, opacity: 0, duration: 0.5, delay: 0.1, ease: 'power2.out' });
  }, [isLoading]);

  const handleVerify = async () => {
    if (!verifyTarget) return;
    setIsVerifying(true);
    try {
      await softwarePurchaseService.verify(verifyTarget.id);
      await loadData();
      alert.success(`Pembelian "${verifyTarget.softwareName}" berhasil diverifikasi.`);
      setVerifyTarget(null);
    } catch { alert.error('Gagal verifikasi.'); }
    finally { setIsVerifying(false); }
  };

  const handleReject = async (notes) => {
    await softwarePurchaseService.reject(rejectTarget.id, notes);
    await loadData();
    alert.success(`Pembelian "${rejectTarget.softwareName}" ditolak.`);
    setRejectTarget(null);
  };

  const filtered = purchases.filter(p => filter === 'all' || p.paymentStatus === filter);

  if (isLoading) return (
    <div className="min-h-screen bg-neu-bg flex items-center justify-center">
      <p className="font-display font-bold text-neu-black animate-pulse">Memuat...</p>
    </div>
  );

  return (
    <PageLayout user={user} title="Pembelian Software" alert={alert}>
      <ConfirmModal
        isOpen={Boolean(verifyTarget)}
        title="Verifikasi Pembelian"
        message={`Konfirmasi pembayaran dari ${verifyTarget?.clientName ?? 'client'} untuk "${verifyTarget?.softwareName}" sebesar ${fmt(verifyTarget?.totalPrice ?? 0)} sudah diterima?`}
        onConfirm={handleVerify}
        onCancel={() => setVerifyTarget(null)}
        isLoading={isVerifying}
        confirmText="Ya, Verifikasi"
        confirmColor="bg-neu-green text-neu-white"
      />
      {rejectTarget && <RejectModal onClose={() => setRejectTarget(null)} onReject={handleReject} />}
      {receiptModal && <ReceiptModal url={receiptModal.url} name={receiptModal.name} onClose={() => setReceiptModal(null)} />}

      {/* Header toolbar */}
      <div ref={headerRef} className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex gap-2 flex-wrap">
          {FILTER_OPTIONS.map(opt => (
            <button key={opt.value} onClick={() => setFilter(opt.value)}
              className={cn('px-3 py-1.5 border-2 border-neu-black font-display font-bold text-xs uppercase transition-all duration-150', filter === opt.value ? 'bg-neu-black text-neu-white' : 'bg-neu-white text-neu-black hover:bg-neu-bg')}>
              {opt.label}
            </button>
          ))}
        </div>
        <span className="font-mono text-xs text-neu-black/50 ml-auto">
          <strong className="text-neu-black">{filtered.length}</strong> dari <strong className="text-neu-black">{purchases.length}</strong> transaksi
        </span>
      </div>

      {/* Table */}
      <div ref={tableRef} className="border-2 border-neu-black shadow-neu bg-neu-white overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-16 text-center">
            <p className="font-display font-bold text-xl text-neu-black/40">Belum ada transaksi pembelian.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-neu-black text-neu-white">
                  {['No', 'Software', 'Client', 'Total', 'Bukti', 'Status', 'Tanggal', 'Aksi'].map((h, i) => (
                    <th key={h} className={cn('px-4 py-3 font-display font-bold text-xs uppercase tracking-wide text-left', i < 7 && 'border-r-2 border-neu-white/20')}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, idx) => {
                  const cfg = STATUS_CONFIG[p.paymentStatus] ?? { label: p.paymentStatus, bg: 'bg-neu-black/10', text: 'text-neu-black' };
                  return (
                    <tr key={p.id} className="border-b-2 border-neu-black bg-neu-white hover:bg-neu-bg transition-colors">
                      <td className="px-4 py-3 border-r-2 border-neu-black font-mono text-xs text-neu-black/50 text-center w-10">{idx + 1}</td>
                      <td className="px-4 py-3 border-r-2 border-neu-black">
                        <p className="font-display font-bold text-sm text-neu-black">{p.softwareName}</p>
                        <p className="font-mono text-xs text-neu-black/40">{fmt(p.softwarePrice)} × {p.quantity}</p>
                      </td>
                      <td className="px-4 py-3 border-r-2 border-neu-black">
                        <p className="font-body text-sm text-neu-black font-bold">{p.clientName ?? '—'}</p>
                        <p className="font-mono text-xs text-neu-black/40">{p.clientEmail ?? ''}</p>
                      </td>
                      <td className="px-4 py-3 border-r-2 border-neu-black font-display font-bold text-sm text-neu-black whitespace-nowrap">
                        {fmt(p.totalPrice)}
                      </td>
                      <td className="px-4 py-3 border-r-2 border-neu-black w-20">
                        {p.receiptImageUrl ? (
                          <button onClick={() => setReceiptModal({ url: p.receiptImageUrl, name: `Bukti — ${p.softwareName}` })}
                            className="w-14 h-10 border-2 border-neu-black overflow-hidden hover:border-neu-primary hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-neu-sm transition-all duration-150">
                            <img src={p.receiptImageUrl} alt="bukti" className="w-full h-full object-cover" />
                          </button>
                        ) : (
                          <span className="font-mono text-xs text-neu-black/30">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 border-r-2 border-neu-black">
                        <span className={cn('inline-block px-2 py-0.5 border-2 border-neu-black font-mono font-bold text-xs uppercase', cfg.bg, cfg.text)}>
                          {cfg.label}
                        </span>
                        {p.paymentStatus === 'rejected' && p.notes && (
                          <p className="font-body text-xs text-neu-accent mt-1 max-w-[120px]">{p.notes}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 border-r-2 border-neu-black font-mono text-xs text-neu-black/50 whitespace-nowrap">
                        {new Date(p.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3">
                        {p.paymentStatus === 'pending_verification' && (
                          <div className="flex gap-2">
                            <button onClick={() => setVerifyTarget(p)}
                              className="px-2.5 py-1 bg-neu-green border-2 border-neu-black font-display font-bold text-[10px] uppercase text-neu-white shadow-neu-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-150">
                              Verifikasi
                            </button>
                            <button onClick={() => setRejectTarget(p)}
                              className="px-2.5 py-1 bg-neu-white border-2 border-neu-black font-display font-bold text-[10px] uppercase text-neu-accent shadow-neu-sm hover:bg-neu-accent hover:text-neu-white hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-150">
                              Tolak
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
