import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { gsap } from 'gsap';
import { cn } from '../utils/cn';
import { authService } from '../services/auth.service';
import { contactService } from '../services/contact.service';
import { getPlatform } from '../constants/platforms';
import { PageLayout } from '../components/layout/PageLayout';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { useAlert } from '../hooks/useAlert';
import { PageLoader } from '../components/ui/PageLoader';

/* ─── Table Row ──────────────────────────────────────────────────────────── */
function ContactRow({ item, index, onEdit, onDelete, onToggleActive }) {
  const ref = useRef(null);
  const platform = getPlatform(item.icon);
  const { Icon, color } = platform;

  useEffect(() => {
    gsap.from(ref.current, { x: -20, opacity: 0, duration: 0.4, delay: index * 0.04, ease: 'power2.out' });
  }, [index]);

  return (
    <tr ref={ref} className="border-b-2 border-neu-black bg-neu-white hover:bg-neu-bg transition-colors duration-150">
      {/* No */}
      <td className="px-4 py-3 border-r-2 border-neu-black font-mono text-xs text-neu-black/50 text-center w-10">
        {index + 1}
      </td>

      {/* Platform + Icon */}
      <td className="px-4 py-3 border-r-2 border-neu-black w-44">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 border-2 border-neu-black flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: color + '18' }}>
            <Icon style={{ color }} className="w-5 h-5" />
          </div>
          <span className="font-display font-bold text-sm text-neu-black">{item.platform}</span>
        </div>
      </td>

      {/* Nama */}
      <td className="px-4 py-3 border-r-2 border-neu-black w-40">
        <p className="font-display font-bold text-sm text-neu-black">{item.nama}</p>
      </td>

      {/* Contact Info */}
      <td className="px-4 py-3 border-r-2 border-neu-black">
        <p className="font-mono text-sm text-neu-black">{item.contactInfo}</p>
      </td>

      {/* Link URL */}
      <td className="px-4 py-3 border-r-2 border-neu-black">
        <a href={item.linkUrl} target="_blank" rel="noopener noreferrer"
          className="font-body text-xs text-neu-blue underline truncate block max-w-52 hover:text-neu-black transition-colors">
          {item.linkUrl}
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
export default function ContactPage() {
  const navigate = useNavigate();
  const { t }    = useTranslation();
  const alert    = useAlert();

  const [user,         setUser]         = useState(null);
  const [items,        setItems]        = useState([]);
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
        return contactService.getAll();
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
      await contactService.update(item.id, { isActive: !item.isActive });
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, isActive: !i.isActive } : i));
      alert.success(`${item.platform} berhasil ${!item.isActive ? 'diaktifkan' : 'dinonaktifkan'}.`);
    } catch {
      alert.error('Gagal mengubah status.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await contactService.remove(deleteTarget.id);
      setItems(prev => prev.filter(i => i.id !== deleteTarget.id));
      alert.success(`${deleteTarget.platform} berhasil dihapus.`);
      setDeleteTarget(null);
    } catch {
      alert.error('Gagal menghapus kontak.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = items.filter(i =>
    !search ||
    i.platform.toLowerCase().includes(search.toLowerCase()) ||
    i.contactInfo.toLowerCase().includes(search.toLowerCase()),
  );

  if (isLoading) return <PageLoader />;

  return (
    <PageLayout user={user} title="Contact Management" alert={alert}>
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Hapus Kontak"
        message={`Apakah kamu yakin ingin menghapus kontak "${deleteTarget?.platform}"? Tindakan ini tidak bisa dibatalkan.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isDeleting}
      />

      {/* Toolbar */}
      <div ref={headerRef} className="flex flex-wrap items-center gap-3 mb-6">
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Cari platform atau info kontak..."
          className="flex-1 min-w-48 px-4 py-2.5 bg-neu-white border-2 border-neu-black shadow-neu-sm font-body text-sm text-neu-black placeholder:text-neu-black/30 outline-none focus:shadow-neu transition-all duration-150"
        />
        <span className="font-mono text-xs text-neu-black/50">
          <strong className="text-neu-black">{filtered.length}</strong> / <strong className="text-neu-black">{items.length}</strong> kontak
        </span>
        <button onClick={() => navigate('/contacts/new')}
          className={cn(
            'px-5 py-2.5 bg-neu-primary border-2 border-neu-black shadow-neu',
            'font-display font-bold text-xs uppercase tracking-wide text-neu-black whitespace-nowrap',
            'transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm active:translate-x-1 active:translate-y-1 active:shadow-none',
          )}>
          + Tambah Kontak
        </button>
      </div>

      {/* Table */}
      <div ref={tableRef} className="border-2 border-neu-black shadow-neu bg-neu-white overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-16 text-center">
            <p className="font-display font-bold text-xl text-neu-black/40">
              {items.length === 0 ? 'Belum ada kontak.' : 'Tidak ada hasil pencarian.'}
            </p>
            {items.length === 0 && (
              <button onClick={() => navigate('/contacts/new')}
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
                  <th className="px-4 py-3 border-r-2 border-neu-white/20 font-display font-bold text-xs uppercase tracking-wide text-left w-44">Platform</th>
                  <th className="px-4 py-3 border-r-2 border-neu-white/20 font-display font-bold text-xs uppercase tracking-wide text-left w-40">Nama</th>
                  <th className="px-4 py-3 border-r-2 border-neu-white/20 font-display font-bold text-xs uppercase tracking-wide text-left">Info Kontak</th>
                  <th className="px-4 py-3 border-r-2 border-neu-white/20 font-display font-bold text-xs uppercase tracking-wide text-left">Link URL</th>
                  <th className="px-4 py-3 border-r-2 border-neu-white/20 font-display font-bold text-xs uppercase tracking-wide text-center w-28">Status</th>
                  <th className="px-4 py-3 font-display font-bold text-xs uppercase tracking-wide text-left w-52">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, idx) => (
                  <ContactRow
                    key={item.id}
                    item={item}
                    index={idx}
                    onEdit={id => navigate(`/contacts/${id}/edit`)}
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
