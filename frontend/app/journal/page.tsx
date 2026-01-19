"use client";

import { useEffect, useState } from "react";
import CalendarView from "../../components/CalendarView";
import { api } from "../../lib/api";
import { DailyJournalStat } from "../../types";

export default function JournalPage() {
  const [stats, setStats] = useState<Record<string, DailyJournalStat>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await api.getJournalStats();
      setStats(data.stats);
    } catch (error) {
      console.error("Failed to load journal stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Trading Journal</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-zinc-500">Loading journal...</div>
        </div>
      ) : (
        <CalendarView data={stats} />
      )}
    </div>
  );
}
