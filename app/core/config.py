from typing import List, Union
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = Field(default="Shikshit Bharat API", description="Application Name")
    APP_ENV: str = Field(default="development", description="Environment (development/production/test)")
    DEBUG: bool = Field(default=True, description="Debug mode")
    API_V1_PREFIX: str = Field(default="/api/v1", description="API v1 prefix")

    HOST: str = Field(default="0.0.0.0", description="Server host")
    PORT: int = Field(default=8000, description="Server port")

    # PostgreSQL as primary production database, with support for local sqlite when running without external DB
    DATABASE_URL: str = Field(
        default="postgresql://postgres:postgres@localhost:5432/shikshit_bharat",
        description="Database connection URL"
    )

    ALLOWED_ORIGINS: Union[str, List[str]] = Field(
        default=["*"],
        description="List of allowed CORS origins or comma-separated string"
    )

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            if v.strip() == "*":
                return ["*"]
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
