"use client";

import { useMemo, useState } from "react";
import { EquityPoint } from "../types";

interface EquityCurveChartProps {
  data: EquityPoint[];
  height?: number;
}

export default function EquityCurveChart({ data, height = 400 }: EquityCurveChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const { points, minVal, maxVal, width } = useMemo(() => {
    if (data.length === 0) return { points: [], minVal: 0, maxVal: 0, width: 0 };

    const width = 800;
    const padding = 40;
    const values = data.map((d) => d.equity);

    // Add 0 as a baseline if appropriate, or just use data range
    const minVal = Math.min(0, ...values);
    const maxVal = Math.max(0, ...values);

    // Add some buffer
    const range = maxVal - minVal;
    const buffer = range === 0 ? 100 : range * 0.1;
    const effectiveMin = minVal - buffer;
    const effectiveMax = maxVal + buffer;
    const effectiveRange = effectiveMax - effectiveMin;

    const points = data.map((d, i) => {
      const x = padding + (i / (data.length - 1 || 1)) * (width - 2 * padding);
      const y = height - padding - ((d.equity - effectiveMin) / effectiveRange) * (height - 2 * padding);
      return { x, y, data: d };
    });

    return { points, minVal: effectiveMin, maxVal: effectiveMax, width };
  }, [data, height]);

  if (data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-zinc-500" style={{ height }}>
        No data to display
      </div>
    );
  }

  const pathD = points.length > 1
    ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ")
    : `M ${points[0].x} ${points[0].y} L ${points[0].x + 1} ${points[0].y}`;

  // Create gradient fill
  const areaPathD = `${pathD} L ${points[points.length - 1].x} ${height - 40} L ${points[0].x} ${height - 40} Z`;

  return (
    <div className="w-full relative overflow-hidden">
      <svg
        viewBox={`0 0 800 ${height}`}
        className="w-full h-auto overflow-visible"
        preserveAspectRatio="none"
        onMouseLeave={() => setHoveredIndex(null)}
      >
        <defs>
          <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(16 185 129)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="rgb(16 185 129)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        <line x1="40" y1="40" x2="760" y2="40" stroke="currentColor" strokeOpacity="0.1" />
        <line x1="40" y1={height / 2} x2="760" y2={height / 2} stroke="currentColor" strokeOpacity="0.1" />
        <line x1="40" y1={height - 40} x2="760" y2={height - 40} stroke="currentColor" strokeOpacity="0.1" />

        {/* Area fill */}
        <path d={areaPathD} fill="url(#equityGradient)" />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke="rgb(16 185 129)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Points for hover detection */}
        {points.map((point, i) => (
          <g key={i}>
            <circle
              cx={point.x}
              cy={point.y}
              r="6"
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIndex(i)}
            />
            {hoveredIndex === i && (
              <circle
                cx={point.x}
                cy={point.y}
                r="4"
                fill="rgb(16 185 129)"
                stroke="white"
                strokeWidth="2"
              />
            )}
          </g>
        ))}
      </svg>

      {/* Tooltip */}
      {hoveredIndex !== null && (
        <div
          className="absolute z-10 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-lg rounded-lg p-3 text-sm pointer-events-none transform -translate-x-1/2 -translate-y-full"
          style={{
            left: `${(points[hoveredIndex].x / 800) * 100}%`,
            top: `${(points[hoveredIndex].y / height) * 100}%`,
            marginTop: '-10px'
          }}
        >
          <div className="font-semibold text-zinc-900 dark:text-zinc-100">
            {points[hoveredIndex].data.date}
          </div>
          <div className="text-emerald-600 dark:text-emerald-400 font-bold">
            ${points[hoveredIndex].data.equity.toFixed(2)}
          </div>
          <div className="text-xs text-zinc-500">
            Daily: {points[hoveredIndex].data.pnl >= 0 ? "+" : ""}${points[hoveredIndex].data.pnl.toFixed(2)}
          </div>
        </div>
      )}
    </div>
  );
}
