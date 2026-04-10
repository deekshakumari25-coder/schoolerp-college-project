from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    mongodb_uri: str | None = Field(default=None, validation_alias="MONGODB_URI")
    database_url: str | None = Field(default=None, validation_alias="DATABASE_URL")
    database_name: str = "school"
    jwt_secret: str = "change-me-in-production-use-long-random-secret"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24 * 7
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    @property
    def mongo_url(self) -> str:
        return self.mongodb_uri or self.database_url or "mongodb://localhost:27017"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
