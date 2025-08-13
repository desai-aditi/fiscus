# dependencies.py - Authentication and other dependencies
import os
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

SECRET_KEY = os.getenv("JWT_SECRET_KEY")

if not SECRET_KEY:
    raise ValueError("JWT_SECRET_KEY environment variable is required")
RESET_TOKEN_EXPIRY_MINUTES = 15

# Security scheme for Bearer token
security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    Validate Firebase ID token and return user information
    """
    try:
        # Extract token from Authorization header
        token = credentials.credentials
        
        # Verify the Firebase ID token
        decoded_token = auth.verify_id_token(token)
        
        # Return user information
        return {
            "uid": decoded_token["uid"],
            "email": decoded_token.get("email"),
            "name": decoded_token.get("name"),
            "picture": decoded_token.get("picture")
        }
        
    except auth.InvalidIdTokenError:
        logger.error("Invalid Firebase ID token")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
security = HTTPBearer()

def generate_reset_token(uid: str) -> str:
    """Generate a JWT token specifically for password reset operations"""
    payload = {
        'uid': uid,
        'purpose': 'password_reset',  # This is crucial - limits token usage
        'exp': datetime.now(timezone.utc) + timedelta(minutes=RESET_TOKEN_EXPIRY_MINUTES),
        'iat': datetime.now(timezone.utc)  # Issued at time
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')

def verify_reset_token(token: str) -> Dict[str, Any]:
    """Verify and decode a reset token"""
    try:
        # Decode the token
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        
        # Check if this is actually a reset token
        if payload.get('purpose') != 'password_reset':
            raise HTTPException(
                status_code=401, 
                detail="Invalid token: not a password reset token"
            )
        
        return payload
    
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Reset token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid reset token")

async def get_reset_user(credentials = Depends(security)) -> Dict[str, Any]:
    """Dependency to extract user from reset token"""
    token = credentials.credentials
    payload = verify_reset_token(token)
    return {
        'uid': payload['uid'],
        'token_purpose': payload['purpose']
    }
