from pydantic import BaseModel
import os
from pathlib import Path
from dotenv import load_dotenv


# Load .env from project root (../.. from this file)
_PROJECT_ROOT = Path(__file__).resolve().parents[2]
_ENV_PATH = _PROJECT_ROOT / ".env"
if _ENV_PATH.exists():
    load_dotenv(_ENV_PATH)


def _resolve_path(p: str) -> str:
    path = Path(p)
    return str(path if path.is_absolute() else (_PROJECT_ROOT / path))


class Settings(BaseModel):
    demo_password: str = os.getenv("DEMO_PASSWORD", "eat_good#")
    demo_token: str = os.getenv("DEMO_TOKEN", "demo-token-please-change")
    api_port: int = int(os.getenv("API_PORT", "8000"))
    allowed_origin: str | None = os.getenv("ALLOWED_ORIGIN")
    assets_dir: str = _resolve_path(os.getenv("ASSETS_DIR", "./data/assets"))
    db_path: str = _resolve_path(os.getenv("DB_PATH", "./data/db/app.db"))
    public_base_url: str = os.getenv("PUBLIC_BASE_URL", "http://localhost:8080")


settings = Settings()
