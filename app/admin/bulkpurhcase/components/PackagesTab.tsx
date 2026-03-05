// app/admin/bulk-purchase/components/PackagesTab.tsx
'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '../api';
import { COLORS } from '@/lib/constants/colors';

interface Pkg { capacity: string; mb: string; price: string | number; }
interface AllPackages { TELECEL: Pkg[]; YELLO: Pkg[]; AT_PREMIUM: Pkg[]; }

const NETWORKS = ['TELECEL', 'YELLO', 'AT_PREMIUM'] as const;
type Network = typeof NETWORKS[number];

const NETWORK_LABEL: Record<Network, string> = {
  TELECEL: 'Telecel (Vodafone)',
  YELLO: 'MTN Ghana',
  AT_PREMIUM: 'AirtelTigo',
};

const NETWORK_COLOR: Record<Network, string> = {
  TELECEL: '#e2001a',
  YELLO:   '#ffcc00',
  AT_PREMIUM: '#0066b3',
};

export default function PackagesTab() {
  const [data, setData]         = useState<AllPackages | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [active, setActive]     = useState<Network>('YELLO');

  useEffect(() => {
    apiFetch('/data-packages')
      .then((res) => {
        if (res.status === 'success') setData(res.data);
        else setError(res.message || 'Failed');
      })
      .catch(() => setError('Network error'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ color: COLORS.muted }}>Loading packages…</p>;
  if (error)   return <p style={{ color: '#ef4444' }}>Error: {error}</p>;
  if (!data)   return null;

  const pkgs = data[active];
  const color = NETWORK_COLOR[active];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Network Tab Bar */}
      <div style={{ display: 'flex', gap: 8 }}>
        {NETWORKS.map((n) => (
          <button key={n} onClick={() => setActive(n)}
            style={{
              padding: '9px 18px', borderRadius: 9, fontSize: 13, fontWeight: 700,
              border: `1.5px solid ${active === n ? NETWORK_COLOR[n] : COLORS.border}`,
              background: active === n ? `${NETWORK_COLOR[n]}18` : COLORS.surface,
              color: active === n ? NETWORK_COLOR[n] : COLORS.muted,
              cursor: 'pointer', transition: 'all 0.15s',
            }}>
            {NETWORK_LABEL[n]}
          </button>
        ))}
      </div>

      {/* Table for active network */}
      <div style={{ background: COLORS.surface, border: `1.5px solid ${COLORS.border}`, borderRadius: 12, overflow: 'hidden' }}>
        {/* Table header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
          padding: '10px 20px', gap: 8,
          fontSize: 11, fontWeight: 700, color: COLORS.muted,
          textTransform: 'uppercase', letterSpacing: '0.06em',
          borderBottom: `1.5px solid ${COLORS.border}`,
          borderTop: `3px solid ${color}`,
        }}>
          <span>Data (GB)</span>
          <span>MB</span>
          <span>Price (GHS)</span>
        </div>

        {/* Rows */}
        {pkgs.map((pkg, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
            padding: '11px 20px', gap: 8, alignItems: 'center',
            borderBottom: `1px solid ${COLORS.border}20`,
            fontSize: 13,
          }}>
            <span style={{ color: COLORS.white, fontWeight: 700 }}>{pkg.capacity} GB</span>
            <span style={{ color: COLORS.muted }}>{pkg.mb} MB</span>
            <span style={{ color, fontWeight: 700 }}>GHS {Number(pkg.price).toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}