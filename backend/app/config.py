from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    google_places_api_key: str = ""
    database_url: str = "sqlite:///./app.db"
    frontend_origin: str = "http://localhost:5173"
    session_expiry_hours: int = 24

    class Config:
        env_file = ".env"


settings = Settings()
