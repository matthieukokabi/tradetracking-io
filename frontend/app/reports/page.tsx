"use client";

import { useEffect, useState } from "react";
import EquityCurveChart from "../../components/EquityCurveChart";
import FilterBar from "../../components/FilterBar";
import { api } from "../../lib/api";
import { EquityPoint } from "../../types";
import { TradeFilters } from "../../types/filters";

export default function ReportsPage() {
  const [equityData, setEquityData] = useState<EquityPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<TradeFilters>({});

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await api.getEquityCurve(filters);
      setEquityData(response.data);
    } catch (error) {
      console.error("Failed to load equity data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Reports & Analysis</h1>
      </div>

      <FilterBar filters={filters} onChange={setFilters} />

      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
          <h3 className="font-semibold">Equity Curve</h3>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex h-[400px] items-center justify-center text-zinc-500">
              Loading chart...
            </div>
          ) : (
            <EquityCurveChart data={equityData} />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950 p-6">
            <h3 className="font-semibold mb-4">Performance Metrics</h3>
            <div className="space-y-4">
               <p className="text-zinc-500 text-sm">More detailed metrics coming soon...</p>
            </div>
         </div>
      </div>
    </div>
  );
}
