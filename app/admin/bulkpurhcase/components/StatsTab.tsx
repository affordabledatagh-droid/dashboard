// app/admin/bulk-purchase/components/StatsTab.tsx
'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '../api';
import { COLORS } from '@/lib/constants/colors';

interface StatsShape {
  today: { orders: number; spent: number };
  thisMonth: { orders: number; spent: number };
  allTime: { orders: number; spent: number };
  statusBreakdown: Record<string, number>; // e.g. { completed: 3 } or {}
  networkBreakdown: { network: string; orders: number; spent: number }[];
  apiKey: { name: string; createdAt: string; lastUsed: string; expiresAt: string | null };
}

export default function StatsTab() {
  const [balance, setBalance] = useState<number | null>(null);
  const [stats, setStats]     = useState<StatsShape | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    Promise.all([
      apiFetch('/balance'),
      apiFetch('/usage/stats'),
    ]).then(([balRes, statsRes]) => {
      console.log('[StatsTab] balance raw:', JSON.stringify(balRes, null, 2));
      console.log('[StatsTab] stats raw:', JSON.stringify(statsRes, null, 2));

      // balance endpoint returns { status, data: { balance } }
      setBalance(balRes?.data?.balance ?? balRes?.balance ?? 0);

      // stats endpoint returns the stats object directly at top level (no .data wrapper)
      if (statsRes?.today) {
        setStats(statsRes);
      } else if (statsRes?.data?.today) {
        setStats(statsRes.data);
      } else {
        console.warn('[StatsTab] Unexpected stats shape:', statsRes);
        setError('Unexpected response shape — check console');
      }
    })
    .catch((e) => {
      console.error('[StatsTab] fetch error:', e);
      setError('Failed to load stats');
    })
    .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ color: COLORS.muted }}>Loading stats…</p>;
  if (error)   return <p style={{ color: '#ef4444' }}>Error: {error}</p>;
  if (!stats)  return null;

  const cards = [
    { label: 'Wallet Balance',  value: `GHS ${Number(balance ?? 0).toFixed(2)}`,        sub: null },
    { label: 'Today',          value: `${stats.today.orders} orders`,                   sub: `GHS ${Number(stats.today.spent).toFixed(2)} spent` },
    { label: 'This Month',     value: `${stats.thisMonth.orders} orders`,               sub: `GHS ${Number(stats.thisMonth.spent).toFixed(2)} spent` },
    { label: 'All Time',       value: `${stats.allTime.orders} orders`,                 sub: `GHS ${Number(stats.allTime.spent).toFixed(2)} spent` },
  ];

  // statusBreakdown is a plain object e.g. {} or { completed: 3, failed: 1 }
  const breakdown = stats.statusBreakdown ?? {};
  const completed = breakdown['completed'] ?? 0;
  const pending   = breakdown['pending']   ?? 0;
  const failed    = breakdown['failed']    ?? 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
        {cards.map((c) => (
          <div key={c.label} style={{ background: COLORS.surface, border: `1.5px solid ${COLORS.border}`, borderRadius: 12, padding: 18 }}>
            <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
              {c.label}
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.white }}>{c.value}</div>
            {c.sub && <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 4 }}>{c.sub}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}