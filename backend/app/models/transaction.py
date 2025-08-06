from pydantic import BaseModel, Field
from typing import Literal, Optional

class TransactionBase(BaseModel):
    type: Literal['expense', 'income']
    amount: float = Field(..., gt=0)
    category: str = Field(..., min_length=1)
    date: str  # ISO date string (YYYY-MM-DD)
    description: str = Field(default="")

class TransactionCreate(TransactionBase):
    uid: str
    id: str

class TransactionResponse(TransactionBase):
    id: str
    uid: str
    created_at: int  # Unix timestamp in milliseconds
    updated_at: int  # Unix timestamp in milliseconds
    deleted_at: Optional[int] = None  # Unix timestamp in milliseconds