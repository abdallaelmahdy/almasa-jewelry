from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    POSTGRES_USER: str = "almasa"
    POSTGRES_PASSWORD: str = "almasa_password"
    POSTGRES_DB: str = "almasa_jewelry"
    DATABASE_URL: str = "postgresql://almasa:almasa_password@localhost:5432/almasa_jewelry"
    PORT: int = 8000
    ENVIRONMENT: str = "development"
    API_V1_STR: str = "/api/v1"
    GOLD_API_KEY: str = ""

    # JWT Settings
    SECRET_KEY: str = "supersecretkey_please_change_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    class Config:
        env_file = ".env"

settings = Settings()
