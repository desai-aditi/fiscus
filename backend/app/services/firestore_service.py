import firebase_admin
from firebase_admin import firestore
from typing import List, Dict, Any
from datetime import datetime, timedelta, timezone
import bcrypt
import random
from google.cloud.firestore_v1 import DELETE_FIELD
from firebase_admin import auth

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

async def store_code(uid: str, code: str, mode: str = "verification"):
    hashed_code = bcrypt.hashpw(code.encode(), bcrypt.gensalt()).decode()
    expiry_time = datetime.now(timezone.utc) + timedelta(minutes=10)

    field_name = "verification" if mode == "verification" else "resetPassword"

    db.collection("users").document(uid).update({
        field_name: {
            "code": hashed_code,
            "expiresAt": expiry_time
        }
    })

def get_code_data(uid: str, mode: str = "verification"):
    doc = db.collection("users").document(uid).get()
    if not doc.exists:
        return None
    doc_data = doc.to_dict() or {}

    field_name = "verification" if mode == "verification" else "resetPassword"
    return doc_data.get(field_name, None)

async def delete_code_field(uid: str, mode: str = "verification"):
    field_name = "verification" if mode == "verification" else "resetPassword"
    db.collection("users").document(uid).update({
        field_name: DELETE_FIELD
    })

async def set_new_password(uid: str, newPassword: str):
    auth.update_user(uid, password=newPassword)

async def send_email(email: str, code: str):
    db.collection("verificationMail").add({
        "to": email,
        "message": {
        "subject": "Thank you for signing up for Fiscus.",
        "text": "Hi there, below is your verification code. ",
        "html": code,
        },
    })

async def mark_email_verified(uid: str):
    db.collection("users").document(uid).update({
        "emailVerified": True,
    })

async def store_user_pin(uid: str, pin: str):
    hashed_pin = bcrypt.hashpw(pin.encode(), bcrypt.gensalt()).decode()
    db.collection("users").document(uid).update({
        "securityMethod": 'pin',
        "pin": hashed_pin
    })

def get_user_pin_hash(uid: str) -> str | None:
    doc = db.collection("users").document(uid).get()
    if not doc.exists:
        return None
    doc_data = doc.to_dict() or {}
    return doc_data.get("pin")

def get_user_by_email(email: str) -> str | None:
    """Get user data by email address"""
    try:
        # First try to get user from Firebase Auth
        try:
            user_record = auth.get_user_by_email(email)
            return user_record.uid
        except auth.UserNotFoundError:
            return None
            
    except Exception as e:
        print(f"Error getting user by email: {str(e)}")
        return None