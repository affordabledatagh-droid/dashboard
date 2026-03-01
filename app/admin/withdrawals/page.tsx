'use client';

import { useEffect, useState } from 'react';
import { COLORS } from '@/lib/constants/colors';
import DataTable from '@/components/admin/DataTable';
import Modal from '@/components/admin/Modal';
import Toast from '@/components/admin/Toast';
import { Withdrawal } from '@/lib/types/admin';
import { HiCheckCircle, HiXCircle } from 'react-icons/hi2';

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [modalType, setModalType] = useState<'approve' | 'reject' | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false,
  });

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
      {
        id: 'WD004',
        agentName: 'Yaw Boateng',
        agentCode: 'AG004',
        amount: 734.00,
        requestDate: '2026-02-28',
        status: 'pending',
        paymentMethod: 'AirtelTigo Money',
      },
    ]);
    setLoading(false);
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type, visible: true });
  };

  const handleApprove = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setModalType('approve');
  };

  const handleReject = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setModalType('reject');
  };

  const confirmApprove = () => {
    if (selectedWithdrawal) {
      setWithdrawals(withdrawals.map(w => 
        w.id === selectedWithdrawal.id ? { ...w, status: 'completed' } : w
      ));
      showToast('Withdrawal approved successfully', 'success');
      setModalType(null);
      setSelectedWithdrawal(null);
    }
  };

  const confirmReject = () => {
    if (selectedWithdrawal) {
      setWithdrawals(withdrawals.map(w => 
        w.id === selectedWithdrawal.id ? { ...w, status: 'failed' } : w
      ));
      showToast('Withdrawal rejected', 'info');
      setModalType(null);
      setSelectedWithdrawal(null);
    }
  };

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
              onClick={() => handleApprove(withdrawal)}
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
              onClick={() => handleReject(withdrawal)}
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
      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
      />

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
        <div
          style={{
            background: COLORS.surface,
            border: `1.5px solid ${COLORS.border}`,
            borderRadius: '12px',
            padding: '16px',
          }}
        >
          <div style={{ fontSize: '12px', color: COLORS.muted, marginBottom: '8px' }}>
            Total Requests
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: COLORS.blue }}>
            {withdrawals.length}
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

      {/* Approve Modal */}
      {modalType === 'approve' && selectedWithdrawal && (
        <Modal isOpen={true} onClose={() => setModalType(null)} title="Approve Withdrawal">
          <div>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '14px', color: COLORS.muted, marginBottom: '16px' }}>
                Confirm approval of withdrawal request:
              </div>
              <div style={{ background: COLORS.faint, padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', color: COLORS.muted }}>Agent:</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: COLORS.white }}>
                    {selectedWithdrawal.agentName} ({selectedWithdrawal.agentCode})
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', color: COLORS.muted }}>Amount:</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: COLORS.white }}>
                    GH₵ {selectedWithdrawal.amount.toLocaleString()}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', color: COLORS.muted }}>Payment Method:</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: COLORS.white }}>
                    {selectedWithdrawal.paymentMethod}
                  </span>
                </div>
              </div>
            </div>
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
                onClick={confirmApprove}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: '#22c55e',
                  border: 'none',
                  borderRadius: '8px',
                  color: COLORS.white,
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Approve Withdrawal
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Reject Modal */}
      {modalType === 'reject' && selectedWithdrawal && (
        <Modal isOpen={true} onClose={() => setModalType(null)} title="Reject Withdrawal">
          <div>
            <p style={{ fontSize: '14px', color: COLORS.muted, marginBottom: '20px' }}>
              Are you sure you want to reject the withdrawal request from {selectedWithdrawal.agentName} for GH₵ {selectedWithdrawal.amount.toLocaleString()}?
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
                onClick={confirmReject}
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
                Reject Request
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
