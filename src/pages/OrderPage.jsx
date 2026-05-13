import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { gsap } from 'gsap';
import { cn } from '../utils/cn';
import { authService } from '../services/auth.service';
import { orderService } from '../services/order.service';
import { PageLayout } from '../components/layout/PageLayout';
import { useAlert } from '../hooks/useAlert';
import { PageLoader } from '../components/ui/PageLoader';

const STATUS_BG = {
  pending:     { bg: 'bg-neu-primary',  text: 'text-neu-black' },
  in_progress: { bg: 'bg-neu-blue',     text: 'text-neu-white' },
  testing:     { bg: 'bg-neu-purple',   text: 'text-neu-white' },
  revision:    { bg: 'bg-[#F97316]',    text: 'text-neu-white' },
  completed:   { bg: 'bg-neu-green',    text: 'text-neu-white' },
  canceled:    { bg: 'bg-neu-accent',   text: 'text-neu-white' },
};
const STATUS_KEYS = Object.keys(STATUS_BG);

function StatusBadge({ status }) {
  const { t } = useTranslation();
  const cfg = STATUS_BG[status] ?? { bg: 'bg-neu-black/20', text: 'text-neu-black' };
  return (
    <span className={cn('inline-block px-2 py-0.5 border-2 border-neu-black font-mono font-bold text-xs uppercase', cfg.bg, cfg.text)}>
      {t(`status.${status}`, { defaultValue: status })}
    </span>
  );
}

function OrderRow({ order, index, onOpen }) {
  const ref = useRef(null);
  useEffect(() => { gsap.from(ref.current, { x: -20, opacity: 0, duration: 0.4, delay: index * 0.04, ease: 'power2.out' }); }, [index]);
  const fmt     = (val) => val ? `Rp ${Number(val).toLocaleString('id-ID')}` : '—';
  const fmtDate = (val) => val ? new Date(val).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' }) : '—';
  return (
    <tr ref={ref} className="border-b-2 border-neu-black bg-neu-white hover:bg-neu-bg transition-colors duration-150 cursor-pointer" onClick={() => onOpen(order.id)}>
      <td className="px-4 py-3 border-r-2 border-neu-black font-mono text-xs text-neu-black/50 text-center w-10">{index + 1}</td>
      <td className="px-4 py-3 border-r-2 border-neu-black">
        <p className="font-display font-bold text-sm text-neu-black">{order.title}</p>
        {order.serviceCategory && <p className="font-mono text-xs text-neu-black/40">{order.serviceCategory}</p>}
      </td>
      <td className="px-4 py-3 border-r-2 border-neu-black w-40">
        <p className="font-body text-sm text-neu-black">{order.clientName ?? '—'}</p>
        <p className="font-mono text-xs text-neu-black/40 truncate max-w-36">{order.clientEmail ?? ''}</p>
      </td>
      <td className="px-4 py-3 border-r-2 border-neu-black font-mono text-sm text-neu-black w-36">{fmt(order.totalPrice)}</td>
      <td className="px-4 py-3 border-r-2 border-neu-black font-mono text-xs text-neu-black/60 w-32">{fmtDate(order.deadline)}</td>
      <td className="px-4 py-3 border-r-2 border-neu-black w-32"><StatusBadge status={order.status} /></td>
      <td className="px-4 py-3 font-mono text-xs text-neu-black/40 w-32">{fmtDate(order.createdAt)}</td>
    </tr>
  );
}

export default function OrderPage() {
  const navigate = useNavigate();
  const alert    = useAlert();
  const { t }    = useTranslation();

  const [user,      setUser]      = useState(null);
  const [orders,    setOrders]    = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter,    setFilter]    = useState('all');
  const [search,    setSearch]    = useState('');

  const headerRef = useRef(null);
  const tableRef  = useRef(null);

  useEffect(() => {
    authService.getMe()
      .then(res => {
        const u = res.data;
        if (u.role !== 'admin') { navigate('/dashboard'); return; }
        setUser(u);
        return orderService.getAll();
      })
      .then(res => { if (res) setOrders(res.data ?? []); })
      .catch(() => navigate('/login'))
      .finally(() => setIsLoading(false));
  }, [navigate]);

  useEffect(() => {
    if (!isLoading) {
      if (headerRef.current) gsap.from(headerRef.current, { y: -20, opacity: 0, duration: 0.4, ease: 'power2.out' });
      if (tableRef.current)  gsap.from(tableRef.current,  { y: 20,  opacity: 0, duration: 0.5, delay: 0.1, ease: 'power2.out' });
    }
  }, [isLoading]);

  const filtered = orders.filter(o => {
    const matchStatus = filter === 'all' || o.status === filter;
    const matchSearch = !search || o.title.toLowerCase().includes(search.toLowerCase()) || (o.clientName ?? '').toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  if (isLoading) return <PageLoader />;

  return (
    <PageLayout user={user} title={t('orders.title')} alert={alert}>
      <div ref={headerRef} className="flex flex-wrap items-center gap-3 mb-6">
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder={t('orders.search')}
          className="flex-1 min-w-48 px-4 py-2.5 bg-neu-white border-2 border-neu-black shadow-neu-sm font-body text-sm placeholder:text-neu-black/30 outline-none focus:shadow-neu transition-all duration-150" />
        <select value={filter} onChange={e => setFilter(e.target.value)}
          className="px-4 py-2.5 bg-neu-white border-2 border-neu-black shadow-neu-sm font-display font-bold text-xs uppercase outline-none focus:shadow-neu transition-all duration-150 cursor-pointer">
          <option value="all">{t('orders.allStatus')}</option>
          {STATUS_KEYS.map(k => <option key={k} value={k}>{t(`status.${k}`, { defaultValue: k })}</option>)}
        </select>
        <span className="font-mono text-xs text-neu-black/50">
          <strong>{filtered.length}</strong> / <strong>{orders.length}</strong>
        </span>
        <button onClick={() => navigate('/orders/new')}
          className={cn('px-5 py-2.5 bg-neu-primary border-2 border-neu-black shadow-neu font-display font-bold text-xs uppercase tracking-wide text-neu-black whitespace-nowrap',
            'transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm active:translate-x-1 active:translate-y-1 active:shadow-none')}>
          {t('orders.createOrder')}
        </button>
      </div>

      {/* Status chips */}
      <div className="flex gap-3 mb-5 flex-wrap">
        {STATUS_KEYS.map(k => {
          const count = orders.filter(o => o.status === k).length;
          const cfg   = STATUS_BG[k];
          return count > 0 ? (
            <div key={k} className={cn('px-3 py-1.5 border-2 border-neu-black shadow-neu-sm flex items-center gap-2', cfg.bg)}>
              <span className={cn('font-mono font-bold text-lg leading-none', cfg.text)}>{count}</span>
              <span className={cn('font-mono text-xs uppercase', cfg.text)}>{t(`status.${k}`, { defaultValue: k })}</span>
            </div>
          ) : null;
        })}
      </div>

      <div ref={tableRef} className="border-2 border-neu-black shadow-neu bg-neu-white overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-16 text-center">
            <p className="font-display font-bold text-xl text-neu-black/40">
              {orders.length === 0 ? t('orders.noOrders') : t('orders.noResult')}
            </p>
            {orders.length === 0 && (
              <button onClick={() => navigate('/orders/new')}
                className="mt-4 px-5 py-2.5 bg-neu-primary border-2 border-neu-black shadow-neu font-display font-bold text-xs uppercase hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm transition-all duration-150">
                {t('orders.createFirst')}
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-neu-black text-neu-white">
                  <th className="px-4 py-3 border-r-2 border-neu-white/20 font-display font-bold text-xs uppercase w-10 text-center">No</th>
                  <th className="px-4 py-3 border-r-2 border-neu-white/20 font-display font-bold text-xs uppercase text-left">{t('orders.cols.title')}</th>
                  <th className="px-4 py-3 border-r-2 border-neu-white/20 font-display font-bold text-xs uppercase text-left w-40">{t('orders.cols.client')}</th>
                  <th className="px-4 py-3 border-r-2 border-neu-white/20 font-display font-bold text-xs uppercase text-left w-36">{t('orders.cols.total')}</th>
                  <th className="px-4 py-3 border-r-2 border-neu-white/20 font-display font-bold text-xs uppercase text-left w-32">{t('orders.cols.deadline')}</th>
                  <th className="px-4 py-3 border-r-2 border-neu-white/20 font-display font-bold text-xs uppercase text-left w-32">{t('orders.cols.status')}</th>
                  <th className="px-4 py-3 font-display font-bold text-xs uppercase text-left w-32">{t('orders.cols.createdAt')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order, idx) => (
                  <OrderRow key={order.id} order={order} index={idx} onOpen={id => navigate(`/orders/${id}`)} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
