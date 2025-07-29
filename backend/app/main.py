from fastapi import FastAPI
from app.router import router

import firebase_admin
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings

app = FastAPI()
app.include_router(router)
settings = get_settings()
origins = [settings.frontend_url]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
