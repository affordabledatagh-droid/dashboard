'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { COLORS } from '@/lib/constants/colors'
import Modal from '@/components/admin/Modal'
import Toast from '@/components/admin/Toast'
import { adminApi, WithdrawalRow } from '@/lib/utils/adminApi'
import { money, dateTime } from '@/lib/utils/format'
import { HiCheckCircle, HiXCircle, HiClipboard } from 'react-icons/hi2'

type Filter = 'pending' | 'success' | 'failed' | 'all'
const GREEN = '#22c55e'

const STATUS = {
  pending: { label: 'Pending', color: COLORS.yellow },
  success: { label: 'Completed', color: GREEN },
  failed:  { label: 'Rejected', color: COLORS.red },
} as const

const btn = (bg: string): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 12px', background: bg, border: 'none',
  borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
})

export default function WithdrawalsPage() {
  const [rows, setRows] = useState<WithdrawalRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('pending')
  const [query, setQuery] = useState('')
  const [action, setAction] = useState<{ row: WithdrawalRow; type: 'complete' | 'reject' } | null>(null)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState({ message: '', type: 'success' as 'success' | 'error' | 'info', visible: false })
  const show = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => setToast({ message, type, visible: true }), [])

  const load = useCallback(async () => {
    try { setRows((await adminApi.getWithdrawals()).data) }
    catch (e: any) { show(e.message, 'error') }
    finally { setLoading(false) }
  }, [show])
  useEffect(() => { load() }, [load])

  const counts = useMemo(() => ({
    pending: rows.filter(r => r.status === 'pending').length,
    success: rows.filter(r => r.status === 'success').length,
    failed:  rows.filter(r => r.status === 'failed').length,
  }), [rows])

  const pendingTotal = rows.filter(r => r.status === 'pending').reduce((s, r) => s + r.amount, 0)
  const feesEarned = rows.filter(r => r.status === 'success').reduce((s, r) => s + r.fee, 0)

  const shown = rows.filter(r => {
    if (filter !== 'all' && r.status !== filter) return false
    const q = query.trim().toLowerCase()
    return !q || `${r.shopName} ${r.agentCode} ${r.phone} ${r.network}`.toLowerCase().includes(q)
  })

  const confirm = async () => {
    if (!action) return
    setBusy(true)
    try {
      action.type === 'complete' ? await adminApi.completeWithdrawal(action.row.id) : await adminApi.rejectWithdrawal(action.row.id)
      show(action.type === 'complete' ? 'Marked as completed. The agent can now see it as paid.' : `Rejected. ${money(action.row.total)} refunded to the wallet.`)
      setAction(null); load()
    } catch (e: any) { show(e.message, 'error') } finally { setBusy(false) }
  }

  const copy = (t: string) => { navigator.clipboard?.writeText(t); show('Copied', 'info') }

  return (
    <div style={{ padding: 'clamp(16px, 4vw, 32px) clamp(12px, 3vw, 24px)', maxWidth: 1200, margin: '0 auto' }}>
      <Toast message={toast.message} type={toast.type} isVisible={toast.visible} onClose={() => setToast(t => ({ ...t, visible: false }))} />

      <h1 style={{ fontSize: 'clamp(22px, 4vw, 28px)', fontWeight: 800, color: COLORS.white, margin: 0 }}>Withdrawals</h1>
      <p style={{ fontSize: 13, color: COLORS.muted, margin: '6px 0 18px' }}>
        Requested amounts and charges are already taken from the agent's wallet. Send the money by MoMo, then mark it completed.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10, marginBottom: 16 }}>
        {[['To pay out now', money(pendingTotal), counts.pending ? COLORS.yellow : COLORS.white], ['Waiting', counts.pending, COLORS.white], ['Completed', counts.success, GREEN], ['Charges collected', money(feesEarned), COLORS.blueLight]].map(([l, v, c]) => (
          <div key={l as string} style={{ background: COLORS.surface, border: `1.5px solid ${COLORS.border}`, borderRadius: 12, padding: '12px 14px' }}>
            <div style={{ fontSize: 11, color: COLORS.muted }}>{l}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: c as string }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14, alignItems: 'center' }}>
        {(['pending', 'success', 'failed', 'all'] as Filter[]).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            background: filter === f ? COLORS.blue : COLORS.surface, color: filter === f ? '#fff' : COLORS.muted,
            border: `1.5px solid ${filter === f ? COLORS.blue : COLORS.border}`,
          }}>{f === 'all' ? 'All' : STATUS[f].label}{f !== 'all' && ` (${counts[f]})`}</button>
        ))}
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search shop, code or number"
          style={{ flex: '1 1 200px', maxWidth: 300, padding: '9px 12px', background: COLORS.surface, border: `1.5px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.white, fontSize: 14, outline: 'none' }} />
      </div>

      {loading ? (
        <div style={{ display: 'grid', gap: 10 }}>{Array.from({ length: 4 }, (_, i) => <div key={i} className="skeleton" style={{ height: 96, borderRadius: 12 }} />)}</div>
      ) : shown.length === 0 ? (
        <div style={{ background: COLORS.surface, border: `1.5px solid ${COLORS.border}`, borderRadius: 14, padding: 40, textAlign: 'center', color: COLORS.muted, fontSize: 14 }}>
          {filter === 'pending' ? 'No withdrawals waiting. All caught up.' : 'Nothing to show.'}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {shown.map(w => {
            const st = STATUS[w.status]
            return (
              <div key={w.id} style={{ background: COLORS.surface, border: `1.5px solid ${w.status === 'pending' ? `${COLORS.yellow}55` : COLORS.border}`, borderRadius: 12, padding: '14px 16px', display: 'grid', gridTemplateColumns: 'minmax(0,1.3fr) minmax(0,1fr) auto', gap: 14, alignItems: 'center' }} className="wd-row">
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, color: COLORS.white, fontSize: 15 }}>{w.shopName}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: COLORS.faint, color: COLORS.muted }}>{w.type === 'agent' ? 'AGENT' : 'SUB-AGENT'}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: st.color, border: `1px solid ${st.color}`, borderRadius: 999, padding: '2px 9px' }}>{st.label}</span>
                    {w.initiatedByAdmin && <span style={{ fontSize: 10, color: COLORS.muted }}>started by admin</span>}
                  </div>
                  <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 5 }}>{w.agentCode} · requested {dateTime(w.createdAt)}{w.status !== 'pending' && w.updatedAt ? ` · ${st.label.toLowerCase()} ${dateTime(w.updatedAt)}` : ''}</div>
                  <button onClick={() => w.phone && copy(w.phone)} style={{ marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 6, background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: '5px 9px', color: COLORS.white, fontSize: 13, cursor: 'pointer' }}>
                    <strong>{w.network}</strong> {w.phone} <HiClipboard size={14} color={COLORS.muted} />
                  </button>
                </div>
                <div style={{ fontSize: 13 }}>
                  <div style={{ color: COLORS.muted }}>Send to agent</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.white }}>{money(w.amount)}</div>
                  <div style={{ fontSize: 11, color: COLORS.muted }}>charge {money(w.fee)} · wallet debit {money(w.total)}</div>
                </div>
                {w.status === 'pending' ? (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button onClick={() => setAction({ row: w, type: 'complete' })} style={btn(GREEN)}><HiCheckCircle size={16} /> Mark completed</button>
                    <button onClick={() => setAction({ row: w, type: 'reject' })} style={btn(COLORS.faint)}><HiXCircle size={16} color={COLORS.red} /> Reject</button>
                  </div>
                ) : <span />}
              </div>
            )
          })}
        </div>
      )}

      {action && (
        <Modal isOpen onClose={() => !busy && setAction(null)} title={action.type === 'complete' ? 'Mark as completed' : 'Reject withdrawal'}>
          {action.type === 'complete' ? (
            <p style={{ fontSize: 14, color: COLORS.muted, lineHeight: 1.6, marginBottom: 18 }}>
              Confirm you have sent <strong style={{ color: COLORS.white }}>{money(action.row.amount)}</strong> to {action.row.network} <strong style={{ color: COLORS.white }}>{action.row.phone}</strong> for {action.row.shopName}. They will see this withdrawal as completed.
            </p>
          ) : (
            <p style={{ fontSize: 14, color: COLORS.muted, lineHeight: 1.6, marginBottom: 18 }}>
              Reject this request and return <strong style={{ color: COLORS.white }}>{money(action.row.total)}</strong> (amount plus charge) to {action.row.shopName}'s wallet?
            </p>
          )}
          <div style={{ display: 'flex', gap: 10 }}>
            <button disabled={busy} onClick={() => setAction(null)} style={{ ...btn(COLORS.faint), flex: 1, padding: 11 }}>Cancel</button>
            <button disabled={busy} onClick={confirm} style={{ ...btn(action.type === 'complete' ? GREEN : COLORS.red), flex: 1, padding: 11 }}>
              {busy ? <span className="spinner" /> : action.type === 'complete' ? 'Yes, completed' : 'Reject and refund'}
            </button>
          </div>
        </Modal>
      )}

      <style>{`@media (max-width: 760px) { .wd-row { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  )
}
