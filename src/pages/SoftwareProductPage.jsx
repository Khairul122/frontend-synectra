import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { cn } from '../utils/cn';
import { authService } from '../services/auth.service';
import { softwareProductService } from '../services/softwareProduct.service';
import { PageLayout } from '../components/layout/PageLayout';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { useAlert } from '../hooks/useAlert';

const fmt = (val) => `Rp ${Number(val).toLocaleString('id-ID')}`;

function SoftwareRow({ product, index, onEdit, onDelete, onToggleActive }) {
  const ref = useRef(null);
  useEffect(() => {
    gsap.from(ref.current, { x: -20, opacity: 0, duration: 0.4, delay: index * 0.04, ease: 'power2.out' });
  }, [index]);

  return (
    <tr ref={ref} className="border-b-2 border-neu-black bg-neu-white hover:bg-neu-bg transition-colors duration-150">
      <td className="px-4 py-3 border-r-2 border-neu-black font-mono text-xs text-neu-black/50 text-center w-10">
        {index + 1}
      </td>

      {/* Thumbnail */}
      <td className="px-4 py-3 border-r-2 border-neu-black w-20">
        <div className="w-14 h-10 border-2 border-neu-black bg-neu-bg overflow-hidden flex items-center justify-center">
          {product.thumbnailUrl ? (
            <img src={product.thumbnailUrl} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <svg className="w-5 h-5 text-neu-black/20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <rect x="2" y="3" width="20" height="14" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          )}
        </div>
      </td>

      {/* Nama & Kategori */}
      <td className="px-4 py-3 border-r-2 border-neu-black">
        <p className="font-display font-bold text-sm text-neu-black">{product.name}</p>
        {product.category && (
          <span className="font-mono text-[10px] text-neu-black/40 uppercase">{product.category}</span>
        )}
      </td>

      {/* Harga */}
      <td className="px-4 py-3 border-r-2 border-neu-black font-display font-bold text-sm text-neu-black whitespace-nowrap">
        {fmt(product.price)}
      </td>

      {/* Demo URL */}
      <td className="px-4 py-3 border-r-2 border-neu-black w-32">
        {product.demoUrl ? (
          <a href={product.demoUrl} target="_blank" rel="noopener noreferrer"
            className="font-mono text-xs text-neu-blue underline hover:no-underline truncate block max-w-[120px]">
            Lihat Demo
          </a>
        ) : (
          <span className="font-mono text-xs text-neu-black/30">—</span>
        )}
      </td>

      {/* Status */}
      <td className="px-4 py-3 border-r-2 border-neu-black text-center w-28">
        <span className={cn(
          'inline-block px-2 py-0.5 border-2 border-neu-black font-mono font-bold text-xs uppercase',
          product.isActive ? 'bg-neu-green text-neu-white' : 'bg-neu-black/10 text-neu-black/50',
        )}>
          {product.isActive ? 'Aktif' : 'Nonaktif'}
        </span>
      </td>

      {/* Aksi */}
      <td className="px-4 py-3 w-52">
        <div className="flex items-center gap-2">
          <button onClick={() => onToggleActive(product)}
            className={cn(
              'px-2.5 py-1 border-2 border-neu-black font-display font-bold text-[10px] uppercase transition-all duration-150 shadow-neu-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none',
              product.isActive ? 'bg-neu-black/10 text-neu-black' : 'bg-neu-green text-neu-white',
            )}>
            {product.isActive ? 'Nonaktifkan' : 'Aktifkan'}
          </button>
          <button onClick={() => onEdit(product.id)}
            className="px-2.5 py-1 border-2 border-neu-black bg-neu-primary font-display font-bold text-[10px] uppercase text-neu-black shadow-neu-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-150">
            Edit
          </button>
          <button onClick={() => onDelete(product)}
            className="px-2.5 py-1 border-2 border-neu-black bg-neu-white font-display font-bold text-[10px] uppercase text-neu-accent shadow-neu-sm hover:bg-neu-accent hover:text-neu-white hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-150">
            Hapus
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function SoftwareProductPage() {
  const navigate = useNavigate();
  const alert    = useAlert();

  const [user,         setUser]         = useState(null);
  const [products,     setProducts]     = useState([]);
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
        return softwareProductService.getAll();
      })
      .then(res => { if (res) setProducts(res.data ?? []); })
      .catch(() => navigate('/login'))
      .finally(() => setIsLoading(false));
  }, [navigate]);

  useEffect(() => {
    if (!isLoading && headerRef.current)
      gsap.from(headerRef.current, { y: -20, opacity: 0, duration: 0.4, ease: 'power2.out' });
    if (!isLoading && tableRef.current)
      gsap.from(tableRef.current, { y: 20, opacity: 0, duration: 0.5, delay: 0.1, ease: 'power2.out' });
  }, [isLoading]);

  const handleToggleActive = async (product) => {
    try {
      await softwareProductService.update(product.id, { isActive: !product.isActive });
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, isActive: !p.isActive } : p));
      alert.success(`Software "${product.name}" berhasil ${!product.isActive ? 'diaktifkan' : 'dinonaktifkan'}.`);
    } catch {
      alert.error('Gagal mengubah status software.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await softwareProductService.remove(deleteTarget.id);
      setProducts(prev => prev.filter(p => p.id !== deleteTarget.id));
      alert.success(`Software "${deleteTarget.name}" berhasil dihapus.`);
      setDeleteTarget(null);
    } catch {
      alert.error('Gagal menghapus software.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = products.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(search.toLowerCase()),
  );

  if (isLoading) return (
    <div className="min-h-screen bg-neu-bg flex items-center justify-center">
      <p className="font-display font-bold text-neu-black animate-pulse">Memuat...</p>
    </div>
  );

  return (
    <PageLayout user={user} title="Manajemen Software" alert={alert}>
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Hapus Software"
        message={`Apakah kamu yakin ingin menghapus software "${deleteTarget?.name}"? Tindakan ini tidak bisa dibatalkan.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isDeleting}
      />

      {/* Header toolbar */}
      <div ref={headerRef} className="flex flex-wrap items-center gap-3 mb-6">
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Cari software..."
          className="flex-1 min-w-48 px-4 py-2.5 bg-neu-white border-2 border-neu-black shadow-neu-sm font-body text-sm text-neu-black placeholder:text-neu-black/30 outline-none focus:shadow-neu transition-all duration-150"
        />
        <span className="font-mono text-xs text-neu-black/50">
          <strong className="text-neu-black">{filtered.length}</strong> dari <strong className="text-neu-black">{products.length}</strong> software
        </span>
        <button onClick={() => navigate('/software-products/new')}
          className="px-5 py-2.5 bg-neu-primary border-2 border-neu-black shadow-neu font-display font-bold text-xs uppercase tracking-wide text-neu-black transition-all duration-150 whitespace-nowrap hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm active:translate-x-1 active:translate-y-1 active:shadow-none">
          + Tambah Software
        </button>
      </div>

      {/* Table */}
      <div ref={tableRef} className="border-2 border-neu-black shadow-neu bg-neu-white overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-16 text-center">
            <p className="font-display font-bold text-xl text-neu-black/40">
              {products.length === 0 ? 'Belum ada software.' : 'Tidak ada hasil pencarian.'}
            </p>
            {products.length === 0 && (
              <button onClick={() => navigate('/software-products/new')}
                className="mt-4 px-5 py-2.5 bg-neu-primary border-2 border-neu-black shadow-neu font-display font-bold text-xs uppercase hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm transition-all duration-150">
                Tambah Software Pertama
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-neu-black text-neu-white">
                  {['No', 'Thumbnail', 'Nama / Kategori', 'Harga', 'Demo', 'Status', 'Aksi'].map((h, i) => (
                    <th key={h} className={cn('px-4 py-3 font-display font-bold text-xs uppercase tracking-wide text-left', i < 6 && 'border-r-2 border-neu-white/20')}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((product, idx) => (
                  <SoftwareRow
                    key={product.id}
                    product={product}
                    index={idx}
                    onEdit={id => navigate(`/software-products/${id}/edit`)}
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
