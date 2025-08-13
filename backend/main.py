from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import firebase_admin
from app.config import get_settings
from app.api.routes import transactions
from app.api.routes import verification

app = FastAPI(title="Fiscus API")

# Include routers
app.include_router(transactions.router, prefix="/api/transactions")
app.include_router(verification.router, prefix="/api/verification")

# CORS
settings = get_settings()
origins = [settings.frontend_url]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8081",  # Expo default port
        "http://localhost:19006", # Expo web port
        "http://127.0.0.1:8081",
        "http://127.0.0.1:19006",
        "exp://localhost:19000",  # Expo development
        "*"  # Allow all origins for development - REMOVE IN PRODUCTION
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Personal Finance API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "API is running"}
