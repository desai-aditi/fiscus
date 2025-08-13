from fastapi import APIRouter, Depends, HTTPException, status
from typing import Annotated
from app.dependencies import get_current_user, get_reset_user, generate_reset_token
from app.services.firestore_service import store_code, get_code_data, mark_email_verified, store_user_pin, get_user_pin_hash, send_email, delete_code_field, get_user_by_email, set_new_password
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
        await store_code(user["uid"], code, mode='verification')

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
        stored = get_code_data(user["uid"], mode='verification')
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
        await delete_code_field(user['uid'], mode='verification')

        return {"success": True, "message": "Email verified successfully."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error verifying code: {str(e)}")
    
@router.post("/sendResetCode/")
async def send_reset_code(request: dict):
    """Generate a code, store it hashed in Firestore, and send it via email."""
    try:
        email = request.get("email")
        if not email:
            raise HTTPException(status_code=400, detail="Email is required")
        
        # 1. Generate code
        code = str(random.randint(100000, 999999))
        
        # 2. Store hashed code + expiry
        uid = get_user_by_email(email)
        if uid is None:
            raise HTTPException(status_code=404, detail="User not found")
        
        await store_code(uid, code, 'resetPassword')
        
        # 3. Send email (replace with real service)
        print(f"Sending reset password code {code} to {email}")
        await send_email(email, code)
        
        return {"success": True, "message": "Reset password code sent."}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error sending reset password code: {str(e)}")

@router.post("/verifyResetCode/")
async def verify_reset_code(request: dict):
    """Check the entered code against the hashed one in Firestore and return reset token."""
    try:
        email = request.get("email")
        code = request.get("code")
        
        if not email or not code:
            raise HTTPException(status_code=400, detail="Email and code are required")
        
        uid = get_user_by_email(email)
        if uid is None:
            raise HTTPException(status_code=404, detail="User not found")
            
        stored = get_code_data(uid, mode='resetPassword')
        if not stored:
            raise HTTPException(status_code=400, detail="No reset password data found.")
            
        # Expiry check
        if datetime.now(timezone.utc) > stored["expiresAt"]:
            raise HTTPException(status_code=400, detail="Reset password code expired.")
            
        # Match check
        if not bcrypt.checkpw(code.encode(), stored["code"].encode()):
            raise HTTPException(status_code=400, detail="Invalid reset password code.")
            
        # Generate reset token - THIS IS THE KEY PART
        reset_token = generate_reset_token(uid)
        
        # Clean up - delete the used code
        await delete_code_field(uid, mode='resetPassword')
        
        return {
            "success": True, 
            "message": "Code verified successfully.",
            "resetToken": reset_token  # Return the special reset token
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error verifying reset password code: {str(e)}")

@router.post('/resetPassword/')
async def reset_password(
    request: dict,
    user: Annotated[dict, Depends(get_reset_user)],  # Use reset token dependency
):
    """Reset password using the reset token (not regular auth token)"""
    try:
        new_password = request.get('newPassword')
        if not new_password:
            raise HTTPException(status_code=400, detail="New password is required")
        
        # Verify this is indeed a reset token
        if user.get('token_purpose') != 'password_reset':
            raise HTTPException(status_code=401, detail="Invalid token for this operation")
        
        # Reset the password
        await set_new_password(user["uid"], new_password)
        
        return {"success": True, "message": "Password reset successfully."}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error resetting password: {e}")
    
    
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