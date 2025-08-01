import os
import pathlib
from functools import lru_cache
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

basedir = pathlib.Path(__file__).parents[1]
load_dotenv(basedir / ".env")

class Settings(BaseSettings):
    app_name: str = "fiscus"
    env: str = os.getenv("ENV", "development")
    frontend_url: str = "http://localhost:8081"

@lru_cache
def get_settings() -> Settings:
    return Settings()