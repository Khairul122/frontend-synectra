import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '../utils/cn';
import { authService } from '../services/auth.service';
import { orderService } from '../services/order.service';
import { PageLayout } from '../components/layout/PageLayout';
import { useAlert } from '../hooks/useAlert';

const STATUS_BG = {
  pending:     { bg: 'bg-neu-primary', text: 'text-neu-black' },
  in_progress: { bg: 'bg-neu-blue',    text: 'text-neu-white' },
  testing:     { bg: 'bg-neu-purple',  text: 'text-neu-white' },
  revision:    { bg: 'bg-[#F97316]',   text: 'text-neu-white' },
  completed:   { bg: 'bg-neu-green',   text: 'text-neu-white' },
  canceled:    { bg: 'bg-neu-accent',  text: 'text-neu-white' },
};

const ACTIVE_STATUSES = ['pending', 'in_progress', 'testing', 'revision'];

export default function MyOrderPage() {
  const navigate = useNavigate();
  const { t }    = useTranslation();
  const alert    = useAlert();

  const [user,         setUser]         = useState(null);
  const [orders,       setOrders]       = useState([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');


  useEffect(() => {
    authService.getMe()
      .then(res => {
        setUser(res.data);
        return orderService.getAll();
      })
      .then(res => { if (res) setOrders(res.data ?? []); })
      .catch(() => navigate('/login'))
      .finally(() => setIsLoading(false));
  }, [navigate]);


  const fmt = (val) => val ? `Rp ${Number(val).toLocaleString('id-ID')}` : '—';
  const fmtDate = (val) => val ? new Date(val).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' }) : '—';

  const filteredOrders = orders.filter(o => {
    if (statusFilter === 'all')       return true;
    if (statusFilter === 'active')    return ACTIVE_STATUSES.includes(o.status);
    if (statusFilter === 'completed') return o.status === 'completed';
    if (statusFilter === 'canceled')  return o.status === 'canceled';
    return true;
  });

  const counts = {
    all:       orders.length,
    active:    orders.filter(o => ACTIVE_STATUSES.includes(o.status)).length,
    completed: orders.filter(o => o.status === 'completed').length,
    canceled:  orders.filter(o => o.status === 'canceled').length,
  };

  const filterTabs = [
    { key: 'all',       label: 'Semua'   },
    { key: 'active',    label: 'Aktif'   },
    { key: 'completed', label: 'Selesai' },
    { key: 'canceled',  label: 'Batal'   },
  ];

  return (
    <PageLayout user={user} title={t('myOrders.title')} alert={alert} isLoading={isLoading}>
      {/* Header toolbar */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="font-display font-bold text-xl text-neu-black">{t('myOrders.title')}</h2>
          <p className="font-mono text-xs text-neu-black/50 mt-0.5">{orders.length} pesanan terdaftar</p>
        </div>
        <button
          onClick={() => navigate('/my-orders/new')}
          className={cn(
            'px-5 py-2.5 bg-neu-primary border-2 border-neu-black shadow-neu',
            'font-display font-bold text-xs uppercase tracking-wide text-neu-black whitespace-nowrap',
            'hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm transition-all duration-150',
          )}
        >
          {t('myOrders.create')}
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="border-2 border-dashed border-neu-black/30 p-16 text-center">
          <p className="font-display font-bold text-xl text-neu-black/40">{t('myOrders.noOrders')}</p>
          <p className="font-body text-sm text-neu-black/30 mt-1">Klik "Buat Pesanan Baru" untuk mulai.</p>
          <button onClick={() => navigate('/my-orders/new')}
            className="mt-4 px-5 py-2.5 bg-neu-primary border-2 border-neu-black shadow-neu font-display font-bold text-xs uppercase hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm transition-all duration-150">
            {t('myOrders.createFirst')}
          </button>
        </div>
      ) : (
        <>
          {/* Status Filter Tabs */}
          <div className="flex border-2 border-neu-black mb-6 overflow-x-auto">
            {filterTabs.map(({ key, label }) => (
              <button key={key}
                onClick={() => setStatusFilter(key)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 font-display font-bold text-xs uppercase whitespace-nowrap',
                  'border-r-2 border-neu-black last:border-r-0 transition-colors duration-150',
                  statusFilter === key
                    ? 'bg-neu-primary text-neu-black'
                    : 'bg-neu-white text-neu-black/50 hover:bg-neu-bg hover:text-neu-black',
                )}>
                {label}
                <span className={cn(
                  'inline-flex items-center justify-center w-5 h-5 border border-neu-black font-mono text-[10px]',
                  statusFilter === key ? 'bg-neu-black text-neu-white' : 'bg-neu-bg text-neu-black/50',
                )}>
                  {counts[key]}
                </span>
              </button>
            ))}
          </div>

          {filteredOrders.length === 0 ? (
            <div className="border-2 border-dashed border-neu-black/30 p-12 text-center">
              <p className="font-body text-sm text-neu-black/40">
                Tidak ada pesanan dengan filter ini.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredOrders.map((order) => {
                const cfg = STATUS_BG[order.status] ?? { bg: 'bg-neu-black/20', text: 'text-neu-black' };
                const lastProgress = order.progressReports?.length
                  ? order.progressReports[order.progressReports.length - 1].progressPercentage
                  : null;
                const daysLeft = order.deadline
                  ? Math.ceil((new Date(order.deadline) - new Date()) / (1000 * 60 * 60 * 24))
                  : null;
                const isUrgent  = daysLeft !== null && daysLeft <= 3  && !['completed','canceled'].includes(order.status);
                const isWarning = daysLeft !== null && daysLeft <= 7  && daysLeft > 3 && !['completed','canceled'].includes(order.status);
                return (
                  <div key={order.id}
                    onClick={() => navigate(`/my-orders/${order.id}`)}
                    className="bg-neu-white border-2 border-neu-black shadow-neu hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neu-lg cursor-pointer p-5 flex flex-col gap-3 transition-all duration-150">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn('inline-block px-2 py-0.5 border-2 border-neu-black font-mono font-bold text-xs uppercase', cfg.bg, cfg.text)}>
                          {t(`status.${order.status}`, { defaultValue: order.status })}
                        </span>
                        {isUrgent  && <span className="inline-block px-2 py-0.5 border-2 border-neu-accent bg-neu-accent text-neu-white font-mono font-bold text-[9px] uppercase">⚠ Mendesak</span>}
                        {isWarning && <span className="inline-block px-2 py-0.5 border-2 border-[#F97316] bg-[#F97316] text-neu-white font-mono font-bold text-[9px] uppercase">Segera</span>}
                      </div>
                      <span className="font-mono text-xs text-neu-black/40 whitespace-nowrap flex-shrink-0">{fmtDate(order.createdAt)}</span>
                    </div>
                    <h3 className="font-display font-bold text-base text-neu-black leading-tight">{order.title}</h3>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-body text-neu-black/60">{fmt(order.totalPrice)}</span>
                      <span className={cn('font-mono text-xs', isUrgent ? 'text-neu-accent font-bold' : isWarning ? 'text-[#F97316] font-bold' : 'text-neu-black/40')}>
                        Deadline: {fmtDate(order.deadline)}
                        {daysLeft !== null && daysLeft >= 0 && !['completed','canceled'].includes(order.status) && (
                          <span className="ml-1">({daysLeft}h)</span>
                        )}
                      </span>
                    </div>
                    {lastProgress !== null && (
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="font-mono text-xs text-neu-black/50">Progress</span>
                          <span className="font-mono text-xs font-bold text-neu-blue">{lastProgress}%</span>
                        </div>
                        <div className="h-2 border border-neu-black bg-neu-bg">
                          <div className="h-full bg-neu-blue" style={{ width: `${lastProgress}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </PageLayout>
  );
}
