// app/admin/bulk-purchase/components/OrdersTab.tsx
'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '../api';
import { COLORS } from '@/lib/constants/colors';

interface Order {
  id: string;
  phoneNumber: string;
  network: string;
  capacity: string;
  price: string | number;
  status: string;
  createdAt: string;
}

export default function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [page, setPage]       = useState(1);
  const [raw, setRaw]         = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    apiFetch(`/usage/history?page=${page}&limit=20`)
      .then((res) => {
        setRaw(res);

        // Log everything so we can see the exact shape
        console.log('[OrdersTab] full response:', JSON.stringify(res, null, 2));
        console.log('[OrdersTab] res.status:', res?.status);
        console.log('[OrdersTab] res.data type:', typeof res?.data, Array.isArray(res?.data) ? '(array)' : '');
        console.log('[OrdersTab] res.data keys:', res?.data ? Object.keys(res.data) : 'no data key');
        console.log('[OrdersTab] res.data.orders:', res?.data?.orders);
        console.log('[OrdersTab] res.data.history:', res?.data?.history);
        console.log('[OrdersTab] res.data.purchases:', res?.data?.purchases);

        if (res.status === 'success') {
          // Try every likely key the API might use
          const found =
            res.data?.orders    ??
            res.data?.history   ??
            res.data?.purchases ??
            (Array.isArray(res.data) ? res.data : null) ??
            [];

          console.log('[OrdersTab] resolved orders array:', found);
          setOrders(found);
        } else {
          console.error('[OrdersTab] API error:', res.message);
          setError(res.message || 'Failed to load orders');
        }
      })
      .catch((e) => {
        console.error('[OrdersTab] fetch threw:', e);
        setError('Network error');
      })
      .finally(() => setLoading(false));
  }, [page]);

  if (loading) return <p style={{ color: COLORS.muted }}>Loading orders…</p>;
  if (error)   return <p style={{ color: '#ef4444' }}>Error: {error}</p>;

  const statusColor = (s: string) =>
    s === 'completed' ? '#22c55e' : s === 'pending' ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ background: COLORS.surface, border: `1.5px solid ${COLORS.border}`, borderRadius: 12, overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 110px 60px 90px 95px 100px', gap: 8, padding: '10px 16px', fontSize: 11, fontWeight: 700, color: COLORS.muted, borderBottom: `1.5px solid ${COLORS.border}`, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <span>Phone</span>
          <span>Network</span>
          <span>GB</span>
          <span>Price</span>
          <span>Status</span>
          <span>Date</span>
        </div>

        {/* Empty state */}
        {orders.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: COLORS.muted, fontSize: 13 }}>
            No orders found. Check the Raw response below to debug.
          </div>
        )}

        {/* Rows */}
        {orders.map((o) => (
          <div key={o.id} style={{ display: 'grid', gridTemplateColumns: '1.2fr 110px 60px 90px 95px 100px', gap: 8, alignItems: 'center', padding: '10px 16px', borderBottom: `1px solid ${COLORS.border}20`, fontSize: 13, color: COLORS.white }}>
            <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{o.phoneNumber}</span>
            <span style={{ fontSize: 12 }}>{o.network}</span>
            <span>{o.capacity} GB</span>
            <span>GHS {Number(o.price).toFixed(2)}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: statusColor(o.status) }}>
              {o.status}
            </span>
            <span style={{ fontSize: 11, color: COLORS.muted }}>
              {new Date(o.createdAt).toLocaleDateString()}
            </span>
          </div>
        ))}

        {/* Pagination */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderTop: `1.5px solid ${COLORS.border}` }}>
          <span style={{ fontSize: 12, color: COLORS.muted }}>{orders.length} orders on this page</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              style={{ padding: '6px 12px', borderRadius: 7, background: COLORS.bg, border: `1.5px solid ${COLORS.border}`, color: COLORS.white, fontSize: 12, cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1 }}>
              Prev
            </button>
            <span style={{ fontSize: 12, color: COLORS.muted }}>Page {page}</span>
            <button onClick={() => setPage((p) => p + 1)} disabled={orders.length < 20}
              style={{ padding: '6px 12px', borderRadius: 7, background: COLORS.bg, border: `1.5px solid ${COLORS.border}`, color: COLORS.white, fontSize: 12, cursor: orders.length < 20 ? 'not-allowed' : 'pointer', opacity: orders.length < 20 ? 0.4 : 1 }}>
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Raw debug — expand this to find exact shape */}
      <details style={{ background: COLORS.surface, border: `1.5px solid ${COLORS.border}`, borderRadius: 12, padding: 14 }}>
        <summary style={{ color: COLORS.muted, fontSize: 12, cursor: 'pointer' }}>
          Raw API response (debug) — expand to find correct field name
        </summary>
        <pre style={{ fontSize: 11, color: COLORS.muted, marginTop: 10, overflow: 'auto', maxHeight: 300 }}>
          {JSON.stringify(raw, null, 2)}
        </pre>
      </details>
    </div>
  );
}
