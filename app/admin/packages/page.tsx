'use client';

import { useEffect, useState } from 'react';
import { COLORS, NETWORK_COLORS } from '@/lib/constants/colors';
import DataTable from '@/components/admin/DataTable';
import Modal from '@/components/admin/Modal';
import Toast from '@/components/admin/Toast';
import { DataPackage } from '@/lib/types/admin';
import { HiPencil, HiTrash, HiPlus } from 'react-icons/hi2';

type NetworkFilter = 'All' | 'MTN' | 'Telecel' | 'AirtelTigo';

export default function PackagesPage() {
  const [packages, setPackages] = useState<DataPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<NetworkFilter>('All');
  const [selectedPackage, setSelectedPackage] = useState<DataPackage | null>(null);
  const [modalType, setModalType] = useState<'add' | 'edit' | 'delete' | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false,
  });

  const [formData, setFormData] = useState<Partial<DataPackage>>({
    network: 'MTN',
    packageName: '',
    dataSize: 0,
    validity: '',
    basePrice: 0,
    defaultAgentProfit: 0,
    status: 'active',
  });

  useEffect(() => {
    // Mock data - replace with actual API call
    setPackages([
      {
        id: '1',
        network: 'MTN',
        packageName: '1GB Daily',
        dataSize: 1,
        validity: '1 Day',
        basePrice: 4.50,
        defaultAgentProfit: 0.50,
        status: 'active',
      },
      {
        id: '2',
        network: 'MTN',
        packageName: '2GB Weekly',
        dataSize: 2,
        validity: '7 Days',
        basePrice: 10.00,
        defaultAgentProfit: 1.00,
        status: 'active',
      },
      {
        id: '3',
        network: 'MTN',
        packageName: '5GB Monthly',
        dataSize: 5,
        validity: '30 Days',
        basePrice: 25.00,
        defaultAgentProfit: 2.50,
        status: 'active',
      },
      {
        id: '4',
        network: 'Telecel',
        packageName: '1GB Daily',
        dataSize: 1,
        validity: '1 Day',
        basePrice: 4.00,
        defaultAgentProfit: 0.40,
        status: 'active',
      },
      {
        id: '5',
        network: 'Telecel',
        packageName: '5GB Monthly',
        dataSize: 5,
        validity: '30 Days',
        basePrice: 30.00,
        defaultAgentProfit: 3.00,
        status: 'active',
      },
      {
        id: '6',
        network: 'AirtelTigo',
        packageName: '2GB Weekly',
        dataSize: 2,
        validity: '7 Days',
        basePrice: 9.00,
        defaultAgentProfit: 0.90,
        status: 'active',
      },
      {
        id: '7',
        network: 'AirtelTigo',
        packageName: '10GB Monthly',
        dataSize: 10,
        validity: '30 Days',
        basePrice: 55.00,
        defaultAgentProfit: 5.50,
        status: 'active',
      },
    ]);
    setLoading(false);
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type, visible: true });
  };

  const filteredPackages = activeTab === 'All' 
    ? packages 
    : packages.filter(pkg => pkg.network === activeTab);

  const handleAdd = () => {
    setFormData({
      network: activeTab === 'All' ? 'MTN' : activeTab,
      packageName: '',
      dataSize: 0,
      validity: '',
      basePrice: 0,
      defaultAgentProfit: 0,
      status: 'active',
    });
    setModalType('add');
  };

  const handleEdit = (pkg: DataPackage) => {
    setSelectedPackage(pkg);
    setFormData(pkg);
    setModalType('edit');
  };

  const handleDelete = (pkg: DataPackage) => {
    setSelectedPackage(pkg);
    setModalType('delete');
  };

  const confirmDelete = () => {
    if (selectedPackage) {
      setPackages(packages.filter(p => p.id !== selectedPackage.id));
      showToast('Package deleted successfully', 'success');
      setModalType(null);
      setSelectedPackage(null);
    }
  };

  const savePackage = () => {
    if (modalType === 'add') {
      const newPackage: DataPackage = {
        id: String(packages.length + 1),
        ...formData as DataPackage,
      };
      setPackages([...packages, newPackage]);
      showToast('Package added successfully', 'success');
    } else if (modalType === 'edit' && selectedPackage) {
      setPackages(packages.map(p => p.id === selectedPackage.id ? { ...p, ...formData } : p));
      showToast('Package updated successfully', 'success');
    }
    setModalType(null);
    setSelectedPackage(null);
  };

  const columns = [
    {
      key: 'network',
      label: 'Network',
      render: (pkg: DataPackage) => {
        const networkColor = NETWORK_COLORS[pkg.network];
        return (
          <span
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 700,
              background: networkColor.bg,
              color: networkColor.text,
            }}
          >
            {pkg.network}
          </span>
        );
      },
    },
    {
      key: 'packageName',
      label: 'Package Name',
      sortable: true,
    },
    {
      key: 'dataSize',
      label: 'Data Size',
      sortable: true,
      render: (pkg: DataPackage) => `${pkg.dataSize} GB`,
    },
    {
      key: 'validity',
      label: 'Validity',
    },
    {
      key: 'basePrice',
      label: 'Base Price',
      sortable: true,
      render: (pkg: DataPackage) => `GH₵ ${pkg.basePrice.toFixed(2)}`,
    },
    {
      key: 'defaultAgentProfit',
      label: 'Agent Profit',
      sortable: true,
      render: (pkg: DataPackage) => `GH₵ ${pkg.defaultAgentProfit.toFixed(2)}`,
    },
    {
      key: 'status',
      label: 'Status',
      render: (pkg: DataPackage) => (
        <span
          style={{
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            background: pkg.status === 'active' ? '#22c55e20' : '#f5323220',
            color: pkg.status === 'active' ? '#22c55e' : COLORS.red,
          }}
        >
          {pkg.status}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (pkg: DataPackage) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => handleEdit(pkg)}
            style={{
              padding: '6px',
              background: COLORS.faint,
              border: 'none',
              borderRadius: '6px',
              color: COLORS.blue,
              cursor: 'pointer',
            }}
            title="Edit"
          >
            <HiPencil size={16} />
          </button>
          <button
            onClick={() => handleDelete(pkg)}
            style={{
              padding: '6px',
              background: COLORS.faint,
              border: 'none',
              borderRadius: '6px',
              color: COLORS.red,
              cursor: 'pointer',
            }}
            title="Delete"
          >
            <HiTrash size={16} />
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '80vh',
          color: COLORS.muted,
        }}
      >
        Loading...
      </div>
    );
  }

  const tabs: NetworkFilter[] = ['All', 'MTN', 'Telecel', 'AirtelTigo'];

  return (
    <div
      style={{
        padding: 'clamp(20px, 4vw, 32px) clamp(16px, 3vw, 24px)',
        maxWidth: '1400px',
        margin: '0 auto',
      }}
    >
      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
      />

      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'clamp(24px, 4vw, 32px)',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 'clamp(24px, 4vw, 32px)',
              fontWeight: 800,
              color: COLORS.white,
              marginBottom: '8px',
            }}
          >
            Data Packages
          </h1>
          <p style={{ fontSize: '14px', color: COLORS.muted }}>
            Manage data packages for all networks
          </p>
        </div>
        <button
          onClick={handleAdd}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            background: COLORS.blue,
            border: 'none',
            borderRadius: '8px',
            color: COLORS.white,
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <HiPlus size={16} />
          Add Package
        </button>
      </div>

      {/* Network Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: 'clamp(16px, 3vw, 24px)',
          flexWrap: 'wrap',
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 16px',
              background: activeTab === tab ? COLORS.blue : COLORS.surface,
              border: `1.5px solid ${activeTab === tab ? COLORS.blue : COLORS.border}`,
              borderRadius: '8px',
              color: activeTab === tab ? COLORS.white : COLORS.muted,
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {tab} {tab !== 'All' && `(${packages.filter(p => p.network === tab).length})`}
          </button>
        ))}
      </div>

      {/* Packages Table */}
      <div
        style={{
          background: COLORS.surface,
          border: `1.5px solid ${COLORS.border}`,
          borderRadius: '14px',
          padding: 'clamp(16px, 3vw, 24px)',
        }}
      >
        <DataTable
          data={filteredPackages}
          columns={columns}
          searchPlaceholder="Search packages by name or network..."
        />
      </div>

      {/* Add/Edit Modal */}
      {(modalType === 'add' || modalType === 'edit') && (
        <Modal 
          isOpen={true} 
          onClose={() => setModalType(null)} 
          title={modalType === 'add' ? 'Add New Package' : 'Edit Package'}
          maxWidth="600px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: '8px' }}>
                Network
              </label>
              <select
                value={formData.network}
                onChange={(e) => setFormData({ ...formData, network: e.target.value as any })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: COLORS.bg,
                  border: `1.5px solid ${COLORS.border}`,
                  borderRadius: '8px',
                  color: COLORS.white,
                  fontSize: '14px',
                }}
              >
                <option value="MTN">MTN</option>
                <option value="Telecel">Telecel</option>
                <option value="AirtelTigo">AirtelTigo</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: '8px' }}>
                Package Name
              </label>
              <input
                type="text"
                value={formData.packageName}
                onChange={(e) => setFormData({ ...formData, packageName: e.target.value })}
                placeholder="e.g., 1GB Daily"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: COLORS.bg,
                  border: `1.5px solid ${COLORS.border}`,
                  borderRadius: '8px',
                  color: COLORS.white,
                  fontSize: '14px',
                }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: '8px' }}>
                  Data Size (GB)
                </label>
                <input
                  type="number"
                  value={formData.dataSize}
                  onChange={(e) => setFormData({ ...formData, dataSize: Number(e.target.value) })}
                  min="0"
                  step="0.1"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: COLORS.bg,
                    border: `1.5px solid ${COLORS.border}`,
                    borderRadius: '8px',
                    color: COLORS.white,
                    fontSize: '14px',
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: '8px' }}>
                  Validity
                </label>
                <input
                  type="text"
                  value={formData.validity}
                  onChange={(e) => setFormData({ ...formData, validity: e.target.value })}
                  placeholder="e.g., 1 Day, 7 Days"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: COLORS.bg,
                    border: `1.5px solid ${COLORS.border}`,
                    borderRadius: '8px',
                    color: COLORS.white,
                    fontSize: '14px',
                  }}
                />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: '8px' }}>
                  Base Price (GH₵)
                </label>
                <input
                  type="number"
                  value={formData.basePrice}
                  onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                  min="0"
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: COLORS.bg,
                    border: `1.5px solid ${COLORS.border}`,
                    borderRadius: '8px',
                    color: COLORS.white,
                    fontSize: '14px',
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: '8px' }}>
                  Agent Profit (GH₵)
                </label>
                <input
                  type="number"
                  value={formData.defaultAgentProfit}
                  onChange={(e) => setFormData({ ...formData, defaultAgentProfit: Number(e.target.value) })}
                  min="0"
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: COLORS.bg,
                    border: `1.5px solid ${COLORS.border}`,
                    borderRadius: '8px',
                    color: COLORS.white,
                    fontSize: '14px',
                  }}
                />
              </div>
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: '8px' }}>
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: COLORS.bg,
                  border: `1.5px solid ${COLORS.border}`,
                  borderRadius: '8px',
                  color: COLORS.white,
                  fontSize: '14px',
                }}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button
                onClick={() => setModalType(null)}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: COLORS.faint,
                  border: `1.5px solid ${COLORS.border}`,
                  borderRadius: '8px',
                  color: COLORS.white,
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={savePackage}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: COLORS.blue,
                  border: 'none',
                  borderRadius: '8px',
                  color: COLORS.white,
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {modalType === 'add' ? 'Add Package' : 'Save Changes'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Modal */}
      {modalType === 'delete' && selectedPackage && (
        <Modal isOpen={true} onClose={() => setModalType(null)} title="Delete Package">
          <div>
            <p style={{ fontSize: '14px', color: COLORS.muted, marginBottom: '20px' }}>
              Are you sure you want to delete the package "{selectedPackage.packageName}"? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setModalType(null)}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: COLORS.faint,
                  border: `1.5px solid ${COLORS.border}`,
                  borderRadius: '8px',
                  color: COLORS.white,
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: COLORS.red,
                  border: 'none',
                  borderRadius: '8px',
                  color: COLORS.white,
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Delete Package
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
