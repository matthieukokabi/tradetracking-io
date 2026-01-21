"use client";

import { DashboardStats, PortfolioStats } from "../types";

interface StatCardProps {
  title: string;
  value: string;
  subValue?: string;
  positive?: boolean;
  icon: string;
  loading?: boolean;
}

function StatCard({
  title,
  value,
  subValue,
  positive,
  icon,
  loading,
}: StatCardProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="animate-pulse">
          <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded mb-4" />
          <div className="h-8 w-32 bg-zinc-200 dark:bg-zinc-800 rounded mb-2" />
          <div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 hover:shadow-md transition-shadow group">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          {title}
        </h3>
        <span className="text-xl">{icon}</span>
      </div>
      <div
        className={`mt-2 text-2xl font-bold ${
          typeof positive === "boolean"
            ? positive
              ? "text-emerald-600"
              : "text-red-600"
            : ""
        }`}
      >
        {value}
      </div>
      <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-2 group-hover:text-zinc-600 transition-colors">
        {typeof positive === "boolean" && (
          <span
            className={`w-2 h-2 rounded-full ${positive ? "bg-emerald-400" : "bg-red-400"} animate-pulse`}
          />
        )}
        {subValue}
      </div>
    </div>
  );
}

interface DashboardStatsCardProps {
  stats: DashboardStats | null;
  portfolio?: PortfolioStats | null;
  loading?: boolean;
}

export default function DashboardStatsCards({
  stats,
  portfolio,
  loading,
}: DashboardStatsCardProps) {
  // Safe defaults
  const safeStats = stats || {
    total_pnl: 0,
    win_rate: 0,
    total_trades: 0,
    profit_factor: 0,
    winning_trades: 0,
    losing_trades: 0,
  };
  const safePortfolio = portfolio || {
    total_equity: 0,
    unrealized_pnl: 0,
    open_positions_count: 0,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard
        title="Account Equity"
        value={`$${safePortfolio.total_equity?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}`}
        subValue="Live Balance"
        positive={true}
        icon="💰"
        loading={loading}
      />
      <StatCard
        title="Active PnL"
        value={`${safePortfolio.unrealized_pnl >= 0 ? "+" : ""}$${safePortfolio.unrealized_pnl?.toFixed(2) || "0.00"}`}
        subValue={`${safePortfolio.open_positions_count || 0} Open Positions`}
        positive={safePortfolio.unrealized_pnl >= 0}
        icon="📈"
        loading={loading}
      />
      <StatCard
        title="Realized PnL"
        value={`${safeStats.total_pnl >= 0 ? "+" : ""}$${safeStats.total_pnl?.toFixed(2) || "0.00"}`}
        subValue="Closed Trades"
        positive={safeStats.total_pnl >= 0}
        icon="✅"
        loading={loading}
      />
      <StatCard
        title="Win Rate"
        value={`${safeStats.win_rate?.toFixed(1) || 0}%`}
        subValue={`Across ${safeStats.total_trades} Trades`}
        positive={safeStats.win_rate >= 50}
        icon="🎯"
        loading={loading}
      />
    </div>
  );
}
