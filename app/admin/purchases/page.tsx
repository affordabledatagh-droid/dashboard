'use client'

import { useEffect, useState, useMemo } from 'react'
import { COLORS, NETWORK_COLORS } from '@/lib/constants/colors'
import { adminApi } from '@/lib/utils/adminApi'

type OrderStatus = 'placed' | 'processing' | 'delivered'
type TabFilter   = 'placed' | 'processing' | 'delivered'

interface Transaction {
  id: string
  phone_number: string
  total_paid: number
  agent_profit_at_purchase: number
  sub_agent_profit_at_purchase: number
  status: string
  order_status: OrderStatus
  created_at: string
  delivered_at: string | null
  data_packages: { name: string; data_size: string; network: string } | null
}

const STATUS_STYLE: Record<OrderStatus, { bg: string; color: string }> = {
  placed:     { bg: '#3b82f615', color: '#3b82f6' },
  processing: { bg: '#f5c40018', color: '#f5c400' },
  delivered:  { bg: '#22c55e18', color: '#22c55e' },
}

function OrderBadge({ status }: { status: OrderStatus }) {
  const s = STATUS_STYLE[status] ?? STATUS_STYLE.placed
  return (
    <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, textTransform: 'capitalize', background: s.bg, color: s.color }}>
      {status}
    </span>
  )
}

function NetworkBadge({ network }: { network: string }) {
  const c = (NETWORK_COLORS as any)[network] ?? { bg: '#ffffff10', text: '#fff' }
  return (
    <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: c.bg, color: c.text }}>
      {network}
    </span>
  )
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function gbValue(dataSize: string | undefined): number {
  if (!dataSize) return 0
  return parseFloat(dataSize) || 0
}

function buildExportText(rows: Transaction[]): string {
  const groups: Record<string, Transaction[]> = {}
  for (const tx of rows) {
    const net = tx.data_packages?.network ?? 'Unknown'
    if (!groups[net]) groups[net] = []
    groups[net].push(tx)
  }
  return Object.entries(groups)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([network, txs]) => {
      const lines = txs.map(tx => `${tx.phone_number} ${gbValue(tx.data_packages?.data_size)}`).join('\n')
      return `=== ${network} ===\n${lines}`
    })
    .join('\n\n')
}

function downloadText(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

export default function PurchasesPage() {
  const [tab,          setTab]          = useState<TabFilter>('placed')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading,      setLoading]      = useState(true)
  const [acting,       setActing]       = useState(false)   // covers both export+process and mark-delivered
  const [search,       setSearch]       = useState('')
  const [toast,        setToast]        = useState<{ msg: string; ok: boolean } | null>(null)

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3500)
  }

  const load = async (orderStatus: TabFilter) => {
    setLoading(true)
    setSearch('')
    try {
      const { data } = await adminApi.getTransactions(orderStatus)
      setTransactions(data)
    } catch (err: any) {
      showToast(err.message, false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(tab) }, [tab])

  const filtered = useMemo(() => {
    if (!search.trim()) return transactions
    const q = search.toLowerCase()
    return transactions.filter(tx =>
      tx.phone_number?.toLowerCase().includes(q) ||
      tx.data_packages?.name?.toLowerCase().includes(q) ||
      tx.data_packages?.network?.toLowerCase().includes(q)
    )
  }, [transactions, search])

  // Placed tab: export file → bulk move to processing
  const handleExportAndProcess = async () => {
    if (!transactions.length) return
    setActing(true)
    try {
      const content = buildExportText(transactions)
      downloadText(content, `orders-placed-${new Date().toISOString().slice(0, 10)}.txt`)
      const ids = transactions.map(tx => tx.id)
      await adminApi.bulkUpdateStatus(ids, 'processing')
      showToast(`Exported ${ids.length} orders and moved to Processing`)
      setTransactions([])
    } catch (err: any) {
      showToast(err.message, false)
    } finally {
      setActing(false)
    }
  }

  // Processing tab: bulk move to delivered (no export needed)
  const handleMarkAllDelivered = async () => {
    if (!transactions.length) return
    setActing(true)
    try {
      const ids = transactions.map(tx => tx.id)
      await adminApi.bulkUpdateStatus(ids, 'delivered')
      showToast(`${ids.length} orders marked as Delivered`)
      setTransactions([])
    } catch (err: any) {
      showToast(err.message, false)
    } finally {
      setActing(false)
    }
  }

  const TABS: { key: TabFilter; label: string }[] = [
    { key: 'placed',     label: 'Placed'     },
    { key: 'processing', label: 'Processing' },
    { key: 'delivered',  label: 'Delivered'  },
  ]

  const ActionButton = () => {
    if (tab === 'placed') {
      const disabled = acting || transactions.length === 0
      return (
        <button onClick={handleExportAndProcess} disabled={disabled} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '10px 18px', borderRadius: '8px', border: 'none',
          background: disabled ? COLORS.surface : COLORS.blue,
          color: disabled ? COLORS.muted : COLORS.white,
          fontSize: '13px', fontWeight: 600,
          cursor: disabled ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
        }}>
          {acting ? 'Exporting...' : `Export & Mark Processing (${transactions.length})`}
        </button>
      )
    }

    if (tab === 'processing') {
      const disabled = acting || transactions.length === 0
      return (
        <button onClick={handleMarkAllDelivered} disabled={disabled} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '10px 18px', borderRadius: '8px', border: 'none',
          background: disabled ? COLORS.surface : '#22c55e',
          color: disabled ? COLORS.muted : '#0f1013',
          fontSize: '13px', fontWeight: 700,
          cursor: disabled ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
        }}>
          {acting ? 'Updating...' : `✓ Mark All Delivered (${transactions.length})`}
        </button>
      )
    }

    return null  // delivered tab — no action needed
  }

  return (
    <div style={{ padding: 'clamp(20px, 4vw, 32px) clamp(16px, 3vw, 24px)', maxWidth: '1200px', margin: '0 auto' }}>

      {toast && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
          padding: '12px 20px', borderRadius: '10px',
          background: toast.ok ? '#22c55e18' : `${COLORS.red}18`,
          border: `1px solid ${toast.ok ? '#22c55e40' : `${COLORS.red}40`}`,
          color: toast.ok ? '#22c55e' : COLORS.red,
          fontSize: '13px', fontWeight: 600,
        }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(22px, 4vw, 28px)', fontWeight: 800, color: COLORS.white, marginBottom: '6px' }}>Orders</h1>
          <p style={{ fontSize: '14px', color: COLORS.muted }}>
            {filtered.length} {tab} order{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
        <ActionButton />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '8px 18px', borderRadius: '8px', fontWeight: 600, fontSize: '13px',
            cursor: 'pointer', transition: 'all 0.18s',
            background: tab === t.key ? STATUS_STYLE[t.key].bg : COLORS.surface,
            border: `1.5px solid ${tab === t.key ? STATUS_STYLE[t.key].color : COLORS.border}`,
            color:  tab === t.key ? STATUS_STYLE[t.key].color : COLORS.muted,
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="Search by phone, package or network..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', padding: '10px 14px', boxSizing: 'border-box',
            background: COLORS.surface, border: `1px solid ${COLORS.border}`,
            borderRadius: '8px', color: COLORS.white, fontSize: '14px', outline: 'none',
          }}
        />
      </div>

      {/* Table */}
      <div style={{ background: COLORS.surface, border: `1.5px solid ${COLORS.border}`, borderRadius: '14px', overflow: 'hidden' }}>
        {loading ? (
          <p style={{ color: COLORS.muted, textAlign: 'center', padding: '48px 0' }}>Loading...</p>
        ) : filtered.length === 0 ? (
          <p style={{ color: COLORS.muted, textAlign: 'center', padding: '48px 0' }}>
            {search ? 'No results match your search.' : `No ${tab} orders.`}
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
              <thead>
                <tr style={{ background: COLORS.bg }}>
                  {['Date & Time', 'Phone', 'Network', 'Package', 'Amount', 'Status'].map(h => (
                    <th key={h} style={{
                      padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: 700,
                      color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.06em',
                      whiteSpace: 'nowrap', borderBottom: `1px solid ${COLORS.border}`,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((tx, i) => (
                  <tr key={tx.id}
                    style={{ background: i % 2 === 0 ? 'transparent' : `${COLORS.border}18`, transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = `${COLORS.blue}10`)}
                    onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : `${COLORS.border}18`)}
                  >
                    <td style={{ padding: '12px 14px', borderBottom: `1px solid ${COLORS.border}`, whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: '13px', color: COLORS.white }}>{formatDate(tx.created_at)}</span>
                    </td>
                    <td style={{ padding: '12px 14px', borderBottom: `1px solid ${COLORS.border}` }}>
                      <span style={{ fontSize: '13px', color: COLORS.white, fontFamily: 'monospace' }}>{tx.phone_number}</span>
                    </td>
                    <td style={{ padding: '12px 14px', borderBottom: `1px solid ${COLORS.border}` }}>
                      <NetworkBadge network={tx.data_packages?.network ?? '—'} />
                    </td>
                    <td style={{ padding: '12px 14px', borderBottom: `1px solid ${COLORS.border}` }}>
                      <div style={{ fontSize: '13px', color: COLORS.white }}>{tx.data_packages?.name ?? '—'}</div>
                      <div style={{ fontSize: '11px', color: COLORS.muted, marginTop: '2px' }}>{tx.data_packages?.data_size}</div>
                    </td>
                    <td style={{ padding: '12px 14px', borderBottom: `1px solid ${COLORS.border}`, whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: COLORS.white }}>GH₵ {(tx.total_paid ?? 0).toFixed(2)}</span>
                    </td>
                    <td style={{ padding: '12px 14px', borderBottom: `1px solid ${COLORS.border}` }}>
                      <OrderBadge status={tx.order_status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}