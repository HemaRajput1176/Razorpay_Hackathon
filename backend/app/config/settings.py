import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "CYBERNEXUS"
    PRODUCT_NAME: str = "CYBERNEXUS — AI-Powered Autonomous Cyber Defense & Security Validation Platform"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "cybernexus-super-secret-key-change-in-production-2026")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours
    
    # Database URL defaults to local SQLite for instant out-of-the-box operation, can be overridden with Postgres
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./cybernexus.db")
    
    # Environment mode
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
