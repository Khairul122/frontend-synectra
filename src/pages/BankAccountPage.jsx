import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { gsap } from 'gsap';
import { cn } from '../utils/cn';
import { authService } from '../services/auth.service';
import { bankAccountService } from '../services/bankAccount.service';
import { PageLayout } from '../components/layout/PageLayout';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { useAlert } from '../hooks/useAlert';
import { PageLoader } from '../components/ui/PageLoader';

function LogoPreviewModal({ account, onClose }) {
  const { t } = useTranslation();
  const backdropRef = useRef(null);
  const cardRef     = useRef(null);

  useEffect(() => {
    gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 });
    gsap.fromTo(cardRef.current, { y: -30, opacity: 0, scale: 0.95 }, { y: 0, opacity: 1, scale: 1, duration: 0.3, ease: 'power3.out' });
    const handleKey = (e) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleClose = () => {
    gsap.to(cardRef.current,     { y: -20, opacity: 0, scale: 0.95, duration: 0.2, ease: 'power2.in' });
    gsap.to(backdropRef.current, { opacity: 0, duration: 0.2, onComplete: onClose });
  };

  return createPortal(
    <div ref={backdropRef} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neu-black/70"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
      <div ref={cardRef} className="w-full max-w-md bg-neu-white border-2 border-neu-black shadow-neu-xl">
        <div className="flex items-center justify-between px-5 py-3 border-b-2 border-neu-black bg-neu-black">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-neu-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="2" y="5" width="20" height="16" /><line x1="2" y1="10" x2="22" y2="10" />
            </svg>
            <h3 className="font-display font-bold text-sm text-neu-white uppercase tracking-wide">{account.bankName}</h3>
          </div>
          <button onClick={handleClose} className="text-neu-white/60 hover:text-neu-white font-mono text-2xl leading-none">×</button>
        </div>
        <div className="bg-neu-bg border-b-2 border-neu-black flex items-center justify-center p-8">
          <img src={account.bankLogo} alt={account.bankName} className="max-h-40 max-w-full object-contain" />
        </div>
        <div className="px-5 py-4 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <p className="font-display font-bold text-sm text-neu-black">{account.bankName}</p>
            <p className="font-body text-xs text-neu-black/50">{account.accountHolder}</p>
          </div>
          <button onClick={handleClose} className={cn('px-4 py-2 bg-neu-white border-2 border-neu-black shadow-neu font-display font-bold text-xs uppercase tracking-wide text-neu-black transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm')}>
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function BankAccountRow({ account, index, onEdit, onDelete, onToggleActive, onPreview }) {
  const { t } = useTranslation();
  const ref = useRef(null);
  useEffect(() => { gsap.from(ref.current, { x: -20, opacity: 0, duration: 0.4, delay: index * 0.04, ease: 'power2.out' }); }, [index]);

  return (
    <tr ref={ref} className="border-b-2 border-neu-black bg-neu-white hover:bg-neu-bg transition-colors duration-150">
      <td className="px-4 py-3 border-r-2 border-neu-black font-mono text-xs text-neu-black/50 text-center w-10">{index + 1}</td>
      <td className="px-4 py-3 border-r-2 border-neu-black w-20">
        <div onClick={() => account.bankLogo && onPreview(account)}
          className={cn('w-14 h-10 border-2 border-neu-black overflow-hidden bg-neu-bg flex-shrink-0 flex items-center justify-center transition-all duration-150', account.bankLogo && 'cursor-pointer hover:border-neu-primary hover:shadow-neu-sm hover:translate-x-[-1px] hover:translate-y-[-1px]')}>
          {account.bankLogo
            ? <img src={account.bankLogo} alt={account.bankName} className="w-full h-full object-contain p-1" onError={e => { e.target.style.display = 'none'; }} />
            : <span className="font-display font-bold text-base text-neu-black/20">{account.bankName.charAt(0).toUpperCase()}</span>
          }
        </div>
      </td>
      <td className="px-4 py-3 border-r-2 border-neu-black w-36"><p className="font-display font-bold text-sm text-neu-black">{account.bankName}</p></td>
      <td className="px-4 py-3 border-r-2 border-neu-black w-40"><p className="font-mono text-sm text-neu-black">{account.accountNumber}</p></td>
      <td className="px-4 py-3 border-r-2 border-neu-black"><p className="font-body text-sm text-neu-black">{account.accountHolder}</p></td>
      <td className="px-4 py-3 border-r-2 border-neu-black text-center w-28">
        <span className={cn('inline-block px-2 py-0.5 border-2 border-neu-black font-mono font-bold text-xs uppercase', account.isActive ? 'bg-neu-green text-neu-white' : 'bg-neu-black/10 text-neu-black/50')}>
          {account.isActive ? t('common.active') : t('common.inactive')}
        </span>
      </td>
      <td className="px-4 py-3 border-r-2 border-neu-black font-mono text-xs text-neu-black/50 w-36 whitespace-nowrap">
        {new Date(account.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
      </td>
      <td className="px-4 py-3 w-52">
        <div className="flex items-center gap-2">
          <button onClick={() => onToggleActive(account)} className={cn('px-2.5 py-1 border-2 border-neu-black font-display font-bold text-[10px] uppercase tracking-wide transition-all duration-150 shadow-neu-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none', account.isActive ? 'bg-neu-black/10 text-neu-black' : 'bg-neu-green text-neu-white')}>
            {account.isActive ? t('common.deactivate') : t('common.activate')}
          </button>
          <button onClick={() => onEdit(account.id)} className="px-2.5 py-1 border-2 border-neu-black bg-neu-primary font-display font-bold text-[10px] uppercase tracking-wide text-neu-black shadow-neu-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-150">{t('common.edit')}</button>
          <button onClick={() => onDelete(account)} className="px-2.5 py-1 border-2 border-neu-black bg-neu-white font-display font-bold text-[10px] uppercase tracking-wide text-neu-accent shadow-neu-sm hover:bg-neu-accent hover:text-neu-white hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-150">{t('common.delete')}</button>
        </div>
      </td>
    </tr>
  );
}

export default function BankAccountPage() {
  const navigate = useNavigate();
  const alert    = useAlert();
  const { t }    = useTranslation();

  const [user,           setUser]           = useState(null);
  const [accounts,       setAccounts]       = useState([]);
  const [isLoading,      setIsLoading]      = useState(true);
  const [search,         setSearch]         = useState('');
  const [deleteTarget,   setDeleteTarget]   = useState(null);
  const [isDeleting,     setIsDeleting]     = useState(false);
  const [previewAccount, setPreviewAccount] = useState(null);

  const headerRef = useRef(null);
  const tableRef  = useRef(null);

  useEffect(() => {
    authService.getMe()
      .then(res => {
        const u = res.data;
        if (u.role !== 'admin') { navigate('/dashboard'); return; }
        setUser(u);
        return bankAccountService.getAll();
      })
      .then(res => { if (res) setAccounts(res.data ?? []); })
      .catch(() => navigate('/login'))
      .finally(() => setIsLoading(false));
  }, [navigate]);

  useEffect(() => {
    if (!isLoading) {
      if (headerRef.current) gsap.from(headerRef.current, { y: -20, opacity: 0, duration: 0.4, ease: 'power2.out' });
      if (tableRef.current)  gsap.from(tableRef.current,  { y: 20,  opacity: 0, duration: 0.5, delay: 0.1, ease: 'power2.out' });
    }
  }, [isLoading]);

  const handleToggleActive = async (account) => {
    try {
      await bankAccountService.update(account.id, { isActive: !account.isActive });
      setAccounts(prev => prev.map(a => a.id === account.id ? { ...a, isActive: !a.isActive } : a));
      alert.success(!account.isActive ? t('bankAccounts.success.activated', { name: account.bankName }) : t('bankAccounts.success.deactivated', { name: account.bankName }));
    } catch { alert.error(t('bankAccounts.failed.status')); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await bankAccountService.remove(deleteTarget.id);
      setAccounts(prev => prev.filter(a => a.id !== deleteTarget.id));
      alert.success(t('bankAccounts.success.delete'));
      setDeleteTarget(null);
    } catch { alert.error(t('bankAccounts.failed.delete')); }
    finally { setIsDeleting(false); }
  };

  const filtered = accounts.filter(a =>
    !search || a.bankName.toLowerCase().includes(search.toLowerCase()) || a.accountHolder.toLowerCase().includes(search.toLowerCase()),
  );

  if (isLoading) return <PageLoader />;

  return (
    <PageLayout user={user} title={t('bankAccounts.title')} alert={alert}>
      {previewAccount && <LogoPreviewModal account={previewAccount} onClose={() => setPreviewAccount(null)} />}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title={t('bankAccounts.title')}
        message={t('bankAccounts.deleteConfirm', { name: deleteTarget?.bankName })}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isDeleting}
      />

      <div ref={headerRef} className="flex flex-wrap items-center gap-3 mb-6">
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder={t('bankAccounts.search')}
          className="flex-1 min-w-48 px-4 py-2.5 bg-neu-white border-2 border-neu-black shadow-neu-sm font-body text-sm text-neu-black placeholder:text-neu-black/30 outline-none focus:shadow-neu transition-all duration-150" />
        <span className="font-mono text-xs text-neu-black/50">
          {t('common.showing')} <strong className="text-neu-black">{filtered.length}</strong> {t('common.from')} <strong className="text-neu-black">{accounts.length}</strong>
        </span>
        <button onClick={() => navigate('/bank-accounts/new')}
          className="px-5 py-2.5 bg-neu-primary border-2 border-neu-black shadow-neu font-display font-bold text-xs uppercase tracking-wide text-neu-black whitespace-nowrap transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm active:translate-x-1 active:translate-y-1 active:shadow-none">
          {t('bankAccounts.add')}
        </button>
      </div>

      <div ref={tableRef} className="border-2 border-neu-black shadow-neu bg-neu-white overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-16 text-center">
            <p className="font-display font-bold text-xl text-neu-black/40">
              {accounts.length === 0 ? t('bankAccounts.noAccounts') : t('common.noResult')}
            </p>
            {accounts.length === 0 && (
              <button onClick={() => navigate('/bank-accounts/new')}
                className="mt-4 px-5 py-2.5 bg-neu-primary border-2 border-neu-black shadow-neu font-display font-bold text-xs uppercase hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm transition-all duration-150">
                {t('bankAccounts.addFirst')}
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-neu-black text-neu-white">
                  {['No', t('bankAccounts.cols.logo'), t('bankAccounts.cols.bank'), t('bankAccounts.cols.number'), t('bankAccounts.cols.owner'), t('common.status'), t('common.createdAt'), t('common.actions')].map((h, i) => (
                    <th key={h} className={cn('px-4 py-3 font-display font-bold text-xs uppercase tracking-wide text-left', i < 7 && 'border-r-2 border-neu-white/20')}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((account, idx) => (
                  <BankAccountRow key={account.id} account={account} index={idx}
                    onEdit={id => navigate(`/bank-accounts/${id}/edit`)}
                    onDelete={setDeleteTarget} onToggleActive={handleToggleActive} onPreview={setPreviewAccount} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
