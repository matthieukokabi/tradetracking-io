"use client";

import { Position } from "../types";

interface ActivePositionsProps {
  positions?: Position[];
  loading?: boolean;
}

export default function ActivePositions({
  positions = [],
  loading,
}: ActivePositionsProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 mb-8">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
          <div className="animate-pulse h-6 w-32 bg-zinc-200 dark:bg-zinc-800 rounded" />
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-zinc-200 dark:bg-zinc-800 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!positions || positions.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 mb-8">
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
        <h3 className="font-semibold flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
          </span>
          Live Positions
          <span className="text-xs font-normal text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
            {positions.length}
          </span>
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800">
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Symbol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Side
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Size
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Unrealized PnL
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Exchange
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {positions.map((pos, idx) => (
              <tr
                key={idx}
                className="hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="font-mono font-semibold">{pos.symbol}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      pos.side === "long" || pos.size > 0
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                  >
                    {pos.side || (pos.size > 0 ? "Long" : "Short")}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right font-mono">
                  {Math.abs(pos.size).toLocaleString()}
                </td>
                <td
                  className={`px-6 py-4 whitespace-nowrap text-right font-mono font-semibold ${
                    pos.pnl >= 0 ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  <span className="inline-flex items-center gap-1">
                    {pos.pnl >= 0 ? "↑" : "↓"} {pos.pnl >= 0 ? "+" : ""}$
                    {parseFloat(String(pos.pnl)).toFixed(2)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-xs text-zinc-500 uppercase font-bold">
                  {pos.exchange || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
