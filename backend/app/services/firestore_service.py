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

async def update_transaction(uid: str, transaction_data: Dict[str, Any]) -> Dict[str, Any]:
    """Update an existing transaction for a user"""
    transaction_id = transaction_data.get("id")
    if not transaction_id:
        raise ValueError("Transaction ID is required for update")

    # Query for the document with the custom "id" field using new filter syntax
    query = db.collection("transactions").where("id", "==", transaction_id).where("uid", "==", uid)
    docs = query.get()
    
    # Check if document exists
    if not docs:
        raise ValueError(f"Transaction with ID {transaction_id} does not exist for user {uid}")
    
    if len(docs) > 1:
        raise ValueError(f"Multiple transactions found with ID {transaction_id}")
    
    # Get the document reference and current data
    doc = docs[0]
    doc_ref = doc.reference

    transaction_data.pop("id", None)  # Remove ID from update data
    transaction_data["updated_at"] = datetime.now()  # Update timestamp

    doc_ref.update(transaction_data)

    return transaction_data

async def remove_transaction(transaction_id: str, uid: str) -> None:
    """Delete a transaction for a user"""

    # Query for the document with the custom "id" field using new filter syntax
    query = db.collection("transactions").where("id", "==", transaction_id).where("uid", "==", uid)
    docs = query.get()
    
    # Check if document exists
    if not docs:
        raise ValueError(f"Transaction with ID {transaction_id} does not exist for user {uid}")
    
    if len(docs) > 1:
        raise ValueError(f"Multiple transactions found with ID {transaction_id}")
    
    # Delete the document
    doc = docs[0]
    doc_ref = doc.reference

    doc_ref.update({ "deleted_at": datetime.now()})