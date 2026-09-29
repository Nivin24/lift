import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "LIFT"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://user@localhost:5432/lift"
    )
    
    # JWT Auth
    SECRET_KEY: str = os.getenv(
        "SECRET_KEY", 
        "lift_dev_secret_key_change_in_production_9f83a0e1c2b54789a4"
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Credential Encryption (32-byte urlsafe base64 string)
    ENCRYPTION_SECRET: str = os.getenv(
        "ENCRYPTION_SECRET", 
        "t8qM_Z94Uo0h1vVpWsRkNmAxLzKyCiFeTgBoPqYuVxE="
    )
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
