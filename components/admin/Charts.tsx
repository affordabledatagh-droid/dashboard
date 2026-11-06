'use client';

import { useState } from 'react';
import { COLORS } from '@/lib/constants/colors';
import { shortDate } from '@/lib/utils/format';

interface Point { label: string; value: number; secondary?: number; detail?: string }

/** Responsive SVG bar chart with hover read-out. Optional second series drawn as a thinner overlay bar. */
export function BarChart({ data, color = COLORS.blue, secondColor = '#22c55e', format = (n: number) => String(n), height = 180 }: {
  data: Point[]; color?: string; secondColor?: string; format?: (n: number) => string; height?: number
}) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...data.map(d => Math.max(d.value, d.secondary ?? 0)), 1);
  const W = 1000, H = height, pad = { t: 10, b: 24 };
  const bw = W / data.length;
  const inner = H - pad.t - pad.b;
  const h = (v: number) => (v / max) * inner;
  const every = Math.ceil(data.length / 8);
  const sel = hover !== null ? data[hover] : null;

  return (
    <div>
      <div style={{ minHeight: 20, fontSize: 12, color: COLORS.muted, marginBottom: 6 }}>
        {sel
          ? <><strong style={{ color: COLORS.white }}>{sel.label}</strong> · {format(sel.value)}{sel.detail && <span style={{ color: COLORS.muted }}> · {sel.detail}</span>}{sel.secondary !== undefined && <span style={{ color: secondColor }}> · {format(sel.secondary)}</span>}</>
          : 'Hover a bar for details'}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none" role="img" style={{ display: 'block' }}>
        {[0.25, 0.5, 0.75, 1].map(f => (
          <line key={f} x1={0} x2={W} y1={pad.t + inner - inner * f} y2={pad.t + inner - inner * f} stroke={COLORS.border} strokeWidth={1} vectorEffect="non-scaling-stroke" />
        ))}
        {data.map((d, i) => {
          const x = i * bw;
          return (
            <g key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onTouchStart={() => setHover(i)}>
              <rect x={x} y={0} width={bw} height={H} fill="transparent" />
              <rect x={x + bw * 0.18} width={bw * 0.64} y={pad.t + inner - h(d.value)} height={Math.max(h(d.value), d.value > 0 ? 2 : 0)} rx={3}
                fill={color} opacity={hover === null || hover === i ? 1 : 0.45} />
              {d.secondary !== undefined && (
                <rect x={x + bw * 0.32} width={bw * 0.36} y={pad.t + inner - h(d.secondary)} height={Math.max(h(d.secondary), d.secondary > 0 ? 2 : 0)} rx={2}
                  fill={secondColor} opacity={hover === null || hover === i ? 1 : 0.45} />
              )}
              {i % every === 0 && (
                <text x={x + bw / 2} y={H - 6} textAnchor="middle" fontSize={22} fill={COLORS.muted}>{d.label}</text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function Sparkline({ values, color = COLORS.blue, width = 110, height = 32 }: { values: number[]; color?: string; width?: number; height?: number }) {
  const max = Math.max(...values, 1);
  const step = width / Math.max(values.length - 1, 1);
  const pts = values.map((v, i) => `${i * step},${height - 2 - (v / max) * (height - 4)}`).join(' ');
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export const dayLabel = (iso: string) => shortDate(iso);
