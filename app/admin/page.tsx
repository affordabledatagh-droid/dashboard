'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { COLORS, NETWORK_COLORS } from '@/lib/constants/colors';
import StatCard from '@/components/admin/StatCard';
import { BarChart, Sparkline, dayLabel } from '@/components/admin/Charts';
import { adminApi, Analytics, Earner } from '@/lib/utils/adminApi';
import { money } from '@/lib/utils/format';
import { HiExclamationTriangle } from 'react-icons/hi2';

const RANGES = [7, 14, 30, 90];
const LOW_MHANY_BALANCE = 100; // GH₵ — below this the wallet is close to failing orders

const card: React.CSSProperties = {
  background: COLORS.surface, border: `1.5px solid ${COLORS.border}`, borderRadius: 14, padding: 'clamp(14px, 3vw, 20px)', minWidth: 0,
};

function Skeleton({ h = 90 }: { h?: number }) {
  return <div className="skeleton" style={{ height: h, borderRadius: 14 }} />;
}

const pct = (a: number, b?: number | null) => (b ? Math.round(((a - b) / b) * 100) : undefined);

export default function AdminDashboard() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'all' | 'agent' | 'sub_agent'>('all');

  useEffect(() => {
    let off = false;
    setLoading(true); setError('');
    adminApi.getAnalytics(days)
      .then(r => { if (!off) setData(r.data); })
      .catch(e => { if (!off) setError(e.message); })
      .finally(() => { if (!off) setLoading(false); });
    return () => { off = true; };
  }, [days]);

  const earners: Earner[] = useMemo(() => {
    if (!data) return [];
    return tab === 'agent' ? data.topAgents : tab === 'sub_agent' ? data.topSubAgents : data.topEarners;
  }, [data, tab]);

  const alerts = useMemo(() => {
    if (!data) return [];
    const a = data.attention, out: { text: string; href?: string; tone: 'danger' | 'warn' }[] = [];
    if (a.pricingAlerts > 0) out.push({ tone: 'danger', href: '/admin/packages', text: `${a.pricingAlerts} package${a.pricingAlerts > 1 ? 's are' : ' is'} enabled here but no longer listed by Mhany. Customers can buy them but we can't fulfil them.` });
    if (a.belowMhany > 0) out.push({ tone: 'danger', href: '/admin/packages', text: `${a.belowMhany} package${a.belowMhany > 1 ? 's are' : ' is'} priced below Mhany's price, so each sale loses money.` });
    if (data.mhanyBalance && data.mhanyBalance.balance < LOW_MHANY_BALANCE) out.push({ tone: 'danger', text: `Mhany wallet is low (${money(data.mhanyBalance.balance)}). Top up to keep orders flowing.` });
    if (a.fulfilmentErrors > 0) out.push({ tone: 'warn', text: `${a.fulfilmentErrors} unresolved fulfilment error${a.fulfilmentErrors > 1 ? 's' : ''} (orders that didn't reach Mhany).` });
    if (a.pendingWithdrawals > 0) out.push({ tone: 'warn', href: '/admin/withdrawals', text: `${a.pendingWithdrawals} withdrawal${a.pendingWithdrawals > 1 ? 's' : ''} waiting to be paid out (${money(a.pendingWithdrawalAmount)}).` });
    if (a.placed > 0) out.push({ tone: 'warn', href: '/admin/purchases', text: `${a.placed} paid order${a.placed > 1 ? 's' : ''} still not sent to Mhany.` });
    return out;
  }, [data]);

  return (
    <div style={{ padding: 'clamp(16px, 4vw, 32px) clamp(12px, 3vw, 24px)', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: 800, color: COLORS.white, margin: 0 }}>Overview</h1>
          <p style={{ fontSize: 13, color: COLORS.muted, margin: '6px 0 0' }}>Sales, agent earnings and what needs your attention.</p>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {RANGES.map(r => (
            <button key={r} onClick={() => setDays(r)} style={{
              padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              background: days === r ? COLORS.blue : COLORS.surface, color: days === r ? '#fff' : COLORS.muted,
              border: `1.5px solid ${days === r ? COLORS.blue : COLORS.border}`,
            }}>{r}d</button>
          ))}
        </div>
      </div>

      {error && <div style={{ ...card, borderColor: COLORS.red, color: COLORS.red, marginBottom: 16 }}>{error}</div>}

      {alerts.length > 0 && (
        <div style={{ display: 'grid', gap: 8, marginBottom: 20 }}>
          {alerts.map((a, i) => {
            const c = a.tone === 'danger' ? COLORS.red : COLORS.yellow;
            const body = (
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 14px', borderRadius: 10, background: `${c}14`, border: `1px solid ${c}55`, color: COLORS.white, fontSize: 13, lineHeight: 1.5 }}>
                <HiExclamationTriangle size={18} color={c} style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{ flex: 1 }}>{a.text}</span>
                {a.href && <span style={{ color: c, fontWeight: 700, whiteSpace: 'nowrap' }}>View →</span>}
              </div>
            );
            return a.href ? <Link key={i} href={a.href}>{body}</Link> : <div key={i}>{body}</div>;
          })}
        </div>
      )}

      {loading || !data ? (
        <div style={{ display: 'grid', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12 }}>
            {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} />)}
          </div>
          <Skeleton h={260} /><Skeleton h={260} />
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 12, marginBottom: 20 }}>
            <StatCard label="Orders today" value={data.today.orders} accent={COLORS.white} trend={pct(data.today.orders, data.yesterday?.orders)} />
            <StatCard label={`Revenue (${days}d)`} value={money(data.totals.revenue)} accent={COLORS.blue} />
            <StatCard label={`Agent profit (${days}d)`} value={money(data.totals.agentProfit)} accent="#22c55e" />
            <StatCard label="Our estimated margin" value={data.totals.estimatedMargin === null ? '—' : money(data.totals.estimatedMargin)}
              accent={data.totals.estimatedMargin !== null && data.totals.estimatedMargin < 0 ? COLORS.red : COLORS.yellow} />
            <StatCard label="Mhany wallet" value={data.mhanyBalance ? money(data.mhanyBalance.balance) : 'Unavailable'}
              accent={data.mhanyBalance && data.mhanyBalance.balance < LOW_MHANY_BALANCE ? COLORS.red : COLORS.white} />
            <StatCard label="Pending withdrawals" value={money(data.attention.pendingWithdrawalAmount)} accent={data.attention.pendingWithdrawals ? COLORS.yellow : COLORS.white} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: 16, marginBottom: 20 }}>
            <section style={card}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: COLORS.white, margin: '0 0 2px' }}>Sold per day</h2>
              <p style={{ fontSize: 12, color: COLORS.muted, margin: '0 0 12px' }}>{data.totals.orders.toLocaleString()} orders · avg {money(data.totals.avgOrder)}</p>
              <BarChart color={COLORS.blue} format={money}
                data={data.daily.map(d => ({ label: dayLabel(d.date), value: d.revenue, detail: `${d.orders} orders, ${d.delivered} delivered` }))} />
            </section>
            <section style={card}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: COLORS.white, margin: '0 0 2px' }}>Agent profit per day</h2>
              <p style={{ fontSize: 12, color: COLORS.muted, margin: '0 0 12px' }}>Total earned by agents and sub-agents</p>
              <BarChart color="#22c55e" format={money}
                data={data.daily.map(d => ({ label: dayLabel(d.date), value: d.agentProfit, detail: `${d.orders} orders` }))} />
            </section>
          </div>

          <section style={{ ...card, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: COLORS.white, margin: 0 }}>Top 5 earners</h2>
                <p style={{ fontSize: 12, color: COLORS.muted, margin: '4px 0 0' }}>Profit made from the orders their customers placed, last {days} days</p>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {([['all', 'All'], ['agent', 'Agents'], ['sub_agent', 'Sub-agents']] as const).map(([k, l]) => (
                  <button key={k} onClick={() => setTab(k)} style={{
                    padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    background: tab === k ? COLORS.faint : 'transparent', color: tab === k ? COLORS.white : COLORS.muted,
                    border: `1.5px solid ${tab === k ? COLORS.faint : COLORS.border}`,
                  }}>{l}</button>
                ))}
              </div>
            </div>
            {earners.length === 0 ? (
              <p style={{ color: COLORS.muted, fontSize: 13, textAlign: 'center', padding: '24px 0', margin: 0 }}>No agent profit in this period yet.</p>
            ) : (
              <div style={{ display: 'grid', gap: 8 }}>
                {earners.map((e, i) => {
                  const share = data.totals.agentProfit ? Math.round((e.profit / data.totals.agentProfit) * 100) : 0;
                  return (
                    <div key={`${e.type}:${e.id}`} style={{ display: 'grid', gridTemplateColumns: 'auto minmax(0,1fr) auto', gap: 14, alignItems: 'center', padding: '12px 14px', background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: i === 0 ? COLORS.yellow : COLORS.faint, color: i === 0 ? '#000' : COLORS.white, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13 }}>{i + 1}</div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700, color: COLORS.white, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>{e.shopName}</span>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: e.type === 'agent' ? `${COLORS.blue}25` : `${COLORS.yellow}25`, color: e.type === 'agent' ? COLORS.blueLight : COLORS.yellow }}>{e.type === 'agent' ? 'AGENT' : 'SUB-AGENT'}</span>
                        </div>
                        <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 3 }}>
                          {e.orders} orders · {share}% of agent profit{e.parentShop ? ` · under ${e.parentShop}` : ''}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div className="hide-xs"><Sparkline values={e.daily.map(d => d.profit)} color="#22c55e" /></div>
                        <div style={{ textAlign: 'right', fontWeight: 800, color: '#22c55e', fontSize: 15, whiteSpace: 'nowrap' }}>{money(e.profit)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 16 }}>
            <section style={card}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: COLORS.white, margin: '0 0 14px' }}>By network</h2>
              {data.byNetwork.map(n => {
                const c = (NETWORK_COLORS as any)[n.network]?.bg ?? COLORS.blue;
                const w = Math.round((n.orders / Math.max(data.byNetwork[0].orders, 1)) * 100);
                return (
                  <div key={n.network} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: COLORS.white, marginBottom: 5 }}>
                      <span>{n.network}</span><span style={{ color: COLORS.muted }}>{n.orders} orders · {money(n.revenue)}</span>
                    </div>
                    <div style={{ height: 8, borderRadius: 4, background: COLORS.bg }}><div style={{ width: `${w}%`, height: '100%', borderRadius: 4, background: c }} /></div>
                  </div>
                );
              })}
            </section>
            <section style={card}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: COLORS.white, margin: '0 0 14px' }}>Best-selling packages</h2>
              {data.topPackages.map((p, i) => (
                <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '8px 0', borderTop: i ? `1px solid ${COLORS.border}` : 'none', fontSize: 13 }}>
                  <span style={{ color: COLORS.white }}>{p.name}</span>
                  <span style={{ color: COLORS.muted, whiteSpace: 'nowrap' }}>{p.orders} · {money(p.revenue)}</span>
                </div>
              ))}
            </section>
            <section style={card}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: COLORS.white, margin: '0 0 14px' }}>Order pipeline</h2>
              {([['Not sent to Mhany', data.attention.placed, COLORS.yellow], ['Processing at Mhany', data.attention.processing, COLORS.blueLight], ['Rejected', data.attention.rejected, COLORS.red]] as const).map(([l, v, c]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 13, borderBottom: `1px solid ${COLORS.border}` }}>
                  <span style={{ color: COLORS.white }}>{l}</span><span style={{ color: v ? c : COLORS.muted, fontWeight: 700 }}>{v}</span>
                </div>
              ))}
              <div style={{ marginTop: 12, fontSize: 12, color: COLORS.muted }}>
                Paid with {Object.entries(data.byMethod).map(([k, v]) => `${k} ${v}`).join(' · ') || '—'}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
