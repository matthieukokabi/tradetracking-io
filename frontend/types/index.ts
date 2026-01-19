export enum TradeSide {
  BUY = "BUY",
  SELL = "SELL",
}

export enum TradeStatus {
  OPEN = "OPEN",
  CLOSED = "CLOSED",
}

export interface Trade {
  _id?: string;
  user_id: string;
  symbol: string;
  side: TradeSide;
  quantity: number;
  entry_price: number;
  exit_price?: number;
  entry_time: string; // ISO date string
  exit_time?: string; // ISO date string
  status: TradeStatus;
  pnl?: number;
  setup?: string;
  notes?: string;
}

export interface User {
  _id?: string;
  username: string;
  email: string;
  full_name?: string;
  disabled?: boolean;
  created_at: string;
}

export interface DashboardStats {
  total_pnl: number;
  win_rate: number;
  profit_factor: number;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  breakeven_trades: number;
}

export interface DailyJournalStat {
  date: string;
  count: number;
  pnl: number;
  win_rate: number;
  profit_factor: number;
  wins: number;
  losses: number;
  breakeven: number;
}

export interface JournalResponse {
  stats: Record<string, DailyJournalStat>;
}

export interface EquityPoint {
  date: string;
  equity: number;
  pnl: number;
}

export interface EquityCurveResponse {
  data: EquityPoint[];
}
