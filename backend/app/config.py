from pydantic import BaseModel
import os


class Settings(BaseModel):
    demo_password: str = os.getenv("DEMO_PASSWORD", "eat_good#")
    demo_token: str = os.getenv("DEMO_TOKEN", "demo-token-please-change")
    api_port: int = int(os.getenv("API_PORT", "8000"))
    allowed_origin: str | None = os.getenv("ALLOWED_ORIGIN")
    assets_dir: str = os.getenv("ASSETS_DIR", "/data/assets")
    db_path: str = os.getenv("DB_PATH", "/data/db/app.db")
    public_base_url: str = os.getenv("PUBLIC_BASE_URL", "http://localhost:8080")


settings = Settings()

