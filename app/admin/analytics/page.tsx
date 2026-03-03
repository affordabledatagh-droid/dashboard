'use client';

import { useEffect, useState } from 'react';
import { COLORS } from '@/lib/constants/colors';
import StatCard from '@/components/admin/StatCard';
import {
  HiCurrencyDollar,
  HiUsers,
  HiShoppingCart,
  HiChartBarSquare,
  HiCalendar,
  HiArrowDownTray,
} from 'react-icons/hi2';

interface AgentPerformance {
  name: string;
  sales: number;
  profit: number;
}

interface NetworkStats {
  network: string;
  purchases: number;
  revenue: number;
  percentage: number;
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('30');
  const [topAgents, setTopAgents] = useState<AgentPerformance[]>([]);
  const [networkStats, setNetworkStats] = useState<NetworkStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with actual API calls
    setTopAgents([
      { name: 'Abena Osei', sales: 15670, profit: 1567 },
      { name: 'Ama Serwaa', sales: 12450, profit: 1245 },
      { name: 'Kofi Mensah', sales: 8920, profit: 892 },
      { name: 'Yaw Boateng', sales: 7340, profit: 734 },
      { name: 'Kwame Asante', sales: 6210, profit: 621 },
    ]);

    setNetworkStats([
      { network: 'MTN', purchases: 542, revenue: 18450, percentage: 45 },
      { network: 'TELECEL', purchases: 361, revenue: 12300, percentage: 30 },
      { network: 'AT PREMIUM', purchases: 301, revenue: 10250, percentage: 25 },
    ]);

    setLoading(false);
  }, [dateRange]);

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
        Loading analytics...
      </div>
    );
  }

  const totalRevenue = networkStats.reduce((sum, item) => sum + item.revenue, 0);
  const totalPurchases = networkStats.reduce((sum, item) => sum + item.purchases, 0);
  const avgOrderValue = totalRevenue / totalPurchases;

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
            Analytics & Reports
          </h1>
          <p style={{ fontSize: '14px', color: COLORS.muted }}>
            Track performance metrics and generate insights
          </p>
        </div>

        {/* Date Range Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HiCalendar size={18} color={COLORS.muted} />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            style={{
              background: COLORS.surface,
              border: `1.5px solid ${COLORS.border}`,
              borderRadius: '8px',
              padding: '8px 12px',
              color: COLORS.white,
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="365">Last Year</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
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
          value={`GH₵ ${totalRevenue.toLocaleString()}`}
          accent={COLORS.blue}
          icon={<HiCurrencyDollar size={32} />}
          trend={12.5}
        />
        <StatCard
          label="Total Purchases"
          value={totalPurchases}
          accent="#22c55e"
          icon={<HiShoppingCart size={32} />}
          trend={8.3}
        />
        <StatCard
          label="Avg Order Value"
          value={`GH₵ ${avgOrderValue.toFixed(2)}`}
          accent={COLORS.yellow}
          icon={<HiChartBarSquare size={32} />}
          trend={5.7}
        />
        <StatCard
          label="Active Agents"
          value={topAgents.length}
          accent={COLORS.red}
          icon={<HiUsers size={32} />}
        />
      </div>

      {/* Charts Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))',
          gap: 'clamp(16px, 3vw, 24px)',
          marginBottom: 'clamp(16px, 3vw, 24px)',
        }}
      >
        {/* Network Distribution */}
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
              marginBottom: '20px',
            }}
          >
            Network Distribution
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {networkStats.map((network) => (
              <div key={network.network}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: COLORS.white }}>
                    {network.network}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: COLORS.blue }}>
                    {network.percentage}%
                  </span>
                </div>
                <div
                  style={{
                    width: '100%',
                    height: '8px',
                    background: COLORS.faint,
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${network.percentage}%`,
                      height: '100%',
                      background: network.network === 'MTN' ? COLORS.yellow : network.network === 'Telecel' ? COLORS.red : COLORS.blue,
                      transition: 'width 0.3s',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                  <span style={{ fontSize: '11px', color: COLORS.muted }}>
                    {network.purchases} purchases
                  </span>
                  <span style={{ fontSize: '11px', color: COLORS.muted }}>
                    GH₵ {network.revenue.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Agents Performance */}
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
              marginBottom: '20px',
            }}
          >
            Top Agents by Sales
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {topAgents.map((agent, index) => (
              <div
                key={agent.name}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: COLORS.faint,
                  borderRadius: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: COLORS.blue,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: 700,
                      color: COLORS.white,
                    }}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: COLORS.white }}>
                      {agent.name}
                    </div>
                    <div style={{ fontSize: '11px', color: COLORS.muted }}>
                      Profit: GH₵ {agent.profit.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: COLORS.blue }}>
                  GH₵ {agent.sales.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
