from fastapi import APIRouter, Depends, HTTPException
from typing import Annotated, Optional
from pydantic import BaseModel
from datetime import datetime, timedelta
import firebase_admin
from firebase_admin import firestore
from app.config import get_firebase_user_from_token

if not firebase_admin._apps:
    firebase_admin.initialize_app()

router = APIRouter()
db = firestore.client()

@router.get("/")
async def read_root():
    return {"message": "Welcome to the Fiscus API"}

@router.get("/userid")
async def get_userid(user: Annotated[dict, Depends(get_firebase_user_from_token)]):
    """gets the firebase connected user"""
    return {"id": user["uid"]}

@router.get("/transactions")
async def get_transactions(
    user: Annotated[dict, Depends(get_firebase_user_from_token)]
):
    """Get all transactions for the authenticated user"""
    try:
        transactions_ref = db.collection("transactions").where("uid", "==", user["uid"])
        docs = transactions_ref.stream()
        
        transactions = []
        for doc in docs:
            transaction_data = doc.to_dict()
            transaction_data["id"] = doc.id
            transactions.append(transaction_data)
        
        return {
            "success": True,
            "data": {"transactions": transactions}
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching transactions: {str(e)}")