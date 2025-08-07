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
        
        # Ensure timestamps are integers (in case Firestore stored them as different types)
        if isinstance(transaction_data.get("created_at"), datetime):
            transaction_data["created_at"] = int(transaction_data["created_at"].timestamp() * 1000)
        if isinstance(transaction_data.get("updated_at"), datetime):
            transaction_data["updated_at"] = int(transaction_data["updated_at"].timestamp() * 1000)
            
        transactions.append(transaction_data)
    
    return transactions

async def get_updated_transactions(uid: str, last_sync_timestamp: int) -> List[Dict[str, Any]]:
    """Get transactions with updated_at timestamp greater than last_sync_timestamp"""
    print(f"Querying Firestore for uid: {uid}, timestamp > {last_sync_timestamp}")
    
    try:
        transactions_ref = db.collection("transactions").where("uid", "==", uid).where("updated_at", ">", last_sync_timestamp)
        docs = transactions_ref.stream()
        
        transactions = []
        for doc in docs:
            transaction_data = doc.to_dict()
            transaction_data["id"] = doc.id
            
            # Ensure timestamps are integers
            if isinstance(transaction_data.get("created_at"), datetime):
                transaction_data["created_at"] = int(transaction_data["created_at"].timestamp() * 1000)
            if isinstance(transaction_data.get("updated_at"), datetime):
                transaction_data["updated_at"] = int(transaction_data["updated_at"].timestamp() * 1000)
            if isinstance(transaction_data.get("deleted_at"), datetime):
                transaction_data["deleted_at"] = int(transaction_data["deleted_at"].timestamp() * 1000)
                
            transactions.append(transaction_data)
        
        print(f"Successfully retrieved {len(transactions)} transactions")
        return transactions
        
    except Exception as e:
        print(f"Error in get_updated_transactions: {str(e)}")
        raise e

async def create_transaction(uid: str, transaction_data: Dict[str, Any]) -> Dict[str, Any]:
    """Create a new transaction for a user"""
    now = int(datetime.utcnow().timestamp() * 1000)
    transaction_id = transaction_data.get("id")
    
    if not transaction_id:
        raise ValueError("Transaction ID is required")
    
    transaction_doc = {
        "type": transaction_data["type"],
        "amount": transaction_data["amount"],
        "category": transaction_data["category"],
        "date": transaction_data["date"],
        "description": transaction_data.get("description", ""),
        "uid": uid,
        "created_at": now,
        "updated_at": now,
        "deleted_at": None
    }
    
    # Use custom document ID instead of auto-generated
    doc_ref = db.collection("transactions").document(transaction_id)
    doc_ref.set(transaction_doc)
    
    # Return with consistent timestamp format
    return {
        **transaction_doc,
        "id": transaction_id
    }

async def update_transaction(uid: str, transaction_data: Dict[str, Any]) -> Dict[str, Any]:
    """Update an existing transaction for a user"""
    transaction_id = transaction_data.get("id")
    if not transaction_id:
        raise ValueError("Transaction ID is required for update")

    # Query for the document with the custom "id" field using new filter syntax
    doc_ref = db.collection("transactions").document(transaction_id)
    doc = doc_ref.get()
    
    update_data = {
        "type": transaction_data["type"],
        "amount": transaction_data["amount"], 
        "category": transaction_data["category"],
        "date": transaction_data["date"],
        "description": transaction_data.get("description", ""),
        "updated_at": int(datetime.utcnow().timestamp() * 1000)  # Unix timestamp
    }
    
    doc_ref.update(update_data)

    return {
        **update_data,
        "id": transaction_id
    }

async def remove_transaction(transaction_id: str, uid: str) -> Dict[str, Any]:
    """Soft delete a transaction for a user"""
    if not transaction_id:
        raise ValueError("Transaction ID is required")
    
    # Get document reference directly using the transaction_id
    doc_ref = db.collection("transactions").document(transaction_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise ValueError(f"Transaction with ID {transaction_id} does not exist")
    
    # Soft delete with Unix timestamp
    now = int(datetime.now().timestamp() * 1000)
    update_data = {
        "deleted_at": now,
        "updated_at": now
    }
    
    doc_ref.update(update_data)
    
    # Return updated data
    return {
        **update_data,
        "id": transaction_id
    }