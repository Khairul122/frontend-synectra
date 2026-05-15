import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { cn } from '../utils/cn';
import { authService } from '../services/auth.service';
import { paymentService } from '../services/payment.service';
import { PageLayout } from '../components/layout/PageLayout';
import { useAlert } from '../hooks/useAlert';
import { PageLoader } from '../components/ui/PageLoader';

const MONTHS_ID = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'];
const MONTHS_FULL = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

function fmtRp(val) {
  if (val >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (val >= 1_000_000)     return `${(val / 1_000_000).toFixed(1).replace(/\.0$/, '')} jt`;
  if (val >= 1_000)         return `${Math.round(val / 1_000)} rb`;
  return val === 0 ? '0' : String(val);
}

function fmtRpFull(val) {
  return `Rp ${Number(val).toLocaleString('id-ID')}`;
}

function niceMax(max) {
  if (max <= 0) return 1_000_000;
  const mag  = Math.pow(10, Math.floor(Math.log10(max)));
  const n    = max / mag;
  const nice = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return nice * mag;
}

function xLabel(label, view) {
  if (view === 'daily')   return label.slice(8);
  if (view === 'monthly') return MONTHS_ID[parseInt(label.slice(5)) - 1];
  return label;
}

function xLabelFull(label, view) {
  if (view === 'daily') {
    const d = new Date(label + 'T00:00:00');
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  if (view === 'monthly') {
    const [y, m] = label.split('-');
    return `${MONTHS_FULL[parseInt(m) - 1]} ${y}`;
  }
  return label;
}

/* ─── SVG Line Chart ───────────────────────────────────────────────────────── */
function LineChart({ data, view }) {
  const [tooltip, setTooltip] = useState(null);
  const svgRef = useRef(null);

  const W = 800, H = 300;
  const PAD = { left: 72, right: 16, top: 24, bottom: 52 };
  const cW  = W - PAD.left - PAD.right;
  const cH  = H - PAD.top  - PAD.bottom;

  const maxVal = Math.max(...data.map(d => d.total), 0);
  const yMax   = niceMax(maxVal);
  const Y_TICKS = 5;

  const xAt = i => PAD.left + (data.length <= 1 ? cW / 2 : (i / (data.length - 1)) * cW);
  const yAt = v => PAD.top + cH - (v / yMax) * cH;

  const step = data.length <= 12 ? 1 : Math.ceil(data.length / 12);

  const coords = data.map((d, i) => `${xAt(i)},${yAt(d.total)}`);
  const linePath = coords.length ? `M ${coords.join(' L ')}` : '';
  const areaPath = coords.length
    ? `M ${xAt(0)},${PAD.top + cH} L ${coords.join(' L ')} L ${xAt(data.length - 1)},${PAD.top + cH} Z`
    : '';

  const handleEnter = (e, d, i) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const sx = rect.width  / W;
    const sy = rect.height / H;
    setTooltip({ screenX: rect.left + xAt(i) * sx, screenY: rect.top + yAt(d.total) * sy, ...d });
  };

  return (
    <div className="relative select-none">
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} width="100%" style={{ overflow: 'visible' }}>

        {/* Y grid + labels */}
        {Array.from({ length: Y_TICKS + 1 }, (_, i) => {
          const val = (i / Y_TICKS) * yMax;
          const y   = yAt(val);
          return (
            <g key={i}>
              <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y}
                stroke="#0D0D0D"
                strokeWidth={i === 0 ? 2 : 0.5}
                strokeDasharray={i === 0 ? undefined : '4 4'}
                opacity={i === 0 ? 1 : 0.2}
              />
              <text x={PAD.left - 6} y={y} textAnchor="end" dominantBaseline="middle"
                fontSize="10" fontFamily="JetBrains Mono, monospace" fill="#0D0D0D" fillOpacity="0.5">
                {fmtRp(val)}
              </text>
            </g>
          );
        })}

        {/* Left axis border */}
        <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + cH}
          stroke="#0D0D0D" strokeWidth="2" />

        {/* Area fill */}
        {areaPath && <path d={areaPath} fill="#4D61FF" opacity="0.08" />}

        {/* Line */}
        {linePath && (
          <path d={linePath} fill="none" stroke="#4D61FF" strokeWidth="2.5"
            strokeLinejoin="round" strokeLinecap="round" />
        )}

        {/* Data points — squares (neubrutalism) */}
        {data.map((d, i) => (
          <rect key={i}
            x={xAt(i) - 5} y={yAt(d.total) - 5} width="10" height="10"
            fill={d.total > 0 ? '#4D61FF' : '#F5F0E8'}
            stroke="#0D0D0D" strokeWidth="2"
            style={{ cursor: 'pointer' }}
            onMouseEnter={e => handleEnter(e, d, i)}
            onMouseLeave={() => setTooltip(null)}
          />
        ))}

        {/* X-axis labels */}
        {data.map((d, i) => {
          if (i % step !== 0 && i !== data.length - 1) return null;
          const rotate = data.length > 15 ? `rotate(-45,${xAt(i)},${PAD.top + cH + 16})` : undefined;
          return (
            <text key={i}
              x={xAt(i)} y={PAD.top + cH + 16}
              textAnchor={data.length > 15 ? 'end' : 'middle'}
              fontSize="10" fontFamily="JetBrains Mono, monospace"
              fill="#0D0D0D" fillOpacity="0.6"
              transform={rotate}>
              {xLabel(d.label, view)}
            </text>
          );
        })}
      </svg>

      {/* Floating tooltip */}
      {tooltip && (
        <div className="fixed z-50 pointer-events-none"
          style={{ left: tooltip.screenX + 14, top: tooltip.screenY - 56 }}>
          <div className="bg-neu-white border-2 border-neu-black shadow-neu px-3 py-2 min-w-36">
            <p className="font-mono text-[10px] text-neu-black/50 uppercase mb-0.5">
              {xLabelFull(tooltip.label, view)}
            </p>
            <p className="font-display font-bold text-sm text-neu-black">{fmtRpFull(tooltip.total)}</p>
            <p className="font-mono text-xs text-neu-black/40">{tooltip.count} transaksi</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Summary Card ─────────────────────────────────────────────────────────── */
function SummaryCard({ label, value, accentClass, delay }) {
  const ref = useRef(null);
  useEffect(() => {
    gsap.from(ref.current, { y: 20, opacity: 0, duration: 0.5, delay, ease: 'power2.out' });
  }, [delay]);
  return (
    <div ref={ref} className={cn('bg-neu-white border-2 border-neu-black shadow-neu p-5', accentClass)}>
      <p className="font-mono text-xs text-neu-black/40 uppercase tracking-wide mb-1">{label}</p>
      <p className="font-display font-bold text-xl text-neu-black">{fmtRpFull(value)}</p>
    </div>
  );
}

/* ─── Main Page ────────────────────────────────────────────────────────────── */
export default function IncomePage() {
  const navigate = useNavigate();
  const alert    = useAlert();
  const now      = new Date();

  const [user,       setUser]       = useState(null);
  const [isLoading,  setIsLoading]  = useState(true);
  const [view,       setView]       = useState('monthly');
  const [year,       setYear]       = useState(now.getFullYear());
  const [month,      setMonth]      = useState(now.getMonth() + 1);
  const [incomeData, setIncomeData] = useState(null);
  const [isFetching, setIsFetching] = useState(false);

  const pageRef = useRef(null);

  useEffect(() => {
    authService.getMe()
      .then(res => {
        const u = res.data;
        if (u.role !== 'admin') { navigate('/dashboard'); return; }
        setUser(u);
      })
      .catch(() => navigate('/login'))
      .finally(() => setIsLoading(false));
  }, [navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchIncome = async () => {
      setIsFetching(true);
      try {
        const res = await paymentService.getIncome(
          view,
          year,
          view === 'daily' ? month : undefined,
        );
        setIncomeData(res.data);
      } catch {
        alert.error('Gagal memuat data pemasukan.');
      } finally {
        setIsFetching(false);
      }
    };
    fetchIncome();
  }, [user, view, year, month]);

  useEffect(() => {
    if (!isLoading && pageRef.current) {
      gsap.from(pageRef.current, { y: 20, opacity: 0, duration: 0.5, ease: 'power2.out' });
    }
  }, [isLoading]);

  if (isLoading) return <PageLoader />;

  const YEAR_RANGE = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);

  const filteredPoints = incomeData?.points ?? [];
  const hasData = filteredPoints.some(p => p.total > 0);
  const periodTotal = filteredPoints.reduce((s, p) => s + p.total, 0);
  const periodCount = filteredPoints.reduce((s, p) => s + p.count, 0);

  const chartTitle =
    view === 'daily'   ? `${MONTHS_FULL[month - 1]} ${year}` :
    view === 'monthly' ? String(year) :
    'Semua Waktu';

  return (
    <PageLayout user={user} title="Pemasukan" alert={alert}>
      <div ref={pageRef} className="max-w-5xl mx-auto space-y-6">

        {/* ─── Header + Controls ─── */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display font-bold text-2xl text-neu-black">Rekap Pemasukan</h2>
            <p className="font-body text-sm text-neu-black/50 mt-0.5">
              Berdasarkan pembayaran yang telah diverifikasi
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {['daily', 'monthly', 'yearly'].map(v => (
              <button key={v} onClick={() => setView(v)}
                className={cn(
                  'px-4 py-2 border-2 border-neu-black font-display font-bold text-xs uppercase transition-all duration-150',
                  view === v
                    ? 'bg-neu-primary shadow-neu text-neu-black'
                    : 'bg-neu-white text-neu-black/60 shadow-neu-sm hover:bg-neu-bg hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none',
                )}>
                {v === 'daily' ? 'Harian' : v === 'monthly' ? 'Bulanan' : 'Tahunan'}
              </button>
            ))}

            {(view === 'monthly' || view === 'daily') && (
              <select value={year} onChange={e => setYear(Number(e.target.value))}
                className="px-3 py-2 bg-neu-white border-2 border-neu-black shadow-neu-sm font-body text-sm outline-none cursor-pointer">
                {YEAR_RANGE.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            )}

            {view === 'daily' && (
              <select value={month} onChange={e => setMonth(Number(e.target.value))}
                className="px-3 py-2 bg-neu-white border-2 border-neu-black shadow-neu-sm font-body text-sm outline-none cursor-pointer">
                {MONTHS_FULL.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
            )}
          </div>
        </div>

        {/* ─── Summary Cards ─── */}
        {incomeData && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard label="Hari Ini"    value={incomeData.summary.today}     accentClass="border-l-4 border-l-neu-primary" delay={0}    />
            <SummaryCard label="Bulan Ini"   value={incomeData.summary.thisMonth} accentClass="border-l-4 border-l-neu-blue"    delay={0.05} />
            <SummaryCard label="Tahun Ini"   value={incomeData.summary.thisYear}  accentClass="border-l-4 border-l-neu-green"   delay={0.1}  />
            <SummaryCard label="Total Semua" value={incomeData.summary.allTime}   accentClass="border-l-4 border-l-neu-purple"  delay={0.15} />
          </div>
        )}

        {/* ─── Chart Card ─── */}
        <div className="bg-neu-white border-2 border-neu-black shadow-neu">

          {/* Chart Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b-2 border-neu-black">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-neu-blue" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
              <h3 className="font-display font-bold text-sm text-neu-black uppercase tracking-wide">
                Grafik Pemasukan — {chartTitle}
              </h3>
            </div>
            <div className="flex items-center gap-3">
              {hasData && (
                <span className="font-mono text-xs text-neu-black/50">
                  Total: <strong className="text-neu-black">{fmtRpFull(periodTotal)}</strong>
                </span>
              )}
              {isFetching && (
                <div className="w-4 h-4 border-2 border-neu-black border-t-neu-primary animate-spin" />
              )}
            </div>
          </div>

          {/* Chart Body */}
          <div className="p-6">
            {isFetching ? (
              <div className="h-72 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-neu-black border-t-neu-primary animate-spin" />
              </div>
            ) : !hasData ? (
              <div className="h-72 flex flex-col items-center justify-center gap-3">
                <svg className="w-12 h-12 text-neu-black/20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                </svg>
                <p className="font-display font-bold text-sm text-neu-black/30 uppercase tracking-wide">
                  Belum ada pemasukan pada periode ini
                </p>
              </div>
            ) : (
              <LineChart data={filteredPoints} view={view} />
            )}
          </div>

          {/* Data Table */}
          {hasData && !isFetching && (
            <div className="border-t-2 border-neu-black overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-neu-black/5">
                    <th className="px-5 py-2.5 text-left font-display font-bold text-xs uppercase text-neu-black/50 border-r-2 border-neu-black/10 border-b-2 border-neu-black/10">
                      Periode
                    </th>
                    <th className="px-5 py-2.5 text-right font-display font-bold text-xs uppercase text-neu-black/50 border-r-2 border-neu-black/10 border-b-2 border-neu-black/10">
                      Pemasukan
                    </th>
                    <th className="px-5 py-2.5 text-right font-display font-bold text-xs uppercase text-neu-black/50 border-b-2 border-neu-black/10">
                      Transaksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[...filteredPoints]
                    .reverse()
                    .filter(p => p.total > 0)
                    .map((p, i) => (
                      <tr key={p.label}
                        className={cn(
                          'border-b border-neu-black/10 hover:bg-neu-bg transition-colors duration-100',
                          i % 2 === 0 ? 'bg-neu-white' : 'bg-neu-bg/50',
                        )}>
                        <td className="px-5 py-2.5 font-mono text-xs text-neu-black border-r-2 border-neu-black/10">
                          {xLabelFull(p.label, view)}
                        </td>
                        <td className="px-5 py-2.5 font-display font-bold text-sm text-neu-black text-right border-r-2 border-neu-black/10">
                          {fmtRpFull(p.total)}
                        </td>
                        <td className="px-5 py-2.5 font-mono text-sm text-neu-black/60 text-right">
                          {p.count}
                        </td>
                      </tr>
                    ))}
                </tbody>
                <tfoot>
                  <tr className="bg-neu-primary border-t-2 border-neu-black">
                    <td className="px-5 py-2.5 font-display font-bold text-xs uppercase text-neu-black border-r-2 border-neu-black">
                      Total Periode
                    </td>
                    <td className="px-5 py-2.5 font-display font-bold text-sm text-neu-black text-right border-r-2 border-neu-black">
                      {fmtRpFull(periodTotal)}
                    </td>
                    <td className="px-5 py-2.5 font-display font-bold text-sm text-neu-black text-right">
                      {periodCount}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

      </div>
    </PageLayout>
  );
}
