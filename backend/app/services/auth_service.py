from typing import Optional
from fastapi import HTTPException, status
from firebase_admin.auth import verify_id_token

def verify_firebase_token(token: str) -> dict:
    """Verify Firebase ID token and return user data"""
    try:
        user = verify_id_token(token)
        return user
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not logged in or Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )