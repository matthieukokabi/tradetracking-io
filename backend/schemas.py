from pydantic import BaseModel
from typing import List, Dict
from datetime import date

class DailyJournalStat(BaseModel):
    date: date
    count: int
    pnl: float
    win_rate: float
    profit_factor: float
    wins: int
    losses: int
    breakeven: int

class JournalResponse(BaseModel):
    stats: Dict[str, DailyJournalStat]  # Key is ISO date string YYYY-MM-DD

class EquityPoint(BaseModel):
    date: str
    equity: float
    pnl: float  # Daily P&L

class EquityCurveResponse(BaseModel):
    data: List[EquityPoint]
