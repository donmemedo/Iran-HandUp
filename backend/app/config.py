from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "HandUp Iran API"
    database_url: str = "sqlite:///./handup.db"
    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24 * 7
    cors_origins: str = "http://localhost:3035,http://127.0.0.1:3035,http://localhost:3000"
    seed_on_start: bool = True

    class Config:
        env_file = ".env"


settings = Settings()
