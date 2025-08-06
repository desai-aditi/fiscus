from fastapi import APIRouter, Depends, HTTPException, status
from typing import Annotated, List
from app.dependencies import get_current_user
from app.models.transaction import TransactionResponse, TransactionCreate
from app.services.firestore_service import create_transaction, update_transaction, remove_transaction

router = APIRouter()

# @router.get("/", response_model=List[TransactionResponse])
# async def get_transactions(
#     user: Annotated[dict, Depends(get_current_user)]
# ):
#     """Get all transactions for the authenticated user"""
#     try:
#         transactions = await get_user_transactions(user["uid"])
#         return transactions
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Error fetching transactions: {str(e)}")
    
@router.post("/", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
async def add_transaction(
    transaction: TransactionCreate,
    user: Annotated[dict, Depends(get_current_user)]
):
    """Create a new transaction for the authenticated user"""
    try:
        created_transaction = await create_transaction(
            uid=user["uid"],
            transaction_data=transaction.model_dump()
        )
        return created_transaction
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating transaction: {str(e)}"
        )
@router.put("/{transaction_id}/", status_code=status.HTTP_200_OK) 
async def set_transaction(transaction: TransactionCreate,
    user: Annotated[dict, Depends(get_current_user)]):
    try:
        updated_transaction = await update_transaction(
            uid=user["uid"],
            transaction_data=transaction.model_dump()
        )
        return updated_transaction
    except Exception as e:
        print(f"Error updating transaction: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating transaction: {str(e)}"
        )
    
@router.delete("/{transaction_id}/", status_code=status.HTTP_204_NO_CONTENT)
async def delete_transaction( 
    transaction_id: str,
    user: Annotated[dict, Depends(get_current_user)]
):
    """Delete a transaction for the authenticated user"""
    try:
        await remove_transaction(transaction_id=transaction_id, uid=user["uid"])
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting transaction: {str(e)}"
        )