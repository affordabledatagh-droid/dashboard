'use client';

import { useEffect, useState } from 'react';
import { COLORS, NETWORK_COLORS } from '@/lib/constants/colors';
import DataTable from '@/components/admin/DataTable';
import { DataPackage } from '@/lib/types/admin';
import { HiPencil, HiTrash, HiPlus } from 'react-icons/hi2';

export default function PackagesPage() {
  const [packages, setPackages] = useState<DataPackage[]>([]);
  const [loading, setLoading] = useState(true);

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
        network: 'Telecel',
        packageName: '5GB Monthly',
        dataSize: 5,
        validity: '30 Days',
        basePrice: 30.00,
        defaultAgentProfit: 3.00,
        status: 'active',
      },
      {
        id: '4',
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
      render: () => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
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

  return (
    <div
      style={{
        padding: 'clamp(20px, 4vw, 32px) clamp(16px, 3vw, 24px)',
        maxWidth: '1400px',
        margin: '0 auto',
      }}
    >
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
        {['All', 'MTN', 'Telecel', 'AirtelTigo'].map((network) => (
          <button
            key={network}
            style={{
              padding: '8px 16px',
              background: network === 'All' ? COLORS.blue : COLORS.surface,
              border: `1.5px solid ${COLORS.border}`,
              borderRadius: '8px',
              color: network === 'All' ? COLORS.white : COLORS.muted,
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {network}
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
          data={packages}
          columns={columns}
          searchPlaceholder="Search packages by name or network..."
        />
      </div>
    </div>
  );
}
