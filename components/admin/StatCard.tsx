import { COLORS } from '@/lib/constants/colors';
import { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  accent: string;
  icon?: ReactNode;
  trend?: number;
}

export default function StatCard({ label, value, accent, icon, trend }: StatCardProps) {
  return (
    <div
      style={{
        background: COLORS.surface,
        border: `1.5px solid ${COLORS.border}`,
        borderRadius: '14px',
        padding: 'clamp(16px, 3vw, 20px)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 'clamp(11px, 2vw, 12px)', color: COLORS.muted, marginBottom: '8px' }}>
            {label}
          </div>
          <div style={{ fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: 800, color: accent }}>
            {value}
          </div>
          {trend !== undefined && (
            <div
              style={{
                fontSize: '11px',
                color: trend > 0 ? '#22c55e' : COLORS.red,
                marginTop: '4px',
              }}
            >
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </div>
          )}
        </div>
        {icon && <div style={{ color: accent, opacity: 0.6 }}>{icon}</div>}
      </div>
    </div>
  );
}
