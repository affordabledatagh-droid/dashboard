'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { COLORS } from '@/lib/constants/colors'
import Modal from '@/components/admin/Modal'
import Toast from '@/components/admin/Toast'
import { BarChart, dayLabel } from '@/components/admin/Charts'
import { adminApi, AgentDetail, AgentRow, AgentsPage as AgentsResult } from '@/lib/utils/adminApi'
import { TEMPLATES, suggestTemplate, templateContext, whatsappLink } from '@/lib/utils/whatsapp'
import { daysSinceContacted, keyOf, markContacted } from '@/lib/utils/contacted'
import BulkMessageModal from '@/components/admin/BulkMessageModal'
import { money, ago, dateTime } from '@/lib/utils/format'
import { HiChevronUp, HiChevronDown, HiMagnifyingGlass, HiChevronLeft, HiChevronRight } from 'react-icons/hi2'
import { FaWhatsapp } from 'react-icons/fa'

type Scope = 'all' | 'agent' | 'sub_agent'
type SortKey = 'shopName' | 'orders' | 'sales' | 'profit' | 'walletBalance' | 'customers' | 'lastOrderAt' | 'joined'
type Activity = 'all' | 'active' | 'inactive' | 'never' | 'lowbalance' | 'pending'

const GREEN = '#22c55e'
const MIN_WD = 10, FEE_RATE = 0.02, MAX_FEE = 20
const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100
const calcFee = (a: number) => round2(Math.min(a * FEE_RATE, MAX_FEE))
const maxWd = (bal: number) => {
  if (bal <= 0) return 0
  let net = Math.floor((bal / (1 + FEE_RATE)) * 100) / 100
  if (calcFee(net) >= MAX_FEE) net = Math.floor((bal - MAX_FEE) * 100) / 100
  while (net > 0 && net + calcFee(net) > bal + 1e-9) net = round2(net - 0.01)
  return Math.max(net, 0)
}

const field: React.CSSProperties = { width: '100%', padding: '9px 11px', background: COLORS.bg, border: `1.5px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.white, fontSize: 14, outline: 'none', boxSizing: 'border-box' }
const chip = (c: string): React.CSSProperties => ({ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: `${c}25`, color: c })
const btn = (bg: string): React.CSSProperties => ({ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 14px', background: bg, border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' })

const PAGE_SIZES = [25, 50, 100]

export default function AgentsPage() {
  const [data, setData] = useState<AgentsResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [scope, setScope] = useState<Scope>('all')
  const [activity, setActivity] = useState<Activity>('all')
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'profit', dir: 'desc' })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [open, setOpen] = useState<AgentRow | null>(null)
  const [messaging, setMessaging] = useState<AgentRow | null>(null)
  const [selected, setSelected] = useState<Map<string, AgentRow>>(new Map())
  const [bulkOpen, setBulkOpen] = useState(false)
  const [selecting, setSelecting] = useState(false)
  const [, bump] = useState(0)   // re-render after messaging so "Messaged Xd ago" tags refresh
  const [toast, setToast] = useState({ message: '', type: 'success' as 'success' | 'error' | 'info', visible: false })
  const show = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => setToast({ message, type, visible: true }), [])

  // Wait for the user to stop typing before asking the server
  useEffect(() => { const t = setTimeout(() => setDebounced(query), 300); return () => clearTimeout(t) }, [query])
  // Any filter change goes back to page 1
  useEffect(() => { setPage(1) }, [scope, activity, debounced, sort, pageSize])

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      setData((await adminApi.getAgents({ scope, q: debounced, activity, sort: sort.key, dir: sort.dir, page, pageSize })).data)
    } catch (e: any) { setError(e.message); show(e.message, 'error') } finally { setLoading(false) }
  }, [scope, debounced, activity, sort, page, pageSize, show])
  useEffect(() => { load() }, [load])

  const rows = data?.rows ?? []

  const toggleOne = (r: AgentRow) => setSelected(m => { const n = new Map(m); const k = keyOf(r.type, r.id); n.has(k) ? n.delete(k) : n.set(k, r); return n })
  const pageAllSelected = rows.length > 0 && rows.every(r => selected.has(keyOf(r.type, r.id)))
  const togglePage = () => setSelected(m => {
    const n = new Map(m)
    rows.forEach(r => pageAllSelected ? n.delete(keyOf(r.type, r.id)) : n.set(keyOf(r.type, r.id), r))
    return n
  })
  // Everyone matching the current filters (with a WhatsApp number), fetched only when asked
  const selectAllMatching = async () => {
    setSelecting(true)
    try {
      const res = (await adminApi.getAgentContacts({ scope, q: debounced, activity, sort: sort.key, dir: sort.dir })).data
      setSelected(new Map(res.rows.map(r => [keyOf(r.type, r.id), r])))
      show(`Selected ${res.rows.length} with a WhatsApp number${res.capped ? ' (limit 500)' : ''}`, 'info')
    } catch (e: any) { show(e.message, 'error') } finally { setSelecting(false) }
  }

  const sortBy = (key: SortKey) => setSort(s => s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: key === 'shopName' ? 'asc' : 'desc' })
  const Th = ({ k, children, right }: { k?: SortKey; children: React.ReactNode; right?: boolean }) => (
    <th onClick={k ? () => sortBy(k) : undefined} style={{ padding: '11px 12px', textAlign: right ? 'right' : 'left', fontSize: 11, fontWeight: 700, color: COLORS.muted, textTransform: 'uppercase', whiteSpace: 'nowrap', cursor: k ? 'pointer' : 'default', userSelect: 'none' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>{children}{k && sort.key === k && (sort.dir === 'asc' ? <HiChevronUp size={13} /> : <HiChevronDown size={13} />)}</span>
    </th>
  )

  const t = data?.totals

  return (
    <div style={{ padding: 'clamp(16px, 4vw, 32px) clamp(12px, 3vw, 24px)', maxWidth: 1400, margin: '0 auto' }}>
      <Toast message={toast.message} type={toast.type} isVisible={toast.visible} onClose={() => setToast(x => ({ ...x, visible: false }))} />
      <h1 style={{ fontSize: 'clamp(22px, 4vw, 28px)', fontWeight: 800, color: COLORS.white, margin: 0 }}>Agents & sub-agents</h1>
      <p style={{ fontSize: 13, color: COLORS.muted, margin: '6px 0 18px' }}>Sales, profit, wallets, customers and payouts for everyone who resells for you.</p>

      {t && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, marginBottom: 16 }}>
          {[['Agents', t.agents, COLORS.white], ['Sub-agents', t.subAgents, COLORS.white], ['Sold in last 30 days', t.activeLast30, GREEN], ['Wallet running dry', t.lowBalance, t.lowBalance ? COLORS.yellow : COLORS.white],
            ['Total profit earned', money(t.profit), GREEN], ['Held in wallets', money(t.walletBalance), COLORS.blueLight], ['Withdrawals pending', money(t.pendingWithdrawal), t.pendingWithdrawal ? COLORS.yellow : COLORS.white]].map(([l, v, c]) => (
            <div key={l as string} style={{ background: COLORS.surface, border: `1.5px solid ${COLORS.border}`, borderRadius: 12, padding: '12px 14px' }}>
              <div style={{ fontSize: 11, color: COLORS.muted }}>{l}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: c as string }}>{v}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 14 }}>
        {([['all', 'Everyone'], ['agent', 'Agents'], ['sub_agent', 'Sub-agents']] as const).map(([k, l]) => (
          <button key={k} onClick={() => setScope(k)} style={{ padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: scope === k ? COLORS.blue : COLORS.surface, color: scope === k ? '#fff' : COLORS.muted, border: `1.5px solid ${scope === k ? COLORS.blue : COLORS.border}` }}>{l}</button>
        ))}
        <select value={activity} onChange={e => setActivity(e.target.value as Activity)} style={{ ...field, width: 'auto', padding: '8px 10px' }}>
          <option value="all">Any activity</option><option value="active">Sold in last 30 days</option><option value="inactive">No sales in 30 days</option><option value="never">Never sold</option><option value="lowbalance">Wallet running dry</option><option value="pending">Has pending withdrawal</option>
        </select>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: COLORS.surface, border: `1.5px solid ${COLORS.border}`, borderRadius: 8, padding: '0 10px', flex: '1 1 220px', maxWidth: 340 }}>
          <HiMagnifyingGlass size={16} color={COLORS.muted} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search shop, code, number" style={{ ...field, border: 'none', background: 'transparent', padding: '9px 0' }} />
        </div>
        <span style={{ fontSize: 12, color: COLORS.muted }}>{data ? `${data.total.toLocaleString()} match` : ''}</span>
      </div>

      {(selected.size > 0 || (pageAllSelected && data && data.total > rows.length)) && (
        <div style={{ position: 'sticky', top: 64, zIndex: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap', padding: '10px 14px', marginBottom: 12, background: COLORS.surface, border: `1.5px solid ${COLORS.blue}`, borderRadius: 12 }}>
          <div style={{ fontSize: 13, color: COLORS.white }}>
            <strong>{selected.size}</strong> selected
            {pageAllSelected && data && data.total > rows.length && selected.size < data.total && (
              <button onClick={selectAllMatching} disabled={selecting} style={{ marginLeft: 10, background: 'none', border: 'none', color: COLORS.blueLight, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                {selecting ? 'Selecting…' : `Select all ${data.total.toLocaleString()} matching`}
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setSelected(new Map())} style={{ ...btn(COLORS.faint) }}>Clear</button>
            <button onClick={() => setBulkOpen(true)} disabled={selected.size === 0} style={{ ...btn('#1fa855'), opacity: selected.size ? 1 : 0.5 }}><FaWhatsapp size={15} /> Message {selected.size}</button>
          </div>
        </div>
      )}

      <div style={{ background: COLORS.surface, border: `1.5px solid ${COLORS.border}`, borderRadius: 14, overflow: 'hidden' }}>
        {!data ? (
          <div style={{ padding: 20, display: 'grid', gap: 10 }}>{Array.from({ length: 8 }, (_, i) => <div key={i} className="skeleton" style={{ height: 48, borderRadius: 8 }} />)}</div>
        ) : (
          <div style={{ overflowX: 'auto', opacity: loading ? 0.5 : 1, transition: 'opacity .15s' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1040 }}>
              <thead><tr style={{ background: COLORS.bg }}>
                <th style={{ padding: '11px 12px', width: 36 }}><input type="checkbox" checked={pageAllSelected} onChange={togglePage} aria-label="Select this page" style={{ width: 16, height: 16, cursor: 'pointer' }} /></th>
                <Th k="shopName">Shop</Th><Th>Type</Th><Th k="orders" right>Orders</Th><Th k="sales" right>Sales</Th><Th k="profit" right>Profit</Th>
                <Th k="walletBalance" right>Wallet</Th><Th k="customers" right>Customers</Th><Th k="lastOrderAt">Last order</Th><Th k="joined">Joined</Th><Th>Message</Th>
              </tr></thead>
              <tbody>
                {rows.map(r => (
                  <tr key={`${r.type}:${r.id}`} onClick={() => setOpen(r)} style={{ borderTop: `1px solid ${COLORS.border}`, cursor: 'pointer' }}
                    onMouseEnter={e => (e.currentTarget.style.background = COLORS.bg)} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ ...cell, width: 36 }} onClick={e => e.stopPropagation()}>
                      <input type="checkbox" checked={selected.has(keyOf(r.type, r.id))} onChange={() => toggleOne(r)} aria-label={`Select ${r.shopName}`} style={{ width: 16, height: 16, cursor: 'pointer' }} />
                    </td>
                    <td style={cell}>
                      <div style={{ fontWeight: 700, color: COLORS.white }}>{r.shopName}</div>
                      <div style={{ fontSize: 11, color: COLORS.muted }}>{r.agentCode}{r.parentShop ? ` · under ${r.parentShop}` : ''}{r.name ? ` · ${r.name}` : ''}</div>
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 4 }}>
                        {r.lowBalance && <span style={chip(COLORS.yellow)}>RUNNING DRY</span>}
                        {r.inactiveDays === null && <span style={chip(COLORS.muted)}>NEVER SOLD</span>}
                        {r.inactiveDays !== null && r.inactiveDays !== undefined && r.inactiveDays > 30 && <span style={chip(COLORS.red)}>QUIET {r.inactiveDays}D</span>}
                        {(() => { const d = daysSinceContacted(r.type, r.id); return d === null ? null : <span style={chip(COLORS.blueLight)}>MESSAGED {d === 0 ? 'TODAY' : `${d}D AGO`}</span> })()}
                      </div>
                    </td>
                    <td style={cell}><span style={chip(r.type === 'agent' ? COLORS.blueLight : COLORS.yellow)}>{r.type === 'agent' ? 'AGENT' : 'SUB-AGENT'}</span>{r.type === 'agent' && !!r.subAgents && <span style={{ fontSize: 11, color: COLORS.muted, marginLeft: 6 }}>{r.subAgents} subs</span>}</td>
                    <td style={{ ...cell, textAlign: 'right' }}>{r.orders.toLocaleString()}</td>
                    <td style={{ ...cell, textAlign: 'right' }}>{money(r.sales)}</td>
                    <td style={{ ...cell, textAlign: 'right', color: GREEN, fontWeight: 700 }}>{money(r.profit)}</td>
                    <td style={{ ...cell, textAlign: 'right' }}>
                      {money(r.walletBalance)}
                      {r.pendingWithdrawal > 0 && <div style={{ fontSize: 10, color: COLORS.yellow }}>{money(r.pendingWithdrawal)} pending</div>}
                    </td>
                    <td style={{ ...cell, textAlign: 'right' }}>{r.customers}</td>
                    <td style={{ ...cell, color: COLORS.muted }}>{ago(r.lastOrderAt)}</td>
                    <td style={{ ...cell, color: COLORS.muted }}>{new Date(r.joined).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}</td>
                    <td style={cell} onClick={e => e.stopPropagation()}>
                      <button onClick={() => setMessaging(r)} title="Send a WhatsApp check-in" aria-label={`Message ${r.shopName}`}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 8, border: `1px solid ${r.whatsapp ? '#25d36655' : COLORS.border}`, background: r.whatsapp ? '#25d36618' : 'transparent', color: r.whatsapp ? '#25d366' : COLORS.muted, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                        <FaWhatsapp size={14} /> Message
                      </button>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && <tr><td colSpan={11} style={{ padding: 40, textAlign: 'center', color: COLORS.muted }}>No one matches these filters.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {error && <p style={{ color: COLORS.red, fontSize: 13, marginTop: 12 }}>{error}</p>}

      {data && data.total > 0 && (
        <Pager page={data.page} pages={data.pages} total={data.total} pageSize={data.pageSize} onPage={setPage} onSize={setPageSize} busy={loading} />
      )}

      {open && <Detail row={open} onClose={() => setOpen(null)} onChanged={load} show={show} onMessage={() => { setMessaging(open); }} />}
      {messaging && <MessageModal row={messaging} onClose={() => { setMessaging(null); bump(n => n + 1) }} show={show} />}
      {bulkOpen && <BulkMessageModal rows={[...selected.values()]} onClose={() => { setBulkOpen(false); bump(n => n + 1) }} onProgress={() => bump(n => n + 1)} />}
    </div>
  )
}

const cell: React.CSSProperties = { padding: '11px 12px', fontSize: 13, color: COLORS.white, verticalAlign: 'middle' }

// ── Detail modal ──────────────────────────────────────────────────

function Detail({ row, onClose, onChanged, show, onMessage }: { row: AgentRow; onClose: () => void; onChanged: () => void; show: (m: string, t?: 'success' | 'error' | 'info') => void; onMessage: () => void }) {
  const [d, setD] = useState<AgentDetail | null>(null)
  const [err, setErr] = useState('')
  const reload = useCallback(() => adminApi.getAgentDetail(row.type, row.id).then(r => setD(r.data)).catch(e => setErr(e.message)), [row])
  useEffect(() => { reload() }, [reload])

  const p = d?.profile ?? row
  const wa = p.whatsapp ? `https://wa.me/${p.whatsapp.replace(/\D/g, '')}` : null

  return (
    <Modal isOpen onClose={onClose} title={`${row.shopName} · ${row.type === 'agent' ? 'Agent' : 'Sub-agent'}`} maxWidth="920px">
      {err && <div style={{ color: COLORS.red, fontSize: 13, marginBottom: 10 }}>{err}</div>}
      <div style={{ display: 'grid', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8 }}>
          {[['Wallet', money(p.walletBalance), COLORS.white], ['Profit earned', money(p.profit), GREEN], ['Sales', money(p.sales), COLORS.white], ['Orders', p.orders, COLORS.white],
            ['Customers', p.customers, COLORS.white], ['Withdrawn', money(p.withdrawn), COLORS.white], ['Pending payout', money(p.pendingWithdrawal), p.pendingWithdrawal ? COLORS.yellow : COLORS.white],
            ['Deposits', d ? `${d.deposits.count} · ${money(d.deposits.total)}` : '…', COLORS.white]].map(([l, v, c]) => (
            <div key={l as string} style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: '9px 11px' }}>
              <div style={{ fontSize: 10, color: COLORS.muted }}>{l}</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: c as string }}>{v}</div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 12, color: COLORS.muted, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <span>Code <strong style={{ color: COLORS.white }}>{p.agentCode}</strong></span>
          {p.name && <span>Name <strong style={{ color: COLORS.white }}>{p.name}</strong></span>}
          {p.parentShop && <span>Under <strong style={{ color: COLORS.white }}>{p.parentShop}</strong></span>}
          <span>Joined {new Date(p.joined).toLocaleDateString('en-GB')}</span>
          <span>Last order {ago(p.lastOrderAt)}</span>
          {wa ? <a href={wa} target="_blank" rel="noopener noreferrer" style={{ color: GREEN, fontWeight: 700 }}>WhatsApp {p.whatsapp}</a> : <span>No WhatsApp number</span>}
          <button onClick={onMessage} style={{ background: 'none', border: 'none', color: '#25d366', fontWeight: 700, cursor: 'pointer', padding: 0, fontSize: 12 }}>Send a check-in message</button>
        </div>

        <section>
          <h3 style={h3}>Profit per day (30 days)</h3>
          {d ? <BarChart height={150} color={GREEN} format={money} data={d.daily.map(x => ({ label: dayLabel(x.date), value: x.profit, detail: `${x.orders} orders` }))} /> : <div className="skeleton" style={{ height: 150, borderRadius: 10 }} />}
        </section>

        <WithdrawForm row={p} onDone={() => { reload(); onChanged() }} show={show} />

        {d && d.subAgents.length > 0 && (
          <section>
            <h3 style={h3}>Sub-agents ({d.subAgents.length})</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520, fontSize: 13 }}>
                <tbody>
                  {[...d.subAgents].sort((a, b) => b.profit - a.profit).map(s => (
                    <tr key={s.id} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                      <td style={cell}>{s.shopName}<div style={{ fontSize: 11, color: COLORS.muted }}>{s.agentCode}</div></td>
                      <td style={{ ...cell, textAlign: 'right' }}>{s.orders} orders</td>
                      <td style={{ ...cell, textAlign: 'right', color: GREEN }}>{money(s.profit)}</td>
                      <td style={{ ...cell, textAlign: 'right', color: COLORS.muted }}>{ago(s.lastOrderAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <section>
          <h3 style={h3}>Withdrawals</h3>
          {!d ? <div className="skeleton" style={{ height: 60, borderRadius: 10 }} /> : d.withdrawals.length === 0 ? <p style={muted}>None yet.</p> : (
            <div style={{ display: 'grid', gap: 6 }}>
              {d.withdrawals.slice(0, 8).map(w => {
                const c = w.status === 'success' ? GREEN : w.status === 'pending' ? COLORS.yellow : COLORS.red
                return (
                  <div key={w.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', padding: '8px 11px', background: COLORS.bg, borderRadius: 8, fontSize: 13, color: COLORS.white }}>
                    <span>{money(w.amount)} <span style={{ color: COLORS.muted }}>+ {money(w.fee)} charge · {w.network} {w.phone}</span></span>
                    <span style={{ color: c, fontWeight: 700 }}>{w.status === 'success' ? 'Completed' : w.status === 'pending' ? 'Pending' : 'Rejected'} <span style={{ color: COLORS.muted, fontWeight: 400 }}>{dateTime(w.createdAt)}</span></span>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        <section>
          <h3 style={h3}>Recent orders</h3>
          {!d ? <div className="skeleton" style={{ height: 80, borderRadius: 10 }} /> : d.recentOrders.length === 0 ? <p style={muted}>No orders yet.</p> : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560, fontSize: 13 }}>
                <tbody>
                  {d.recentOrders.map(o => (
                    <tr key={o.id} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                      <td style={{ ...cell, color: COLORS.muted, whiteSpace: 'nowrap' }}>{dateTime(o.createdAt)}</td>
                      <td style={cell}>{o.pkg}<div style={{ fontSize: 11, color: COLORS.muted }}>{o.phone}{o.selfOrder ? ' · own purchase' : ''}{o.viaSubAgent ? ' · via sub-agent' : ''}</div></td>
                      <td style={{ ...cell, textAlign: 'right' }}>{money(o.paid)}</td>
                      <td style={{ ...cell, textAlign: 'right', color: o.profit ? GREEN : COLORS.muted }}>{o.profit ? `+${money(o.profit)}` : '—'}</td>
                      <td style={{ ...cell, color: COLORS.muted, textTransform: 'capitalize' }}>{o.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </Modal>
  )
}

const h3: React.CSSProperties = { fontSize: 14, fontWeight: 700, color: COLORS.white, margin: '0 0 10px' }
const muted: React.CSSProperties = { fontSize: 13, color: COLORS.muted, margin: 0 }

/** Admin starts a withdrawal for the account: same charge and balance rules as self-service. */
function WithdrawForm({ row, onDone, show }: { row: AgentRow; onDone: () => void; show: (m: string, t?: 'success' | 'error' | 'info') => void }) {
  const [amount, setAmount] = useState('')
  const [network, setNetwork] = useState('MTN')
  const [phone, setPhone] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const amt = parseFloat(amount) || 0
  const fee = amt > 0 ? calcFee(amt) : 0
  const total = round2(amt + fee)
  const max = maxWd(row.walletBalance)
  const tooHigh = amt >= MIN_WD && total > row.walletBalance
  const ok = amt >= MIN_WD && !tooHigh && phone.replace(/\D/g, '').length >= 9

  const submit = async () => {
    setBusy(true); setErr('')
    try {
      await adminApi.initiateWithdrawal(row.type, row.id, { amount: amt, phone, network })
      show(`Withdrawal of ${money(amt)} created. ${money(total)} taken from the wallet.`)
      setAmount(''); onDone()
    } catch (e: any) { setErr(e.message) } finally { setBusy(false) }
  }

  return (
    <section style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 14 }}>
      <h3 style={h3}>Start a withdrawal for this account</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
        <label style={lbl}>Amount they receive (GH₵)
          <input style={field} inputMode="decimal" value={amount} placeholder="0.00" onChange={e => /^\d*\.?\d{0,2}$/.test(e.target.value) && setAmount(e.target.value)} />
        </label>
        <label style={lbl}>Network
          <select style={field} value={network} onChange={e => setNetwork(e.target.value)}><option>MTN</option><option>Telecel</option><option>AirtelTigo</option></select>
        </label>
        <label style={lbl}>MoMo number
          <input style={field} inputMode="tel" value={phone} placeholder="024 000 0000" onChange={e => setPhone(e.target.value)} />
        </label>
      </div>
      {amt > 0 && (
        <p style={{ fontSize: 12, color: COLORS.muted, margin: '10px 0 0', lineHeight: 1.6 }}>
          Charge <strong style={{ color: COLORS.white }}>{money(fee)}</strong> · wallet debit <strong style={{ color: COLORS.white }}>{money(total)}</strong> · balance after <strong style={{ color: COLORS.white }}>{money(Math.max(row.walletBalance - total, 0))}</strong>
        </p>
      )}
      {(tooHigh || amt > 0 && amt < MIN_WD) && (
        <p style={{ fontSize: 12, color: COLORS.red, margin: '8px 0 0' }}>
          {amt < MIN_WD ? `Minimum is ${money(MIN_WD)}.` : `${money(amt)} plus the ${money(fee)} charge is ${money(total)}, more than the ${money(row.walletBalance)} balance. ${max >= MIN_WD ? `Reduce it to ${money(max)} or less.` : 'Balance is too low.'}`}
        </p>
      )}
      {err && <p style={{ fontSize: 12, color: COLORS.red, margin: '8px 0 0' }}>{err}</p>}
      <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <button onClick={submit} disabled={!ok || busy} style={{ ...btn(COLORS.blue), opacity: ok && !busy ? 1 : 0.5 }}>{busy ? <span className="spinner" /> : 'Create withdrawal'}</button>
        <span style={{ fontSize: 11, color: COLORS.muted }}>Max for this wallet: {money(max)}. It will appear under Withdrawals as pending.</span>
      </div>
    </section>
  )
}
const lbl: React.CSSProperties = { display: 'grid', gap: 5, fontSize: 12, fontWeight: 600, color: COLORS.muted }


// ── Pagination ────────────────────────────────────────────────────

function Pager({ page, pages, total, pageSize, onPage, onSize, busy }: { page: number; pages: number; total: number; pageSize: number; onPage: (p: number) => void; onSize: (n: number) => void; busy: boolean }) {
  const from = (page - 1) * pageSize + 1, to = Math.min(page * pageSize, total)
  const window = Array.from({ length: pages }, (_, i) => i + 1).filter(p => p === 1 || p === pages || Math.abs(p - page) <= 1)
  const pb = (active: boolean, disabled = false): React.CSSProperties => ({
    minWidth: 34, height: 34, padding: '0 8px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    background: active ? COLORS.blue : COLORS.surface, color: active ? '#fff' : COLORS.muted, border: `1.5px solid ${active ? COLORS.blue : COLORS.border}`, opacity: disabled ? 0.4 : 1,
  })
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginTop: 14 }}>
      <span style={{ fontSize: 12, color: COLORS.muted }}>Showing {from.toLocaleString()}–{to.toLocaleString()} of {total.toLocaleString()}</span>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
        <button style={pb(false, page <= 1 || busy)} disabled={page <= 1 || busy} onClick={() => onPage(page - 1)} aria-label="Previous page"><HiChevronLeft size={16} /></button>
        {window.map((p, i) => (
          <span key={p} style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
            {i > 0 && p - window[i - 1] > 1 && <span style={{ color: COLORS.muted }}>…</span>}
            <button style={pb(p === page)} disabled={busy} onClick={() => onPage(p)}>{p}</button>
          </span>
        ))}
        <button style={pb(false, page >= pages || busy)} disabled={page >= pages || busy} onClick={() => onPage(page + 1)} aria-label="Next page"><HiChevronRight size={16} /></button>
        <select value={pageSize} onChange={e => onSize(Number(e.target.value))} style={{ ...field, width: 'auto', padding: '7px 8px' }} aria-label="Rows per page">
          {PAGE_SIZES.map(n => <option key={n} value={n}>{n} / page</option>)}
        </select>
      </div>
    </div>
  )
}

// ── WhatsApp check-in ─────────────────────────────────────────────

function MessageModal({ row, onClose, show }: { row: AgentRow; onClose: () => void; show: (m: string, t?: 'success' | 'error' | 'info') => void }) {
  const ctx = useMemo(() => templateContext(row), [row])
  const suggested = useMemo(() => suggestTemplate(row), [row])
  const [tid, setTid] = useState(suggested)
  const [text, setText] = useState(() => TEMPLATES.find(t => t.id === suggested)!.build(ctx))

  const pick = (id: string) => { setTid(id); setText(TEMPLATES.find(t => t.id === id)!.build(ctx)) }
  const link = whatsappLink(row.whatsapp, text)
  const copy = () => { navigator.clipboard?.writeText(text); show('Message copied', 'info') }

  return (
    <Modal isOpen onClose={onClose} title={`Message ${row.shopName}`} maxWidth="640px">
      <div style={{ display: 'grid', gap: 14 }}>
        <div style={{ fontSize: 12, color: COLORS.muted, lineHeight: 1.6 }}>
          {row.whatsapp ? <>To <strong style={{ color: COLORS.white }}>{row.whatsapp}</strong></> : <span style={{ color: COLORS.yellow }}>No WhatsApp number on file. You can still copy the message.</span>}
          {' · '}Wallet {money(row.walletBalance)} · {row.inactiveDays === null || row.inactiveDays === undefined ? 'has never sold' : row.inactiveDays <= 1 ? 'sold recently' : `last sale ${row.inactiveDays} days ago`}
        </div>

        <div style={{ display: 'grid', gap: 8 }}>
          {TEMPLATES.map(t => {
            const active = t.id === tid
            return (
              <button key={t.id} onClick={() => pick(t.id)} style={{
                textAlign: 'left', padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                background: active ? `${COLORS.blue}18` : COLORS.bg, border: `1.5px solid ${active ? COLORS.blue : COLORS.border}`, color: COLORS.white,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700 }}>
                  {t.label}
                  {t.id === suggested && <span style={chip(GREEN)}>SUGGESTED</span>}
                </div>
                <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>{t.hint}</div>
              </button>
            )
          })}
        </div>

        <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 600, color: COLORS.muted }}>
          Message (edit before sending)
          <textarea value={text} onChange={e => setText(e.target.value)} rows={6}
            style={{ ...field, fontSize: 16, lineHeight: 1.55, resize: 'vertical', fontFamily: 'inherit' }} />
        </label>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {link ? (
            <a href={link} target="_blank" rel="noopener noreferrer" onClick={() => { markContacted(row.type, row.id); setTimeout(onClose, 150) }}
              style={{ ...btn('#1fa855'), flex: '1 1 200px', textDecoration: 'none' }}><FaWhatsapp size={16} /> Open in WhatsApp</a>
          ) : (
            <button disabled style={{ ...btn('#1fa855'), flex: '1 1 200px', opacity: 0.4, cursor: 'not-allowed' }}><FaWhatsapp size={16} /> No number</button>
          )}
          <button onClick={copy} style={{ ...btn(COLORS.faint), flex: '0 1 auto' }}>Copy</button>
        </div>
      </div>
    </Modal>
  )
}
