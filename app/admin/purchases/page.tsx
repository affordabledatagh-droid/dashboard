'use client';

import { useEffect, useState } from 'react';
import { COLORS, NETWORK_COLORS } from '@/lib/constants/colors';
import DataTable from '@/components/admin/DataTable';
import ExportButton from '@/components/admin/ExportButton';
import { DataPurchase } from '@/lib/types/admin';
import { HiEye } from 'react-icons/hi2';

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<DataPurchase[]>([]);
  const [loading, setLoading] = useState(true);

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
      key: 'id',
      label: 'Purchase ID',
      sortable: true,
    },
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
      render: () => (
        <button
          style={{
            padding: '6px',
            background: COLORS.faint,
            border: 'none',
            borderRadius: '6px',
            color: COLORS.blue,
            cursor: 'pointer',
          }}
          title="View Details"
        >
          <HiEye size={16} />
        </button>
      ),
    },
  ];

  const exportColumns = [
    { key: 'id' as keyof DataPurchase, label: 'Purchase ID' },
    { key: 'date' as keyof DataPurchase, label: 'Date' },
    { key: 'time' as keyof DataPurchase, label: 'Time' },
    { key: 'customerName' as keyof DataPurchase, label: 'Customer Name' },
    { key: 'phoneNumber' as keyof DataPurchase, label: 'Phone Number' },
    { key: 'network' as keyof DataPurchase, label: 'Network' },
    { key: 'dataPackage' as keyof DataPurchase, label: 'Data Package' },
    { key: 'gbAmount' as keyof DataPurchase, label: 'GB Amount' },
    { key: 'validity' as keyof DataPurchase, label: 'Validity' },
    { key: 'amount' as keyof DataPurchase, label: 'Amount (GH₵)' },
    { key: 'agentName' as keyof DataPurchase, label: 'Agent Name' },
    { key: 'agentCode' as keyof DataPurchase, label: 'Agent Code' },
    { key: 'agentProfit' as keyof DataPurchase, label: 'Agent Profit (GH₵)' },
    { key: 'status' as keyof DataPurchase, label: 'Status' },
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
    </div>
  );
}
