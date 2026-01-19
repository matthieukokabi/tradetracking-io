from pydantic import BaseModel, Field, BeforeValidator
from typing import Optional, List, Annotated
from datetime import datetime
from enum import Enum

# Helper for Pydantic v2 to handle ObjectId
PyObjectId = Annotated[str, BeforeValidator(str)]

class TradeSide(str, Enum):
    BUY = "BUY"
    SELL = "SELL"

class TradeStatus(str, Enum):
    OPEN = "OPEN"
    CLOSED = "CLOSED"

class TradeBase(BaseModel):
    symbol: str
    side: TradeSide
    quantity: float
    entry_price: float
    exit_price: Optional[float] = None
    entry_time: datetime
    exit_time: Optional[datetime] = None
    status: TradeStatus = TradeStatus.OPEN
    pnl: Optional[float] = None
    setup: Optional[str] = None
    notes: Optional[str] = None

class TradeCreate(TradeBase):
    pass

class TradeUpdate(BaseModel):
    symbol: Optional[str] = None
    side: Optional[TradeSide] = None
    quantity: Optional[float] = None
    entry_price: Optional[float] = None
    exit_price: Optional[float] = None
    entry_time: Optional[datetime] = None
    exit_time: Optional[datetime] = None
    status: Optional[TradeStatus] = None
    pnl: Optional[float] = None
    setup: Optional[str] = None
    notes: Optional[str] = None

class Trade(TradeBase):
    id: Optional[PyObjectId] = Field(None, alias="_id")
    user_id: str

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "user_id": "user123",
                "symbol": "BTC/USD",
                "side": "BUY",
                "quantity": 0.5,
                "entry_price": 45000.0,
                "entry_time": "2024-01-01T10:00:00",
                "status": "OPEN"
            }
        }

class UserBase(BaseModel):
    username: str
    email: str
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: Optional[PyObjectId] = Field(None, alias="_id")
    disabled: Optional[bool] = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserInDB(User):
    hashed_password: str

class Portfolio(BaseModel):
    id: Optional[PyObjectId] = Field(None, alias="_id")
    user_id: str
    name: str
    initial_balance: float
    current_balance: float
    created_at: datetime = Field(default_factory=datetime.utcnow)
