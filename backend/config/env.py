from pydantic import RedisDsn
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    SECRET_KEY: str
    DEBUG: bool = False
    ALLOWED_HOSTS: list[str] = ["localhost", "127.0.0.1"]
    REDIS_URL: RedisDsn = RedisDsn("redis://127.0.0.1:6379/1")
    CACHE_CLEAR_TOKEN: str


settings = Settings()
