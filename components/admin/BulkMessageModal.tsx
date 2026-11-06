'use client';

import { useMemo, useState } from 'react';
import { COLORS } from '@/lib/constants/colors';
import Modal from '@/components/admin/Modal';
import { AgentRow } from '@/lib/utils/adminApi';
import { TEMPLATES, suggestTemplate, templateContext, whatsappLink } from '@/lib/utils/whatsapp';
import { daysSinceContacted, keyOf, markContacted } from '@/lib/utils/contacted';
import { FaWhatsapp } from 'react-icons/fa';

const GREEN = '#22c55e';
const SKIP_RECENT_DAYS = 3;

/**
 * Message many accounts in one run. WhatsApp can't be sent automatically from a link, so this
 * lines everyone up and opens each chat with ONE click, already filled in. You just press send.
 */
export default function BulkMessageModal({ rows, onClose, onProgress }: { rows: AgentRow[]; onClose: () => void; onProgress: () => void }) {
  const [mode, setMode] = useState<string>('auto');            // 'auto' = best fit per person
  const [skipRecent, setSkipRecent] = useState(true);
  const [done, setDone] = useState<Record<string, 'sent' | 'skipped'>>({});
  const [cursor, setCursor] = useState(0);

  const plan = useMemo(() => rows.map(r => {
    const tid = mode === 'auto' ? suggestTemplate(r) : mode;
    const text = TEMPLATES.find(t => t.id === tid)!.build(templateContext(r));
    const recent = daysSinceContacted(r.type, r.id);
    return {
      row: r, key: keyOf(r.type, r.id), tid, text, link: whatsappLink(r.whatsapp, text),
      recentlyMessaged: recent !== null && recent < SKIP_RECENT_DAYS ? recent : null,
    };
    // `done` is included so "messaged just now" shows up straight after sending
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [rows, mode, done]);

  const queue = plan.filter(p => p.link && !(skipRecent && p.recentlyMessaged !== null));
  const noNumber = plan.filter(p => !p.link);
  const skippedRecent = plan.filter(p => p.link && skipRecent && p.recentlyMessaged !== null);

  const pending = queue.filter(p => !done[p.key]);
  const next = pending[0];
  const finished = queue.length - pending.length;

  const openNext = () => {
    if (!next?.link) return;
    // One named tab is reused, so 20 chats don't pile up as 20 tabs
    window.open(next.link, 'affordabledata_whatsapp');
    markContacted(next.row.type, next.row.id);
    setDone(d => ({ ...d, [next.key]: 'sent' }));
    setCursor(c => c + 1);
    onProgress();
  };
  const skipNext = () => { if (next) setDone(d => ({ ...d, [next.key]: 'skipped' })); };

  const copyNumbers = () => navigator.clipboard?.writeText(queue.map(p => p.row.whatsapp).join('\n'));
  const downloadCsv = () => {
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const csv = ['name,shop,number,message', ...queue.map(p => [p.row.name ?? '', p.row.shopName, p.row.whatsapp ?? '', p.text].map(esc).join(','))].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `whatsapp-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(a.href);
  };

  const modes = [{ id: 'auto', label: 'Best fit for each person', hint: 'Low wallet → balance message, never sold → no-sales message, and so on' }, ...TEMPLATES.map(t => ({ id: t.id, label: t.label, hint: 'Same message to everyone' }))];

  return (
    <Modal isOpen onClose={onClose} title={`Message ${rows.length} account${rows.length > 1 ? 's' : ''}`} maxWidth="760px">
      <div style={{ display: 'grid', gap: 16 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.muted, marginBottom: 8 }}>Which message?</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 8 }}>
            {modes.map(m => (
              <button key={m.id} onClick={() => setMode(m.id)} style={{
                textAlign: 'left', padding: '9px 11px', borderRadius: 10, cursor: 'pointer', color: COLORS.white,
                background: mode === m.id ? `${COLORS.blue}18` : COLORS.bg, border: `1.5px solid ${mode === m.id ? COLORS.blue : COLORS.border}`,
              }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{m.label}</div>
                <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>{m.hint}</div>
              </button>
            ))}
          </div>
        </div>

        <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, color: COLORS.muted, cursor: 'pointer' }}>
          <input type="checkbox" checked={skipRecent} onChange={e => setSkipRecent(e.target.checked)} style={{ width: 16, height: 16 }} />
          Skip anyone messaged in the last {SKIP_RECENT_DAYS} days{skippedRecent.length > 0 && <span style={{ color: COLORS.yellow }}> ({skippedRecent.length} skipped)</span>}
        </label>

        {/* The one-click queue */}
        <div style={{ background: COLORS.bg, border: `1.5px solid ${COLORS.border}`, borderRadius: 12, padding: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: COLORS.muted, marginBottom: 8 }}>
            <span>{finished} of {queue.length} done</span>
            {noNumber.length > 0 && <span style={{ color: COLORS.yellow }}>{noNumber.length} have no WhatsApp number</span>}
          </div>
          <div style={{ height: 6, borderRadius: 3, background: COLORS.surface, marginBottom: 14 }}>
            <div style={{ width: `${queue.length ? (finished / queue.length) * 100 : 0}%`, height: '100%', borderRadius: 3, background: GREEN, transition: 'width .2s' }} />
          </div>

          {next ? (
            <>
              <div style={{ fontSize: 13, color: COLORS.white, marginBottom: 4 }}>Next: <strong>{next.row.shopName}</strong> <span style={{ color: COLORS.muted }}>· {next.row.whatsapp}</span></div>
              <div style={{ fontSize: 12, color: COLORS.muted, background: COLORS.surface, borderRadius: 8, padding: '8px 10px', lineHeight: 1.55, marginBottom: 12 }}>{next.text}</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button onClick={openNext} style={{ flex: '1 1 220px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 16px', background: '#1fa855', border: 'none', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
                  <FaWhatsapp size={18} /> Open chat {finished + 1} of {queue.length}
                </button>
                <button onClick={skipNext} style={{ padding: '12px 14px', background: COLORS.faint, border: 'none', borderRadius: 10, color: COLORS.white, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Skip</button>
              </div>
              <p style={{ fontSize: 11, color: COLORS.muted, margin: '10px 0 0', lineHeight: 1.5 }}>
                WhatsApp opens with the message ready. Press send there, come back here, and click again{cursor > 0 ? '' : ' (WhatsApp always needs your tap to send)'}.
              </p>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '10px 0', color: queue.length ? GREEN : COLORS.muted, fontWeight: 700, fontSize: 14 }}>
              {queue.length ? `All ${queue.length} chats opened.` : 'Nobody to message with these settings.'}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={copyNumbers} disabled={!queue.length} style={ghost}>Copy numbers</button>
          <button onClick={downloadCsv} disabled={!queue.length} style={ghost}>Download CSV</button>
          <span style={{ fontSize: 11, color: COLORS.muted }}>For a WhatsApp Business broadcast list or another sending tool</span>
        </div>

        <details>
          <summary style={{ cursor: 'pointer', fontSize: 13, fontWeight: 700, color: COLORS.white }}>See everyone ({plan.length})</summary>
          <div style={{ display: 'grid', gap: 6, marginTop: 10, maxHeight: 260, overflowY: 'auto' }}>
            {plan.map(p => {
              const st = done[p.key];
              const note = !p.link ? 'No number' : p.recentlyMessaged !== null && skipRecent ? `Messaged ${p.recentlyMessaged === 0 ? 'today' : `${p.recentlyMessaged}d ago`}, skipped` : st === 'sent' ? 'Opened' : st === 'skipped' ? 'Skipped' : TEMPLATES.find(t => t.id === p.tid)!.label;
              const c = st === 'sent' ? GREEN : !p.link || (p.recentlyMessaged !== null && skipRecent) ? COLORS.yellow : COLORS.muted;
              return (
                <div key={p.key} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 12, padding: '6px 10px', background: COLORS.bg, borderRadius: 8, color: COLORS.white }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.row.shopName}</span>
                  <span style={{ color: c, whiteSpace: 'nowrap' }}>{note}</span>
                </div>
              );
            })}
          </div>
        </details>
      </div>
    </Modal>
  );
}

const ghost: React.CSSProperties = { padding: '8px 12px', borderRadius: 8, background: COLORS.faint, border: 'none', color: COLORS.white, fontSize: 12, fontWeight: 600, cursor: 'pointer' };
