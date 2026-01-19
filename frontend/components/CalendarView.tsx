"use client";

import { useEffect, useState } from "react";
import { DailyJournalStat } from "../types";

interface CalendarViewProps {
  data: Record<string, DailyJournalStat>;
}

export default function CalendarView({ data }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const year = currentDate.getFullYear();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const renderDays = () => {
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-32 border border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950/50" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const dayData = data[dateStr];
      const hasData = !!dayData;
      const isProfitable = hasData && dayData.pnl > 0;
      const isLoss = hasData && dayData.pnl < 0;

      days.push(
        <div
          key={day}
          className={`h-32 border border-zinc-200 dark:border-zinc-800 p-2 flex flex-col justify-between transition-colors
            ${isProfitable ? "bg-emerald-50/50 dark:bg-emerald-950/20" : ""}
            ${isLoss ? "bg-red-50/50 dark:bg-red-950/20" : ""}
            hover:bg-zinc-50 dark:hover:bg-zinc-900/50
          `}
        >
          <div className="flex justify-between items-start">
            <span className={`text-sm font-medium ${
              new Date().toISOString().slice(0, 10) === dateStr
                ? "bg-foreground text-background w-6 h-6 flex items-center justify-center rounded-full"
                : "text-zinc-500"
            }`}>
              {day}
            </span>
          </div>

          {hasData && (
            <div className="flex flex-col gap-1 items-end">
              <span className={`text-sm font-bold ${
                isProfitable ? "text-emerald-600 dark:text-emerald-400" :
                isLoss ? "text-red-600 dark:text-red-400" : "text-zinc-600 dark:text-zinc-400"
              }`}>
                {dayData.pnl >= 0 ? "+" : "-"}${Math.abs(dayData.pnl).toFixed(2)}
              </span>
              <div className="flex gap-2 text-xs text-zinc-500">
                <span className="text-emerald-600">{dayData.wins}W</span>
                <span className="text-red-600">{dayData.losses}L</span>
              </div>
              <span className="text-[10px] text-zinc-400">
                {dayData.count} trades
              </span>
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">{monthName} {year}</h2>
        <div className="flex gap-2">
          <button
            onClick={prevMonth}
            className="p-2 rounded-md border border-zinc-200 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
          >
            ←
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-md border border-zinc-200 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
          >
            →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-2 text-center text-sm font-medium text-zinc-500">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>

      <div className="grid grid-cols-7 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
        {renderDays()}
      </div>
    </div>
  );
}
