// app/admin/bulk-purchase/page.tsx
'use client';

import { useState } from 'react';
import { COLORS } from '@/lib/constants/colors';
import PackagesTab from './components/PackagesTab';
import PurchaseTab from './components/PurchaseTab';
import OrdersTab from './components/OrdersTab';

type Tab = 'packages' | 'purchase' | 'stats' | 'orders';

const TABS: { id: Tab; label: string }[] = [
  { id: 'purchase', label: '🛒 Bulk Purchase' },
    { id: 'packages', label: '📦 Packages & Prices' },
  { id: 'orders',   label: '📋 Orders' },

];

export default function BulkPurchasePage() {
  const [tab, setTab] = useState<Tab>('purchase');

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ color: COLORS.white, fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
        Bulk Data Purchase
      </h1>
      <p style={{ color: COLORS.muted, fontSize: 13, marginBottom: 24 }}>
        View packages, send data in bulk, and track orders.
      </p>

      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 28, flexWrap: 'wrap' }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '9px 16px',
              borderRadius: 9,
              fontSize: 13,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              background: tab === t.id ? COLORS.blue : COLORS.surface,
              color: tab === t.id ? '#fff' : COLORS.muted,
              transition: 'all 0.15s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content — only the active one renders */}
      {tab === 'packages' && <PackagesTab />}
      {tab === 'purchase' && <PurchaseTab />}
      {tab === 'orders'   && <OrdersTab />}
    </div>
  );
}