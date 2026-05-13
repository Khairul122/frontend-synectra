import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { cn } from '../utils/cn';
import { authService } from '../services/auth.service';
import { servicePackageService } from '../services/servicePackage.service';
import { PageLayout } from '../components/layout/PageLayout';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { useAlert } from '../hooks/useAlert';
import { PageLoader } from '../components/ui/PageLoader';

const fmt = (val) => `Rp ${Number(val).toLocaleString('id-ID')}`;

/* ─── Table row ──────────────────────────────────────────────────────────── */
function PackageRow({ pkg, index, onEdit, onDelete, onToggleActive }) {
  const ref = useRef(null);
  useEffect(() => {
    gsap.from(ref.current, { x: -20, opacity: 0, duration: 0.4, delay: index * 0.04, ease: 'power2.out' });
  }, [index]);

  return (
    <tr ref={ref} className="border-b-2 border-neu-black bg-neu-white hover:bg-neu-bg transition-colors duration-150">
      <td className="px-4 py-3 border-r-2 border-neu-black font-mono text-xs text-neu-black/50 text-center w-10">
        {index + 1}
      </td>

      {/* Icon */}
      <td className="px-4 py-3 border-r-2 border-neu-black w-16">
        <div className="w-12 h-12 border-2 border-neu-black bg-neu-bg overflow-hidden flex items-center justify-center">
          {pkg.iconUrl ? (
            <img src={pkg.iconUrl} alt={pkg.name} className="w-full h-full object-cover" />
          ) : (
            <span className="font-display font-bold text-lg text-neu-black/20">{pkg.name?.charAt(0)}</span>
          )}
        </div>
      </td>

      {/* Nama & Kategori */}
      <td className="px-4 py-3 border-r-2 border-neu-black">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-display font-bold text-sm text-neu-black">{pkg.name}</p>
          {pkg.badge && (
            <span className="px-2 py-0.5 bg-neu-primary border border-neu-black font-mono font-bold text-[10px] uppercase">
              {pkg.badge}
            </span>
          )}
        </div>
        {pkg.category && (
          <p className="font-mono text-xs text-neu-black/40 mt-0.5 uppercase">{pkg.category}</p>
        )}
      </td>

      {/* Harga */}
      <td className="px-4 py-3 border-r-2 border-neu-black font-display font-bold text-sm text-neu-black whitespace-nowrap">
        {fmt(pkg.price)}
      </td>

      {/* Durasi */}
      <td className="px-4 py-3 border-r-2 border-neu-black font-body text-xs text-neu-black/70 whitespace-nowrap">
        {pkg.duration || '—'}
      </td>

      {/* Status */}
      <td className="px-4 py-3 border-r-2 border-neu-black text-center w-28">
        <span className={cn(
          'inline-block px-2 py-0.5 border-2 border-neu-black font-mono font-bold text-xs uppercase',
          pkg.isActive ? 'bg-neu-green text-neu-white' : 'bg-neu-black/10 text-neu-black/50',
        )}>
          {pkg.isActive ? 'Aktif' : 'Nonaktif'}
        </span>
      </td>

      {/* Aksi */}
      <td className="px-4 py-3 w-52">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleActive(pkg)}
            className={cn(
              'px-2.5 py-1 border-2 border-neu-black font-display font-bold text-[10px] uppercase tracking-wide transition-all duration-150',
              'shadow-neu-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none',
              pkg.isActive ? 'bg-neu-black/10 text-neu-black' : 'bg-neu-green text-neu-white',
            )}
          >
            {pkg.isActive ? 'Nonaktifkan' : 'Aktifkan'}
          </button>
          <button
            onClick={() => onEdit(pkg.id)}
            className="px-2.5 py-1 border-2 border-neu-black bg-neu-primary font-display font-bold text-[10px] uppercase tracking-wide text-neu-black shadow-neu-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-150"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(pkg)}
            className="px-2.5 py-1 border-2 border-neu-black bg-neu-white font-display font-bold text-[10px] uppercase tracking-wide text-neu-accent shadow-neu-sm hover:bg-neu-accent hover:text-neu-white hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-150"
          >
            Hapus
          </button>
        </div>
      </td>
    </tr>
  );
}

/* ─── Main page ──────────────────────────────────────────────────────────── */
export default function ServicePackagePage() {
  const navigate = useNavigate();
  const alert    = useAlert();

  const [user,         setUser]         = useState(null);
  const [packages,     setPackages]     = useState([]);
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
        return servicePackageService.getAll();
      })
      .then(res => { if (res) setPackages(res.data ?? []); })
      .catch(() => navigate('/login'))
      .finally(() => setIsLoading(false));
  }, [navigate]);

  useEffect(() => {
    if (!isLoading && headerRef.current)
      gsap.from(headerRef.current, { y: -20, opacity: 0, duration: 0.4, ease: 'power2.out' });
    if (!isLoading && tableRef.current)
      gsap.from(tableRef.current, { y: 20, opacity: 0, duration: 0.5, delay: 0.1, ease: 'power2.out' });
  }, [isLoading]);

  const handleToggleActive = async (pkg) => {
    try {
      await servicePackageService.update(pkg.id, { isActive: !pkg.isActive });
      setPackages(prev => prev.map(p => p.id === pkg.id ? { ...p, isActive: !p.isActive } : p));
      alert.success(`Paket "${pkg.name}" berhasil ${!pkg.isActive ? 'diaktifkan' : 'dinonaktifkan'}.`);
    } catch {
      alert.error('Gagal mengubah status paket.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await servicePackageService.remove(deleteTarget.id);
      setPackages(prev => prev.filter(p => p.id !== deleteTarget.id));
      alert.success(`Paket "${deleteTarget.name}" berhasil dihapus.`);
      setDeleteTarget(null);
    } catch {
      alert.error('Gagal menghapus paket.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = packages.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(search.toLowerCase()),
  );

  if (isLoading) return <PageLoader />;

  return (
    <PageLayout user={user} title="Paket Layanan" alert={alert}>
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Hapus Paket Layanan"
        message={`Apakah kamu yakin ingin menghapus paket "${deleteTarget?.name}"? Tindakan ini tidak bisa dibatalkan.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isDeleting}
      />

      {/* Header toolbar */}
      <div ref={headerRef} className="flex flex-wrap items-center gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari paket layanan..."
          className="flex-1 min-w-48 px-4 py-2.5 bg-neu-white border-2 border-neu-black shadow-neu-sm font-body text-sm text-neu-black placeholder:text-neu-black/30 outline-none focus:shadow-neu transition-all duration-150"
        />
        <span className="font-mono text-xs text-neu-black/50">
          Menampilkan <strong className="text-neu-black">{filtered.length}</strong> dari{' '}
          <strong className="text-neu-black">{packages.length}</strong> paket
        </span>
        <button
          onClick={() => navigate('/service-packages/new')}
          className="px-5 py-2.5 bg-neu-primary border-2 border-neu-black shadow-neu font-display font-bold text-xs uppercase tracking-wide text-neu-black transition-all duration-150 whitespace-nowrap hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm active:translate-x-1 active:translate-y-1 active:shadow-none"
        >
          + Tambah Paket
        </button>
      </div>

      {/* Table */}
      <div ref={tableRef} className="border-2 border-neu-black shadow-neu bg-neu-white overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-16 text-center">
            <p className="font-display font-bold text-xl text-neu-black/40">
              {packages.length === 0 ? 'Belum ada paket layanan.' : 'Tidak ada hasil pencarian.'}
            </p>
            {packages.length === 0 && (
              <button
                onClick={() => navigate('/service-packages/new')}
                className="mt-4 px-5 py-2.5 bg-neu-primary border-2 border-neu-black shadow-neu font-display font-bold text-xs uppercase hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm transition-all duration-150"
              >
                Tambah Paket Pertama
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-neu-black text-neu-white">
                  {['No', 'Icon', 'Nama Paket', 'Harga', 'Durasi', 'Status', 'Aksi'].map((h, i) => (
                    <th key={h} className={cn(
                      'px-4 py-3 font-display font-bold text-xs uppercase tracking-wide text-left',
                      i < 6 && 'border-r-2 border-neu-white/20',
                    )}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((pkg, idx) => (
                  <PackageRow
                    key={pkg.id}
                    pkg={pkg}
                    index={idx}
                    onEdit={id => navigate(`/service-packages/${id}/edit`)}
                    onDelete={setDeleteTarget}
                    onToggleActive={handleToggleActive}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
