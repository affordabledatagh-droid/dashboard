'use client';

import { useCallback, useEffect, useState } from 'react';
import { COLORS } from '@/lib/constants/colors';
import { adminApi, MhanyOrder, readJson } from '@/lib/utils/adminApi';
import { money, dateTime } from '@/lib/utils/format';

const STATUS: Record<string, string> = { DELIVERED: '#22c55e', PROCESSING: COLORS.yellow, REJECTED: COLORS.red };

/** Latest orders as Mhany sees them (their status is the source of truth for delivery). */
export default function OrdersTab() {
  const [orders, setOrders] = useState<MhanyOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lookup, setLookup] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async (id?: string) => {
    setLoading(true); setError('');
    try {
      const res = id ? await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/mhany/orders?id=${encodeURIComponent(id)}`, { headers: { Authorization: `Bearer ${localStorage.getItem('admin_token') ?? ''}` } }).then(readJson) : await adminApi.mhanyOrders();
      if (res.error) throw new Error(res.error);
      setOrders(Array.isArray(res.data) ? res.data : res.data ? [res.data] : []);
    } catch (e: any) { setError(e.message); setOrders([]); } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const reconcile = async () => {
    setBusy(true);
    try { const r = await adminApi.reconcile(); setError(`Checked ${r.data.checked} processing orders, updated ${r.data.updated}.`); }
    catch (e: any) { setError(e.message); } finally { setBusy(false); }
  };

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input value={lookup} onChange={e => setLookup(e.target.value)} placeholder="Look up a Mhany order ID" style={{ flex: '1 1 220px', maxWidth: 300, padding: '9px 12px', background: COLORS.surface, border: `1.5px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.white, fontSize: 16 }} />
        <button onClick={() => load(lookup.trim() || undefined)} style={btn}>{lookup.trim() ? 'Look up' : 'Latest 10'}</button>
        <button onClick={reconcile} disabled={busy} style={{ ...btn, background: 'transparent', border: `1.5px solid ${COLORS.border}`, color: COLORS.muted }}>
          {busy ? 'Checking…' : 'Sync our processing orders'}
        </button>
      </div>
      {error && <div style={{ fontSize: 13, color: /^Checked/.test(error) ? '#22c55e' : COLORS.red }}>{error}</div>}
      {loading ? <div className="skeleton" style={{ height: 160, borderRadius: 12 }} /> : orders.length === 0 ? <p style={{ color: COLORS.muted, fontSize: 13 }}>No orders found.</p> : (
        <div style={{ background: COLORS.surface, border: `1.5px solid ${COLORS.border}`, borderRadius: 12, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520, fontSize: 13 }}>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                  <td style={td}><div style={{ color: COLORS.white, fontWeight: 600 }}>{o.recipientNumber}</div><div style={{ fontSize: 11, color: COLORS.muted }}>#{o.id}</div></td>
                  <td style={td}>{o.bundleSize}</td>
                  <td style={td}>{money(o.pricePaid)}</td>
                  <td style={{ ...td, color: COLORS.muted }}>{dateTime(o.createdAt)}</td>
                  <td style={td}><span style={{ color: STATUS[o.status] ?? COLORS.muted, fontWeight: 700 }}>{o.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
const td: React.CSSProperties = { padding: '11px 12px', color: COLORS.white };
const btn: React.CSSProperties = { padding: '9px 14px', borderRadius: 8, background: COLORS.blue, border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' };
