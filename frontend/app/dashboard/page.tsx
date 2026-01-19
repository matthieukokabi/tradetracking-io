"use client";

import { useEffect, useState } from "react";
import TradeList from "../../components/TradeList";
import TradeForm from "../../components/TradeForm";
import ImportTradesModal from "../../components/ImportTradesModal";
import FilterBar from "../../components/FilterBar";
import { api } from "../../lib/api";
import { DashboardStats, Trade } from "../../types";
import { TradeFilters } from "../../types/filters";

export default function DashboardPage() {
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState(0);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [filters, setFilters] = useState<TradeFilters>({});

  useEffect(() => {
    loadStats();
  }, [refreshKey, filters]);

  const loadStats = async () => {
    try {
      const data = await api.getDashboardStats(filters);
      setStats(data);
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const handleTradeSaved = () => {
    setShowForm(false);
    setEditingTrade(undefined);
    setRefreshKey((prev) => prev + 1);
  };

  const handleImportSuccess = () => {
    setShowImport(false);
    setRefreshKey((prev) => prev + 1);
  };

  const handleEditTrade = (trade: Trade) => {
    setEditingTrade(trade);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingTrade(undefined);
    setShowForm(true);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowImport(true)}
            className="border border-zinc-200 bg-white dark:bg-zinc-900 dark:border-zinc-800 px-4 py-2 rounded-md font-medium text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Import CSV
          </button>
          <button
            onClick={handleAddNew}
            className="bg-foreground text-background px-4 py-2 rounded-md font-medium text-sm hover:opacity-90 transition-opacity"
          >
            Add Trade
          </button>
        </div>
      </div>

      {showImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-xl font-bold mb-4">Import Trades</h2>
            <ImportTradesModal
              onSuccess={handleImportSuccess}
              onCancel={() => setShowImport(false)}
            />
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-xl font-bold mb-4">{editingTrade ? "Edit Trade" : "Add New Trade"}</h2>
            <TradeForm
              initialData={editingTrade}
              onSuccess={handleTradeSaved}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      <FilterBar filters={filters} onChange={setFilters} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Total P&L
          </div>
          <div className={`mt-2 text-2xl font-bold ${
            (stats?.total_pnl || 0) >= 0 ? "text-emerald-600" : "text-red-600"
          }`}>
            {(stats?.total_pnl || 0) >= 0 ? "+" : "-"}${Math.abs(stats?.total_pnl || 0).toFixed(2)}
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Realized P&L
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Win Rate
          </div>
          <div className="mt-2 text-2xl font-bold">{stats?.win_rate || 0}%</div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {stats?.winning_trades || 0}W - {stats?.losing_trades || 0}L
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Profit Factor
          </div>
          <div className="mt-2 text-2xl font-bold">{stats?.profit_factor || 0}</div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Target {">"} 1.5
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Total Trades
          </div>
          <div className="mt-2 text-2xl font-bold">{stats?.total_trades || 0}</div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Lifetime
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
          <h3 className="font-semibold">Recent Trades</h3>
        </div>
        <div className="p-6">
          <TradeList key={refreshKey} onEdit={handleEditTrade} filters={filters} />
        </div>
      </div>
    </div>
  );
}
