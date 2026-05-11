import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { cn } from '../utils/cn';
import { authService } from '../services/auth.service';
import { portfolioService } from '../services/portfolio.service';
import { Sidebar } from '../components/layout/Sidebar';
import { Navbar } from '../components/layout/Navbar';
import { AlertContainer } from '../components/ui/Alert';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { PortfolioDetailModal } from '../components/portfolio/PortfolioDetailModal';
import { useAlert } from '../hooks/useAlert';

const stripHtml = (html) => html?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() ?? '';

const CATEGORY_COLORS = {
  'Web App':   'bg-neu-blue text-neu-white',
  'Mobile':    'bg-neu-green text-neu-white',
  'Design':    'bg-neu-purple text-neu-white',
  'Backend':   'bg-neu-accent text-neu-white',
};
const categoryColor = (cat) => CATEGORY_COLORS[cat] ?? 'bg-neu-black text-neu-white';

function PortfolioCard({ item, isAdmin, onEdit, onDelete, onDetail, delay }) {
  const ref = useRef(null);
  const [imgIdx, setImgIdx] = useState(0);

  const imgs = item.images?.length ? item.images : (item.image ? [item.image] : []);
  const hasMultiple = imgs.length > 1;

  useEffect(() => {
    gsap.from(ref.current, { y: 30, opacity: 0, duration: 0.5, delay, ease: 'power2.out' });
  }, [delay]);

  return (
    <div ref={ref} className="bg-neu-white border-2 border-neu-black shadow-neu flex flex-col">
      {/* Image / Carousel */}
      <div className="relative border-b-2 border-neu-black h-44 bg-neu-bg overflow-hidden">
        {imgs.length > 0 ? (
          <img src={imgs[imgIdx]} alt={item.title} className="w-full h-full object-cover"
            onError={e => { e.target.style.display = 'none'; }} />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-display font-bold text-4xl text-neu-black/20">
              {item.title.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {/* Navigasi carousel */}
        {hasMultiple && (
          <>
            <button onClick={() => setImgIdx(i => (i - 1 + imgs.length) % imgs.length)}
              className="absolute left-1 top-1/2 -translate-y-1/2 w-6 h-6 bg-neu-white/90 border-2 border-neu-black font-mono text-xs flex items-center justify-center hover:bg-neu-primary transition-colors">
              ←
            </button>
            <button onClick={() => setImgIdx(i => (i + 1) % imgs.length)}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 bg-neu-white/90 border-2 border-neu-black font-mono text-xs flex items-center justify-center hover:bg-neu-primary transition-colors">
              →
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {imgs.map((_, i) => (
                <button key={i} onClick={() => setImgIdx(i)}
                  className={cn('w-1.5 h-1.5 border border-neu-black transition-all', i === imgIdx ? 'bg-neu-primary' : 'bg-neu-white/70')} />
              ))}
            </div>
          </>
        )}

        {item.category && (
          <span className={cn('absolute top-2 left-2 px-2 py-0.5 border-2 border-neu-black font-mono font-bold text-xs uppercase', categoryColor(item.category))}>
            {item.category}
          </span>
        )}
        {hasMultiple && (
          <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-neu-black/70 text-neu-white font-mono text-[10px]">
            {imgIdx + 1}/{imgs.length}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col gap-2">
        <h3 className="font-display font-bold text-base text-neu-black leading-tight">{item.title}</h3>
        {item.description && (
          <p className="font-body text-xs text-neu-black/60 line-clamp-3 flex-1">
            {stripHtml(item.description)}
          </p>
        )}
        <div className="mt-auto pt-2 border-t border-neu-black/10 flex items-center justify-between">
          <p className="font-mono text-xs text-neu-black/40">
            {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
          <button
            onClick={() => onDetail(item)}
            className="px-2.5 py-1 font-display font-bold text-[10px] uppercase tracking-wide border-2 border-neu-black bg-neu-white shadow-neu-sm hover:bg-neu-primary hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-150"
          >
            Detail
          </button>
        </div>
      </div>

      {/* Admin actions */}
      {isAdmin && (
        <div className="flex border-t-2 border-neu-black">
          <button onClick={() => onEdit(item)}
            className="flex-1 py-2 font-display font-bold text-xs uppercase text-neu-black border-r-2 border-neu-black hover:bg-neu-primary transition-colors duration-150">
            Edit
          </button>
          <button onClick={() => onDelete(item)}
            className="flex-1 py-2 font-display font-bold text-xs uppercase text-neu-accent hover:bg-neu-accent hover:text-neu-white transition-colors duration-150">
            Hapus
          </button>
        </div>
      )}
    </div>
  );
}

export default function PortfolioPage() {
  const navigate = useNavigate();
  const alert    = useAlert();

  const [user, setUser]             = useState(null);
  const [items, setItems]           = useState([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [showLogout, setShowLogout] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [deleteItem, setDeleteItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [detailItem, setDetailItem] = useState(null);

  const [search, setSearch]         = useState('');
  const [filterCat, setFilterCat]   = useState('');

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    authService.getMe()
      .then(me => {
        const u = me.data;
        if (u.role !== 'admin') { navigate('/dashboard'); return; }
        setUser(u);
        return portfolioService.getAll().then(port => setItems(port.data ?? []));
      })
      .catch(() => navigate('/login'))
      .finally(() => setIsLoading(false));
  }, [navigate]);

  const reload = useCallback(() =>
    portfolioService.getAll().then(r => setItems(r.data ?? [])), []);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await portfolioService.remove(deleteItem.id);
      alert.success('Portfolio berhasil dihapus.');
      setDeleteItem(null);
      await reload();
    } catch {
      alert.error('Gagal menghapus portfolio.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authService.logout();
      alert.success('Berhasil keluar. Sampai jumpa!');
      setTimeout(() => navigate('/login'), 1000);
    } catch {
      alert.error('Gagal keluar. Coba lagi.');
      setIsLoggingOut(false);
      setShowLogout(false);
    }
  };

  const categories = [...new Set(items.map(i => i.category).filter(Boolean))];
  const filtered   = items.filter(i => {
    const matchSearch = !search || i.title.toLowerCase().includes(search.toLowerCase()) || (i.description ?? '').toLowerCase().includes(search.toLowerCase());
    const matchCat    = !filterCat || i.category === filterCat;
    return matchSearch && matchCat;
  });

  if (isLoading) return (
    <div className="min-h-screen bg-neu-bg flex items-center justify-center">
      <p className="font-display font-bold text-neu-black animate-pulse">Memuat...</p>
    </div>
  );

  return (
    <>
      <AlertContainer alerts={alert.alerts} onDismiss={alert.dismiss} />
      <ConfirmModal isOpen={showLogout} title="Konfirmasi Keluar"
        message="Apakah kamu yakin ingin keluar dari Synectra?"
        onConfirm={handleLogout} onCancel={() => setShowLogout(false)} isLoading={isLoggingOut} />
      <ConfirmModal isOpen={Boolean(deleteItem)} title="Hapus Portfolio"
        message={`Hapus "${deleteItem?.title}"? Tindakan ini tidak bisa dibatalkan.`}
        onConfirm={handleDelete} onCancel={() => setDeleteItem(null)} isLoading={isDeleting} />
      {detailItem && (
        <PortfolioDetailModal item={detailItem} onClose={() => setDetailItem(null)} />
      )}

      <div className="flex min-h-screen bg-neu-bg">
        <Sidebar user={user} onLogout={() => setShowLogout(true)} />

        <div className="flex-1 ml-64 flex flex-col">
          <Navbar title="Portfolio" user={user} />

          <main className="flex-1 p-6">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Cari portfolio..."
                className="flex-1 min-w-48 px-4 py-2.5 bg-neu-white border-2 border-neu-black shadow-neu-sm font-body text-sm text-neu-black placeholder:text-neu-black/30 outline-none focus:shadow-neu transition-all duration-150" />

              {categories.length > 0 && (
                <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
                  className="px-4 py-2.5 bg-neu-white border-2 border-neu-black shadow-neu-sm font-display font-bold text-xs uppercase text-neu-black outline-none focus:shadow-neu transition-all duration-150 cursor-pointer">
                  <option value="">Semua Kategori</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              )}

              {isAdmin && (
                <button onClick={() => navigate('/portfolio/new')}
                  className={cn('px-5 py-2.5 font-display font-bold text-xs uppercase tracking-wide', 'bg-neu-primary text-neu-black border-2 border-neu-black shadow-neu', 'transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm', 'active:translate-x-1 active:translate-y-1 active:shadow-none whitespace-nowrap')}>
                  + Tambah Portfolio
                </button>
              )}
            </div>

            {/* Stats bar */}
            <div className="flex items-center gap-3 mb-5">
              <span className="font-mono text-xs text-neu-black/50">
                Menampilkan <strong className="text-neu-black">{filtered.length}</strong> dari <strong className="text-neu-black">{items.length}</strong> portfolio
              </span>
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
              <div className="border-2 border-dashed border-neu-black/30 p-12 text-center">
                <p className="font-display font-bold text-neu-black/40 text-lg">
                  {items.length === 0 ? 'Belum ada portfolio.' : 'Tidak ada hasil pencarian.'}
                </p>
                {isAdmin && items.length === 0 && (
                  <button onClick={() => navigate('/portfolio/new')}
                    className="mt-4 px-5 py-2.5 font-display font-bold text-xs uppercase bg-neu-primary border-2 border-neu-black shadow-neu hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm transition-all duration-150">
                    Tambah Portfolio Pertama
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map((item, i) => (
                  <PortfolioCard key={item.id} item={item} isAdmin={isAdmin}
                    onEdit={it => navigate(`/portfolio/${it.id}/edit`)}
                    onDelete={it => setDeleteItem(it)}
                    onDetail={it => setDetailItem(it)}
                    delay={i * 0.05} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
