import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '../utils/cn';
import { authService } from '../services/auth.service';
import { orderService } from '../services/order.service';
import { clientService } from '../services/client.service';
import { PageLayout } from '../components/layout/PageLayout';
import { useAlert } from '../hooks/useAlert';
import { PageLoader } from '../components/ui/PageLoader';

const STATUS_BG = {
  pending:     { bg: 'bg-neu-primary', text: 'text-neu-black' },
  in_progress: { bg: 'bg-neu-blue',    text: 'text-neu-white' },
  testing:     { bg: 'bg-neu-purple',  text: 'text-neu-white' },
  revision:    { bg: 'bg-[#F97316]',   text: 'text-neu-white' },
  completed:   { bg: 'bg-neu-green',   text: 'text-neu-white' },
  canceled:    { bg: 'bg-neu-accent',  text: 'text-neu-white' },
};

function StatusBadge({ status }) {
  const { t } = useTranslation();
  const cfg = STATUS_BG[status] ?? { bg: 'bg-neu-black/20', text: 'text-neu-black' };
  return (
    <span className={cn('inline-block px-2 py-0.5 border-2 border-neu-black font-mono font-bold text-xs uppercase', cfg.bg, cfg.text)}>
      {t(`status.${status}`, { defaultValue: status })}
    </span>
  );
}

function StatCard({ label, value, valueColor, barColor, onClick }) {
  return (
    <div onClick={onClick}
      className={cn('bg-neu-white border-2 border-neu-black shadow-neu p-5 flex flex-col gap-2', onClick && 'cursor-pointer hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neu-lg transition-all duration-150')}>
      {barColor && <div className="h-1 w-8" style={{ backgroundColor: barColor }} />}
      <p className="font-body text-xs text-neu-black/50 uppercase tracking-wide">{label}</p>
      <p className={cn('font-display font-bold text-3xl leading-none', valueColor ?? 'text-neu-black')}>{value}</p>
    </div>
  );
}

function AdminDashboard({ user, orders, clients, navigate }) {
  const { t } = useTranslation();
  const totalOrders   = orders.length;
  const totalClients  = clients.length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const inProgress    = orders.filter(o => o.status === 'in_progress').length;
  const recentOrders  = [...orders].slice(0, 5);
  const needAction    = orders.filter(o => o.status === 'pending').slice(0, 5);
  const fmtDate = (val) => val ? new Date(val).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
  const fmt     = (val) => val ? `Rp ${Number(val).toLocaleString('id-ID')}` : '—';

  return (
    <>
      <div className="mb-6 p-6 bg-neu-white border-2 border-neu-black shadow-neu" style={{ borderLeftWidth: '6px', borderLeftColor: '#FF5C5C' }}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <span className="inline-block px-3 py-1 border-2 border-neu-black mb-3 font-mono font-bold text-xs uppercase tracking-widest bg-neu-accent text-neu-white">
              {t('dashboard.adminBadge')}
            </span>
            <h2 className="font-display font-bold text-2xl lg:text-3xl text-neu-black">
              {t('dashboard.adminGreeting', { name: user?.fullName })}
            </h2>
            <p className="font-body text-sm text-neu-black/60 mt-1">{t('dashboard.adminSubtitle')}</p>
          </div>
          <div className="w-16 h-16 border-2 border-neu-black bg-neu-accent flex items-center justify-center flex-shrink-0">
            <span className="font-display font-bold text-2xl text-neu-white">{user?.fullName?.charAt(0)?.toUpperCase() ?? '?'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label={t('dashboard.totalOrders')}  value={totalOrders}   valueColor="text-neu-black"   barColor="#0D0D0D" onClick={() => navigate('/orders')} />
        <StatCard label={t('dashboard.totalClients')} value={totalClients}  valueColor="text-neu-blue"    barColor="#4D61FF" onClick={() => navigate('/clients')} />
        <StatCard label={t('dashboard.needAction')}   value={pendingOrders} valueColor="text-neu-primary" barColor="#FFD000" onClick={() => navigate('/orders')} />
        <StatCard label={t('dashboard.inProgress')}   value={inProgress}    valueColor="text-neu-green"   barColor="#00C48C" onClick={() => navigate('/orders')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-neu-white border-2 border-neu-black shadow-neu overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b-2 border-neu-black">
            <h3 className="font-display font-bold text-sm uppercase tracking-wide">{t('dashboard.recentOrders')}</h3>
            <button onClick={() => navigate('/orders')} className="font-mono text-xs text-neu-blue hover:underline">{t('dashboard.viewAll')}</button>
          </div>
          {recentOrders.length === 0 ? (
            <p className="px-5 py-8 text-center font-body text-sm text-neu-black/40">{t('dashboard.noOrders')}</p>
          ) : (
            <div className="divide-y-2 divide-neu-black">
              {recentOrders.map(o => (
                <div key={o.id} onClick={() => navigate(`/orders/${o.id}`)}
                  className="px-5 py-3 flex items-center gap-3 hover:bg-neu-bg transition-colors cursor-pointer">
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-sm text-neu-black truncate">{o.title}</p>
                    <p className="font-mono text-xs text-neu-black/40 truncate">{o.clientName ?? '—'}</p>
                  </div>
                  <StatusBadge status={o.status} />
                  <p className="font-mono text-xs text-neu-black/40 whitespace-nowrap hidden sm:block">{fmtDate(o.deadline)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-neu-white border-2 border-neu-black shadow-neu overflow-hidden">
          <div className="px-5 py-4 border-b-2 border-neu-black">
            <h3 className="font-display font-bold text-sm uppercase tracking-wide">{t('dashboard.pendingOrders')}</h3>
            <p className="font-mono text-xs text-neu-black/40 mt-0.5">{t('dashboard.pendingSubtitle')}</p>
          </div>
          {needAction.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="font-body text-sm text-neu-black/40">{t('dashboard.noPending')}</p>
              <p className="font-mono text-xs text-neu-green mt-1">{t('dashboard.allGood')}</p>
            </div>
          ) : (
            <div className="divide-y-2 divide-neu-black">
              {needAction.map(o => (
                <div key={o.id} onClick={() => navigate(`/orders/${o.id}`)}
                  className="px-5 py-3 hover:bg-neu-bg transition-colors cursor-pointer">
                  <p className="font-display font-bold text-sm text-neu-black truncate">{o.title}</p>
                  <p className="font-mono text-xs text-neu-black/40">{o.clientName ?? '—'}</p>
                  {o.totalPrice && <p className="font-mono text-xs text-neu-primary font-bold mt-0.5">{fmt(o.totalPrice)}</p>}
                </div>
              ))}
            </div>
          )}
          {needAction.length > 0 && (
            <div className="px-5 py-3 border-t-2 border-neu-black">
              <button onClick={() => navigate('/orders')}
                className="w-full py-2 bg-neu-primary border-2 border-neu-black shadow-neu-sm font-display font-bold text-xs uppercase text-neu-black hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-150">
                {t('dashboard.manageOrders')}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function ClientDashboard({ user, orders, navigate }) {
  const { t } = useTranslation();
  const totalOrders  = orders.length;
  const activeOrders = orders.filter(o => !['completed', 'canceled'].includes(o.status)).length;
  const allReports   = orders.flatMap(o => o.progressReports ?? []);
  const latestReport = allReports.length ? allReports.reduce((a, b) => new Date(a.reportedAt) > new Date(b.reportedAt) ? a : b) : null;
  const latestProgress = latestReport?.progressPercentage ?? 0;
  const fmtDate = (val) => val ? new Date(val).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
  const fmt     = (val) => val ? `Rp ${Number(val).toLocaleString('id-ID')}` : '—';

  return (
    <>
      <div className="mb-6 p-6 bg-neu-white border-2 border-neu-black shadow-neu" style={{ borderLeftWidth: '6px', borderLeftColor: '#00C48C' }}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <span className="inline-block px-3 py-1 border-2 border-neu-black mb-3 font-mono font-bold text-xs uppercase tracking-widest bg-neu-green text-neu-white">
              {t('dashboard.clientBadge')}
            </span>
            <h2 className="font-display font-bold text-2xl lg:text-3xl text-neu-black">
              {t('dashboard.clientGreeting', { name: user?.fullName })}
            </h2>
            <p className="font-body text-sm text-neu-black/60 mt-1">{t('dashboard.clientSubtitle')}</p>
          </div>
          <button onClick={() => navigate('/my-orders/new')}
            className="px-4 py-2.5 bg-neu-primary border-2 border-neu-black shadow-neu font-display font-bold text-xs uppercase tracking-wide text-neu-black transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm">
            {t('dashboard.createOrder')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label={t('dashboard.totalOrders')}    value={totalOrders}          valueColor="text-neu-black"  barColor="#0D0D0D" onClick={() => navigate('/my-orders')} />
        <StatCard label={t('dashboard.activeOrders')}   value={activeOrders}         valueColor="text-neu-blue"   barColor="#4D61FF" onClick={() => navigate('/my-orders')} />
        <StatCard label={t('dashboard.latestProgress')} value={`${latestProgress}%`} valueColor={latestProgress === 100 ? 'text-neu-green' : 'text-neu-blue'} barColor="#00C48C" />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-bold text-sm text-neu-black uppercase tracking-wide">{t('dashboard.myOrders')}</h3>
          <button onClick={() => navigate('/my-orders')} className="font-mono text-xs text-neu-blue hover:underline">{t('dashboard.viewAll')}</button>
        </div>

        {orders.length === 0 ? (
          <div className="bg-neu-white border-2 border-dashed border-neu-black p-12 text-center">
            <p className="font-display font-bold text-lg text-neu-black/40 mb-3">{t('dashboard.noOrdersClient')}</p>
            <button onClick={() => navigate('/my-orders/new')}
              className="px-5 py-2.5 bg-neu-primary border-2 border-neu-black shadow-neu font-display font-bold text-xs uppercase text-neu-black hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm transition-all duration-150">
              {t('dashboard.createFirstOrder')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {orders.slice(0, 6).map(o => {
              const cfg = STATUS_BG[o.status] ?? { bg: 'bg-neu-black/20', text: 'text-neu-black' };
              const lastPct = o.progressReports?.length ? o.progressReports[o.progressReports.length - 1].progressPercentage : null;
              return (
                <div key={o.id} onClick={() => navigate(`/my-orders/${o.id}`)}
                  className="bg-neu-white border-2 border-neu-black shadow-neu hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neu-lg transition-all duration-150 cursor-pointer p-5">
                  <div className="flex items-center justify-between mb-2">
                    <StatusBadge status={o.status} />
                    <span className="font-mono text-xs text-neu-black/40">{fmtDate(o.deadline)}</span>
                  </div>
                  <p className="font-display font-bold text-sm text-neu-black leading-tight mb-1">{o.title}</p>
                  {o.totalPrice && <p className="font-mono text-xs text-neu-black/50 mb-2">{fmt(o.totalPrice)}</p>}
                  {lastPct !== null && (
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-mono text-xs text-neu-black/40">{t('dashboard.progress')}</span>
                        <span className="font-mono text-xs font-bold text-neu-blue">{lastPct}%</span>
                      </div>
                      <div className="h-2 border border-neu-black bg-neu-bg">
                        <div className="h-full bg-neu-blue" style={{ width: `${lastPct}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const alert    = useAlert();
  const { t }    = useTranslation();

  const [user,      setUser]      = useState(null);
  const [orders,    setOrders]    = useState([]);
  const [clients,   setClients]   = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    authService.getMe()
      .then(async (res) => {
        const u = res.data;
        setUser(u);
        const [ordersRes, clientsRes] = await Promise.all([
          orderService.getAll().catch(() => ({ data: [] })),
          u.role === 'admin' ? clientService.getAll().catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
        ]);
        setOrders(ordersRes.data ?? []);
        setClients(clientsRes.data ?? []);
      })
      .catch(() => navigate('/login'))
      .finally(() => setIsLoading(false));
  }, [navigate]);

  if (isLoading) return <PageLoader />;

  return (
    <PageLayout user={user} title="Dashboard" alert={alert}>
      {user?.role === 'admin'
        ? <AdminDashboard user={user} orders={orders} clients={clients} navigate={navigate} />
        : <ClientDashboard user={user} orders={orders} navigate={navigate} />
      }
    </PageLayout>
  );
}
