"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { api } from "../lib/api";
import { Trade, TradeSide, TradeStatus } from "../types";

interface TradeFormProps {
  initialData?: Trade;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function TradeForm({ initialData, onSuccess, onCancel }: TradeFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Trade>>({
    symbol: "",
    side: TradeSide.BUY,
    quantity: 0,
    entry_price: 0,
    entry_time: new Date().toISOString().slice(0, 16),
    status: TradeStatus.OPEN,
    ...initialData,
  });

  // Ensure dates are formatted correctly for datetime-local input
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        entry_time: new Date(initialData.entry_time).toISOString().slice(0, 16),
        exit_time: initialData.exit_time ? new Date(initialData.exit_time).toISOString().slice(0, 16) : undefined,
      });
    }
  }, [initialData]);

  // Auto-calculate P&L
  useEffect(() => {
    if (
      formData.entry_price &&
      formData.exit_price &&
      formData.quantity &&
      formData.side
    ) {
      const entry = formData.entry_price;
      const exit = formData.exit_price;
      const qty = formData.quantity;

      let pnl = 0;
      if (formData.side === TradeSide.BUY) {
        pnl = (exit - entry) * qty;
      } else {
        pnl = (entry - exit) * qty;
      }

      // Round to 2 decimals
      pnl = Math.round(pnl * 100) / 100;

      setFormData(prev => {
        if (prev.pnl === pnl) return prev;
        return { ...prev, pnl };
      });
    }
  }, [formData.entry_price, formData.exit_price, formData.quantity, formData.side]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (initialData?._id) {
        await api.updateTrade(initialData._id, formData);
        toast.success("Trade updated successfully");
      } else {
        await api.createTrade({
          ...(formData as any),
          status: TradeStatus.OPEN,
        });
        toast.success("Trade created successfully");
      }
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error(`Failed to ${initialData ? "update" : "create"} trade`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="symbol" className="block text-sm font-medium mb-1">Symbol</label>
          <input
            id="symbol"
            type="text"
            required
            className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
            placeholder="BTC/USD"
            value={formData.symbol}
            onChange={(e) =>
              setFormData({ ...formData, symbol: e.target.value.toUpperCase() })
            }
          />
        </div>
        <div>
          <label htmlFor="side" className="block text-sm font-medium mb-1">Side</label>
          <select
            id="side"
            className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
            value={formData.side}
            onChange={(e) =>
              setFormData({ ...formData, side: e.target.value as TradeSide })
            }
          >
            <option value={TradeSide.BUY}>BUY</option>
            <option value={TradeSide.SELL}>SELL</option>
          </select>
        </div>
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium mb-1">Quantity</label>
          <input
            id="quantity"
            type="number"
            step="any"
            required
            className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
            value={formData.quantity}
            onChange={(e) =>
              setFormData({ ...formData, quantity: parseFloat(e.target.value) })
            }
          />
        </div>
        <div>
          <label htmlFor="entry_price" className="block text-sm font-medium mb-1">Entry Price</label>
          <input
            id="entry_price"
            type="number"
            step="any"
            required
            className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
            value={formData.entry_price}
            onChange={(e) =>
              setFormData({
                ...formData,
                entry_price: parseFloat(e.target.value),
              })
            }
          />
        </div>
        <div className="col-span-2">
          <label htmlFor="entry_time" className="block text-sm font-medium mb-1">Entry Time</label>
          <input
            id="entry_time"
            type="datetime-local"
            required
            className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
            value={formData.entry_time}
            onChange={(e) =>
              setFormData({ ...formData, entry_time: e.target.value })
            }
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium mb-1">Status</label>
          <select
            id="status"
            className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value as TradeStatus })
            }
          >
            <option value={TradeStatus.OPEN}>OPEN</option>
            <option value={TradeStatus.CLOSED}>CLOSED</option>
          </select>
        </div>

        {/* Extended fields for editing or if trade is closed */}
        {(initialData || formData.status === TradeStatus.CLOSED) && (
          <>
             <div>
              <label htmlFor="exit_price" className="block text-sm font-medium mb-1">Exit Price</label>
              <input
                id="exit_price"
                type="number"
                step="any"
                className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                value={formData.exit_price || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    exit_price: e.target.value ? parseFloat(e.target.value) : undefined,
                  })
                }
              />
            </div>
             <div>
              <label htmlFor="exit_time" className="block text-sm font-medium mb-1">Exit Time</label>
              <input
                id="exit_time"
                type="datetime-local"
                className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                value={formData.exit_time || ""}
                onChange={(e) =>
                  setFormData({ ...formData, exit_time: e.target.value })
                }
              />
            </div>
             <div>
              <label htmlFor="pnl" className="block text-sm font-medium mb-1">P&L</label>
              <input
                id="pnl"
                type="number"
                step="any"
                className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                value={formData.pnl || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pnl: e.target.value ? parseFloat(e.target.value) : undefined,
                  })
                }
              />
            </div>
          </>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-md bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Saving..." : (initialData ? "Update Trade" : "Add Trade")}
        </button>
      </div>
    </form>
  );
}
