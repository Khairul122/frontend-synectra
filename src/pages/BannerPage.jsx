import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { cn } from '../utils/cn';
import { authService } from '../services/auth.service';
import { bannerService } from '../services/banner.service';
import { Sidebar } from '../components/layout/Sidebar';
import { Navbar } from '../components/layout/Navbar';
import { AlertContainer } from '../components/ui/Alert';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { useAlert } from '../hooks/useAlert';

const stripHtml = (html) => html?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() ?? '';

/* ─── Table row ──────────────────────────────────────────────────────────── */
function BannerRow({ banner, index, onEdit, onDelete, onToggleActive }) {
  const ref = useRef(null);

  useEffect(() => {
    gsap.from(ref.current, { x: -20, opacity: 0, duration: 0.4, delay: index * 0.04, ease: 'power2.out' });
  }, [index]);

  return (
    <tr
      ref={ref}
      className="border-b-2 border-neu-black bg-neu-white hover:bg-neu-bg transition-colors duration-150"
    >
      {/* No */}
      <td className="px-4 py-3 border-r-2 border-neu-black font-mono text-xs text-neu-black/50 text-center w-10">
        {index + 1}
      </td>

      {/* Gambar */}
      <td className="px-4 py-3 border-r-2 border-neu-black w-20">
        <div className="w-14 h-10 border-2 border-neu-black overflow-hidden bg-neu-bg flex-shrink-0">
          {banner.image ? (
            <img
              src={banner.image}
              alt={banner.title}
              className="w-full h-full object-cover"
              onError={e => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="font-display font-bold text-base text-neu-black/20">
                {banner.title.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </td>

      {/* Judul & Deskripsi */}
      <td className="px-4 py-3 border-r-2 border-neu-black">
        <p className="font-display font-bold text-sm text-neu-black leading-tight">{banner.title}</p>
        {banner.description && (
          <p className="font-body text-xs text-neu-black/50 mt-0.5 line-clamp-1">
            {stripHtml(banner.description)}
          </p>
        )}
      </td>

      {/* Status */}
      <td className="px-4 py-3 border-r-2 border-neu-black text-center w-28">
        <span className={cn(
          'inline-block px-2 py-0.5 border-2 border-neu-black font-mono font-bold text-xs uppercase',
          banner.isActive ? 'bg-neu-green text-neu-white' : 'bg-neu-black/10 text-neu-black/50',
        )}>
          {banner.isActive ? 'Aktif' : 'Nonaktif'}
        </span>
      </td>

      {/* Tanggal */}
      <td className="px-4 py-3 border-r-2 border-neu-black font-mono text-xs text-neu-black/50 w-36 whitespace-nowrap">
        {new Date(banner.createdAt).toLocaleDateString('id-ID', {
          day:   'numeric',
          month: 'short',
          year:  'numeric',
        })}
      </td>

      {/* Aksi */}
      <td className="px-4 py-3 w-48">
        <div className="flex items-center gap-2">
          {/* Toggle */}
          <button
            onClick={() => onToggleActive(banner)}
            title={banner.isActive ? 'Nonaktifkan' : 'Aktifkan'}
            className={cn(
              'px-2.5 py-1 border-2 border-neu-black font-display font-bold text-[10px] uppercase tracking-wide transition-all duration-150',
              'shadow-neu-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none',
              banner.isActive ? 'bg-neu-black/10 text-neu-black' : 'bg-neu-green text-neu-white',
            )}
          >
            {banner.isActive ? 'Nonaktifkan' : 'Aktifkan'}
          </button>

          {/* Edit */}
          <button
            onClick={() => onEdit(banner.id)}
            className={cn(
              'px-2.5 py-1 border-2 border-neu-black bg-neu-primary font-display font-bold text-[10px] uppercase tracking-wide text-neu-black',
              'shadow-neu-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-150',
            )}
          >
            Edit
          </button>

          {/* Hapus */}
          <button
            onClick={() => onDelete(banner)}
            className={cn(
              'px-2.5 py-1 border-2 border-neu-black bg-neu-white font-display font-bold text-[10px] uppercase tracking-wide text-neu-accent',
              'shadow-neu-sm hover:bg-neu-accent hover:text-neu-white hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-150',
            )}
          >
            Hapus
          </button>
        </div>
      </td>
    </tr>
  );
}

/* ─── Main page ──────────────────────────────────────────────────────────── */
export default function BannerPage() {
  const navigate = useNavigate();
  const alert    = useAlert();

  const [user,         setUser]         = useState(null);
  const [banners,      setBanners]      = useState([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [search,       setSearch]       = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting,   setIsDeleting]   = useState(false);

  const headerRef = useRef(null);
  const tableRef  = useRef(null);

  useEffect(() => {
    authService.getMe()
      .then(res => {
        const u = res.data;
        if (u.role !== 'admin') { navigate('/dashboard'); return; }
        setUser(u);
        return bannerService.getAll();
      })
      .then(res => { if (res) setBanners(res.data ?? []); })
      .catch(() => navigate('/login'))
      .finally(() => setIsLoading(false));
  }, [navigate]);

  useEffect(() => {
    if (!isLoading && headerRef.current) {
      gsap.from(headerRef.current, { y: -20, opacity: 0, duration: 0.4, ease: 'power2.out' });
    }
    if (!isLoading && tableRef.current) {
      gsap.from(tableRef.current, { y: 20, opacity: 0, duration: 0.5, delay: 0.1, ease: 'power2.out' });
    }
  }, [isLoading]);

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  const handleToggleActive = async (banner) => {
    try {
      await bannerService.update(banner.id, { isActive: !banner.isActive });
      setBanners(prev => prev.map(b => b.id === banner.id ? { ...b, isActive: !b.isActive } : b));
      alert.success(`Banner "${banner.title}" berhasil ${!banner.isActive ? 'diaktifkan' : 'dinonaktifkan'}.`);
    } catch {
      alert.error('Gagal mengubah status banner.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await bannerService.remove(deleteTarget.id);
      setBanners(prev => prev.filter(b => b.id !== deleteTarget.id));
      alert.success(`Banner "${deleteTarget.title}" berhasil dihapus.`);
      setDeleteTarget(null);
    } catch {
      alert.error('Gagal menghapus banner.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = banners.filter(b =>
    !search || b.title.toLowerCase().includes(search.toLowerCase()),
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
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Hapus Banner"
        message={`Apakah kamu yakin ingin menghapus banner "${deleteTarget?.title}"? Tindakan ini tidak bisa dibatalkan.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isDeleting}
      />

      <div className="flex min-h-screen bg-neu-bg">
        <Sidebar user={user} onLogout={handleLogout} />

        <div className="flex-1 ml-64 flex flex-col">
          <Navbar title="Banner Management" user={user} />

          <main className="flex-1 p-6 overflow-y-auto">

            {/* Header toolbar */}
            <div ref={headerRef} className="flex flex-wrap items-center gap-3 mb-6">
              {/* Search */}
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari banner..."
                className={cn(
                  'flex-1 min-w-48 px-4 py-2.5 bg-neu-white border-2 border-neu-black shadow-neu-sm',
                  'font-body text-sm text-neu-black placeholder:text-neu-black/30',
                  'outline-none focus:shadow-neu transition-all duration-150',
                )}
              />

              {/* Stats */}
              <span className="font-mono text-xs text-neu-black/50">
                Menampilkan <strong className="text-neu-black">{filtered.length}</strong> dari{' '}
                <strong className="text-neu-black">{banners.length}</strong> banner
              </span>

              {/* Tambah */}
              <button
                onClick={() => navigate('/banners/new')}
                className={cn(
                  'px-5 py-2.5 bg-neu-primary border-2 border-neu-black shadow-neu',
                  'font-display font-bold text-xs uppercase tracking-wide text-neu-black',
                  'transition-all duration-150 whitespace-nowrap',
                  'hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm',
                  'active:translate-x-1 active:translate-y-1 active:shadow-none',
                )}
              >
                + Tambah Banner
              </button>
            </div>

            {/* Table */}
            <div ref={tableRef} className="border-2 border-neu-black shadow-neu bg-neu-white overflow-hidden">
              {filtered.length === 0 ? (
                <div className="p-16 text-center border-t-2 border-neu-black">
                  <p className="font-display font-bold text-xl text-neu-black/40">
                    {banners.length === 0 ? 'Belum ada banner.' : 'Tidak ada hasil pencarian.'}
                  </p>
                  {banners.length === 0 && (
                    <button
                      onClick={() => navigate('/banners/new')}
                      className={cn(
                        'mt-4 px-5 py-2.5 bg-neu-primary border-2 border-neu-black shadow-neu',
                        'font-display font-bold text-xs uppercase hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm transition-all duration-150',
                      )}
                    >
                      Tambah Banner Pertama
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-neu-black text-neu-white">
                        <th className="px-4 py-3 border-r-2 border-neu-white/20 font-display font-bold text-xs uppercase tracking-wide text-center w-10">
                          No
                        </th>
                        <th className="px-4 py-3 border-r-2 border-neu-white/20 font-display font-bold text-xs uppercase tracking-wide text-left w-20">
                          Gambar
                        </th>
                        <th className="px-4 py-3 border-r-2 border-neu-white/20 font-display font-bold text-xs uppercase tracking-wide text-left">
                          Judul
                        </th>
                        <th className="px-4 py-3 border-r-2 border-neu-white/20 font-display font-bold text-xs uppercase tracking-wide text-center w-28">
                          Status
                        </th>
                        <th className="px-4 py-3 border-r-2 border-neu-white/20 font-display font-bold text-xs uppercase tracking-wide text-left w-36">
                          Dibuat
                        </th>
                        <th className="px-4 py-3 font-display font-bold text-xs uppercase tracking-wide text-left w-48">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((banner, idx) => (
                        <BannerRow
                          key={banner.id}
                          banner={banner}
                          index={idx}
                          onEdit={id => navigate(`/banners/${id}/edit`)}
                          onDelete={setDeleteTarget}
                          onToggleActive={handleToggleActive}
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
