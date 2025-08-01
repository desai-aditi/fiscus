from pydantic import BaseModel, Field
from typing import Literal
from datetime import datetime

class TransactionBase(BaseModel):
    type: Literal['expense', 'income']
    amount: float
    category: str
    date: str  # ISO string
    description: str

class TransactionCreate(TransactionBase):
    type: Literal['expense', 'income']
    amount: float = Field(..., gt=0, description="Amount must be positive")
    category: str = Field(..., min_length=1)
    date: str = Field(..., description="ISO date string")
    description: str = Field(default="", description="Optional description")
    # Add these fields that your frontend is sending
    uid: str = Field(..., description="User ID from Firebase")
    id: str = Field(..., description="Transaction ID from frontend")


class TransactionUpdate(TransactionBase):
    pass

class TransactionResponse(TransactionBase):
    id: str
    uid: str
    created_at: datetime
    updated_at: datetime