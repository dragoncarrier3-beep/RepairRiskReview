"use client";

import { riskLabelFromScore } from "@/lib/utils";

export function RiskGauge({
  score,
  size = 220,
  label,
}: {
  score: number;
  size?: number;
  label?: string;
}) {
  const risk = label || riskLabelFromScore(score);
  const angle = -90 + (score / 100) * 180;
  const color =
    score <= 40 ? "#16a34a" : score <= 60 ? "#ea580c" : score <= 80 ? "#dc2626" : "#991b1b";

  const r = size * 0.38;
  const cx = size / 2;
  const cy = size * 0.58;
  const startX = cx - r;
  const endX = cx + r;

  const describeArc = (startAngle: number, endAngle: number) => {
    const toXY = (deg: number) => {
      const rad = (deg * Math.PI) / 180;
      return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
    };
    const s = toXY(startAngle);
    const e = toXY(endAngle);
    const large = endAngle - startAngle <= 180 ? 0 : 1;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
  };

  const needleLen = r * 0.85;
  const needleRad = (angle * Math.PI) / 180;
  const nx = cx + needleLen * Math.cos(needleRad);
  const ny = cy + needleLen * Math.sin(needleRad);

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size * 0.72} viewBox={`0 0 ${size} ${size * 0.72}`}>
        <path
          d={describeArc(180, 360)}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={14}
          strokeLinecap="round"
        />
        <path
          d={describeArc(180, 180 + (score / 100) * 180)}
          fill="none"
          stroke={color}
          strokeWidth={14}
          strokeLinecap="round"
        />
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={color} strokeWidth={3} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={6} fill={color} />
        <text x={startX} y={cy + 22} fontSize={11} fill="#64748b" textAnchor="middle">
          0
        </text>
        <text x={cx} y={cy - r - 8} fontSize={11} fill="#64748b" textAnchor="middle">
          50
        </text>
        <text x={endX} y={cy + 22} fontSize={11} fill="#64748b" textAnchor="middle">
          100
        </text>
      </svg>
      <div className="mt-[-8px] text-center">
        <div className="text-4xl font-bold tracking-tight" style={{ color }}>
          {score}
        </div>
        <div className="text-sm font-semibold uppercase tracking-wider" style={{ color }}>
          {risk}
        </div>
      </div>
    </div>
  );
}
