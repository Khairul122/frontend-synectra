import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';
import { cn } from '../utils/cn';
import { authService } from '../services/auth.service';
import { clientService } from '../services/client.service';
import { userService } from '../services/user.service';
import { PageLayout } from '../components/layout/PageLayout';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { useAlert } from '../hooks/useAlert';
import { PageLoader } from '../components/ui/PageLoader';

/* ─── Edit Modal ─────────────────────────────────────────────────────────── */
function EditClientModal({ client, onClose, onSaved }) {
  const backdropRef = useRef(null);
  const cardRef     = useRef(null);
  const [form, setForm] = useState({
    companyName: client.companyName ?? '',
    email:       client.email       ?? '',
  });
  const [pwForm,     setPwForm]     = useState({ newPassword: '', confirmPassword: '' });
  const [isSaving,   setIsSaving]   = useState(false);
  const [isSavingPw, setIsSavingPw] = useState(false);
  const [pwError,    setPwError]    = useState('');
  const alert = useAlert();

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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await clientService.update(client.id, {
        companyName: form.companyName || null,
        email:       form.email       || null,
      });
      onSaved();
      handleClose();
    } catch {
      alert.error('Gagal menyimpan data client.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (pwForm.newPassword.length < 8) { setPwError('Password minimal 8 karakter.'); return; }
    if (pwForm.newPassword !== pwForm.confirmPassword) { setPwError('Konfirmasi password tidak cocok.'); return; }
    setIsSavingPw(true);
    try {
      await userService.resetPassword(client.userId, pwForm.newPassword);
      setPwForm({ newPassword: '', confirmPassword: '' });
      setPwError('');
      alert.success('Password client berhasil direset.');
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'Gagal reset password.';
      alert.error(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setIsSavingPw(false);
    }
  };

  const inputCls = cn(
    'w-full px-4 py-2.5 bg-neu-white border-2 border-neu-black shadow-neu-sm',
    'font-body text-neu-black placeholder:text-gray-400',
    'outline-none focus:shadow-neu focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all duration-150',
  );

  return createPortal(
    <div ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neu-black/60"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
      <div ref={cardRef} className="w-full max-w-md bg-neu-white border-2 border-neu-black shadow-neu-xl">
        <div className="flex items-center justify-between px-5 py-3 border-b-2 border-neu-black bg-neu-black">
          <h3 className="font-display font-bold text-sm text-neu-white uppercase tracking-wide">Edit Data Client</h3>
          <button onClick={handleClose} className="text-neu-white/60 hover:text-neu-white font-mono text-2xl leading-none">×</button>
        </div>

        {/* Readonly user info */}
        <div className="px-5 pt-4 pb-2">
          <div className="bg-neu-bg border-2 border-neu-black p-3 mb-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-neu-primary border-2 border-neu-black flex items-center justify-center font-display font-bold text-neu-black">
              {(client.fullName ?? client.email ?? '?').charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-display font-bold text-sm text-neu-black">{client.fullName ?? '—'}</p>
              <p className="font-mono text-xs text-neu-black/50">{client.fullName ? client.email : '—'}</p>
            </div>
          </div>
        </div>

        <div className="px-5 pb-5 space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-display font-bold text-xs text-neu-black uppercase tracking-wide">Nama / Perusahaan</label>
            <input type="text" value={form.companyName}
              onChange={e => setForm(p => ({ ...p, companyName: e.target.value }))}
              placeholder="Nama individu atau perusahaan"
              className={inputCls} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-display font-bold text-xs text-neu-black uppercase tracking-wide">Email Kontak</label>
            <input type="email" value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              placeholder="email@example.com"
              className={inputCls} />
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={handleSave} disabled={isSaving}
              className={cn(
                'flex-1 py-2.5 bg-neu-primary border-2 border-neu-black shadow-neu font-display font-bold text-sm uppercase text-neu-black',
                'transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm',
                isSaving && 'opacity-60 cursor-not-allowed',
              )}>
              {isSaving ? t('common.saving') : 'Simpan'}
            </button>
            <button onClick={handleClose}
              className="flex-1 py-2.5 bg-neu-white border-2 border-neu-black shadow-neu font-display font-bold text-sm uppercase text-neu-black transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm">
              Batal
            </button>
          </div>

          {/* Reset Password — hanya jika client punya userId */}
          {client.userId && (
            <div className="border-t-2 border-neu-black pt-4 space-y-3">
              <p className="font-display font-bold text-xs text-neu-black uppercase tracking-wide">Reset Password Client</p>
              <div className="flex flex-col gap-1.5">
                <input type="password" value={pwForm.newPassword}
                  onChange={e => { setPwForm(p => ({ ...p, newPassword: e.target.value })); setPwError(''); }}
                  placeholder="Password baru (min 8 karakter)"
                  className={inputCls} />
              </div>
              <div className="flex flex-col gap-1.5">
                <input type="password" value={pwForm.confirmPassword}
                  onChange={e => { setPwForm(p => ({ ...p, confirmPassword: e.target.value })); setPwError(''); }}
                  placeholder="Konfirmasi password baru"
                  className={inputCls} />
              </div>
              {pwError && <p className="text-neu-accent font-body font-semibold text-xs">{pwError}</p>}
              <button onClick={handleResetPassword} disabled={isSavingPw || !pwForm.newPassword}
                className={cn(
                  'w-full py-2 bg-neu-accent border-2 border-neu-black shadow-neu font-display font-bold text-xs uppercase text-neu-white',
                  'transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm',
                  (isSavingPw || !pwForm.newPassword) && 'opacity-50 cursor-not-allowed',
                )}>
                {isSavingPw ? 'Mereset...' : 'Reset Password'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ─── Table Row ──────────────────────────────────────────────────────────── */
function ClientRow({ client, index, onEdit, onDelete }) {
  const ref = useRef(null);
  useEffect(() => {
    gsap.from(ref.current, { x: -20, opacity: 0, duration: 0.4, delay: index * 0.04, ease: 'power2.out' });
  }, [index]);

  const fmtDate = (val) => val ? new Date(val).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
  const initial = (client.fullName ?? client.companyName ?? client.email ?? '?').charAt(0).toUpperCase();

  return (
    <tr ref={ref} className="border-b-2 border-neu-black bg-neu-white hover:bg-neu-bg transition-colors duration-150">
      <td className="px-4 py-3 border-r-2 border-neu-black font-mono text-xs text-neu-black/50 text-center w-10">{index + 1}</td>

      {/* Avatar + Nama */}
      <td className="px-4 py-3 border-r-2 border-neu-black">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-neu-primary border-2 border-neu-black flex items-center justify-center font-display font-bold text-sm text-neu-black flex-shrink-0">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="font-display font-bold text-sm text-neu-black">{client.fullName ?? '—'}</p>
            <p className="font-mono text-xs text-neu-black/40 truncate">{client.email ?? client.companyName ?? '—'}</p>
          </div>
        </div>
      </td>

      {/* Nama/Perusahaan */}
      <td className="px-4 py-3 border-r-2 border-neu-black w-44">
        <p className="font-body text-sm text-neu-black">{client.companyName ?? <span className="text-neu-black/30 italic">—</span>}</p>
      </td>

      {/* Email kontak */}
      <td className="px-4 py-3 border-r-2 border-neu-black">
        <p className="font-mono text-xs text-neu-black">{client.email ?? '—'}</p>
      </td>

      {/* Terdaftar */}
      <td className="px-4 py-3 border-r-2 border-neu-black font-mono text-xs text-neu-black/50 w-32">{fmtDate(client.createdAt)}</td>

      {/* Aksi */}
      <td className="px-4 py-3 w-36">
        <div className="flex items-center gap-2">
          <button onClick={() => onEdit(client)}
            className="px-2.5 py-1 border-2 border-neu-black bg-neu-primary font-display font-bold text-[10px] uppercase tracking-wide text-neu-black shadow-neu-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-150">
            Edit
          </button>
          <button onClick={() => onDelete(client)}
            className="px-2.5 py-1 border-2 border-neu-black bg-neu-white font-display font-bold text-[10px] uppercase tracking-wide text-neu-accent shadow-neu-sm hover:bg-neu-accent hover:text-neu-white hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-150">
            Hapus
          </button>
        </div>
      </td>
    </tr>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */
export default function ClientPage() {
  const navigate = useNavigate();
  const { t }    = useTranslation();
  const alert    = useAlert();

  const [user,         setUser]         = useState(null);
  const [clients,      setClients]      = useState([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [search,       setSearch]       = useState('');
  const [editTarget,   setEditTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting,   setIsDeleting]   = useState(false);

  const headerRef = useRef(null);
  const tableRef  = useRef(null);

  const load = () => clientService.getAll().then(r => setClients(r.data ?? []));

  useEffect(() => {
    authService.getMe()
      .then(res => {
        if (res.data.role !== 'admin') { navigate('/dashboard'); return; }
        setUser(res.data);
        return load();
      })
      .catch(() => navigate('/login'))
      .finally(() => setIsLoading(false));
  }, [navigate]);

  useEffect(() => {
    if (!isLoading) {
      if (headerRef.current) gsap.from(headerRef.current, { y: -20, opacity: 0, duration: 0.4, ease: 'power2.out' });
      if (tableRef.current)  gsap.from(tableRef.current,  { y: 20,  opacity: 0, duration: 0.5, delay: 0.1, ease: 'power2.out' });
    }
  }, [isLoading]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await clientService.remove(deleteTarget.id);
      setClients(prev => prev.filter(c => c.id !== deleteTarget.id));
      alert.success('Client berhasil dihapus.');
      setDeleteTarget(null);
    } catch {
      alert.error('Gagal menghapus client.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = clients.filter(c =>
    !search ||
    (c.fullName ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (c.companyName ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (c.email ?? '').toLowerCase().includes(search.toLowerCase()),
  );

  if (isLoading) return <PageLoader />;

  return (
    <PageLayout user={user} title="Client Management" alert={alert}>
      {editTarget && (
        <EditClientModal
          client={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={() => { load(); alert.success('Data client berhasil diperbarui.'); }}
        />
      )}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Hapus Client"
        message={`Hapus client "${deleteTarget?.fullName ?? deleteTarget?.email}"? Data client akan dihapus permanen.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isDeleting}
        confirmText="Ya, Hapus"
      />

      {/* Toolbar */}
      <div ref={headerRef} className="flex flex-wrap items-center gap-3 mb-6">
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Cari nama, perusahaan, atau email..."
          className="flex-1 min-w-48 px-4 py-2.5 bg-neu-white border-2 border-neu-black shadow-neu-sm font-body text-sm text-neu-black placeholder:text-neu-black/30 outline-none focus:shadow-neu transition-all duration-150" />
        <span className="font-mono text-xs text-neu-black/50">
          <strong className="text-neu-black">{filtered.length}</strong> / <strong className="text-neu-black">{clients.length}</strong> client
        </span>
      </div>

      {/* Table */}
      <div ref={tableRef} className="border-2 border-neu-black shadow-neu bg-neu-white overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-16 text-center">
            <p className="font-display font-bold text-xl text-neu-black/40">
              {clients.length === 0 ? 'Belum ada client terdaftar.' : 'Tidak ada hasil pencarian.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-neu-black text-neu-white">
                  <th className="px-4 py-3 border-r-2 border-neu-white/20 font-display font-bold text-xs uppercase w-10 text-center">No</th>
                  <th className="px-4 py-3 border-r-2 border-neu-white/20 font-display font-bold text-xs uppercase text-left">Nama Pengguna</th>
                  <th className="px-4 py-3 border-r-2 border-neu-white/20 font-display font-bold text-xs uppercase text-left w-44">Nama / Perusahaan</th>
                  <th className="px-4 py-3 border-r-2 border-neu-white/20 font-display font-bold text-xs uppercase text-left">Email Kontak</th>
                  <th className="px-4 py-3 border-r-2 border-neu-white/20 font-display font-bold text-xs uppercase text-left w-32">Terdaftar</th>
                  <th className="px-4 py-3 font-display font-bold text-xs uppercase text-left w-36">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((client, idx) => (
                  <ClientRow key={client.id} client={client} index={idx}
                    onEdit={setEditTarget}
                    onDelete={setDeleteTarget} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
