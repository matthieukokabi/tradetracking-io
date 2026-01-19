"use client";

import { TradeFilters } from "../types/filters";
import { TradeSide, TradeStatus } from "../types";

interface FilterBarProps {
  filters: TradeFilters;
  onChange: (filters: TradeFilters) => void;
}

export default function FilterBar({ filters, onChange }: FilterBarProps) {
  const handleChange = (key: keyof TradeFilters, value: any) => {
    onChange({ ...filters, [key]: value || undefined });
  };

  const clearFilters = () => {
    onChange({});
  };

  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="flex flex-wrap gap-4 items-end bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-zinc-500">Date Range</label>
        <div className="flex gap-2">
          <input
            type="date"
            className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-800 dark:bg-zinc-900"
            value={filters.start_date || ""}
            onChange={(e) => handleChange("start_date", e.target.value)}
          />
          <span className="self-center text-zinc-400">-</span>
          <input
            type="date"
            className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-800 dark:bg-zinc-900"
            value={filters.end_date || ""}
            onChange={(e) => handleChange("end_date", e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-zinc-500">Symbol</label>
        <input
          type="text"
          placeholder="BTC"
          className="w-24 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-800 dark:bg-zinc-900 uppercase"
          value={filters.symbol || ""}
          onChange={(e) => handleChange("symbol", e.target.value.toUpperCase())}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-zinc-500">Side</label>
        <select
          className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-800 dark:bg-zinc-900"
          value={filters.side || ""}
          onChange={(e) => handleChange("side", e.target.value)}
        >
          <option value="">All</option>
          <option value={TradeSide.BUY}>BUY</option>
          <option value={TradeSide.SELL}>SELL</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-zinc-500">Status</label>
        <select
          className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-800 dark:bg-zinc-900"
          value={filters.status || ""}
          onChange={(e) => handleChange("status", e.target.value)}
        >
          <option value="">All</option>
          <option value={TradeStatus.OPEN}>OPEN</option>
          <option value={TradeStatus.CLOSED}>CLOSED</option>
        </select>
      </div>

      {hasFilters && (
        <button
          onClick={clearFilters}
          className="mb-0.5 px-3 py-1.5 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors"
        >
          Clear
        </button>
      )}
    </div>
  );
}
