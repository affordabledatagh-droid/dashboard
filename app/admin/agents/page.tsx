'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { COLORS } from '@/lib/constants/colors'
import Modal from '@/components/admin/Modal'
import Toast from '@/components/admin/Toast'
import { BarChart, dayLabel } from '@/components/admin/Charts'
import { adminApi, AgentDetail, AgentRow, AgentsList } from '@/lib/utils/adminApi'
import { money, ago, dateTime } from '@/lib/utils/format'
import { HiChevronUp, HiChevronDown, HiMagnifyingGlass } from 'react-icons/hi2'

type Scope = 'all' | 'agent' | 'sub_agent'
type SortKey = 'shopName' | 'orders' | 'sales' | 'profit' | 'walletBalance' | 'customers' | 'lastOrderAt' | 'joined'
type Activity = 'all' | 'active' | 'inactive' | 'pending'

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

export default function AgentsPage() {
  const [data, setData] = useState<AgentsList | null>(null)
  const [loading, setLoading] = useState(true)
  const [scope, setScope] = useState<Scope>('all')
  const [activity, setActivity] = useState<Activity>('all')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'profit', dir: 'desc' })
  const [open, setOpen] = useState<AgentRow | null>(null)
  const [toast, setToast] = useState({ message: '', type: 'success' as 'success' | 'error' | 'info', visible: false })
  const show = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => setToast({ message, type, visible: true }), [])

  const load = useCallback(async () => {
    try { setData((await adminApi.getAgents()).data) } catch (e: any) { show(e.message, 'error') } finally { setLoading(false) }
  }, [show])
  useEffect(() => { load() }, [load])

  const rows = useMemo(() => {
    if (!data) return []
    let list = scope === 'agent' ? data.agents : scope === 'sub_agent' ? data.subAgents : [...data.agents, ...data.subAgents]
    const q = query.trim().toLowerCase()
    const recent = (r: AgentRow) => r.lastOrderAt && Date.now() - new Date(r.lastOrderAt).getTime() < 30 * 864e5
    list = list.filter(r => {
      if (q && !`${r.shopName} ${r.name ?? ''} ${r.agentCode} ${r.whatsapp ?? ''} ${r.parentShop ?? ''}`.toLowerCase().includes(q)) return false
      if (activity === 'active') return !!recent(r)
      if (activity === 'inactive') return !recent(r)
      if (activity === 'pending') return r.pendingWithdrawal > 0
      return true
    })
    const dir = sort.dir === 'asc' ? 1 : -1
    return [...list].sort((a, b) => {
      const A: any = a[sort.key] ?? (sort.key === 'lastOrderAt' ? '' : 0), B: any = b[sort.key] ?? (sort.key === 'lastOrderAt' ? '' : 0)
      return (A < B ? -1 : A > B ? 1 : 0) * dir
    })
  }, [data, scope, activity, query, sort])

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
          {[['Agents', t.agents, COLORS.white], ['Sub-agents', t.subAgents, COLORS.white], ['Active (30 days)', t.activeLast30, GREEN],
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
          <option value="all">Any activity</option><option value="active">Sold in last 30 days</option><option value="inactive">No sales in 30 days</option><option value="pending">Has pending withdrawal</option>
        </select>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: COLORS.surface, border: `1.5px solid ${COLORS.border}`, borderRadius: 8, padding: '0 10px', flex: '1 1 220px', maxWidth: 340 }}>
          <HiMagnifyingGlass size={16} color={COLORS.muted} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search shop, code, number" style={{ ...field, border: 'none', background: 'transparent', padding: '9px 0' }} />
        </div>
        <span style={{ fontSize: 12, color: COLORS.muted }}>{rows.length} shown</span>
      </div>

      <div style={{ background: COLORS.surface, border: `1.5px solid ${COLORS.border}`, borderRadius: 14, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 20, display: 'grid', gap: 10 }}>{Array.from({ length: 8 }, (_, i) => <div key={i} className="skeleton" style={{ height: 48, borderRadius: 8 }} />)}</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 980 }}>
              <thead><tr style={{ background: COLORS.bg }}>
                <Th k="shopName">Shop</Th><Th>Type</Th><Th k="orders" right>Orders</Th><Th k="sales" right>Sales</Th><Th k="profit" right>Profit</Th>
                <Th k="walletBalance" right>Wallet</Th><Th k="customers" right>Customers</Th><Th k="lastOrderAt">Last order</Th><Th k="joined">Joined</Th>
              </tr></thead>
              <tbody>
                {rows.map(r => (
                  <tr key={`${r.type}:${r.id}`} onClick={() => setOpen(r)} style={{ borderTop: `1px solid ${COLORS.border}`, cursor: 'pointer' }}
                    onMouseEnter={e => (e.currentTarget.style.background = COLORS.bg)} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={cell}>
                      <div style={{ fontWeight: 700, color: COLORS.white }}>{r.shopName}</div>
                      <div style={{ fontSize: 11, color: COLORS.muted }}>{r.agentCode}{r.parentShop ? ` · under ${r.parentShop}` : ''}{r.name ? ` · ${r.name}` : ''}</div>
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
                  </tr>
                ))}
                {rows.length === 0 && <tr><td colSpan={9} style={{ padding: 40, textAlign: 'center', color: COLORS.muted }}>No one matches these filters.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {open && <Detail row={open} onClose={() => setOpen(null)} onChanged={load} show={show} />}
    </div>
  )
}

const cell: React.CSSProperties = { padding: '11px 12px', fontSize: 13, color: COLORS.white, verticalAlign: 'middle' }

// ── Detail modal ──────────────────────────────────────────────────

function Detail({ row, onClose, onChanged, show }: { row: AgentRow; onClose: () => void; onChanged: () => void; show: (m: string, t?: 'success' | 'error' | 'info') => void }) {
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
