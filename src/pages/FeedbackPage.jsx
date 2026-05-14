import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { cn } from '../utils/cn';
import { authService } from '../services/auth.service';
import { feedbackService } from '../services/feedback.service';
import { PageLayout } from '../components/layout/PageLayout';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { useAlert } from '../hooks/useAlert';
import { PageLoader } from '../components/ui/PageLoader';

const STARS = [1, 2, 3, 4, 5];

function StarDisplay({ rating }) {
  return (
    <div className="flex gap-0.5">
      {STARS.map(s => (
        <svg key={s} className={cn('w-4 h-4', s <= rating ? 'text-[#FFD000]' : 'text-neu-black/20')} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function EditModal({ feedback, onClose, onSaved }) {
  const alert = useAlert();
  const [form, setForm]       = useState({ name: feedback.name, email: feedback.email, rating: feedback.rating, message: feedback.message ?? '' });
  const [hovered, setHovered] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim() || form.rating === 0) return;
    setIsSaving(true);
    try {
      await feedbackService.update(feedback.id, { ...form, message: form.message || undefined });
      onSaved();
      onClose();
    } catch { alert.error('Gagal menyimpan.'); }
    finally { setIsSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neu-black/70"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-md bg-neu-white border-2 border-neu-black shadow-neu-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b-2 border-neu-black bg-neu-black">
          <h3 className="font-display font-bold text-sm text-neu-white uppercase">Edit Feedback</h3>
          <button onClick={onClose} className="text-neu-white/60 hover:text-neu-white font-mono text-2xl leading-none">×</button>
        </div>
        <div className="px-5 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="font-display font-bold text-xs text-neu-black uppercase">Nama *</label>
              <input type="text" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))}
                className="w-full px-3 py-2 bg-neu-white border-2 border-neu-black shadow-neu-sm font-body text-sm text-neu-black outline-none focus:shadow-neu transition-all duration-150" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-display font-bold text-xs text-neu-black uppercase">Email *</label>
              <input type="email" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))}
                className="w-full px-3 py-2 bg-neu-white border-2 border-neu-black shadow-neu-sm font-body text-sm text-neu-black outline-none focus:shadow-neu transition-all duration-150" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-display font-bold text-xs text-neu-black uppercase">Rating *</label>
            <div className="flex gap-1">
              {STARS.map(s => (
                <button key={s} type="button"
                  onMouseEnter={() => setHovered(s)} onMouseLeave={() => setHovered(0)}
                  onClick={() => setForm(p => ({...p, rating: s}))}
                  className="w-9 h-9 flex items-center justify-center transition-transform hover:scale-110">
                  <svg className={cn('w-7 h-7', (hovered || form.rating) >= s ? 'text-[#FFD000]' : 'text-neu-black/20')} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-display font-bold text-xs text-neu-black uppercase">Komentar</label>
            <textarea value={form.message} onChange={e => setForm(p => ({...p, message: e.target.value}))} rows={3}
              className="w-full px-3 py-2 bg-neu-white border-2 border-neu-black shadow-neu-sm font-body text-sm text-neu-black outline-none focus:shadow-neu transition-all duration-150 resize-none" />
          </div>
        </div>
        <div className="px-5 pb-5 flex gap-3">
          <button onClick={handleSubmit} disabled={isSaving || !form.name.trim() || !form.email.trim() || form.rating === 0}
            className={cn('flex-1 py-2.5 bg-neu-primary border-2 border-neu-black shadow-neu font-display font-bold text-sm uppercase text-neu-black transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm', (isSaving || !form.name.trim()) && 'opacity-50 cursor-not-allowed')}>
            {isSaving ? 'Menyimpan...' : 'Simpan'}
          </button>
          <button onClick={onClose} className="flex-1 py-2.5 bg-neu-white border-2 border-neu-black shadow-neu font-display font-bold text-sm uppercase text-neu-black transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm">
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FeedbackPage() {
  const navigate = useNavigate();
  const alert    = useAlert();

  const [user,         setUser]         = useState(null);
  const [feedbacks,    setFeedbacks]    = useState([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [filterRating, setFilterRating] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting,   setIsDeleting]   = useState(false);
  const [editTarget,   setEditTarget]   = useState(null);

  const headerRef = useRef(null);
  const tableRef  = useRef(null);

  const loadData = async () => {
    const res = await feedbackService.getAll();
    setFeedbacks(res.data ?? []);
  };

  useEffect(() => {
    authService.getMe()
      .then(res => {
        const u = res.data;
        if (u.role !== 'admin') { navigate('/dashboard'); return; }
        setUser(u);
        return loadData().catch(() => alert.error('Gagal memuat data.'));
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

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await feedbackService.remove(deleteTarget.id);
      setFeedbacks(prev => prev.filter(f => f.id !== deleteTarget.id));
      alert.success(`Feedback dari "${deleteTarget.name}" berhasil dihapus.`);
      setDeleteTarget(null);
    } catch { alert.error('Gagal menghapus feedback.'); }
    finally { setIsDeleting(false); }
  };

  const filtered = filterRating ? feedbacks.filter(f => f.rating === filterRating) : feedbacks;

  const avg = feedbacks.length
    ? (feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1)
    : '—';

  const fmtDate = (v) => new Date(v).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

  if (isLoading) return <PageLoader />;

  return (
    <PageLayout user={user} title="Feedback & Rating" alert={alert}>
      {editTarget && (
        <EditModal feedback={editTarget} onClose={() => setEditTarget(null)} onSaved={() => { loadData(); alert.success('Feedback berhasil diperbarui.'); }} />
      )}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Hapus Feedback"
        message={`Hapus feedback dari "${deleteTarget?.name}"? Tindakan ini tidak bisa dibatalkan.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isDeleting}
      />

      {/* Stats + filter */}
      <div ref={headerRef} className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex gap-2 flex-wrap">
          {[0, 5, 4, 3, 2, 1].map(r => (
            <button key={r} onClick={() => setFilterRating(r)}
              className={cn('px-3 py-1.5 border-2 border-neu-black font-display font-bold text-xs uppercase transition-all duration-150',
                filterRating === r ? 'bg-neu-black text-neu-white' : 'bg-neu-white text-neu-black hover:bg-neu-bg')}>
              {r === 0 ? 'Semua' : `${r}★`}
            </button>
          ))}
        </div>
        <span className="font-mono text-xs text-neu-black/50 ml-auto">
          <strong className="text-neu-black">{filtered.length}</strong> feedback · Avg: <strong className="text-neu-black">{avg}★</strong>
        </span>
      </div>

      {/* Table */}
      <div ref={tableRef} className="border-2 border-neu-black shadow-neu bg-neu-white overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-16 text-center">
            <p className="font-display font-bold text-xl text-neu-black/40">Belum ada feedback.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-neu-black text-neu-white">
                  {['No', 'Nama', 'Email', 'Rating', 'Komentar', 'Tanggal', 'Aksi'].map((h, i) => (
                    <th key={h} className={cn('px-4 py-3 font-display font-bold text-xs uppercase tracking-wide text-left', i < 6 && 'border-r-2 border-neu-white/20')}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((fb, idx) => (
                  <tr key={fb.id} className="border-b-2 border-neu-black bg-neu-white hover:bg-neu-bg transition-colors">
                    <td className="px-4 py-3 border-r-2 border-neu-black font-mono text-xs text-neu-black/50 text-center w-10">{idx + 1}</td>
                    <td className="px-4 py-3 border-r-2 border-neu-black font-display font-bold text-sm text-neu-black">{fb.name}</td>
                    <td className="px-4 py-3 border-r-2 border-neu-black font-mono text-xs text-neu-black/60">{fb.email}</td>
                    <td className="px-4 py-3 border-r-2 border-neu-black"><StarDisplay rating={fb.rating} /></td>
                    <td className="px-4 py-3 border-r-2 border-neu-black max-w-xs">
                      {fb.message
                        ? <p className="font-body text-sm text-neu-black/70 line-clamp-2">{fb.message}</p>
                        : <span className="font-mono text-xs text-neu-black/30">—</span>}
                    </td>
                    <td className="px-4 py-3 border-r-2 border-neu-black font-mono text-xs text-neu-black/50 whitespace-nowrap">{fmtDate(fb.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => setEditTarget(fb)}
                          className="px-2.5 py-1 bg-neu-primary border-2 border-neu-black font-display font-bold text-[10px] uppercase text-neu-black shadow-neu-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-150">
                          Edit
                        </button>
                        <button onClick={() => setDeleteTarget(fb)}
                          className="px-2.5 py-1 bg-neu-white border-2 border-neu-black font-display font-bold text-[10px] uppercase text-neu-accent shadow-neu-sm hover:bg-neu-accent hover:text-neu-white hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-150">
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
