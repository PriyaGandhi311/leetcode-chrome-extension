from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = Field(alias="DATABASE_URL")

    jwt_secret: str = Field(alias="JWT_SECRET")
    jwt_alg: str = Field(default="HS256", alias="JWT_ALG")
    access_token_expire_minutes: int = Field(default=43200, alias="ACCESS_TOKEN_EXPIRE_MINUTES")

    redis_url: str = Field(alias="REDIS_URL")

    smtp_host: str = Field(default="localhost", alias="SMTP_HOST")
    smtp_port: int = Field(default=1025, alias="SMTP_PORT")
    smtp_from_email: str = Field(default="noreply@leetcode-reminder.local", alias="SMTP_FROM_EMAIL")

settings = Settings()