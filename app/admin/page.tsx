'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { COLORS, NETWORK_COLORS } from '@/lib/constants/colors';
import StatCard from '@/components/admin/StatCard';
import { BarChart, Sparkline } from '@/components/admin/Charts';
import { adminApi, Attention, Breakdown, LeaderCard, Leaders, Metric, Period, Summary } from '@/lib/utils/adminApi';
import { money, weekdayLabel } from '@/lib/utils/format';
import { HiExclamationTriangle } from 'react-icons/hi2';

const GREEN = '#22c55e';
const LOW_MHANY_BALANCE = 100; // GH₵

const PERIODS: { id: Period; label: string }[] = [
  { id: 'today', label: 'Today' }, { id: 'yesterday', label: 'Yesterday' },
  { id: 'week', label: 'This week' }, { id: 'lastweek', label: 'Last week' },
  { id: 'month', label: 'This month' }, { id: 'lastmonth', label: 'Last month' },
];

const card: React.CSSProperties = { background: COLORS.surface, border: `1.5px solid ${COLORS.border}`, borderRadius: 14, padding: 'clamp(14px, 3vw, 20px)', minWidth: 0 };
const h2: React.CSSProperties = { fontSize: 16, fontWeight: 700, color: COLORS.white, margin: 0 };
const sub: React.CSSProperties = { fontSize: 12, color: COLORS.muted, margin: '4px 0 0' };

function Tabs<T extends string>({ value, onChange, items }: { value: T; onChange: (v: T) => void; items: { id: T; label: string }[] }) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {items.map(i => (
        <button key={i.id} onClick={() => onChange(i.id)} style={{
          padding: '7px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
          background: value === i.id ? COLORS.blue : COLORS.surface, color: value === i.id ? '#fff' : COLORS.muted,
          border: `1.5px solid ${value === i.id ? COLORS.blue : COLORS.border}`,
        }}>{i.label}</button>
      ))}
    </div>
  );
}

const Sk = ({ h = 90 }: { h?: number }) => <div className="skeleton" style={{ height: h, borderRadius: 14 }} />;

/** Runs `fn` whenever deps change; keeps the previous data on screen while reloading. */
function useLoad<T>(fn: () => Promise<T>, deps: unknown[], enabled = true) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!enabled) return;
    let off = false;
    setLoading(true); setError('');
    fn().then(d => { if (!off) setData(d); }).catch(e => { if (!off) setError(e.message); }).finally(() => { if (!off) setLoading(false); });
    return () => { off = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, enabled]);
  return { data, error, loading };
}

// ── Needs attention ─────────────────────────────────────────────

function AttentionSection() {
  const { data: a, error } = useLoad(() => adminApi.getAttention().then(r => r.data), []);
  if (error) return <div style={{ ...card, borderColor: COLORS.red, color: COLORS.red, marginBottom: 16, fontSize: 13 }}>{error}</div>;
  if (!a) return <div style={{ marginBottom: 20 }}><Sk h={56} /></div>;

  const items: { text: string; href?: string; tone: 'danger' | 'warn' }[] = [];
  if (a.pricingAlerts > 0) items.push({ tone: 'danger', href: '/admin/packages', text: `${a.pricingAlerts} package${a.pricingAlerts > 1 ? 's are' : ' is'} enabled here but no longer listed by Mhany, so customers can buy what we can't deliver.` });
  if (a.belowMhany > 0) items.push({ tone: 'danger', href: '/admin/packages', text: `${a.belowMhany} package${a.belowMhany > 1 ? 's are' : ' is'} priced below Mhany's price, so every sale loses money.` });
  if (a.mhanyBalance && a.mhanyBalance.balance < LOW_MHANY_BALANCE) items.push({ tone: 'danger', text: `Mhany wallet is low (${money(a.mhanyBalance.balance)}). Top up to keep orders flowing.` });
  if (a.fulfilmentErrors > 0) items.push({ tone: 'warn', text: `${a.fulfilmentErrors} unresolved fulfilment error${a.fulfilmentErrors > 1 ? 's' : ''} (orders that didn't reach Mhany).` });
  if (a.pendingWithdrawals > 0) items.push({ tone: 'warn', href: '/admin/withdrawals', text: `${a.pendingWithdrawals} withdrawal${a.pendingWithdrawals > 1 ? 's' : ''} waiting to be paid out (${money(a.pendingWithdrawalAmount)}).` });
  if (a.placed > 0) items.push({ tone: 'warn', href: '/admin/purchases', text: `${a.placed} paid order${a.placed > 1 ? 's' : ''} still not sent to Mhany.` });

  return (
    <div style={{ marginBottom: 20, display: 'grid', gap: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 12 }}>
        <StatCard label="Mhany wallet" value={a.mhanyBalance ? money(a.mhanyBalance.balance) : 'Unavailable'} accent={a.mhanyBalance && a.mhanyBalance.balance < LOW_MHANY_BALANCE ? COLORS.red : COLORS.white} />
        <StatCard label="Pending withdrawals" value={money(a.pendingWithdrawalAmount)} accent={a.pendingWithdrawals ? COLORS.yellow : COLORS.white} />
        <StatCard label="Processing at Mhany" value={a.processing.toLocaleString()} accent={COLORS.white} />
      </div>
      {items.map((x, i) => {
        const c = x.tone === 'danger' ? COLORS.red : COLORS.yellow;
        const body = (
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 14px', borderRadius: 10, background: `${c}14`, border: `1px solid ${c}55`, color: COLORS.white, fontSize: 13, lineHeight: 1.5 }}>
            <HiExclamationTriangle size={18} color={c} style={{ flexShrink: 0, marginTop: 1 }} />
            <span style={{ flex: 1 }}>{x.text}</span>
            {x.href && <span style={{ color: c, fontWeight: 700, whiteSpace: 'nowrap' }}>View →</span>}
          </div>
        );
        return x.href ? <Link key={i} href={x.href}>{body}</Link> : <div key={i}>{body}</div>;
      })}
    </div>
  );
}

// ── Sales for the chosen period ─────────────────────────────────

function SummarySection({ period }: { period: Period }) {
  const { data, error, loading } = useLoad<Summary>(() => adminApi.getSummary(period).then(r => r.data), [period]);
  if (error) return <div style={{ ...card, color: COLORS.red, fontSize: 13, marginBottom: 20 }}>{error}</div>;
  if (!data) return <div style={{ display: 'grid', gap: 16, marginBottom: 20 }}><Sk h={90} /><Sk h={240} /></div>;

  const t = data.totals;
  const chartLabel = (d: string) => (data.daily.length <= 7 ? weekdayLabel(d) : weekdayLabel(d).split(' ')[1]);
  return (
    <div style={{ opacity: loading ? 0.55 : 1, transition: 'opacity .15s', marginBottom: 20 }}>
      <p style={{ fontSize: 12, color: COLORS.muted, margin: '0 0 12px' }}>{data.range.label} · {data.range.daysLabel}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 12, marginBottom: 16 }}>
        <StatCard label="Orders" value={t.orders.toLocaleString()} accent={COLORS.white} />
        <StatCard label="Revenue" value={money(t.revenue)} accent={COLORS.blue} />
        <StatCard label="Agent profit" value={money(t.agentProfit)} accent={GREEN} />
        <StatCard label="Our estimated margin" value={t.estimatedMargin === null ? '—' : money(t.estimatedMargin)} accent={t.estimatedMargin !== null && t.estimatedMargin < 0 ? COLORS.red : COLORS.yellow} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: 16 }}>
        <section style={card}>
          <h2 style={h2}>Sold per day</h2>
          <p style={{ ...sub, marginBottom: 12 }}>{t.orders.toLocaleString()} orders · avg {money(t.avgOrder)}</p>
          <BarChart color={COLORS.blue} format={money}
            data={data.daily.map(d => ({ label: chartLabel(d.date), value: d.revenue, detail: `${weekdayLabel(d.date)} · ${d.orders} orders, ${d.delivered} delivered` }))} />
        </section>
        <section style={card}>
          <h2 style={h2}>Agent profit per day</h2>
          <p style={{ ...sub, marginBottom: 12 }}>Earned by agents and sub-agents</p>
          <BarChart color={GREEN} format={money}
            data={data.daily.map(d => ({ label: chartLabel(d.date), value: d.agentProfit, detail: `${weekdayLabel(d.date)} · ${d.orders} orders` }))} />
        </section>
      </div>
    </div>
  );
}

// ── Top sellers: today / this week / last week ──────────────────

const LEADER_PERIODS: { id: Period; label: string }[] = [{ id: 'today', label: 'Today' }, { id: 'week', label: 'This week' }, { id: 'lastweek', label: 'Last week' }];
const METRICS: { id: Metric; label: string }[] = [{ id: 'profit', label: 'By profit' }, { id: 'sales', label: 'By sales' }, { id: 'orders', label: 'By orders' }];

function LeadersSection() {
  const [period, setPeriod] = useState<Period>('week');
  const [metric, setMetric] = useState<Metric>('profit');
  const { data, error, loading } = useLoad<Leaders>(() => adminApi.getLeaders(period, metric).then(r => r.data), [period, metric]);

  const value = (c: LeaderCard) => (metric === 'orders' ? `${c.orders} orders` : money(metric === 'sales' ? c.sales : c.profit));

  return (
    <section style={{ ...card, marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
        <div>
          <h2 style={h2}>Top sellers</h2>
          <p style={sub}>{data ? `${data.range.label} · ${data.range.daysLabel}` : 'Loading…'}{data && data.totalPeople > 0 ? ` · ${data.totalPeople} sold` : ''}</p>
        </div>
        <div style={{ display: 'grid', gap: 8, justifyItems: 'end' }}>
          <Tabs value={period} onChange={setPeriod} items={LEADER_PERIODS} />
          <Tabs value={metric} onChange={setMetric} items={METRICS} />
        </div>
      </div>

      {error && <p style={{ color: COLORS.red, fontSize: 13 }}>{error}</p>}
      {!data ? <Sk h={220} /> : (
        <div style={{ opacity: loading ? 0.55 : 1, transition: 'opacity .15s', display: 'grid', gap: 18 }}>
          {data.top.length === 0 ? (
            <p style={{ color: COLORS.muted, fontSize: 13, textAlign: 'center', padding: '20px 0', margin: 0 }}>No sales in this period yet.</p>
          ) : (
            <div style={{ display: 'grid', gap: 8 }}>
              {data.top.map((e, i) => (
                <div key={`${e.type}:${e.id}`} style={{ display: 'grid', gridTemplateColumns: 'auto minmax(0,1fr) auto', gap: 14, alignItems: 'center', padding: '12px 14px', background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: i === 0 ? COLORS.yellow : COLORS.faint, color: i === 0 ? '#000' : COLORS.white, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13 }}>{i + 1}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, color: COLORS.white, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>{e.shopName}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: e.type === 'agent' ? `${COLORS.blue}25` : `${COLORS.yellow}25`, color: e.type === 'agent' ? COLORS.blueLight : COLORS.yellow }}>{e.type === 'agent' ? 'AGENT' : 'SUB-AGENT'}</span>
                    </div>
                    <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 3 }}>{e.orders} orders · {money(e.sales)} sold · {money(e.profit)} profit</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    {e.trend && e.trend.length > 1 && <div className="hide-xs"><Sparkline values={e.trend.map(x => x.value)} color={GREEN} /></div>}
                    <div style={{ fontWeight: 800, color: GREEN, fontSize: 15, whiteSpace: 'nowrap', textAlign: 'right' }}>{value(e)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {data.byDay.length > 0 && (
            <div>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: COLORS.white, margin: '0 0 10px' }}>Winner each day</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8 }}>
                {data.byDay.map(d => (
                  <div key={d.date} style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: '10px 12px' }}>
                    <div style={{ fontSize: 11, color: COLORS.muted, fontWeight: 600, marginBottom: 6 }}>{weekdayLabel(d.date)}</div>
                    {d.top.length === 0 ? <div style={{ fontSize: 12, color: COLORS.muted }}>No sales</div> : d.top.map((p, i) => (
                      <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: i === 0 ? 13 : 11, fontWeight: i === 0 ? 700 : 400, color: i === 0 ? COLORS.white : COLORS.muted, marginTop: i ? 3 : 0 }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{i + 1}. {p.shopName}</span>
                        <span style={{ color: i === 0 ? GREEN : COLORS.muted, whiteSpace: 'nowrap' }}>{metric === 'orders' ? p.orders : money(metric === 'sales' ? p.sales : p.profit).replace('GH₵ ', '')}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

// ── Breakdown (loads only once it scrolls into view) ────────────

function BreakdownSection({ period }: { period: Period }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { rootMargin: '200px' });
    io.observe(el);
    return () => io.disconnect();
  }, [visible]);

  const { data, error, loading } = useLoad<Breakdown>(() => adminApi.getBreakdown(period).then(r => r.data), [period], visible);

  return (
    <div ref={ref} style={{ minHeight: 120 }}>
      {error && <p style={{ color: COLORS.red, fontSize: 13 }}>{error}</p>}
      {!data ? (visible ? <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 16 }}><Sk h={200} /><Sk h={200} /><Sk h={200} /></div> : null) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 16, opacity: loading ? 0.55 : 1, transition: 'opacity .15s' }}>
          <section style={card}>
            <h2 style={{ ...h2, marginBottom: 14 }}>By network</h2>
            {data.byNetwork.length === 0 && <p style={{ color: COLORS.muted, fontSize: 13, margin: 0 }}>No sales yet.</p>}
            {data.byNetwork.map(n => {
              const c = (NETWORK_COLORS as any)[n.network]?.bg ?? COLORS.blue;
              const w = Math.round((n.orders / Math.max(data.byNetwork[0].orders, 1)) * 100);
              return (
                <div key={n.network} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 13, color: COLORS.white, marginBottom: 5 }}>
                    <span>{n.network}</span><span style={{ color: COLORS.muted }}>{n.orders} orders · {money(n.revenue)}</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 4, background: COLORS.bg }}><div style={{ width: `${w}%`, height: '100%', borderRadius: 4, background: c }} /></div>
                </div>
              );
            })}
          </section>
          <section style={card}>
            <h2 style={{ ...h2, marginBottom: 14 }}>Best-selling packages</h2>
            {data.topPackages.map((p, i) => (
              <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '8px 0', borderTop: i ? `1px solid ${COLORS.border}` : 'none', fontSize: 13 }}>
                <span style={{ color: COLORS.white }}>{p.name}</span>
                <span style={{ color: COLORS.muted, whiteSpace: 'nowrap' }}>{p.orders} · {money(p.revenue)}</span>
              </div>
            ))}
          </section>
          <section style={card}>
            <h2 style={{ ...h2, marginBottom: 14 }}>Orders by status</h2>
            {Object.entries(data.byStatus).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 13, borderBottom: `1px solid ${COLORS.border}` }}>
                <span style={{ color: COLORS.white, textTransform: 'capitalize' }}>{k}</span><span style={{ color: COLORS.muted, fontWeight: 700 }}>{v}</span>
              </div>
            ))}
            <div style={{ marginTop: 12, fontSize: 12, color: COLORS.muted }}>
              Paid with {Object.entries(data.byMethod).map(([k, v]) => `${k} ${v}`).join(' · ') || '—'}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [period, setPeriod] = useState<Period>('week');
  const label = PERIODS.find(p => p.id === period)!.label;

  return (
    <div style={{ padding: 'clamp(16px, 4vw, 32px) clamp(12px, 3vw, 24px)', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: 800, color: COLORS.white, margin: 0 }}>Overview</h1>
        <p style={{ fontSize: 13, color: COLORS.muted, margin: '6px 0 0' }}>Weeks run Monday to Sunday. The current week only counts the days that have happened.</p>
      </div>

      <AttentionSection />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        <h2 style={{ ...h2, fontSize: 18 }}>Sales · {label}</h2>
        <Tabs value={period} onChange={setPeriod} items={PERIODS} />
      </div>

      <SummarySection period={period} />
      <LeadersSection />
      <BreakdownSection period={period} />
    </div>
  );
}
