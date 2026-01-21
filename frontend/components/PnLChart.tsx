"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChartDataPoint } from "../types";

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: ChartDataPoint;
  }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 p-4 rounded-xl shadow-lg">
        <p className="text-zinc-400 text-xs mb-1 font-bold uppercase tracking-wider">
          {label}
        </p>
        <p className="text-zinc-900 dark:text-white font-bold text-2xl tracking-tight">
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(payload[0].value)}
        </p>
        <p className="text-xs mt-1 text-zinc-500 font-medium">
          Daily:{" "}
          <span
            className={
              payload[0].payload.daily_pnl > 0
                ? "text-emerald-500"
                : "text-red-500"
            }
          >
            {payload[0].payload.daily_pnl > 0 ? "+" : ""}
            {payload[0].payload.daily_pnl.toFixed(2)}
          </span>
        </p>
      </div>
    );
  }
  return null;
}

interface PnLChartProps {
  data?: ChartDataPoint[];
  loading?: boolean;
}

export default function PnLChart({ data = [], loading }: PnLChartProps) {
  const [chartType, setChartType] = useState<"monotone" | "step" | "linear">(
    "monotone"
  );

  const toggleChartType = () => {
    const types: Array<"monotone" | "step" | "linear"> = [
      "monotone",
      "step",
      "linear",
    ];
    setChartType(types[(types.indexOf(chartType) + 1) % types.length]);
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 p-8 mb-8">
        <div className="h-[300px] flex items-center justify-center">
          <div className="animate-pulse text-zinc-400">Loading Chart...</div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 p-8 mb-8">
        <div className="h-[200px] flex flex-col items-center justify-center">
          <div className="text-4xl mb-4">📈</div>
          <div className="text-zinc-500 text-sm">No chart data available</div>
          <div className="text-zinc-400 text-xs mt-1">
            Add trades to see your equity curve
          </div>
        </div>
      </div>
    );
  }

  // Determine color based on latest value
  const isPositive = data[data.length - 1]?.value >= 0;
  const color = isPositive ? "#10b981" : "#ef4444"; // Emerald or Red

  return (
    <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 p-8 mb-8 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="font-bold text-xl mb-1">Portfolio Performance</h3>
          <p className="text-zinc-400 text-sm">Equity growth over time</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleChartType}
            className="px-4 py-1.5 rounded-full text-xs font-bold bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all uppercase tracking-widest"
          >
            Style:{" "}
            {chartType === "monotone"
              ? "Smooth"
              : chartType === "step"
                ? "Step"
                : "Classic"}
          </button>
          <div
            className={`px-4 py-1.5 rounded-full text-xs font-bold border ${isPositive ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"}`}
          >
            {isPositive ? "📈 Uptrend" : "📉 Downtrend"}
          </div>
        </div>
      </div>

      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
          >
            <defs>
              <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                <stop offset="60%" stopColor={color} stopOpacity={0.1} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="0"
              stroke="var(--grid-color, #e4e4e7)"
              strokeOpacity={0.3}
              vertical={true}
              horizontal={true}
            />
            <XAxis
              dataKey="date"
              stroke="#71717a"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dy={10}
              tickFormatter={(str) => {
                const d = new Date(str);
                return d.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <YAxis
              stroke="#71717a"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dx={-10}
              tickFormatter={(val) => {
                if (val >= 1000) return `$${(val / 1000).toFixed(1)}k`;
                return `$${val}`;
              }}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: "#a1a1aa", strokeWidth: 1, strokeOpacity: 0.3 }}
            />
            <Area
              type={chartType}
              dataKey="value"
              stroke={color}
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorPnl)"
              animationDuration={2000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
