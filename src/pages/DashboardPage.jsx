import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '../utils/cn';
import { authService } from '../services/auth.service';
import { orderService } from '../services/order.service';
import { clientService } from '../services/client.service';
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
      className={cn('bg-neu-white border-2 border-neu-black shadow-neu p-5 flex flex-col gap-2', onClick && 'cursor-pointer hover:shadow-neu-lg')}>
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
                  className="px-5 py-3 flex items-center gap-3 hover:bg-neu-bg cursor-pointer">
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
                  className="px-5 py-3 hover:bg-neu-bg cursor-pointer">
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
                className="w-full py-2 bg-neu-primary border-2 border-neu-black shadow-neu-sm font-display font-bold text-xs uppercase text-neu-black hover:shadow-none">
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

  const stepDefs = [
    { key: 'pending',     label: 'Menunggu',  icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
    { key: 'in_progress', label: 'Dikerjakan',icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg> },
    { key: 'testing',     label: 'Testing',   icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4"/><path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"/></svg> },
    { key: 'revision',    label: 'Revisi',    icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> },
    { key: 'completed',   label: 'Selesai',   icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> },
  ];
  const latestActiveOrder = orders.find(o => !['completed','canceled'].includes(o.status));
  const currentStepIdx = latestActiveOrder ? stepDefs.findIndex(s => s.key === latestActiveOrder.status) : -1;

  return (
    <>
      {/* ── Header greeting + quick actions ── */}
      <div className="mb-6 p-6 bg-neu-white border-2 border-neu-black shadow-neu" style={{ borderLeftWidth: '6px', borderLeftColor: '#00C48C' }}>
        <span className="inline-block px-3 py-1 border-2 border-neu-black mb-3 font-mono font-bold text-xs uppercase tracking-widest bg-neu-green text-neu-white">
          {t('dashboard.clientBadge')}
        </span>
        <h2 className="font-display font-bold text-2xl lg:text-3xl text-neu-black">
          {t('dashboard.clientGreeting', { name: user?.fullName })}
        </h2>
        <p className="font-body text-sm text-neu-black/60 mt-1 mb-4">{t('dashboard.clientSubtitle')}</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => navigate('/my-orders/new')}
            className="flex items-center gap-2 px-4 py-2 bg-neu-primary border-2 border-neu-black shadow-neu-sm font-display font-bold text-xs uppercase text-neu-black hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-150">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
            {t('dashboard.createOrder')}
          </button>
          <button onClick={() => navigate('/my-orders')}
            className="flex items-center gap-2 px-4 py-2 bg-neu-white border-2 border-neu-black font-display font-bold text-xs uppercase text-neu-black/70 hover:text-neu-black transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
            {t('dashboard.myOrders')}
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label={t('dashboard.totalOrders')}    value={totalOrders}          valueColor="text-neu-black"  barColor="#0D0D0D" onClick={() => navigate('/my-orders')} />
        <StatCard label={t('dashboard.activeOrders')}   value={activeOrders}         valueColor="text-neu-blue"   barColor="#4D61FF" onClick={() => navigate('/my-orders')} />
        <StatCard label={t('dashboard.latestProgress')} value={`${latestProgress}%`} valueColor={latestProgress === 100 ? 'text-neu-green' : 'text-neu-blue'} barColor="#00C48C" />
      </div>

      {/* ── Order Status Workflow Stepper (jika ada pesanan aktif) ── */}
      {activeOrders > 0 && (
        <div className="border-2 border-neu-black bg-neu-white p-5 mb-6">
          <p className="font-mono font-bold text-[10px] text-neu-black/40 uppercase tracking-widest mb-4">
            Alur Pesanan Aktif
            {latestActiveOrder && (
              <span className="ml-2 text-neu-black/60 normal-case">— {latestActiveOrder.title}</span>
            )}
          </p>
          <div className="flex items-start">
            {stepDefs.map((step, idx) => {
              const isDone    = idx < currentStepIdx;
              const isCurrent = idx === currentStepIdx;
              return (
                <div key={step.key} className="flex items-center flex-1 min-w-0">
                  <div className="flex flex-col items-center min-w-0">
                    <div className={cn(
                      'w-9 h-9 border-2 border-neu-black flex items-center justify-center flex-shrink-0',
                      isDone ? 'bg-neu-green' : isCurrent ? 'bg-neu-primary shadow-neu-sm' : 'bg-neu-bg',
                    )}>
                      {isDone
                        ? <svg className="w-4 h-4 text-neu-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                        : <span className={cn('', isCurrent ? 'text-neu-black' : 'text-neu-black/30')}>{step.icon}</span>
                      }
                    </div>
                    <p className={cn(
                      'font-mono text-[8px] uppercase tracking-wide mt-1.5 text-center leading-tight px-0.5',
                      isCurrent ? 'text-neu-black font-bold' : isDone ? 'text-neu-green font-bold' : 'text-neu-black/30',
                    )}>
                      {step.label}
                    </p>
                  </div>
                  {idx < stepDefs.length - 1 && (
                    <div className={cn('flex-1 h-0.5 mx-1 mb-5 flex-shrink', isDone ? 'bg-neu-green' : 'bg-neu-black/15')} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Order cards ── */}
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
              const lastPct = o.progressReports?.length ? o.progressReports[o.progressReports.length - 1].progressPercentage : null;
              const daysLeft = o.deadline ? Math.ceil((new Date(o.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : null;
              const isUrgent  = daysLeft !== null && daysLeft <= 3 && !['completed','canceled'].includes(o.status);
              const isWarning = daysLeft !== null && daysLeft <= 7 && daysLeft > 3 && !['completed','canceled'].includes(o.status);
              return (
                <div key={o.id} onClick={() => navigate(`/my-orders/${o.id}`)}
                  className="bg-neu-white border-2 border-neu-black shadow-neu hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neu-lg cursor-pointer p-5 transition-all duration-150">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusBadge status={o.status} />
                      {isUrgent  && <span className="inline-block px-2 py-0.5 border-2 border-neu-accent bg-neu-accent text-neu-white font-mono font-bold text-[9px] uppercase">⚠ Mendesak</span>}
                      {isWarning && <span className="inline-block px-2 py-0.5 border-2 border-[#F97316] bg-[#F97316] text-neu-white font-mono font-bold text-[9px] uppercase">Segera</span>}
                    </div>
                    <span className={cn('font-mono text-xs whitespace-nowrap flex-shrink-0', isUrgent ? 'text-neu-accent font-bold' : isWarning ? 'text-[#F97316] font-bold' : 'text-neu-black/40')}>
                      {fmtDate(o.deadline)}
                    </span>
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

  return (
    <PageLayout user={user} title="Dashboard" alert={alert} isLoading={isLoading}>
      {user && (user.role === 'admin'
        ? <AdminDashboard user={user} orders={orders} clients={clients} navigate={navigate} />
        : <ClientDashboard user={user} orders={orders} navigate={navigate} />
      )}
    </PageLayout>
  );
}
