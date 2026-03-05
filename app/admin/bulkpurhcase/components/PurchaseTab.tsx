// app/admin/bulk-purchase/components/PurchaseTab.tsx
'use client';

import { useState } from 'react';
import { apiFetch } from '../api';
import { COLORS } from '@/lib/constants/colors';
import StatsTab from './StatsTab';

interface Row {
  id: number;
  phone: string;
  gb: string;
  status: 'idle' | 'pending' | 'ok' | 'error';
  msg: string;
}

const NETWORKS = ['TELECEL', 'YELLO', 'AT_PREMIUM'] as const;
type Network = typeof NETWORKS[number];

const NETWORK_LABEL: Record<Network, string> = {
  TELECEL: 'Telecel (Vodafone)',
  YELLO: 'MTN Ghana',
  AT_PREMIUM: 'AirtelTigo',
};

let nextId = 1;
const newRow = (phone = '', gb = '1'): Row => ({ id: nextId++, phone, gb, status: 'idle', msg: '' });

const STATUS_ICON: Record<Row['status'], string> = {
  idle: '—', pending: '⏳', ok: '✅', error: '❌',
};

const inp = {
  background: '#0f172a',
  border: `1.5px solid #1e293b`,
  borderRadius: 8,
  padding: '7px 10px',
  color: '#f1f5f9',
  fontSize: 13,
  width: '100%',
  boxSizing: 'border-box' as const,
};

export default function PurchaseTab() {
  const [network, setNetwork] = useState<Network>('YELLO');
  const [rows, setRows]       = useState<Row[]>([newRow()]);
  const [paste, setPaste]     = useState('');
  const [running, setRunning] = useState(false);

  const update = (id: number, patch: Partial<Row>) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  // ── Parse paste: each line is "PHONE GB" e.g. "0542343324 4"
  const importPaste = () => {
    const parsed: Row[] = [];

    paste.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      const parts = trimmed.split(/\s+/); // split on any whitespace
      const phone = parts[0];
      const gb    = parts[1] || '1'; // default 1GB if not provided

      if (phone) parsed.push(newRow(phone, gb));
    });

    if (parsed.length > 0) {
      setRows(parsed);
      setPaste('');
    }
  };

  // ── Send one purchase — GB comes from the row itself
  const sendOne = async (row: Row) => {
    update(row.id, { status: 'pending', msg: '' });

    const res = await apiFetch('/purchase', {
      method: 'POST',
      body: JSON.stringify({
        phoneNumber: row.phone,
        network,
        capacity: row.gb,   // ← each row has its own GB
        gateway: 'wallet',
      }),
    });

    if (res.status === 'success') {
      update(row.id, { status: 'ok', msg: `ref: ${res.data?.transactionReference}` });
    } else {
      update(row.id, { status: 'error', msg: res.message || 'Failed' });
    }
  };

  const sendAll = async () => {
    setRunning(true);
    for (const row of rows) {
      await sendOne(row);
      await new Promise((r) => setTimeout(r, 300));
    }
    setRunning(false);
  };

  const completed = rows.filter((r) => r.status === 'ok').length;
  const failed    = rows.filter((r) => r.status === 'error').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <StatsTab/>
      {/* Network picker */}
      <div style={{ background: COLORS.surface, border: `1.5px solid ${COLORS.border}`, borderRadius: 12, padding: 16 }}>
        <label style={{ fontSize: 12, color: COLORS.muted, display: 'block', marginBottom: 6, fontWeight: 600 }}>
          Network (applies to all rows)
        </label>
        <select value={network} onChange={(e) => setNetwork(e.target.value as Network)}
          style={{ ...inp, width: 'auto', cursor: 'pointer' }}>
          {NETWORKS.map((n) => <option key={n} value={n}>{NETWORK_LABEL[n]}</option>)}
        </select>
      </div>

      {/* Paste box */}
      <div style={{ background: COLORS.surface, border: `1.5px solid ${COLORS.border}`, borderRadius: 12, padding: 16 }}>
        <label style={{ fontSize: 12, color: COLORS.muted, display: 'block', marginBottom: 4, fontWeight: 600 }}>
          Paste numbers
        </label>
        <p style={{ fontSize: 11, color: COLORS.muted, marginBottom: 8, marginTop: 0 }}>
          Format: <code style={{ background: '#0f172a', padding: '1px 6px', borderRadius: 4 }}>PHONE GB</code> per line — e.g. <code style={{ background: '#0f172a', padding: '1px 6px', borderRadius: 4 }}>0542343324 4</code>
          &nbsp;means 4GB to that number. GB defaults to 1 if omitted.
        </p>
        <textarea
          value={paste}
          onChange={(e) => setPaste(e.target.value)}
          rows={5}
          placeholder={'0542343324 4\n0241234567 2\n0271234567 1'}
          style={{ ...inp, fontFamily: 'monospace', resize: 'vertical', lineHeight: 1.6 }}
        />
        <button onClick={importPaste} disabled={!paste.trim()}
          style={{ marginTop: 8, padding: '8px 16px', borderRadius: 8, background: COLORS.blue, color: '#fff', fontSize: 12, fontWeight: 700, border: 'none', cursor: paste.trim() ? 'pointer' : 'not-allowed', opacity: paste.trim() ? 1 : 0.5 }}>
          Import
        </button>
      </div>

      {/* Rows table */}
      <div style={{ background: COLORS.surface, border: `1.5px solid ${COLORS.border}`, borderRadius: 12, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 36px 36px', gap: 8, padding: '10px 14px', fontSize: 11, fontWeight: 700, color: COLORS.muted, borderBottom: `1.5px solid ${COLORS.border}`, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
          <span>Phone Number</span>
          <span>GB</span>
          <span style={{ textAlign: 'center' }}>St.</span>
          <span />
        </div>

        {/* Rows */}
        <div style={{ maxHeight: 340, overflowY: 'auto' }}>
          {rows.length === 0 && (
            <div style={{ padding: 32, textAlign: 'center', color: COLORS.muted, fontSize: 13 }}>
              Paste numbers above or add rows manually.
            </div>
          )}
          {rows.map((row) => (
            <div key={row.id} style={{
              display: 'grid', gridTemplateColumns: '1fr 90px 36px 36px', gap: 8, alignItems: 'center',
              padding: '7px 14px', borderBottom: `1px solid ${COLORS.border}20`,
              background: row.status === 'ok' ? '#22c55e08' : row.status === 'error' ? '#ef444408' : 'transparent',
            }}>
              <div>
                <input value={row.phone} onChange={(e) => update(row.id, { phone: e.target.value })}
                  placeholder="0542343324" disabled={running} style={inp} />
                {row.msg && (
                  <div style={{ fontSize: 10, marginTop: 2, color: row.status === 'ok' ? '#22c55e' : '#ef4444' }}>
                    {row.msg}
                  </div>
                )}
              </div>
              <input value={row.gb} onChange={(e) => update(row.id, { gb: e.target.value })}
                disabled={running} style={inp} title="Data in GB" />
              <div style={{ textAlign: 'center', fontSize: 16 }}>{STATUS_ICON[row.status]}</div>
              <button onClick={() => setRows((p) => p.filter((r) => r.id !== row.id))} disabled={running}
                style={{ background: 'none', border: 'none', color: COLORS.muted, cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderTop: `1.5px solid ${COLORS.border}` }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button onClick={() => setRows((p) => [...p, newRow()])} disabled={running}
              style={{ padding: '7px 12px', borderRadius: 8, background: 'transparent', border: `1.5px solid ${COLORS.border}`, color: COLORS.muted, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              + Add Row
            </button>
            <span style={{ fontSize: 11, color: COLORS.muted }}>
              {rows.length} rows
              {completed > 0 && <span style={{ color: '#22c55e' }}> · {completed} sent</span>}
              {failed > 0    && <span style={{ color: '#ef4444' }}> · {failed} failed</span>}
            </span>
          </div>
          <button onClick={sendAll} disabled={running || rows.length === 0}
            style={{ padding: '9px 22px', borderRadius: 8, background: COLORS.blue, color: '#fff', fontSize: 13, fontWeight: 700, border: 'none', cursor: running || rows.length === 0 ? 'not-allowed' : 'pointer', opacity: running || rows.length === 0 ? 0.6 : 1 }}>
            {running ? 'Sending…' : `Send All (${rows.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}