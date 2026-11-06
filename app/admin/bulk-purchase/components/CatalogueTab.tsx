'use client';

import { COLORS } from '@/lib/constants/colors';
import { MhanyBundle } from '@/lib/utils/adminApi';
import { money } from '@/lib/utils/format';
import { groupBundles } from './shared';

/** Read-only view of exactly what Mhany sells us, at our reseller price. */
export default function CatalogueTab({ bundles }: { bundles: MhanyBundle[] }) {
  const groups = groupBundles(bundles);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: 14 }}>
      {Object.entries(groups).map(([g, list]) => (
        <section key={g} style={{ background: COLORS.surface, border: `1.5px solid ${COLORS.border}`, borderRadius: 12, padding: 14 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: COLORS.white, margin: '0 0 10px' }}>{g} <span style={{ color: COLORS.muted, fontWeight: 400 }}>· {list.length}</span></h3>
          {list.map(b => (
            <div key={b.bundleId} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderTop: `1px solid ${COLORS.border}`, fontSize: 13, color: COLORS.white }}>
              <span>{b.size}</span><span style={{ color: COLORS.muted }}>{money(b.price)}</span>
            </div>
          ))}
        </section>
      ))}
      {bundles.length === 0 && <p style={{ color: COLORS.muted }}>Mhany returned no bundles.</p>}
    </div>
  );
}
