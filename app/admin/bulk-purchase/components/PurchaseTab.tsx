'use client';

import { memo, useMemo, useState } from 'react';
import { COLORS } from '@/lib/constants/colors';
import { adminApi, MhanyBundle } from '@/lib/utils/adminApi';
import { money } from '@/lib/utils/format';
import { groupBundles, normPhone, validPhone } from './shared';

interface Row {
  id: number; phone: string; bundleId: string
  status: 'idle' | 'sending' | 'ok' | 'error'; msg: string
  verified?: 'checking' | 'yes' | 'no' | 'unknown'
}

let nextId = 1;
const GREEN = '#22c55e';
const inp: React.CSSProperties = { background: COLORS.bg, border: `1.5px solid ${COLORS.border}`, borderRadius: 8, padding: '8px 10px', color: COLORS.white, fontSize: 13, width: '100%', boxSizing: 'border-box' };
const card: React.CSSProperties = { background: COLORS.surface, border: `1.5px solid ${COLORS.border}`, borderRadius: 12, padding: 16 };

const BundleRow = memo(function BundleRow({ row, bundles, groups, busy, onChange, onRemove }: {
  row: Row; bundles: Record<string, MhanyBundle>; groups: Record<string, MhanyBundle[]>; busy: boolean
  onChange: (id: number, p: Partial<Row>) => void; onRemove: (id: number) => void
}) {
  const b = bundles[row.bundleId];
  const bad = row.phone && !validPhone(row.phone);
  const icon = { idle: '', sending: '⏳', ok: '✅', error: '❌' }[row.status];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(120px,1fr) minmax(130px,1.2fr) 82px 52px 30px', gap: 8, alignItems: 'center', padding: '7px 12px', borderTop: `1px solid ${COLORS.border}`, background: row.status === 'ok' ? `${GREEN}0d` : row.status === 'error' ? `${COLORS.red}0d` : 'transparent' }}>
      <div>
        <input value={row.phone} onChange={e => onChange(row.id, { phone: e.target.value, verified: undefined, status: 'idle', msg: '' })} placeholder="0542343324" disabled={busy} inputMode="tel"
          style={{ ...inp, borderColor: bad ? COLORS.red : COLORS.border }} />
        {(row.msg || bad) && <div style={{ fontSize: 10, marginTop: 2, color: bad || row.status === 'error' ? COLORS.red : GREEN }}>{bad ? 'Invalid number' : row.msg}</div>}
      </div>
      <select value={row.bundleId} onChange={e => onChange(row.id, { bundleId: e.target.value, status: 'idle', msg: '' })} disabled={busy} style={inp}>
        <option value="">Choose bundle</option>
        {Object.entries(groups).map(([g, list]) => (
          <optgroup key={g} label={g}>{list.map(x => <option key={x.bundleId} value={x.bundleId}>{x.size} · {money(x.price)}</option>)}</optgroup>
        ))}
      </select>
      <div style={{ fontSize: 12, color: b ? COLORS.white : COLORS.muted, textAlign: 'right' }}>{b ? money(b.price) : '—'}</div>
      <div style={{ textAlign: 'center', fontSize: 13 }} title={row.verified === 'no' ? 'Number not verified' : row.verified === 'yes' ? 'Verified' : ''}>
        {icon || (row.verified === 'checking' ? <span className="spinner" /> : row.verified === 'yes' ? <span style={{ color: GREEN }}>✓</span> : row.verified === 'no' ? <span style={{ color: COLORS.yellow }}>!</span> : '')}
      </div>
      <button onClick={() => onRemove(row.id)} disabled={busy} aria-label="Remove row" style={{ background: 'none', border: 'none', color: COLORS.muted, cursor: 'pointer', fontSize: 18 }}>×</button>
    </div>
  );
});

export default function PurchaseTab({ bundles, balance, onSent }: { bundles: MhanyBundle[]; balance: number | null; onSent: () => void }) {
  const [rows, setRows] = useState<Row[]>([{ id: nextId++, phone: '', bundleId: '', status: 'idle', msg: '' }]);
  const [paste, setPaste] = useState('');
  const [pasteNet, setPasteNet] = useState('MTN');
  const [running, setRunning] = useState(false);
  const [note, setNote] = useState('');

  const byId = useMemo(() => Object.fromEntries(bundles.map(b => [b.bundleId, b])), [bundles]);
  const groups = useMemo(() => groupBundles(bundles), [bundles]);

  const update = (id: number, p: Partial<Row>) => setRows(prev => prev.map(r => (r.id === id ? { ...r, ...p } : r)));
  const remove = (id: number) => setRows(prev => prev.filter(r => r.id !== id));

  // "PHONE GB" per line → pick the Mhany bundle of that size on the chosen network
  const importPaste = () => {
    const list = groups[pasteNet] ?? [];
    const out: Row[] = [];
    const problems: string[] = [];
    paste.split('\n').map(l => l.trim()).filter(Boolean).forEach(line => {
      const [phone, gbRaw = '1'] = line.split(/[\s,]+/);
      const mb = Math.round(parseFloat(gbRaw) * 1000);
      const match = list.find(b => b.size_mb === mb);
      if (!match) problems.push(`${phone}: no ${gbRaw}GB bundle on ${pasteNet}`);
      out.push({ id: nextId++, phone, bundleId: match?.bundleId ?? '', status: 'idle', msg: match ? '' : `No ${gbRaw}GB on Mhany` });
    });
    if (out.length) { setRows(out); setPaste(''); setNote(problems.length ? `${problems.length} line(s) have no matching Mhany bundle, so choose one or remove them.` : ''); }
  };

  const ready = rows.filter(r => r.status !== 'ok' && validPhone(r.phone) && byId[r.bundleId]);
  const cost = ready.reduce((s, r) => s + byId[r.bundleId].price, 0);
  const short = balance !== null && cost > balance;
  const sent = rows.filter(r => r.status === 'ok').length;
  const failed = rows.filter(r => r.status === 'error').length;

  const verifyAll = async () => {
    for (const r of rows.filter(r => validPhone(r.phone))) {
      update(r.id, { verified: 'checking' });
      try {
        const res = await adminApi.mhanyVerify(normPhone(r.phone));
        update(r.id, { verified: /verified/i.test(res.data.status) && !/un/i.test(res.data.status) ? 'yes' : 'no' });
      } catch { update(r.id, { verified: 'unknown' }); }
    }
  };

  const sendAll = async () => {
    if (!ready.length) return;
    if (!window.confirm(`Send ${ready.length} bundle${ready.length > 1 ? 's' : ''} for ${money(cost)} from the Mhany wallet?`)) return;
    setRunning(true); setNote('');
    const CHUNK = 10;
    for (let i = 0; i < ready.length; i += CHUNK) {
      const chunk = ready.slice(i, i + CHUNK);
      chunk.forEach(r => update(r.id, { status: 'sending', msg: '' }));
      try {
        const { data } = await adminApi.mhanyBulkPurchase(chunk.map(r => ({ bundleId: r.bundleId, number: normPhone(r.phone) })));
        chunk.forEach((r, k) => {
          const res = data.results[k];
          if (!res) update(r.id, { status: 'idle', msg: 'Not attempted (batch stopped)' });
          else if (res.ok) update(r.id, { status: 'ok', msg: `Order ${res.orderId ?? ''} · ${res.status ?? 'PROCESSING'}` });
          else update(r.id, { status: 'error', msg: res.error ?? 'Failed' });
        });
        if (data.notAttempted > 0) { setNote('Stopped early (wallet empty or key problem). Remaining rows were not sent.'); break; }
      } catch (e: any) {
        chunk.forEach(r => update(r.id, { status: 'error', msg: e.message }));
        break;
      }
    }
    setRunning(false); onSent();
  };

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={card}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 8 }}>
          <label style={{ fontSize: 12, color: COLORS.muted, fontWeight: 600 }}>Paste numbers for</label>
          <select value={pasteNet} onChange={e => setPasteNet(e.target.value)} style={{ ...inp, width: 'auto' }}>
            {Object.keys(groups).map(g => <option key={g}>{g}</option>)}
          </select>
        </div>
        <p style={{ fontSize: 11, color: COLORS.muted, margin: '0 0 8px' }}>One per line as <code>PHONE GB</code>, for example <code>0542343324 4</code> (GB defaults to 1). Each line is matched to Mhany's bundle of that size.</p>
        <textarea value={paste} onChange={e => setPaste(e.target.value)} rows={4} placeholder={'0542343324 4\n0241234567 2'} style={{ ...inp, fontFamily: 'monospace', resize: 'vertical', lineHeight: 1.6, fontSize: 16 }} />
        <button onClick={importPaste} disabled={!paste.trim()} style={{ marginTop: 8, padding: '8px 16px', borderRadius: 8, background: COLORS.blue, color: '#fff', fontSize: 12, fontWeight: 700, border: 'none', cursor: paste.trim() ? 'pointer' : 'not-allowed', opacity: paste.trim() ? 1 : 0.5 }}>Import</button>
      </div>

      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: 560 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(120px,1fr) minmax(130px,1.2fr) 82px 52px 30px', gap: 8, padding: '10px 12px', fontSize: 11, fontWeight: 700, color: COLORS.muted, textTransform: 'uppercase' }}>
              <span>Phone</span><span>Mhany bundle</span><span style={{ textAlign: 'right' }}>Cost</span><span style={{ textAlign: 'center' }}>St.</span><span />
            </div>
            <div style={{ maxHeight: 420, overflowY: 'auto' }}>
              {rows.map(r => <BundleRow key={r.id} row={r} bundles={byId} groups={groups} busy={running} onChange={update} onRemove={remove} />)}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap', padding: '12px 14px', borderTop: `1.5px solid ${COLORS.border}` }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => setRows(p => [...p, { id: nextId++, phone: '', bundleId: p[p.length - 1]?.bundleId ?? '', status: 'idle', msg: '' }])} disabled={running} style={ghost}>+ Add row</button>
            <button onClick={verifyAll} disabled={running} style={ghost}>Check numbers</button>
            <span style={{ fontSize: 12, color: COLORS.muted }}>
              {rows.length} rows{sent > 0 && <span style={{ color: GREEN }}> · {sent} sent</span>}{failed > 0 && <span style={{ color: COLORS.red }}> · {failed} failed</span>}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'right', fontSize: 12 }}>
              <div style={{ color: COLORS.white, fontWeight: 700 }}>Total {money(cost)}</div>
              {balance !== null && <div style={{ color: short ? COLORS.red : COLORS.muted }}>{short ? `Wallet short by ${money(cost - balance)}` : `Wallet ${money(balance)}`}</div>}
            </div>
            <button onClick={sendAll} disabled={running || !ready.length || short} style={{ padding: '10px 22px', borderRadius: 8, background: COLORS.blue, color: '#fff', fontSize: 13, fontWeight: 700, border: 'none', cursor: running || !ready.length || short ? 'not-allowed' : 'pointer', opacity: running || !ready.length || short ? 0.55 : 1, display: 'inline-flex', gap: 8, alignItems: 'center' }}>
              {running ? <><span className="spinner" /> Sending</> : `Send ${ready.length}`}
            </button>
          </div>
        </div>
      </div>
      {note && <div style={{ fontSize: 13, color: COLORS.yellow }}>{note}</div>}
    </div>
  );
}

const ghost: React.CSSProperties = { padding: '8px 12px', borderRadius: 8, background: 'transparent', border: `1.5px solid ${COLORS.border}`, color: COLORS.muted, fontSize: 12, fontWeight: 600, cursor: 'pointer' };
