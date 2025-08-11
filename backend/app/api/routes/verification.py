from fastapi import APIRouter, Depends, HTTPException, status
from typing import Annotated
from app.dependencies import get_current_user
from app.services.firestore_service import store_verification_code, get_verification_data, mark_email_verified, store_user_pin, get_user_pin_hash, send_email
import bcrypt
import random
from datetime import datetime, timezone
# from app.services.email_service import send_email  # if you separate email logic

router = APIRouter()

@router.get("/sendVerificationCode/")
async def send_verification_code(
    user: Annotated[dict, Depends(get_current_user)]
):
    """Generate a code, store it hashed in Firestore, and send it via email."""
    try:
        # 1. Generate code
        code = str(random.randint(100000, 999999))

        # 2. Store hashed code + expiry
        await store_verification_code(user["uid"], code)

        # 3. Send email (replace with real service)
        print(f"Sending verification code {code} to {user['email']}")  
        await send_email(user["email"], code)

        return {"success": True, "message": "Verification code sent."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error sending verification code: {str(e)}")


@router.post("/verifyCode/")
async def verify_code(
    code_data: dict,
    user: Annotated[dict, Depends(get_current_user)]
):
    """Check the entered code against the hashed one in Firestore."""
    try:
        stored = get_verification_data(user["uid"])
        if not stored:
            raise HTTPException(status_code=400, detail="No verification data found.")

        # Expiry check
        if datetime.now(timezone.utc) > stored["expiresAt"]:
            raise HTTPException(status_code=400, detail="Verification code expired.")

        # Match check
        if not bcrypt.checkpw(code_data["code"].encode(), stored["code"].encode()):
            raise HTTPException(status_code=400, detail="Invalid verification code.")

        # Mark verified
        await mark_email_verified(user["uid"])

        return {"success": True, "message": "Email verified successfully."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error verifying code: {str(e)}")
    
@router.post("/setPin/")
async def set_pin(
    pin_data: dict,
    user: Annotated[dict, Depends(get_current_user)]
):
    """Set a new PIN (hashed) for the authenticated user."""
    try:
        await store_user_pin(user["uid"], pin_data["pin"])
        return {"success": True, "message": "PIN set successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error setting PIN: {str(e)}")

@router.post("/verifyPin/")
async def verify_pin(
    pin_data: dict,
    user: Annotated[dict, Depends(get_current_user)]
):
    """Verify provided PIN matches stored hash."""
    try:
        stored_hash = get_user_pin_hash(user["uid"])
        if not stored_hash:
            raise HTTPException(status_code=400, detail="PIN not set.")

        if not bcrypt.checkpw(pin_data["pin"].encode(), stored_hash.encode()):
            raise HTTPException(status_code=400, detail="Invalid PIN.")

        return {"success": True, "message": "PIN verified."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error verifying PIN: {str(e)}")