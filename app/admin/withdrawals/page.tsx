'use client';

import { useEffect, useState } from 'react';
import { COLORS } from '@/lib/constants/colors';
import DataTable from '@/components/admin/DataTable';
import { Withdrawal } from '@/lib/types/admin';
import { HiCheckCircle, HiXCircle } from 'react-icons/hi2';

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with actual API call
    setWithdrawals([
      {
        id: 'WD001',
        agentName: 'Ama Serwaa',
        agentCode: 'AG001',
        amount: 1245.00,
        requestDate: '2026-02-28',
        status: 'pending',
        paymentMethod: 'MTN Mobile Money',
      },
      {
        id: 'WD002',
        agentName: 'Kofi Mensah',
        agentCode: 'AG002',
        amount: 892.00,
        requestDate: '2026-02-27',
        status: 'completed',
        paymentMethod: 'Telecel Cash',
      },
      {
        id: 'WD003',
        agentName: 'Abena Osei',
        agentCode: 'AG003',
        amount: 1567.00,
        requestDate: '2026-02-26',
        status: 'completed',
        paymentMethod: 'MTN Mobile Money',
      },
    ]);
    setLoading(false);
  }, []);

  const columns = [
    {
      key: 'id',
      label: 'Request ID',
      sortable: true,
    },
    {
      key: 'agentName',
      label: 'Agent Name',
      sortable: true,
    },
    {
      key: 'agentCode',
      label: 'Agent Code',
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (withdrawal: Withdrawal) => `GH₵ ${withdrawal.amount.toLocaleString()}`,
    },
    {
      key: 'requestDate',
      label: 'Request Date',
      sortable: true,
    },
    {
      key: 'paymentMethod',
      label: 'Payment Method',
    },
    {
      key: 'status',
      label: 'Status',
      render: (withdrawal: Withdrawal) => {
        const statusColors = {
          pending: { bg: '#f5c40020', color: COLORS.yellow },
          completed: { bg: '#22c55e20', color: '#22c55e' },
          failed: { bg: '#f5323220', color: COLORS.red },
        };
        const statusColor = statusColors[withdrawal.status];
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
            {withdrawal.status}
          </span>
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (withdrawal: Withdrawal) =>
        withdrawal.status === 'pending' ? (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              style={{
                padding: '6px 10px',
                background: '#22c55e20',
                border: 'none',
                borderRadius: '6px',
                color: '#22c55e',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
              title="Approve"
            >
              <HiCheckCircle size={14} />
              Approve
            </button>
            <button
              style={{
                padding: '6px 10px',
                background: '#f5323220',
                border: 'none',
                borderRadius: '6px',
                color: COLORS.red,
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
              title="Reject"
            >
              <HiXCircle size={14} />
              Reject
            </button>
          </div>
        ) : (
          <span style={{ fontSize: '12px', color: COLORS.muted }}>-</span>
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

  const pendingWithdrawals = withdrawals.filter((w) => w.status === 'pending');
  const totalPending = pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0);

  return (
    <div
      style={{
        padding: 'clamp(20px, 4vw, 32px) clamp(16px, 3vw, 24px)',
        maxWidth: '1400px',
        margin: '0 auto',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 'clamp(24px, 4vw, 32px)' }}>
        <h1
          style={{
            fontSize: 'clamp(24px, 4vw, 32px)',
            fontWeight: 800,
            color: COLORS.white,
            marginBottom: '8px',
          }}
        >
          Withdrawals Management
        </h1>
        <p style={{ fontSize: '14px', color: COLORS.muted }}>
          Review and process agent withdrawal requests
        </p>
      </div>

      {/* Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 200px), 1fr))',
          gap: 'clamp(12px, 2vw, 16px)',
          marginBottom: 'clamp(24px, 4vw, 32px)',
        }}
      >
        <div
          style={{
            background: COLORS.surface,
            border: `1.5px solid ${COLORS.border}`,
            borderRadius: '12px',
            padding: '16px',
          }}
        >
          <div style={{ fontSize: '12px', color: COLORS.muted, marginBottom: '8px' }}>
            Pending Requests
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: COLORS.yellow }}>
            {pendingWithdrawals.length}
          </div>
        </div>
        <div
          style={{
            background: COLORS.surface,
            border: `1.5px solid ${COLORS.border}`,
            borderRadius: '12px',
            padding: '16px',
          }}
        >
          <div style={{ fontSize: '12px', color: COLORS.muted, marginBottom: '8px' }}>
            Total Pending Amount
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: COLORS.red }}>
            GH₵ {totalPending.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Withdrawals Table */}
      <div
        style={{
          background: COLORS.surface,
          border: `1.5px solid ${COLORS.border}`,
          borderRadius: '14px',
          padding: 'clamp(16px, 3vw, 24px)',
        }}
      >
        <DataTable
          data={withdrawals}
          columns={columns}
          searchPlaceholder="Search by agent name, code, or request ID..."
        />
      </div>
    </div>
  );
}
