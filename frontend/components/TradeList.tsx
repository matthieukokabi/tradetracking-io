"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "../lib/api";
import { Trade, TradeSide } from "../types";
import { TradeFilters } from "../types/filters";

interface TradeListProps {
  onEdit?: (trade: Trade) => void;
  filters?: TradeFilters;
}

export default function TradeList({ onEdit, filters }: TradeListProps) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadTrades();
  }, [filters]); // Reload when filters change

  const loadTrades = async () => {
    setLoading(true);
    try {
      const data = await api.getTrades(100, filters);
      setTrades(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load trades");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    toast("Are you sure you want to delete this trade?", {
      action: {
        label: "Delete",
        onClick: async () => {
          setDeletingId(id);
          try {
            await api.deleteTrade(id);
            setTrades((prev) => prev.filter((t) => t._id !== id));
            toast.success("Trade deleted successfully");
          } catch (error) {
            console.error("Failed to delete trade:", error);
            toast.error("Failed to delete trade");
          } finally {
            setDeletingId(null);
          }
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    });
  };

  if (loading) {
    return <div className="text-center text-zinc-500 py-8">Loading trades...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-8">{error}</div>;
  }

  if (trades.length === 0) {
    return (
      <div className="text-center text-zinc-500 py-8">
        No trades found. Start by adding your first trade!
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-900/50">
          <tr>
            <th className="px-6 py-3">Date</th>
            <th className="px-6 py-3">Symbol</th>
            <th className="px-6 py-3">Side</th>
            <th className="px-6 py-3 text-right">Size</th>
            <th className="px-6 py-3 text-right">Entry</th>
            <th className="px-6 py-3 text-right">Exit</th>
            <th className="px-6 py-3 text-right">P&L</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((trade) => (
            <tr
              key={trade._id}
              className="bg-white border-b dark:bg-zinc-950 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
            >
              <td className="px-6 py-4 font-medium">
                {new Date(trade.entry_time).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 font-bold">{trade.symbol}</td>
              <td className="px-6 py-4">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    trade.side === TradeSide.BUY
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  }`}
                >
                  {trade.side}
                </span>
              </td>
              <td className="px-6 py-4 text-right">{trade.quantity}</td>
              <td className="px-6 py-4 text-right">
                ${trade.entry_price.toFixed(2)}
              </td>
              <td className="px-6 py-4 text-right">
                {trade.exit_price ? `$${trade.exit_price.toFixed(2)}` : "-"}
              </td>
              <td
                className={`px-6 py-4 text-right font-medium ${
                  (trade.pnl || 0) >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {trade.pnl ? (
                  <>
                    {(trade.pnl >= 0 ? "+" : "")}
                    ${Math.abs(trade.pnl).toFixed(2)}
                  </>
                ) : (
                  "-"
                )}
              </td>
              <td className="px-6 py-4">
                <span className="text-zinc-500 dark:text-zinc-400">
                  {trade.status}
                </span>
              </td>
              <td className="px-6 py-4 text-right flex justify-end gap-2">
                <button
                  onClick={() => onEdit?.(trade)}
                  className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => trade._id && handleDelete(trade._id)}
                  disabled={deletingId === trade._id}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium disabled:opacity-50"
                >
                  {deletingId === trade._id ? "..." : "Delete"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
