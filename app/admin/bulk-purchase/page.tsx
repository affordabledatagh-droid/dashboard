'use client';

import { useCallback, useEffect, useState } from 'react';
import { COLORS } from '@/lib/constants/colors';
import { adminApi, MhanyBundle } from '@/lib/utils/adminApi';
import { money } from '@/lib/utils/format';
import PurchaseTab from './components/PurchaseTab';
import CatalogueTab from './components/CatalogueTab';
import OrdersTab from './components/OrdersTab';

type Tab = 'purchase' | 'catalogue' | 'orders';
const TABS: { id: Tab; label: string }[] = [
  { id: 'purchase', label: 'Bulk purchase' },
  { id: 'catalogue', label: 'Mhany bundles & prices' },
  { id: 'orders', label: 'Orders' },
];

export default function BulkPurchasePage() {
  const [tab, setTab] = useState<Tab>('purchase');
  const [bundles, setBundles] = useState<MhanyBundle[]>([]);
  const [balance, setBalance] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadBalance = useCallback(() => adminApi.mhanyBalance().then(r => setBalance(r.data.balance)).catch(() => setBalance(null)), []);
  const loadBundles = useCallback(async (refresh = false) => {
    setLoading(true); setError('');
    try { setBundles((await adminApi.mhanyBundles(refresh)).data); }
    catch (e: any) { setError(`Couldn't load Mhany bundles: ${e.message}`); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { loadBundles(); loadBalance(); }, [loadBundles, loadBalance]);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(16px, 4vw, 32px) clamp(12px, 3vw, 24px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
        <div>
          <h1 style={{ color: COLORS.white, fontSize: 'clamp(22px, 4vw, 28px)', fontWeight: 800, margin: 0 }}>Bulk data purchase</h1>
          <p style={{ color: COLORS.muted, fontSize: 13, margin: '6px 0 0' }}>Bundles and prices come straight from Mhany. Orders are paid from the Mhany wallet.</p>
        </div>
        <div style={{ background: COLORS.surface, border: `1.5px solid ${COLORS.border}`, borderRadius: 12, padding: '10px 14px', textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: COLORS.muted }}>Mhany wallet</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: balance !== null && balance < 100 ? COLORS.red : COLORS.white }}>{balance === null ? '—' : money(balance)}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 22, flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '9px 16px', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer',
            border: `1.5px solid ${tab === t.id ? COLORS.blue : COLORS.border}`,
            background: tab === t.id ? COLORS.blue : COLORS.surface, color: tab === t.id ? '#fff' : COLORS.muted,
          }}>{t.label}</button>
        ))}
        <button onClick={() => { loadBundles(true); loadBalance(); }} style={{ padding: '9px 14px', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'transparent', border: `1.5px solid ${COLORS.border}`, color: COLORS.muted }}>Refresh from Mhany</button>
      </div>

      {error && <div style={{ color: COLORS.red, fontSize: 13, marginBottom: 14 }}>{error}</div>}
      {loading && tab !== 'orders' ? <div className="skeleton" style={{ height: 240, borderRadius: 12 }} /> : (
        <>
          {tab === 'purchase'  && <PurchaseTab bundles={bundles} balance={balance} onSent={loadBalance} />}
          {tab === 'catalogue' && <CatalogueTab bundles={bundles} />}
          {tab === 'orders'    && <OrdersTab />}
        </>
      )}
    </div>
  );
}
