import firebase_admin
from firebase_admin import firestore
from typing import List, Dict, Any
from datetime import datetime

if not firebase_admin._apps:
    firebase_admin.initialize_app()

db = firestore.client()

async def get_user_transactions(uid: str) -> List[Dict[str, Any]]:
    """Get all transactions for a user"""
    transactions_ref = db.collection("transactions").where("uid", "==", uid)
    docs = transactions_ref.stream()
    
    transactions = []
    for doc in docs:
        transaction_data = doc.to_dict()
        transaction_data["id"] = doc.id
        transactions.append(transaction_data)
    
    return transactions

async def create_transaction(uid: str, transaction_data: Dict[str, Any]) -> Dict[str, Any]:
    """Create a new transaction for a user"""
    # Add metadata
    now = datetime.utcnow()
    transaction_doc = {
        **transaction_data,
        "uid": uid,
        "created_at": now,
        "updated_at": now
    }
    
    # Add to Firestore
    doc_ref = db.collection("transactions").add(transaction_doc)
    doc_id = doc_ref[1].id  # doc_ref returns (timestamp, DocumentReference)
    
    # Return the created transaction with ID
    transaction_doc["id"] = doc_id
    return transaction_doc