"use client";

import { DashboardStats } from "../types";

interface TradeScoreProps {
  stats: DashboardStats | null;
  loading?: boolean;
  compact?: boolean;
}

/**
 * Calculates the Trade Tracking Score
 * Based on: Win Rate, Profit Factor, Consistency, Max Drawdown, Recovery Factor
 * Returns a score from 0-100
 */
function calculateTradeScore(stats: DashboardStats | null): number {
  if (!stats || stats.total_trades === 0) return 0;

  const {
    win_rate = 0,
    profit_factor = 1,
    total_pnl = 0,
    avg_win = 0,
    avg_loss = 0,
    max_drawdown = 0,
    total_trades = 0,
    winning_trades = 0,
    losing_trades = 0,
  } = stats;

  // Win Rate Score (0-25 points)
  const winRateScore = Math.min(25, (win_rate / 100) * 25);

  // Profit Factor Score (0-25 points)
  const pf =
    profit_factor ||
    (avg_win && avg_loss
      ? (avg_win * winning_trades) / Math.abs(avg_loss * losing_trades)
      : 1);
  const profitFactorScore = Math.min(25, Math.max(0, (pf - 1) * 12.5));

  // Consistency Score (0-20 points)
  const avgTradeValue = total_trades > 0 ? total_pnl / total_trades : 0;
  const consistencyScore = Math.min(
    20,
    Math.max(0, avgTradeValue > 0 ? 15 : 5) +
      (total_trades >= 20 ? 5 : total_trades / 4)
  );

  // Drawdown Score (0-15 points)
  const drawdownPercent = Math.abs(max_drawdown || 0) * 100;
  const drawdownScore = Math.max(0, 15 - drawdownPercent / 2);

  // Recovery Factor Score (0-15 points)
  const recoveryFactor =
    max_drawdown !== 0 ? Math.abs(total_pnl / max_drawdown) : 0;
  const recoveryScore = Math.min(15, recoveryFactor * 5);

  const totalScore = Math.round(
    winRateScore +
      profitFactorScore +
      consistencyScore +
      drawdownScore +
      recoveryScore
  );
  return Math.min(100, Math.max(0, totalScore));
}

function getScoreGrade(score: number) {
  if (score >= 90)
    return {
      grade: "S",
      color: "text-yellow-400",
      bg: "bg-yellow-400/20",
      label: "Elite",
    };
  if (score >= 80)
    return {
      grade: "A",
      color: "text-green-400",
      bg: "bg-green-400/20",
      label: "Excellent",
    };
  if (score >= 70)
    return {
      grade: "B",
      color: "text-blue-400",
      bg: "bg-blue-400/20",
      label: "Good",
    };
  if (score >= 60)
    return {
      grade: "C",
      color: "text-purple-400",
      bg: "bg-purple-400/20",
      label: "Average",
    };
  if (score >= 50)
    return {
      grade: "D",
      color: "text-orange-400",
      bg: "bg-orange-400/20",
      label: "Below Avg",
    };
  return {
    grade: "F",
    color: "text-red-400",
    bg: "bg-red-400/20",
    label: "Needs Work",
  };
}

function ScoreBreakdownItem({
  label,
  value,
  score,
  max,
}: {
  label: string;
  value: string;
  score: number;
  max: number;
}) {
  const percentage = (score / max) * 100;
  return (
    <div className="flex items-center gap-2">
      <span className="w-20 text-zinc-500 dark:text-zinc-400">{label}</span>
      <div className="flex-1 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-violet-500 to-blue-500 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="w-12 text-right text-zinc-400">{value}</span>
    </div>
  );
}

export default function TradeScore({
  stats,
  loading,
  compact = false,
}: TradeScoreProps) {
  const score = calculateTradeScore(stats);
  const { grade, color, bg, label } = getScoreGrade(score);

  if (loading) {
    return (
      <div
        className={`rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 ${compact ? "" : "h-full"}`}
      >
        <div className="animate-pulse">
          <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded mb-4" />
          <div className="h-24 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-full mx-auto mb-4" />
          <div className="h-3 w-24 bg-zinc-200 dark:bg-zinc-800 rounded mx-auto" />
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`flex items-center gap-3 px-4 py-2 rounded-xl ${bg}`}>
        <div className={`text-2xl font-black ${color}`}>{score}</div>
        <div className="flex flex-col">
          <span className={`text-xs font-black ${color}`}>Grade {grade}</span>
          <span className="text-[10px] text-zinc-400">{label}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">
          Trade Score
        </h3>
        <span className="text-lg">⚡</span>
      </div>

      {/* Score Ring */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative">
          <svg
            className="w-28 h-28 transform -rotate-90"
            viewBox="0 0 100 100"
          >
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-zinc-200 dark:text-zinc-800"
            />
            {/* Score progress */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${score * 2.83} 283`}
              className={color}
              style={{ transition: "stroke-dasharray 1s ease-out" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-black ${color}`}>{score}</span>
            <span className="text-[10px] font-bold text-zinc-500 uppercase">
              / 100
            </span>
          </div>
        </div>
      </div>

      {/* Grade Badge */}
      <div
        className={`mt-4 py-3 px-4 rounded-xl ${bg} flex items-center justify-between`}
      >
        <div>
          <div className={`text-lg font-black ${color}`}>Grade {grade}</div>
          <div className="text-xs text-zinc-400">{label}</div>
        </div>
        <div className={`text-3xl font-black ${color}`}>{grade}</div>
      </div>

      {/* Score Breakdown */}
      <div className="mt-4 space-y-2 text-xs">
        <ScoreBreakdownItem
          label="Win Rate"
          value={`${stats?.win_rate?.toFixed(1) || 0}%`}
          score={Math.min(25, ((stats?.win_rate || 0) / 100) * 25)}
          max={25}
        />
        <ScoreBreakdownItem
          label="Profit Factor"
          value={stats?.profit_factor?.toFixed(2) || "1.00"}
          score={Math.min(
            25,
            Math.max(0, ((stats?.profit_factor || 1) - 1) * 12.5)
          )}
          max={25}
        />
        <ScoreBreakdownItem
          label="Consistency"
          value={(stats?.total_trades || 0) >= 20 ? "High" : "Low"}
          score={(stats?.total_trades || 0) >= 20 ? 20 : 10}
          max={20}
        />
        <ScoreBreakdownItem
          label="Drawdown"
          value={`${((stats?.max_drawdown || 0) * 100).toFixed(1)}%`}
          score={Math.max(
            0,
            15 - (Math.abs(stats?.max_drawdown || 0) * 100) / 2
          )}
          max={15}
        />
      </div>
    </div>
  );
}
