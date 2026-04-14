from functools import lru_cache
import os

from pydantic import BaseModel


class Settings(BaseModel):
    app_name: str = "VOKASI API"
    app_env: str = "development"
    api_prefix: str = "/api/v1"
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]


@lru_cache
def get_settings() -> Settings:
    return Settings(
        app_name=os.getenv("APP_NAME", "VOKASI API"),
        app_env=os.getenv("APP_ENV", "development"),
        api_prefix=os.getenv("API_PREFIX", "/api/v1"),
    )
