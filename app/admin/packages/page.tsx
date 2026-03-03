'use client'

import { useEffect, useState } from 'react'
import { COLORS, NETWORK_COLORS } from '@/lib/constants/colors'
import DataTable from '@/components/admin/DataTable'
import Modal from '@/components/admin/Modal'
import Toast from '@/components/admin/Toast'
import { adminApi } from '@/lib/utils/adminApi'
import { HiPencil, HiTrash, HiPlus } from 'react-icons/hi2'

// ── Types ─────────────────────────────────────────────────────────

type Network = 'MTN' | 'TELECEL' | 'AT PREMIUM'
type NetworkFilter = 'All' | Network

interface Package {
  id:         string
  network:    Network
  name:       string       // maps to backend `name`
  data_size:  string       // e.g. "1 GB"
  validity:   string
  admin_price: number
  is_active:  boolean
}

interface FormState {
  network:     Network
  name:        string
  data_size:   string
  validity:    string
  admin_price: number
  is_active:   boolean
}

const EMPTY_FORM: FormState = {
  network:     'MTN',
  name:        '',
  data_size:   '',
  validity:    '',
  admin_price: 0,
  is_active:   true,
}

// ── Helpers ───────────────────────────────────────────────────────

function StatusToggle({ pkg, onToggle }: { pkg: Package; onToggle: (pkg: Package) => void }) {
  return (
    <button
      onClick={() => onToggle(pkg)}
      title={pkg.is_active ? 'Click to deactivate' : 'Click to activate'}
      style={{
        padding: '4px 12px',
        borderRadius: '6px',
        fontSize: '11px',
        fontWeight: 700,
        textTransform: 'uppercase',
        border: 'none',
        cursor: 'pointer',
        background: pkg.is_active ? '#22c55e20' : `${COLORS.red}20`,
        color:      pkg.is_active ? '#22c55e'   : COLORS.red,
        transition: 'all 0.15s',
      }}
    >
      {pkg.is_active ? 'Active' : 'Inactive'}
    </button>
  )
}

// ── Page ──────────────────────────────────────────────────────────

export default function PackagesPage() {
  const [packages,   setPackages]   = useState<Package[]>([])
  const [loading,    setLoading]    = useState(true)
  const [saving,     setSaving]     = useState(false)
  const [activeTab,  setActiveTab]  = useState<NetworkFilter>('All')
  const [selected,   setSelected]   = useState<Package | null>(null)
  const [modalType,  setModalType]  = useState<'add' | 'edit' | 'delete' | null>(null)
  const [formData,   setFormData]   = useState<FormState>(EMPTY_FORM)
  const [toast,      setToast]      = useState<{ message: string; type: 'success' | 'error' | 'info'; visible: boolean }>({ message: '', type: 'success', visible: false })

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') =>
    setToast({ message, type, visible: true })

  // ── Fetch ──────────────────────────────────────────────────────

  const loadPackages = async () => {
    setLoading(true)
    try {
      const { data } = await adminApi.getPackages()
      setPackages(data)
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadPackages() }, [])

  // ── Filtered list ──────────────────────────────────────────────

  const filtered = activeTab === 'All'
    ? packages
    : packages.filter(p => p.network === activeTab)

  // ── Handlers ───────────────────────────────────────────────────

  const openAdd = () => {
    setFormData({ ...EMPTY_FORM, network: activeTab === 'All' ? 'MTN' : activeTab })
    setSelected(null)
    setModalType('add')
  }

  const openEdit = (pkg: Package) => {
    setSelected(pkg)
    setFormData({
      network:     pkg.network,
      name:        pkg.name,
      data_size:   pkg.data_size,
      validity:    pkg.validity,
      admin_price: pkg.admin_price,
      is_active:   pkg.is_active,
    })
    setModalType('edit')
  }

  const openDelete = (pkg: Package) => {
    setSelected(pkg)
    setModalType('delete')
  }

  // Toggle active/inactive inline — no modal needed
  const handleToggle = async (pkg: Package) => {
    try {
      const { data: updated } = await adminApi.updatePackage(pkg.id, { is_active: !pkg.is_active })
      setPackages(prev => prev.map(p => p.id === updated.id ? updated : p))
      showToast(`Package ${updated.is_active ? 'activated' : 'deactivated'}`)
    } catch (err: any) {
      showToast(err.message, 'error')
    }
  }

  const handleSave = async () => {
    if (!formData.name || !formData.data_size || !formData.validity || formData.admin_price <= 0) {
      showToast('Please fill in all required fields', 'error')
      return
    }
    setSaving(true)
    try {
      if (modalType === 'add') {
        const { data } = await adminApi.createPackage({
          name:       formData.name,
          dataSize:   formData.data_size,
          validity:   formData.validity,
          adminPrice: formData.admin_price,
          network:    formData.network,
        })
        setPackages(prev => [data, ...prev])
        showToast('Package added')
      } else if (modalType === 'edit' && selected) {
        const { data: updated } = await adminApi.updatePackage(selected.id, {
          name:        formData.name,
          data_size:   formData.data_size,
          validity:    formData.validity,
          admin_price: formData.admin_price,
          network:     formData.network,
          is_active:   formData.is_active,
        })
        setPackages(prev => prev.map(p => p.id === updated.id ? updated : p))
        showToast('Package updated')
      }
      setModalType(null)
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selected) return
    setSaving(true)
    try {
      await adminApi.deletePackage(selected.id)
      setPackages(prev => prev.filter(p => p.id !== selected.id))
      showToast('Package deleted')
      setModalType(null)
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  // ── Table columns ──────────────────────────────────────────────

  const columns = [
    {
      key: 'network',
      label: 'Network',
      render: (pkg: Package) => {
        const c = NETWORK_COLORS[pkg.network]
        return (
          <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: c.bg, color: c.text }}>
            {pkg.network}
          </span>
        )
      },
    },
    { key: 'name',       label: 'Package Name', sortable: true },
    { key: 'data_size',  label: 'Size',         sortable: true },
    { key: 'validity',   label: 'Validity' },
    {
      key: 'admin_price',
      label: 'Base Price',
      sortable: true,
      render: (pkg: Package) => `GH₵ ${Number(pkg.admin_price).toFixed(2)}`,
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (pkg: Package) => <StatusToggle pkg={pkg} onToggle={handleToggle} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (pkg: Package) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => openEdit(pkg)}
            style={{ padding: '6px', background: COLORS.faint, border: 'none', borderRadius: '6px', color: COLORS.blue, cursor: 'pointer' }}
            title="Edit"
          >
            <HiPencil size={16} />
          </button>
          <button
            onClick={() => openDelete(pkg)}
            style={{ padding: '6px', background: COLORS.faint, border: 'none', borderRadius: '6px', color: COLORS.red, cursor: 'pointer' }}
            title="Delete"
          >
            <HiTrash size={16} />
          </button>
        </div>
      ),
    },
  ]

  // ── Form field helper ──────────────────────────────────────────

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: COLORS.muted, marginBottom: '8px' }}>
        {label}
      </label>
      {children}
    </div>
  )

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px',
    background: COLORS.bg, border: `1.5px solid ${COLORS.border}`,
    borderRadius: '8px', color: COLORS.white, fontSize: '14px',
    outline: 'none', boxSizing: 'border-box',
  }

  const tabs: NetworkFilter[] = ['All', 'MTN', 'TELECEL', 'AT PREMIUM']

  // ── Render ─────────────────────────────────────────────────────

  return (
    <div style={{ padding: 'clamp(20px, 4vw, 32px) clamp(16px, 3vw, 24px)', maxWidth: '1400px', margin: '0 auto' }}>

      <Toast message={toast.message} type={toast.type} isVisible={toast.visible}
        onClose={() => setToast(t => ({ ...t, visible: false }))} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(22px, 4vw, 28px)', fontWeight: 800, color: COLORS.white, marginBottom: '6px' }}>
            Data Packages
          </h1>
          <p style={{ fontSize: '14px', color: COLORS.muted }}>
            {packages.length} total · {packages.filter(p => p.is_active).length} active
          </p>
        </div>
        <button
          onClick={openAdd}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: COLORS.blue, border: 'none', borderRadius: '8px', color: COLORS.white, fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
        >
          <HiPlus size={16} /> Add Package
        </button>
      </div>

      {/* Network tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '8px 16px',
            background: activeTab === tab ? COLORS.blue : COLORS.surface,
            border: `1.5px solid ${activeTab === tab ? COLORS.blue : COLORS.border}`,
            borderRadius: '8px',
            color: activeTab === tab ? COLORS.white : COLORS.muted,
            fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
          }}>
            {tab} {tab !== 'All' && `(${packages.filter(p => p.network === tab).length})`}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: COLORS.surface, border: `1.5px solid ${COLORS.border}`, borderRadius: '14px', padding: '20px' }}>
        {loading ? (
          <p style={{ color: COLORS.muted, textAlign: 'center', padding: '40px 0' }}>Loading packages...</p>
        ) : (
          <DataTable data={filtered} columns={columns} searchPlaceholder="Search packages..." />
        )}
      </div>

      {/* Add / Edit Modal */}
      {(modalType === 'add' || modalType === 'edit') && (
        <Modal isOpen onClose={() => setModalType(null)} title={modalType === 'add' ? 'Add New Package' : 'Edit Package'} maxWidth="560px">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            <Field label="Network">
              <select value={formData.network} onChange={e => setFormData(f => ({ ...f, network: e.target.value as Network }))} style={inputStyle}>
                <option value="MTN">MTN</option>
                <option value="TELECEL">TELELCEL</option>
                <option value="AT PREMIUM">AT PREMIUM</option>
              </select>
            </Field>

            <Field label="Package Name">
              <input style={inputStyle} type="text" placeholder="e.g. MTN 1 GB" value={formData.name}
                onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} />
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Field label="Data Size">
                <input style={inputStyle} type="text" placeholder="e.g. 1 GB" value={formData.data_size}
                  onChange={e => setFormData(f => ({ ...f, data_size: e.target.value }))} />
              </Field>
              <Field label="Validity">
                <input style={inputStyle} type="text" placeholder="e.g. 30 days" value={formData.validity}
                  onChange={e => setFormData(f => ({ ...f, validity: e.target.value }))} />
              </Field>
            </div>

            <Field label="Base Price (GH₵)">
              <input style={inputStyle} type="number" min="0" step="0.01" value={formData.admin_price}
                onChange={e => setFormData(f => ({ ...f, admin_price: Number(e.target.value) }))} />
            </Field>

            {modalType === 'edit' && (
              <Field label="Status">
                <select value={formData.is_active ? 'active' : 'inactive'}
                  onChange={e => setFormData(f => ({ ...f, is_active: e.target.value === 'active' }))}
                  style={inputStyle}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </Field>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button onClick={() => setModalType(null)} style={{ flex: 1, padding: '10px', background: COLORS.faint, border: `1.5px solid ${COLORS.border}`, borderRadius: '8px', color: COLORS.white, fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: '10px', background: saving ? COLORS.faint : COLORS.blue, border: 'none', borderRadius: '8px', color: COLORS.white, fontSize: '14px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}>
                {saving ? 'Saving...' : modalType === 'add' ? 'Add Package' : 'Save Changes'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Modal */}
      {modalType === 'delete' && selected && (
        <Modal isOpen onClose={() => setModalType(null)} title="Delete Package">
          <p style={{ fontSize: '14px', color: COLORS.muted, marginBottom: '20px' }}>
            Delete <strong style={{ color: COLORS.white }}>{selected.name}</strong>? This cannot be undone and will remove it from all agent shops.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setModalType(null)} style={{ flex: 1, padding: '10px', background: COLORS.faint, border: `1.5px solid ${COLORS.border}`, borderRadius: '8px', color: COLORS.white, fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
              Cancel
            </button>
            <button onClick={handleDelete} disabled={saving} style={{ flex: 1, padding: '10px', background: saving ? COLORS.faint : COLORS.red, border: 'none', borderRadius: '8px', color: COLORS.white, fontSize: '14px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}>
              {saving ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}