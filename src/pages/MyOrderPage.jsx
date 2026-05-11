import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { cn } from '../utils/cn';
import { authService } from '../services/auth.service';
import { orderService } from '../services/order.service';
import { Sidebar } from '../components/layout/Sidebar';
import { Navbar } from '../components/layout/Navbar';
import { AlertContainer } from '../components/ui/Alert';
import { useAlert } from '../hooks/useAlert';

const STATUS_CONFIG = {
  pending:     { label: 'Pending',     bg: 'bg-neu-primary', text: 'text-neu-black' },
  in_progress: { label: 'In Progress', bg: 'bg-neu-blue',    text: 'text-neu-white' },
  testing:     { label: 'Testing',     bg: 'bg-neu-purple',  text: 'text-neu-white' },
  revision:    { label: 'Revisi',      bg: 'bg-[#F97316]',   text: 'text-neu-white' },
  completed:   { label: 'Selesai',     bg: 'bg-neu-green',   text: 'text-neu-white' },
  canceled:    { label: 'Dibatalkan',  bg: 'bg-neu-accent',  text: 'text-neu-white' },
};

export default function MyOrderPage() {
  const navigate = useNavigate();
  const alert    = useAlert();

  const [user,      setUser]      = useState(null);
  const [orders,    setOrders]    = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const headerRef = useRef(null);

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

  useEffect(() => {
    if (!isLoading && headerRef.current) {
      gsap.from(headerRef.current, { y: 20, opacity: 0, duration: 0.5, ease: 'power2.out' });
    }
  }, [isLoading]);

  const fmt = (val) => val ? `Rp ${Number(val).toLocaleString('id-ID')}` : '—';
  const fmtDate = (val) => val ? new Date(val).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' }) : '—';

  if (isLoading) return (
    <div className="min-h-screen bg-neu-bg flex items-center justify-center">
      <p className="font-display font-bold text-neu-black animate-pulse">Memuat...</p>
    </div>
  );

  return (
    <>
      <AlertContainer alerts={alert.alerts} onDismiss={alert.dismiss} />
      <div className="flex min-h-screen bg-neu-bg">
        <Sidebar user={user} />
        <div className="flex-1 ml-64 flex flex-col">
          <Navbar title="Pesanan Saya" user={user} />
          <main className="flex-1 p-6 overflow-y-auto">

            {orders.length === 0 ? (
              <div className="border-2 border-dashed border-neu-black/30 p-16 text-center">
                <p className="font-display font-bold text-xl text-neu-black/40">Belum ada pesanan.</p>
                <p className="font-body text-sm text-neu-black/30 mt-1">Hubungi admin untuk membuat pesanan baru.</p>
              </div>
            ) : (
              <div ref={headerRef} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {orders.map((order, idx) => {
                  const cfg = STATUS_CONFIG[order.status] ?? { label: order.status, bg: 'bg-neu-black/20', text: 'text-neu-black' };
                  const lastProgress = order.progressReports?.length
                    ? order.progressReports[order.progressReports.length - 1].progressPercentage
                    : null;
                  return (
                    <div key={order.id}
                      onClick={() => navigate(`/my-orders/${order.id}`)}
                      className="bg-neu-white border-2 border-neu-black shadow-neu hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neu-lg transition-all duration-150 cursor-pointer p-5 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className={cn('inline-block px-2 py-0.5 border-2 border-neu-black font-mono font-bold text-xs uppercase', cfg.bg, cfg.text)}>
                          {cfg.label}
                        </span>
                        <span className="font-mono text-xs text-neu-black/40">{fmtDate(order.createdAt)}</span>
                      </div>
                      <h3 className="font-display font-bold text-base text-neu-black leading-tight">{order.title}</h3>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-body text-neu-black/60">{fmt(order.totalPrice)}</span>
                        <span className="font-mono text-xs text-neu-black/40">Deadline: {fmtDate(order.deadline)}</span>
                      </div>
                      {lastProgress !== null && (
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="font-mono text-xs text-neu-black/50">Progress</span>
                            <span className="font-mono text-xs font-bold text-neu-blue">{lastProgress}%</span>
                          </div>
                          <div className="h-2 border border-neu-black bg-neu-bg">
                            <div className="h-full bg-neu-blue transition-all duration-300" style={{ width: `${lastProgress}%` }} />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
