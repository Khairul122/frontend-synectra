import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';
import { cn } from '../utils/cn';
import { authService } from '../services/auth.service';
import { socialMediaService } from '../services/socialMedia.service';
import { Sidebar } from '../components/layout/Sidebar';
import { Navbar } from '../components/layout/Navbar';
import { AlertContainer } from '../components/ui/Alert';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { useAlert } from '../hooks/useAlert';

/* ─── Icon Preview Modal ─────────────────────────────────────────────────── */
function IconPreviewModal({ item, onClose }) {
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neu-black/70"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
      <div ref={cardRef} className="w-full max-w-sm bg-neu-white border-2 border-neu-black shadow-neu-xl">
        <div className="flex items-center justify-between px-5 py-3 border-b-2 border-neu-black bg-neu-black">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-neu-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            <h3 className="font-display font-bold text-sm text-neu-white uppercase tracking-wide">{item.platformName}</h3>
          </div>
          <button onClick={handleClose} className="text-neu-white/60 hover:text-neu-white font-mono text-2xl leading-none">×</button>
        </div>
        <div className="bg-neu-bg border-b-2 border-neu-black flex items-center justify-center p-10">
          <img src={item.icon} alt={item.platformName} className="max-h-32 max-w-full object-contain" />
        </div>
        <div className="px-5 py-4 flex items-center justify-between">
          <div>
            <p className="font-display font-bold text-sm text-neu-black">{item.platformName}</p>
            <p className="font-mono text-xs text-neu-black/50">{item.accountName}</p>
          </div>
          <button onClick={handleClose} className={cn(
            'px-4 py-2 bg-neu-white border-2 border-neu-black shadow-neu',
            'font-display font-bold text-xs uppercase tracking-wide text-neu-black',
            'transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm',
          )}>Tutup</button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ─── Table Row ──────────────────────────────────────────────────────────── */
function SocialMediaRow({ item, index, onEdit, onDelete, onToggleActive, onPreview }) {
  const ref = useRef(null);
  useEffect(() => {
    gsap.from(ref.current, { x: -20, opacity: 0, duration: 0.4, delay: index * 0.04, ease: 'power2.out' });
  }, [index]);

  return (
    <tr ref={ref} className="border-b-2 border-neu-black bg-neu-white hover:bg-neu-bg transition-colors duration-150">
      {/* No */}
      <td className="px-4 py-3 border-r-2 border-neu-black font-mono text-xs text-neu-black/50 text-center w-10">
        {index + 1}
      </td>

      {/* Icon */}
      <td className="px-4 py-3 border-r-2 border-neu-black w-20">
        <div
          onClick={() => item.icon && onPreview(item)}
          className={cn(
            'w-10 h-10 border-2 border-neu-black bg-neu-bg flex items-center justify-center overflow-hidden transition-all duration-150',
            item.icon && 'cursor-pointer hover:border-neu-primary hover:shadow-neu-sm hover:translate-x-[-1px] hover:translate-y-[-1px]',
          )}
          title={item.icon ? 'Klik untuk memperbesar' : undefined}
        >
          {item.icon ? (
            <img src={item.icon} alt={item.platformName} className="w-full h-full object-contain p-1"
              onError={e => { e.target.style.display = 'none'; }} />
          ) : (
            <span className="font-display font-bold text-sm text-neu-black/20">
              {item.platformName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
      </td>

      {/* Platform */}
      <td className="px-4 py-3 border-r-2 border-neu-black w-36">
        <p className="font-display font-bold text-sm text-neu-black">{item.platformName}</p>
      </td>

      {/* Account Name */}
      <td className="px-4 py-3 border-r-2 border-neu-black w-40">
        <p className="font-mono text-sm text-neu-black">{item.accountName}</p>
      </td>

      {/* URL */}
      <td className="px-4 py-3 border-r-2 border-neu-black">
        <a href={item.url} target="_blank" rel="noopener noreferrer"
          className="font-body text-xs text-neu-blue underline truncate block max-w-48 hover:text-neu-black transition-colors">
          {item.url}
        </a>
      </td>

      {/* Status */}
      <td className="px-4 py-3 border-r-2 border-neu-black text-center w-28">
        <span className={cn(
          'inline-block px-2 py-0.5 border-2 border-neu-black font-mono font-bold text-xs uppercase',
          item.isActive ? 'bg-neu-green text-neu-white' : 'bg-neu-black/10 text-neu-black/50',
        )}>
          {item.isActive ? 'Aktif' : 'Nonaktif'}
        </span>
      </td>

      {/* Aksi */}
      <td className="px-4 py-3 w-52">
        <div className="flex items-center gap-2">
          <button onClick={() => onToggleActive(item)}
            className={cn(
              'px-2.5 py-1 border-2 border-neu-black font-display font-bold text-[10px] uppercase tracking-wide transition-all duration-150',
              'shadow-neu-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none',
              item.isActive ? 'bg-neu-black/10 text-neu-black' : 'bg-neu-green text-neu-white',
            )}>
            {item.isActive ? 'Nonaktifkan' : 'Aktifkan'}
          </button>
          <button onClick={() => onEdit(item.id)}
            className="px-2.5 py-1 border-2 border-neu-black bg-neu-primary font-display font-bold text-[10px] uppercase tracking-wide text-neu-black shadow-neu-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-150">
            Edit
          </button>
          <button onClick={() => onDelete(item)}
            className="px-2.5 py-1 border-2 border-neu-black bg-neu-white font-display font-bold text-[10px] uppercase tracking-wide text-neu-accent shadow-neu-sm hover:bg-neu-accent hover:text-neu-white hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-150">
            Hapus
          </button>
        </div>
      </td>
    </tr>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */
export default function SocialMediaPage() {
  const navigate = useNavigate();
  const alert    = useAlert();

  const [user,         setUser]         = useState(null);
  const [items,        setItems]        = useState([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [search,       setSearch]       = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting,   setIsDeleting]   = useState(false);
  const [previewItem,  setPreviewItem]  = useState(null);

  const headerRef = useRef(null);
  const tableRef  = useRef(null);

  useEffect(() => {
    authService.getMe()
      .then(res => {
        const u = res.data;
        if (u.role !== 'admin') { navigate('/dashboard'); return; }
        setUser(u);
        return socialMediaService.getAll();
      })
      .then(res => { if (res) setItems(res.data ?? []); })
      .catch(() => navigate('/login'))
      .finally(() => setIsLoading(false));
  }, [navigate]);

  useEffect(() => {
    if (!isLoading) {
      if (headerRef.current) gsap.from(headerRef.current, { y: -20, opacity: 0, duration: 0.4, ease: 'power2.out' });
      if (tableRef.current)  gsap.from(tableRef.current,  { y: 20,  opacity: 0, duration: 0.5, delay: 0.1, ease: 'power2.out' });
    }
  }, [isLoading]);

  const handleToggleActive = async (item) => {
    try {
      await socialMediaService.update(item.id, { isActive: !item.isActive });
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, isActive: !i.isActive } : i));
      alert.success(`${item.platformName} berhasil ${!item.isActive ? 'diaktifkan' : 'dinonaktifkan'}.`);
    } catch {
      alert.error('Gagal mengubah status.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await socialMediaService.remove(deleteTarget.id);
      setItems(prev => prev.filter(i => i.id !== deleteTarget.id));
      alert.success(`${deleteTarget.platformName} berhasil dihapus.`);
      setDeleteTarget(null);
    } catch {
      alert.error('Gagal menghapus sosial media.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = items.filter(i =>
    !search ||
    i.platformName.toLowerCase().includes(search.toLowerCase()) ||
    i.accountName.toLowerCase().includes(search.toLowerCase()),
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neu-bg flex items-center justify-center">
        <p className="font-display font-bold text-neu-black animate-pulse">Memuat...</p>
      </div>
    );
  }

  return (
    <>
      <AlertContainer alerts={alert.alerts} onDismiss={alert.dismiss} />
      {previewItem && <IconPreviewModal item={previewItem} onClose={() => setPreviewItem(null)} />}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Hapus Sosial Media"
        message={`Apakah kamu yakin ingin menghapus "${deleteTarget?.platformName}"? Tindakan ini tidak bisa dibatalkan.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isDeleting}
      />

      <div className="flex min-h-screen bg-neu-bg">
        <Sidebar user={user} />

        <div className="flex-1 ml-64 flex flex-col">
          <Navbar title="Social Media Management" user={user} />

          <main className="flex-1 p-6 overflow-y-auto">
            {/* Toolbar */}
            <div ref={headerRef} className="flex flex-wrap items-center gap-3 mb-6">
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Cari platform atau akun..."
                className="flex-1 min-w-48 px-4 py-2.5 bg-neu-white border-2 border-neu-black shadow-neu-sm font-body text-sm text-neu-black placeholder:text-neu-black/30 outline-none focus:shadow-neu transition-all duration-150"
              />
              <span className="font-mono text-xs text-neu-black/50">
                Menampilkan <strong className="text-neu-black">{filtered.length}</strong> dari <strong className="text-neu-black">{items.length}</strong> akun
              </span>
              <button onClick={() => navigate('/social-media/new')}
                className={cn(
                  'px-5 py-2.5 bg-neu-primary border-2 border-neu-black shadow-neu',
                  'font-display font-bold text-xs uppercase tracking-wide text-neu-black whitespace-nowrap',
                  'transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm active:translate-x-1 active:translate-y-1 active:shadow-none',
                )}>
                + Tambah Sosial Media
              </button>
            </div>

            {/* Table */}
            <div ref={tableRef} className="border-2 border-neu-black shadow-neu bg-neu-white overflow-hidden">
              {filtered.length === 0 ? (
                <div className="p-16 text-center">
                  <p className="font-display font-bold text-xl text-neu-black/40">
                    {items.length === 0 ? 'Belum ada sosial media.' : 'Tidak ada hasil pencarian.'}
                  </p>
                  {items.length === 0 && (
                    <button onClick={() => navigate('/social-media/new')}
                      className="mt-4 px-5 py-2.5 bg-neu-primary border-2 border-neu-black shadow-neu font-display font-bold text-xs uppercase hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm transition-all duration-150">
                      Tambah Pertama
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-neu-black text-neu-white">
                        <th className="px-4 py-3 border-r-2 border-neu-white/20 font-display font-bold text-xs uppercase tracking-wide text-center w-10">No</th>
                        <th className="px-4 py-3 border-r-2 border-neu-white/20 font-display font-bold text-xs uppercase tracking-wide text-left w-20">Icon</th>
                        <th className="px-4 py-3 border-r-2 border-neu-white/20 font-display font-bold text-xs uppercase tracking-wide text-left w-36">Platform</th>
                        <th className="px-4 py-3 border-r-2 border-neu-white/20 font-display font-bold text-xs uppercase tracking-wide text-left w-40">Akun</th>
                        <th className="px-4 py-3 border-r-2 border-neu-white/20 font-display font-bold text-xs uppercase tracking-wide text-left">URL</th>
                        <th className="px-4 py-3 border-r-2 border-neu-white/20 font-display font-bold text-xs uppercase tracking-wide text-center w-28">Status</th>
                        <th className="px-4 py-3 font-display font-bold text-xs uppercase tracking-wide text-left w-52">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((item, idx) => (
                        <SocialMediaRow
                          key={item.id}
                          item={item}
                          index={idx}
                          onEdit={id => navigate(`/social-media/${id}/edit`)}
                          onDelete={setDeleteTarget}
                          onToggleActive={handleToggleActive}
                          onPreview={setPreviewItem}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
