'use client';

import { useEffect, useState } from 'react';
import { COLORS } from '@/lib/constants/colors';
import DataTable from '@/components/admin/DataTable';
import ExportButton from '@/components/admin/ExportButton';
import Modal from '@/components/admin/Modal';
import Toast from '@/components/admin/Toast';
import { Agent } from '@/lib/types/admin';
import { HiEye, HiPencil, HiNoSymbol, HiCheckCircle } from 'react-icons/hi2';

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [modalType, setModalType] = useState<'view' | 'edit' | 'suspend' | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false,
  });

  useEffect(() => {
    // Mock data - replace with actual API call
    setAgents([
      {
        id: '1',
        name: 'Ama Serwaa',
        shopName: 'Ama\'s Data Shop',
        agentCode: 'AG001',
        totalSales: 12450.50,
        walletBalance: 1245.00,
        status: 'active',
        joinDate: '2025-11-15',
      },
      {
        id: '2',
        name: 'Kofi Mensah',
        shopName: 'Kofi Data Hub',
        agentCode: 'AG002',
        totalSales: 8920.00,
        walletBalance: 892.00,
        status: 'active',
        joinDate: '2025-12-01',
      },
      {
        id: '3',
        name: 'Abena Osei',
        shopName: 'Abena\'s Mobile Shop',
        agentCode: 'AG003',
        totalSales: 15670.25,
        walletBalance: 1567.00,
        status: 'active',
        joinDate: '2025-10-20',
      },
    ]);
    setLoading(false);
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type, visible: true });
  };

  const handleView = (agent: Agent) => {
    setSelectedAgent(agent);
    setModalType('view');
  };

  const handleEdit = (agent: Agent) => {
    setSelectedAgent(agent);
    setModalType('edit');
  };

  const handleSuspend = (agent: Agent) => {
    setSelectedAgent(agent);
    setModalType('suspend');
  };

  const confirmSuspend = () => {
    if (selectedAgent) {
      // API call to suspend agent
      setAgents(agents.map(a => 
        a.id === selectedAgent.id ? { ...a, status: a.status === 'active' ? 'suspended' : 'active' } : a
      ));
      showToast(
        `Agent ${selectedAgent.status === 'active' ? 'suspended' : 'activated'} successfully`,
        'success'
      );
      setModalType(null);
      setSelectedAgent(null);
    }
  };

  const saveEdit = () => {
    if (selectedAgent) {
      // API call to update agent
      setAgents(agents.map(a => a.id === selectedAgent.id ? selectedAgent : a));
      showToast('Agent updated successfully', 'success');
      setModalType(null);
      setSelectedAgent(null);
    }
  };

  const columns = [
    {
      key: 'agentCode',
      label: 'Agent Code',
      sortable: true,
    },
    {
      key: 'name',
      label: 'Agent Name',
      sortable: true,
    },
    {
      key: 'shopName',
      label: 'Shop Name',
      sortable: true,
    },
    {
      key: 'totalSales',
      label: 'Total Sales',
      sortable: true,
      render: (agent: Agent) => `GH₵ ${agent.totalSales.toLocaleString()}`,
    },
    {
      key: 'walletBalance',
      label: 'Wallet Balance',
      sortable: true,
      render: (agent: Agent) => `GH₵ ${agent.walletBalance.toLocaleString()}`,
    },
    {
      key: 'status',
      label: 'Status',
      render: (agent: Agent) => (
        <span
          style={{
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            background: agent.status === 'active' ? '#22c55e20' : '#f5323220',
            color: agent.status === 'active' ? '#22c55e' : COLORS.red,
          }}
        >
          {agent.status}
        </span>
      ),
    },
    {
      key: 'joinDate',
      label: 'Join Date',
      sortable: true,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (agent: Agent) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => handleView(agent)}
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
          <button
            onClick={() => handleEdit(agent)}
            style={{
              padding: '6px',
              background: COLORS.faint,
              border: 'none',
              borderRadius: '6px',
              color: COLORS.yellow,
              cursor: 'pointer',
            }}
            title="Edit"
          >
            <HiPencil size={16} />
          </button>
          <button
            onClick={() => handleSuspend(agent)}
            style={{
              padding: '6px',
              background: COLORS.faint,
              border: 'none',
              borderRadius: '6px',
              color: agent.status === 'active' ? COLORS.red : '#22c55e',
              cursor: 'pointer',
            }}
            title={agent.status === 'active' ? 'Suspend' : 'Activate'}
          >
            {agent.status === 'active' ? <HiNoSymbol size={16} /> : <HiCheckCircle size={16} />}
          </button>
        </div>
      ),
    },
  ];

  const exportColumns = [
    { key: 'totalSales' as keyof Agent, label: 'Total Sales' },
    { key: 'walletBalance' as keyof Agent, label: 'Wallet Balance' },
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
            Agents Management
          </h1>
          <p style={{ fontSize: '14px', color: COLORS.muted }}>
            Manage all agents and their activities
          </p>
        </div>
        <ExportButton data={agents} filename="agents" columns={exportColumns} />
      </div>

      {/* Stats Summary */}
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
            Total Agents
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: COLORS.blue }}>
            {agents.length}
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
            Active Agents
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#22c55e' }}>
            {agents.filter((a) => a.status === 'active').length}
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
            Total Sales
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: COLORS.yellow }}>
            GH₵ {agents.reduce((sum, a) => sum + a.totalSales, 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Agents Table */}
      <div
        style={{
          background: COLORS.surface,
          border: `1.5px solid ${COLORS.border}`,
          borderRadius: '14px',
          padding: 'clamp(16px, 3vw, 24px)',
        }}
      >
        <DataTable
          data={agents}
          columns={columns}
          searchPlaceholder="Search agents by name, code, or shop..."
        />
      </div>

      {/* View Modal */}
      {modalType === 'view' && selectedAgent && (
        <Modal isOpen={true} onClose={() => setModalType(null)} title="Agent Details">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', color: COLORS.muted, marginBottom: '4px' }}>Agent Code</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: COLORS.white }}>{selectedAgent.agentCode}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: COLORS.muted, marginBottom: '4px' }}>Name</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: COLORS.white }}>{selectedAgent.name}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: COLORS.muted, marginBottom: '4px' }}>Shop Name</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: COLORS.white }}>{selectedAgent.shopName}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: COLORS.muted, marginBottom: '4px' }}>Total Sales</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: COLORS.white }}>GH₵ {selectedAgent.totalSales.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: COLORS.muted, marginBottom: '4px' }}>Wallet Balance</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: COLORS.white }}>GH₵ {selectedAgent.walletBalance.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: COLORS.muted, marginBottom: '4px' }}>Status</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: selectedAgent.status === 'active' ? '#22c55e' : COLORS.red }}>
                {selectedAgent.status.toUpperCase()}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: COLORS.muted, marginBottom: '4px' }}>Join Date</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: COLORS.white }}>{selectedAgent.joinDate}</div>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Modal */}
      {modalType === 'edit' && selectedAgent && (
        <Modal isOpen={true} onClose={() => setModalType(null)} title="Edit Agent">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: '8px' }}>
                Name
              </label>
              <input
                type="text"
                value={selectedAgent.name}
                onChange={(e) => setSelectedAgent({ ...selectedAgent, name: e.target.value })}
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
                Shop Name
              </label>
              <input
                type="text"
                value={selectedAgent.shopName}
                onChange={(e) => setSelectedAgent({ ...selectedAgent, shopName: e.target.value })}
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
                onClick={saveEdit}
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
                Save Changes
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Suspend/Activate Modal */}
      {modalType === 'suspend' && selectedAgent && (
        <Modal isOpen={true} onClose={() => setModalType(null)} title={`${selectedAgent.status === 'active' ? 'Suspend' : 'Activate'} Agent`}>
          <div>
            <p style={{ fontSize: '14px', color: COLORS.muted, marginBottom: '20px' }}>
              Are you sure you want to {selectedAgent.status === 'active' ? 'suspend' : 'activate'} {selectedAgent.name}?
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
                onClick={confirmSuspend}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: selectedAgent.status === 'active' ? COLORS.red : '#22c55e',
                  border: 'none',
                  borderRadius: '8px',
                  color: COLORS.white,
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {selectedAgent.status === 'active' ? 'Suspend' : 'Activate'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
