'use client';

import { useEffect, useState } from 'react';
import { COLORS, NETWORK_COLORS } from '@/lib/constants/colors';
import DataTable from '@/components/admin/DataTable';
import ExportButton from '@/components/admin/ExportButton';
import Modal from '@/components/admin/Modal';
import { DataPurchase } from '@/lib/types/admin';
import { HiEye } from 'react-icons/hi2';

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<DataPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewModal, setViewModal] = useState<{ open: boolean; purchase: DataPurchase | null }>({
    open: false,
    purchase: null,
  });

  useEffect(() => {
    // Mock data - replace with actual API call
    setPurchases([
      {
        id: 'PUR001',
        date: '2026-03-01',
        time: '14:32',
        customerName: 'Kwame Mensah',
        phoneNumber: '0244123456',
        network: 'MTN',
        dataPackage: '1GB - 1 Day',
        gbAmount: 1,
        validity: '1 Day',
        amount: 5.00,
        agentName: 'Ama\'s Shop',
        agentCode: 'AG001',
        agentProfit: 0.50,
        status: 'success',
      },
      {
        id: 'PUR002',
        date: '2026-03-01',
        time: '14:28',
        customerName: 'Abena Osei',
        phoneNumber: '0551234567',
        network: 'Telecel',
        dataPackage: '2GB - 7 Days',
        gbAmount: 2,
        validity: '7 Days',
        amount: 12.00,
        agentName: 'Kofi Data Hub',
        agentCode: 'AG002',
        agentProfit: 1.20,
        status: 'success',
      },
      {
        id: 'PUR003',
        date: '2026-03-01',
        time: '13:15',
        customerName: 'Yaw Boateng',
        phoneNumber: '0271234567',
        network: 'AirtelTigo',
        dataPackage: '5GB - 30 Days',
        gbAmount: 5,
        validity: '30 Days',
        amount: 35.00,
        agentName: 'Abena\'s Mobile Shop',
        agentCode: 'AG003',
        agentProfit: 3.50,
        status: 'success',
      },
    ]);
    setLoading(false);
  }, []);

  const columns = [
    {
      key: 'date',
      label: 'Date',
      sortable: true,
    },
    {
      key: 'time',
      label: 'Time',
      sortable: true,
    },
    {
      key: 'customerName',
      label: 'Customer',
      sortable: true,
    },
    {
      key: 'phoneNumber',
      label: 'Phone Number',
    },
    {
      key: 'network',
      label: 'Network',
      render: (purchase: DataPurchase) => {
        const networkColor = NETWORK_COLORS[purchase.network];
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
            {purchase.network}
          </span>
        );
      },
    },
    {
      key: 'dataPackage',
      label: 'Package',
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (purchase: DataPurchase) => `GH₵ ${purchase.amount.toFixed(2)}`,
    },
    {
      key: 'agentName',
      label: 'Agent',
    },
    {
      key: 'agentProfit',
      label: 'Agent Profit',
      sortable: true,
      render: (purchase: DataPurchase) => `GH₵ ${purchase.agentProfit.toFixed(2)}`,
    },
    {
      key: 'status',
      label: 'Status',
      render: (purchase: DataPurchase) => {
        const statusColors = {
          success: { bg: '#22c55e20', color: '#22c55e' },
          pending: { bg: '#f5c40020', color: COLORS.yellow },
          failed: { bg: '#f5323220', color: COLORS.red },
        };
        const statusColor = statusColors[purchase.status];
        return (
          <span
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              background: statusColor.bg,
              color: statusColor.color,
            }}
          >
            {purchase.status}
          </span>
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (purchase: DataPurchase) => (
        <button
          onClick={() => setViewModal({ open: true, purchase })}
          style={{
            padding: '6px',
            background: COLORS.faint,
            border: 'none',
            borderRadius: '6px',
            color: COLORS.blue,
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = COLORS.blue + '20')}
          onMouseLeave={(e) => (e.currentTarget.style.background = COLORS.faint)}
          title="View Details"
        >
          <HiEye size={16} />
        </button>
      ),
    },
  ];

  const exportColumns = [
    { key: 'phoneNumber' as keyof DataPurchase, label: 'Phone Number' },
    { key: 'gbAmount' as keyof DataPurchase, label: 'Data Size (GB)' },
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
            Data Purchases
          </h1>
          <p style={{ fontSize: '14px', color: COLORS.muted }}>
            View and manage all data purchase transactions
          </p>
        </div>
        <ExportButton data={purchases} filename="purchases" columns={exportColumns} />
      </div>

      {/* Purchases Table */}
      <div
        style={{
          background: COLORS.surface,
          border: `1.5px solid ${COLORS.border}`,
          borderRadius: '14px',
          padding: 'clamp(16px, 3vw, 24px)',
        }}
      >
        <DataTable
          data={purchases}
          columns={columns}
          searchPlaceholder="Search by customer name, phone, or purchase ID..."
        />
      </div>

      {/* View Details Modal */}
      {viewModal.open && viewModal.purchase && (
        <Modal
          title="Purchase Details"
          onClose={() => setViewModal({ open: false, purchase: null })}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Purchase ID & Status */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px',
                background: COLORS.faint,
                borderRadius: '8px',
              }}
            >
              <div>
                <div style={{ fontSize: '11px', color: COLORS.muted, marginBottom: '4px' }}>
                  Purchase ID
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: COLORS.white }}>
                  {viewModal.purchase.id}
                </div>
              </div>
              <span
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  background:
                    viewModal.purchase.status === 'success'
                      ? '#22c55e20'
                      : viewModal.purchase.status === 'pending'
                      ? '#f5c40020'
                      : '#f5323220',
                  color:
                    viewModal.purchase.status === 'success'
                      ? '#22c55e'
                      : viewModal.purchase.status === 'pending'
                      ? COLORS.yellow
                      : COLORS.red,
                }}
              >
                {viewModal.purchase.status}
              </span>
            </div>

            {/* Customer Information */}
            <div>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: COLORS.white, marginBottom: '12px' }}>
                Customer Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: COLORS.muted, marginBottom: '4px' }}>Name</div>
                  <div style={{ fontSize: '13px', color: COLORS.white }}>{viewModal.purchase.customerName}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: COLORS.muted, marginBottom: '4px' }}>Phone Number</div>
                  <div style={{ fontSize: '13px', color: COLORS.white }}>{viewModal.purchase.phoneNumber}</div>
                </div>
              </div>
            </div>

            {/* Package Details */}
            <div>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: COLORS.white, marginBottom: '12px' }}>
                Package Details
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: COLORS.muted, marginBottom: '4px' }}>Network</div>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      background: NETWORK_COLORS[viewModal.purchase.network].bg,
                      color: NETWORK_COLORS[viewModal.purchase.network].text,
                    }}
                  >
                    {viewModal.purchase.network}
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: COLORS.muted, marginBottom: '4px' }}>Package</div>
                  <div style={{ fontSize: '13px', color: COLORS.white }}>{viewModal.purchase.dataPackage}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: COLORS.muted, marginBottom: '4px' }}>Data Size</div>
                  <div style={{ fontSize: '13px', color: COLORS.white }}>{viewModal.purchase.gbAmount} GB</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: COLORS.muted, marginBottom: '4px' }}>Validity</div>
                  <div style={{ fontSize: '13px', color: COLORS.white }}>{viewModal.purchase.validity}</div>
                </div>
              </div>
            </div>

            {/* Transaction Details */}
            <div>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: COLORS.white, marginBottom: '12px' }}>
                Transaction Details
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: COLORS.muted, marginBottom: '4px' }}>Date</div>
                  <div style={{ fontSize: '13px', color: COLORS.white }}>{viewModal.purchase.date}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: COLORS.muted, marginBottom: '4px' }}>Time</div>
                  <div style={{ fontSize: '13px', color: COLORS.white }}>{viewModal.purchase.time}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: COLORS.muted, marginBottom: '4px' }}>Amount</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: COLORS.blue }}>
                    GH₵ {viewModal.purchase.amount.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: COLORS.muted, marginBottom: '4px' }}>Agent Profit</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#22c55e' }}>
                    GH₵ {viewModal.purchase.agentProfit.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Agent Information */}
            <div>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: COLORS.white, marginBottom: '12px' }}>
                Agent Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: COLORS.muted, marginBottom: '4px' }}>Agent Name</div>
                  <div style={{ fontSize: '13px', color: COLORS.white }}>{viewModal.purchase.agentName}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: COLORS.muted, marginBottom: '4px' }}>Agent Code</div>
                  <div style={{ fontSize: '13px', color: COLORS.white }}>{viewModal.purchase.agentCode}</div>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setViewModal({ open: false, purchase: null })}
              style={{
                width: '100%',
                padding: '10px',
                background: COLORS.blue,
                border: 'none',
                borderRadius: '8px',
                color: COLORS.white,
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                marginTop: '8px',
              }}
            >
              Close
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
