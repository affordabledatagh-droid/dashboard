'use client'

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { COLORS, NETWORK_COLORS } from '@/lib/constants/colors'
import Modal from '@/components/admin/Modal'
import Toast from '@/components/admin/Toast'
import { adminApi, Pricing, PricingRow, PriceStatus } from '@/lib/utils/adminApi'
import { money } from '@/lib/utils/format'
import { HiPencil, HiTrash, HiPlus, HiArrowPath, HiChevronUp, HiChevronDown, HiMagnifyingGlass, HiExclamationTriangle } from 'react-icons/hi2'

type Network = 'MTN' | 'TELECEL' | 'AT PREMIUM'
type SortKey = 'network' | 'size' | 'mhany' | 'price' | 'markup' | 'status'
type StatusFilter = 'all' | 'below' | 'equal' | 'above' | 'unavailable' | 'alert' | 'inactive'

const GREEN = '#22c55e'
const NETWORKS: ('All' | Network)[] = ['All', 'MTN', 'TELECEL', 'AT PREMIUM']

const STATUS_RANK: Record<PriceStatus, number> = { below: 0, unavailable: 1, equal: 2, above: 3, unknown: 4 }

const fieldStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', background: COLORS.bg, border: `1.5px solid ${COLORS.border}`,
  borderRadius: 8, color: COLORS.white, fontSize: 14, outline: 'none', boxSizing: 'border-box',
}

interface FormState { network: Network; name: string; data_size: string; validity: string; admin_price: string; is_active: boolean }
const EMPTY: FormState = { network: 'MTN', name: '', data_size: '', validity: '', admin_price: '', is_active: true }

/** Markup (ours − Mhany) colour: red below cost, green above, neutral at break-even */
const markupColor = (m: number | null) => (m === null ? COLORS.muted : m < 0 ? COLORS.red : m === 0 ? COLORS.yellow : GREEN)

// ── A single row. Module-level + memo so typing never remounts the input (which would drop focus). ──
interface RowProps {
  row: PricingRow
  draft: string | undefined
  onDraft: (id: string, v: string) => void
  onEnter: (id: string) => void
  onToggle: (row: PricingRow) => void
  onEdit: (row: PricingRow) => void
  onDelete: (row: PricingRow) => void
}

const Row = memo(function Row({ row, draft, onDraft, onEnter, onToggle, onEdit, onDelete }: RowProps) {
  const value = draft ?? String(row.admin_price)
  const typed = parseFloat(draft ?? '')
  const price = draft !== undefined && isFinite(typed) ? typed : row.admin_price
  const markup = row.mhany ? Math.round((price - row.mhany.price) * 100) / 100 : null
  const dirty = draft !== undefined && draft !== String(row.admin_price)
  const mc = markupColor(markup)
  const net = (NETWORK_COLORS as any)[row.network]
  const tint = row.alert ? `${COLORS.red}12` : markup !== null && markup < 0 ? `${COLORS.red}0d` : 'transparent'

  return (
    <tr style={{ background: tint, borderTop: `1px solid ${COLORS.border}` }}>
      <td style={td}>
        <span style={{ padding: '3px 9px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: net?.bg, color: net?.text }}>{row.network}</span>
      </td>
      <td style={td}>
        <div style={{ fontWeight: 600, color: COLORS.white, fontSize: 14 }}>{row.data_size}</div>
        <div style={{ fontSize: 11, color: COLORS.muted }}>{row.name} · {row.validity}</div>
      </td>
      <td style={td}>
        {row.mhany ? (
          <span style={{ fontWeight: 600, color: COLORS.white }}>{money(row.mhany.price)}</span>
        ) : (
          <span style={{ fontSize: 11, fontWeight: 700, color: COLORS.red, border: `1px solid ${COLORS.red}`, borderRadius: 6, padding: '3px 8px', whiteSpace: 'nowrap' }}>
            {row.status === 'unknown' ? 'Mhany offline' : 'Disabled on Mhany'}
          </span>
        )}
      </td>
      <td style={td}>
        <div style={{ position: 'relative', width: 128 }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: COLORS.muted, pointerEvents: 'none' }}>GH₵</span>
          <input
            data-price-input={row.id}
            type="text" inputMode="decimal" value={value}
            onChange={e => { if (/^\d*\.?\d{0,2}$/.test(e.target.value)) onDraft(row.id, e.target.value) }}
            onFocus={e => e.currentTarget.select()}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); onEnter(row.id) } }}
            aria-label={`Price for ${row.network} ${row.data_size}`}
            style={{ ...fieldStyle, padding: '8px 10px 8px 38px', fontWeight: 700, borderColor: dirty ? COLORS.blue : COLORS.border, background: dirty ? `${COLORS.blue}12` : COLORS.bg }}
          />
        </div>
      </td>
      <td style={td}>
        {markup === null ? <span style={{ color: COLORS.muted }}>—</span> : (
          <div>
            <div style={{ fontWeight: 800, color: mc }}>{markup > 0 ? '+' : ''}{money(markup).replace('GH₵ ', 'GH₵ ')}</div>
            <div style={{ fontSize: 11, color: mc }}>{markup < 0 ? 'Below Mhany' : markup === 0 ? 'No profit' : 'Above Mhany'}</div>
          </div>
        )}
      </td>
      <td style={td}>
        <button onClick={() => onToggle(row)} title={row.is_active ? 'Click to disable' : 'Click to enable'} style={{
          padding: '5px 12px', borderRadius: 6, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', border: 'none', cursor: 'pointer',
          background: row.is_active ? `${GREEN}22` : `${COLORS.red}22`, color: row.is_active ? GREEN : COLORS.red,
        }}>{row.is_active ? 'Enabled' : 'Disabled'}</button>
        {row.alert && (
          <div style={{ display: 'flex', gap: 5, alignItems: 'flex-start', marginTop: 6, fontSize: 11, color: COLORS.red, maxWidth: 190, lineHeight: 1.35 }}>
            <HiExclamationTriangle size={13} style={{ flexShrink: 0, marginTop: 1 }} />
            Still enabled but Mhany doesn't list it. Disable it.
          </div>
        )}
      </td>
      <td style={td}>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => onEdit(row)} title="Edit details" style={iconBtn(COLORS.blue)}><HiPencil size={15} /></button>
          <button onClick={() => onDelete(row)} title="Delete" style={iconBtn(COLORS.red)}><HiTrash size={15} /></button>
        </div>
      </td>
    </tr>
  )
})

const td: React.CSSProperties = { padding: '10px 12px', fontSize: 13, verticalAlign: 'middle' }
const iconBtn = (c: string): React.CSSProperties => ({ padding: 7, background: COLORS.faint, border: 'none', borderRadius: 6, color: c, cursor: 'pointer', display: 'flex' })

// ── Page ──────────────────────────────────────────────────────────

export default function PackagesPage() {
  const [pricing, setPricing] = useState<Pricing | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const [network, setNetwork] = useState<'All' | Network>('All')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'network', dir: 'asc' })
  const [bulkMarkup, setBulkMarkup] = useState('')

  const [modal, setModal] = useState<'add' | 'edit' | 'delete' | null>(null)
  const [selected, setSelected] = useState<PricingRow | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [toast, setToast] = useState({ message: '', type: 'success' as 'success' | 'error' | 'info', visible: false })
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => setToast({ message, type, visible: true }), [])

  const load = useCallback(async (quiet = false) => {
    quiet ? setRefreshing(true) : setLoading(true)
    try { setPricing((await adminApi.getPricing()).data) }
    catch (e: any) { showToast(e.message, 'error') }
    finally { setLoading(false); setRefreshing(false) }
  }, [showToast])

  useEffect(() => { load() }, [load])

  // Warn before leaving with unsaved prices
  const dirtyIds = useMemo(() => {
    if (!pricing) return []
    return pricing.packages.filter(p => drafts[p.id] !== undefined && drafts[p.id] !== String(p.admin_price)).map(p => p.id)
  }, [pricing, drafts])
  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => { if (dirtyIds.length) e.preventDefault() }
    window.addEventListener('beforeunload', h)
    return () => window.removeEventListener('beforeunload', h)
  }, [dirtyIds.length])

  // ── Filter + sort ───────────────────────────────────────────────
  const rows = useMemo(() => {
    if (!pricing) return []
    const q = query.trim().toLowerCase()
    // Filtering and sorting use SAVED values only, so a row never jumps or disappears while you type in it.
    const live = (r: PricingRow) => r.admin_price
    const liveMarkup = (r: PricingRow) => r.markup
    const liveStatus = (r: PricingRow): PriceStatus => r.status

    let list = pricing.packages.filter(r => {
      if (network !== 'All' && r.network !== network) return false
      if (q && !`${r.name} ${r.data_size} ${r.network} ${r.validity}`.toLowerCase().includes(q)) return false
      switch (statusFilter) {
        case 'below': case 'equal': case 'above': return liveStatus(r) === statusFilter
        case 'unavailable': return !r.mhany
        case 'alert': return r.alert
        case 'inactive': return !r.is_active
        default: return true
      }
    })

    const dir = sort.dir === 'asc' ? 1 : -1
    const val = (r: PricingRow): number | string => {
      switch (sort.key) {
        case 'network': return r.network
        case 'size': return r.size_mb ?? 0
        case 'mhany': return r.mhany?.price ?? -1
        case 'price': return live(r)
        case 'markup': return liveMarkup(r) ?? -9999
        case 'status': return STATUS_RANK[liveStatus(r)]
      }
    }
    list = [...list].sort((a, b) => {
      const A = val(a), B = val(b)
      if (A < B) return -1 * dir
      if (A > B) return 1 * dir
      return (a.size_mb ?? 0) - (b.size_mb ?? 0)
    })
    return list
  }, [pricing, network, statusFilter, query, sort])

  // ── Handlers (stable identities so memoised rows don't re-render) ──
  const onDraft = useCallback((id: string, v: string) => setDrafts(d => ({ ...d, [id]: v })), [])

  const idsRef = useRef<string[]>([])
  idsRef.current = rows.map(r => r.id)
  const onEnter = useCallback((id: string) => {
    const ids = idsRef.current
    const next = ids[ids.indexOf(id) + 1]
    if (next) (document.querySelector(`[data-price-input="${next}"]`) as HTMLInputElement | null)?.focus()
    else (document.activeElement as HTMLElement | null)?.blur()
  }, [])

  const toggle = useCallback(async (row: PricingRow) => {
    try {
      await adminApi.updatePackage(row.id, { is_active: !row.is_active })
      setPricing(p => p && ({
        ...p,
        packages: p.packages.map(x => x.id === row.id ? { ...x, is_active: !row.is_active, alert: !row.is_active && x.status === 'unavailable' } : x),
        summary: { ...p.summary, alerts: p.packages.filter(x => (x.id === row.id ? (!row.is_active && x.status === 'unavailable') : x.alert)).length },
      }))
      showToast(`${row.data_size} ${row.network} ${row.is_active ? 'disabled' : 'enabled'}`)
    } catch (e: any) { showToast(e.message, 'error') }
  }, [showToast])

  const openEdit = useCallback((row: PricingRow) => {
    setSelected(row)
    setForm({ network: row.network as Network, name: row.name, data_size: row.data_size, validity: row.validity, admin_price: String(row.admin_price), is_active: row.is_active })
    setModal('edit')
  }, [])
  const openDelete = useCallback((row: PricingRow) => { setSelected(row); setModal('delete') }, [])

  const openAdd = (preset?: Partial<FormState>) => {
    setSelected(null)
    setForm({ ...EMPTY, network: network === 'All' ? 'MTN' : network, ...preset })
    setModal('add')
  }

  const saveAll = async () => {
    const updates = dirtyIds.map(id => ({ id, admin_price: parseFloat(drafts[id]) }))
    if (updates.some(u => !isFinite(u.admin_price) || u.admin_price < 0)) { showToast('Fix the highlighted prices first', 'error'); return }
    setSaving(true)
    try {
      await adminApi.savePrices(updates)
      setPricing(p => p && ({
        ...p,
        packages: p.packages.map(x => {
          const u = updates.find(u => u.id === x.id)
          if (!u) return x
          const markup = x.mhany ? Math.round((u.admin_price - x.mhany.price) * 100) / 100 : null
          return { ...x, admin_price: u.admin_price, markup, status: !x.mhany ? x.status : markup! < 0 ? 'below' : markup === 0 ? 'equal' : 'above' }
        }),
      }))
      setDrafts({})
      showToast(`${updates.length} price${updates.length > 1 ? 's' : ''} saved`)
    } catch (e: any) { showToast(e.message, 'error') }
    finally { setSaving(false) }
  }

  const applyBulkMarkup = () => {
    const m = parseFloat(bulkMarkup)
    if (!isFinite(m)) return
    const next: Record<string, string> = {}
    rows.forEach(r => { if (r.mhany) next[r.id] = (Math.round((r.mhany.price + m) * 100) / 100).toFixed(2).replace(/\.?0+$/, '') })
    setDrafts(d => ({ ...d, ...next }))
    showToast(`Set ${Object.keys(next).length} prices to Mhany + GH₵${m}. Review, then Save.`, 'info')
  }

  const disableUnavailable = async () => {
    const targets = (pricing?.packages ?? []).filter(p => p.alert)
    try {
      for (const p of targets) await adminApi.updatePackage(p.id, { is_active: false })
      showToast(`Disabled ${targets.length} package${targets.length > 1 ? 's' : ''}`)
      load(true)
    } catch (e: any) { showToast(e.message, 'error'); load(true) }
  }

  const saveForm = async () => {
    const price = parseFloat(form.admin_price)
    if (!form.name || !form.data_size || !form.validity || !isFinite(price) || price <= 0) { showToast('Fill in all fields', 'error'); return }
    setSaving(true)
    try {
      if (modal === 'add') {
        await adminApi.createPackage({ name: form.name, dataSize: form.data_size, validity: form.validity, adminPrice: price, network: form.network })
        showToast('Package added')
      } else if (selected) {
        await adminApi.updatePackage(selected.id, { name: form.name, data_size: form.data_size, validity: form.validity, admin_price: price, network: form.network, is_active: form.is_active })
        showToast('Package updated')
      }
      setModal(null); setDrafts({}); load(true)
    } catch (e: any) { showToast(e.message, 'error') } finally { setSaving(false) }
  }

  const doDelete = async () => {
    if (!selected) return
    setSaving(true)
    try { await adminApi.deletePackage(selected.id); showToast('Package deleted'); setModal(null); load(true) }
    catch (e: any) { showToast(e.message, 'error') } finally { setSaving(false) }
  }

  const sortBy = (key: SortKey) => setSort(s => s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' })
  const Th = ({ k, children }: { k?: SortKey; children: React.ReactNode }) => (
    <th onClick={k ? () => sortBy(k) : undefined} style={{ padding: '11px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: COLORS.muted, textTransform: 'uppercase', whiteSpace: 'nowrap', cursor: k ? 'pointer' : 'default', userSelect: 'none' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        {children}{k && sort.key === k && (sort.dir === 'asc' ? <HiChevronUp size={13} /> : <HiChevronDown size={13} />)}
      </span>
    </th>
  )

  const s = pricing?.summary

  return (
    <div style={{ padding: 'clamp(16px, 4vw, 32px) clamp(12px, 3vw, 24px)', maxWidth: 1400, margin: '0 auto', paddingBottom: dirtyIds.length ? 96 : undefined }}>
      <Toast message={toast.message} type={toast.type} isVisible={toast.visible} onClose={() => setToast(t => ({ ...t, visible: false }))} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
        <div>
          <h1 style={{ fontSize: 'clamp(22px, 4vw, 28px)', fontWeight: 800, color: COLORS.white, margin: 0 }}>Packages & pricing</h1>
          <p style={{ fontSize: 13, color: COLORS.muted, margin: '6px 0 0' }}>
            Our price next to Mhany's. <span style={{ color: COLORS.red }}>Red</span> means we sell below what Mhany charges us, <span style={{ color: GREEN }}>green</span> means we earn on top.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => load(true)} disabled={refreshing} style={{ ...btn(COLORS.faint), color: COLORS.white }}>
            {refreshing ? <span className="spinner" /> : <HiArrowPath size={16} />} Refresh Mhany
          </button>
          <button onClick={() => openAdd()} style={btn(COLORS.blue)}><HiPlus size={16} /> Add package</button>
        </div>
      </div>

      {pricing && !pricing.mhanyOnline && (
        <Banner tone="warn">Couldn't reach Mhany, so prices can't be compared right now. Nothing is marked as disabled.</Banner>
      )}
      {s && s.alerts > 0 && (
        <Banner tone="danger" action={<button onClick={disableUnavailable} style={{ ...btn(COLORS.red), padding: '7px 12px' }}>Disable all {s.alerts}</button>}>
          {s.alerts} package{s.alerts > 1 ? 's are' : ' is'} still enabled but no longer on Mhany. Customers can order {s.alerts > 1 ? 'them' : 'it'} and we can't deliver.
        </Banner>
      )}

      {s && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginBottom: 16 }}>
          {[
            ['Packages', s.total, COLORS.white], ['Enabled', s.active, GREEN],
            ['Below Mhany', s.below, s.below ? COLORS.red : COLORS.muted], ['Not on Mhany', s.unavailable, s.unavailable ? COLORS.yellow : COLORS.muted],
          ].map(([l, v, c]) => (
            <div key={l as string} style={{ background: COLORS.surface, border: `1.5px solid ${COLORS.border}`, borderRadius: 12, padding: '12px 14px' }}>
              <div style={{ fontSize: 11, color: COLORS.muted }}>{l}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: c as string }}>{v}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {NETWORKS.map(n => (
            <button key={n} onClick={() => setNetwork(n)} style={{
              padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              background: network === n ? COLORS.blue : COLORS.surface, color: network === n ? '#fff' : COLORS.muted,
              border: `1.5px solid ${network === n ? COLORS.blue : COLORS.border}`,
            }}>{n}</button>
          ))}
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as StatusFilter)} style={{ ...fieldStyle, width: 'auto', padding: '8px 10px' }}>
          <option value="all">All statuses</option>
          <option value="below">Below Mhany</option>
          <option value="equal">Same as Mhany</option>
          <option value="above">Above Mhany</option>
          <option value="unavailable">Not on Mhany</option>
          <option value="alert">Enabled but not on Mhany</option>
          <option value="inactive">Disabled by us</option>
        </select>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: COLORS.surface, border: `1.5px solid ${COLORS.border}`, borderRadius: 8, padding: '0 10px', flex: '1 1 200px', maxWidth: 320 }}>
          <HiMagnifyingGlass size={16} color={COLORS.muted} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search packages" style={{ ...fieldStyle, border: 'none', background: 'transparent', padding: '9px 0' }} />
        </div>
      </div>

      {/* Bulk markup helper */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 14, fontSize: 12, color: COLORS.muted }}>
        Set the {rows.length} shown package{rows.length === 1 ? '' : 's'} to Mhany price +
        <input value={bulkMarkup} onChange={e => /^-?\d*\.?\d{0,2}$/.test(e.target.value) && setBulkMarkup(e.target.value)} placeholder="0.50" inputMode="decimal"
          style={{ ...fieldStyle, width: 80, padding: '7px 9px' }} />
        <button onClick={applyBulkMarkup} disabled={!bulkMarkup || bulkMarkup === '-'} style={{ ...btn(COLORS.faint), color: COLORS.white, padding: '7px 12px', opacity: bulkMarkup ? 1 : 0.5 }}>Fill prices</button>
        <span>(nothing saves until you press Save)</span>
      </div>

      <div style={{ background: COLORS.surface, border: `1.5px solid ${COLORS.border}`, borderRadius: 14, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 20, display: 'grid', gap: 10 }}>
            {Array.from({ length: 8 }, (_, i) => <div key={i} className="skeleton" style={{ height: 46, borderRadius: 8 }} />)}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 860 }}>
              <thead>
                <tr style={{ background: COLORS.bg }}>
                  <Th k="network">Network</Th><Th k="size">Package</Th><Th k="mhany">Mhany price</Th>
                  <Th k="price">Our price</Th><Th k="markup">Our markup</Th><Th k="status">Status</Th><Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <Row key={r.id} row={r} draft={drafts[r.id]} onDraft={onDraft} onEnter={onEnter} onToggle={toggle} onEdit={openEdit} onDelete={openDelete} />
                ))}
                {rows.length === 0 && (
                  <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: COLORS.muted, fontSize: 14 }}>No packages match these filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mhany bundles we don't sell yet */}
      {pricing && pricing.unlisted.length > 0 && (
        <details style={{ marginTop: 20, background: COLORS.surface, border: `1.5px solid ${COLORS.border}`, borderRadius: 14, padding: '14px 16px' }}>
          <summary style={{ cursor: 'pointer', color: COLORS.white, fontWeight: 700, fontSize: 14 }}>
            {pricing.unlisted.length} Mhany bundle{pricing.unlisted.length > 1 ? 's' : ''} we don't sell yet
          </summary>
          <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
            {pricing.unlisted.map(b => (
              <div key={b.bundleId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap', padding: '8px 10px', background: COLORS.bg, borderRadius: 8, fontSize: 13, color: COLORS.white }}>
                <span>{b.network} · {b.size} <span style={{ color: COLORS.muted }}>· costs {money(b.price)}</span></span>
                <button onClick={() => openAdd({
                  network: /telecel/i.test(b.network) ? 'TELECEL' : /airtel|tigo|^at/i.test(b.network) ? 'AT PREMIUM' : 'MTN',
                  name: `${b.network.replace(/\s*\(.*\)/, '')} ${b.size}`, data_size: b.size, admin_price: String(b.price),
                })} style={{ ...btn(COLORS.faint), color: COLORS.white, padding: '6px 10px' }}>Add to our catalogue</button>
              </div>
            ))}
          </div>
        </details>
      )}

      {/* Unsaved changes bar */}
      {dirtyIds.length > 0 && (
        <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 40, background: COLORS.surface, borderTop: `1.5px solid ${COLORS.blue}`, padding: '12px clamp(12px, 3vw, 24px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ color: COLORS.white, fontSize: 14, fontWeight: 600 }}>{dirtyIds.length} unsaved price change{dirtyIds.length > 1 ? 's' : ''}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setDrafts({})} disabled={saving} style={{ ...btn(COLORS.faint), color: COLORS.white }}>Discard</button>
            <button onClick={saveAll} disabled={saving} style={btn(COLORS.blue)}>{saving ? <><span className="spinner" /> Saving</> : `Save ${dirtyIds.length}`}</button>
          </div>
        </div>
      )}

      {/* Add / edit */}
      {(modal === 'add' || modal === 'edit') && (
        <Modal isOpen onClose={() => setModal(null)} title={modal === 'add' ? 'Add package' : 'Edit package'} maxWidth="560px">
          <div style={{ display: 'grid', gap: 14 }}>
            <label style={lbl}>Network
              <select value={form.network} onChange={e => setForm(f => ({ ...f, network: e.target.value as Network }))} style={fieldStyle}>
                <option value="MTN">MTN</option><option value="TELECEL">TELECEL</option><option value="AT PREMIUM">AT PREMIUM</option>
              </select>
            </label>
            <label style={lbl}>Package name
              <input style={fieldStyle} value={form.name} placeholder="e.g. MTN 1 GB" onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14 }}>
              <label style={lbl}>Data size
                <input style={fieldStyle} value={form.data_size} placeholder="e.g. 1 GB" onChange={e => setForm(f => ({ ...f, data_size: e.target.value }))} />
              </label>
              <label style={lbl}>Validity
                <input style={fieldStyle} value={form.validity} placeholder="e.g. 30 days" onChange={e => setForm(f => ({ ...f, validity: e.target.value }))} />
              </label>
            </div>
            <label style={lbl}>Our price (GH₵)
              <input style={fieldStyle} inputMode="decimal" value={form.admin_price} onChange={e => /^\d*\.?\d{0,2}$/.test(e.target.value) && setForm(f => ({ ...f, admin_price: e.target.value }))} />
            </label>
            {modal === 'edit' && (
              <label style={lbl}>Status
                <select style={fieldStyle} value={form.is_active ? 'on' : 'off'} onChange={e => setForm(f => ({ ...f, is_active: e.target.value === 'on' }))}>
                  <option value="on">Enabled</option><option value="off">Disabled</option>
                </select>
              </label>
            )}
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button onClick={() => setModal(null)} style={{ ...btn(COLORS.faint), color: COLORS.white, flex: 1 }}>Cancel</button>
              <button onClick={saveForm} disabled={saving} style={{ ...btn(COLORS.blue), flex: 1 }}>{saving ? 'Saving…' : modal === 'add' ? 'Add package' : 'Save changes'}</button>
            </div>
          </div>
        </Modal>
      )}

      {modal === 'delete' && selected && (
        <Modal isOpen onClose={() => setModal(null)} title="Delete package">
          <p style={{ fontSize: 14, color: COLORS.muted, marginBottom: 18 }}>
            Delete <strong style={{ color: COLORS.white }}>{selected.name}</strong>? This removes it from every agent shop and can't be undone. Consider disabling it instead.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setModal(null)} style={{ ...btn(COLORS.faint), color: COLORS.white, flex: 1 }}>Cancel</button>
            <button onClick={doDelete} disabled={saving} style={{ ...btn(COLORS.red), flex: 1 }}>{saving ? 'Deleting…' : 'Delete'}</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

const lbl: React.CSSProperties = { display: 'grid', gap: 6, fontSize: 13, fontWeight: 600, color: COLORS.muted }
const btn = (bg: string): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '9px 14px', background: bg, border: 'none',
  borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
})

function Banner({ tone, children, action }: { tone: 'danger' | 'warn'; children: React.ReactNode; action?: React.ReactNode }) {
  const c = tone === 'danger' ? COLORS.red : COLORS.yellow
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', padding: '11px 14px', marginBottom: 12, borderRadius: 10, background: `${c}14`, border: `1px solid ${c}55`, color: COLORS.white, fontSize: 13, lineHeight: 1.5 }}>
      <HiExclamationTriangle size={18} color={c} style={{ flexShrink: 0 }} />
      <span style={{ flex: '1 1 260px' }}>{children}</span>
      {action}
    </div>
  )
}
