"use client";

import { useEffect, useState } from "react";
import TradeList from "../../components/TradeList";
import TradeForm from "../../components/TradeForm";
import ImportTradesModal from "../../components/ImportTradesModal";
import FilterBar from "../../components/FilterBar";
import DashboardStatsCards from "../../components/DashboardStatsCards";
import PnLChart from "../../components/PnLChart";
import ActivePositions from "../../components/ActivePositions";
import TradeScore from "../../components/TradeScore";
import { api } from "../../lib/api";
import { DashboardStats, Trade, PortfolioStats, ChartDataPoint } from "../../types";
import { TradeFilters } from "../../types/filters";

export default function DashboardPage() {
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState(0);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioStats | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [filters, setFilters] = useState<TradeFilters>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [refreshKey, filters]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load stats
      const statsData = await api.getDashboardStats(filters);
      setStats(statsData);

      // Try to load equity curve for chart
      try {
        const equityData = await api.getEquityCurve(filters);
        if (equityData?.data) {
          setChartData(
            equityData.data.map((point) => ({
              date: point.date,
              value: point.equity,
              daily_pnl: point.pnl,
            }))
          );
        }
      } catch {
        // Chart data is optional
        console.log("No chart data available");
      }

      // Mock portfolio data for now (will be real when exchange connections are active)
      setPortfolio({
        total_equity: statsData?.total_pnl || 0,
        unrealized_pnl: 0,
        open_positions_count: 0,
        positions: [],
      });
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
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
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-zinc-500 text-sm mt-1">
            Track your trading performance
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowImport(true)}
            className="border border-zinc-200 bg-white dark:bg-zinc-900 dark:border-zinc-800 px-4 py-2 rounded-lg font-medium text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Import CSV
          </button>
          <button
            onClick={handleAddNew}
            className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-2 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
          >
            + Add Trade
          </button>
        </div>
      </div>

      {/* Import Modal */}
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

      {/* Trade Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-xl font-bold mb-4">
              {editingTrade ? "Edit Trade" : "Add New Trade"}
            </h2>
            <TradeForm
              initialData={editingTrade}
              onSuccess={handleTradeSaved}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {/* Filters */}
      <FilterBar filters={filters} onChange={setFilters} />

      {/* Stats Cards */}
      <DashboardStatsCards stats={stats} portfolio={portfolio} loading={loading} />

      {/* Active Positions (if any) */}
      <ActivePositions positions={portfolio?.positions} loading={loading} />

      {/* P&L Chart */}
      <PnLChart data={chartData} loading={loading} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Recent Trades - Takes 3 columns */}
        <div className="lg:col-span-3 rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <span>⚡</span> Recent Trades
            </h3>
            {stats?.total_trades && stats.total_trades > 0 && (
              <span className="text-sm text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                {stats.total_trades} total
              </span>
            )}
          </div>
          <div className="p-6">
            <TradeList
              key={refreshKey}
              onEdit={handleEditTrade}
              filters={filters}
            />
          </div>
        </div>

        {/* Trade Score - Takes 1 column */}
        <div className="lg:col-span-1">
          <TradeScore stats={stats} loading={loading} />
        </div>
      </div>
    </div>
  );
}
