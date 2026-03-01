'use client';

import { useEffect, useState } from 'react';
import { COLORS } from '@/lib/constants/colors';
import StatCard from '@/components/admin/StatCard';
import { DashboardStats, DataPurchase } from '@/lib/types/admin';
import {
  HiCurrencyDollar,
  HiUsers,
  HiShoppingCart,
  HiBanknotes,
} from 'react-icons/hi2';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentPurchases, setRecentPurchases] = useState<DataPurchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with actual API calls
    setStats({
      totalRevenue: 45230.50,
      activeAgents: 127,
      totalPurchases: 1543,
      pendingWithdrawals: 8450.00,
      revenueTrend: 12.5,
      agentsTrend: 8.3,
      purchasesTrend: 15.7,
    });

    setRecentPurchases([
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
    ]);

    setLoading(false);
  }, []);

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
      <div style={{ marginBottom: 'clamp(24px, 4vw, 32px)' }}>
        <h1
          style={{
            fontSize: 'clamp(24px, 4vw, 32px)',
            fontWeight: 800,
            color: COLORS.white,
            marginBottom: '8px',
          }}
        >
          Dashboard Overview
        </h1>
        <p style={{ fontSize: '14px', color: COLORS.muted }}>
          Welcome back! Here's what's happening with your platform today.
        </p>
      </div>

      {/* Stats Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 240px), 1fr))',
          gap: 'clamp(12px, 2vw, 16px)',
          marginBottom: 'clamp(24px, 4vw, 32px)',
        }}
      >
        <StatCard
          label="Total Revenue"
          value={`GH₵ ${stats?.totalRevenue.toLocaleString()}`}
          accent={COLORS.blue}
          icon={<HiCurrencyDollar size={32} />}
          trend={stats?.revenueTrend}
        />
        <StatCard
          label="Active Agents"
          value={stats?.activeAgents}
          accent={COLORS.yellow}
          icon={<HiUsers size={32} />}
          trend={stats?.agentsTrend}
        />
        <StatCard
          label="Total Purchases Today"
          value={stats?.totalPurchases}
          accent="#22c55e"
          icon={<HiShoppingCart size={32} />}
          trend={stats?.purchasesTrend}
        />
        <StatCard
          label="Pending Withdrawals"
          value={`GH₵ ${stats?.pendingWithdrawals.toLocaleString()}`}
          accent={COLORS.red}
          icon={<HiBanknotes size={32} />}
        />
      </div>

      {/* Recent Activity */}
      <div
        style={{
          background: COLORS.surface,
          border: `1.5px solid ${COLORS.border}`,
          borderRadius: '14px',
          padding: 'clamp(16px, 3vw, 24px)',
        }}
      >
        <h2
          style={{
            fontSize: 'clamp(18px, 3vw, 20px)',
            fontWeight: 700,
            color: COLORS.white,
            marginBottom: '16px',
          }}
        >
          Recent Purchases
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {recentPurchases.map((purchase) => (
            <div
              key={purchase.id}
              style={{
                background: COLORS.bg,
                border: `1px solid ${COLORS.border}`,
                borderRadius: '10px',
                padding: '12px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: COLORS.white }}>
                  {purchase.customerName} - {purchase.phoneNumber}
                </div>
                <div style={{ fontSize: '12px', color: COLORS.muted, marginTop: '4px' }}>
                  {purchase.dataPackage} • {purchase.network} • {purchase.agentName}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: COLORS.blue }}>
                  GH₵ {purchase.amount.toFixed(2)}
                </div>
                <div style={{ fontSize: '11px', color: COLORS.muted, marginTop: '4px' }}>
                  {purchase.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
