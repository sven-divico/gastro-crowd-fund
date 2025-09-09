from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import ORJSONResponse
from fastapi import APIRouter
from .config import settings
import os
from .db import init_db, get_session
from .seed import ensure_seed
from .routes import events as events_routes
from .routes import admin as admin_routes
from .routes import assets as assets_routes
from .auth import bearer_scheme
from sqlmodel import Session


app = FastAPI(default_response_class=ORJSONResponse)


# CORS
origins = []
if settings.allowed_origin:
    origins = [settings.allowed_origin]
else:
    origins = ["http://localhost:8080"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


@app.on_event("startup")
def on_startup():
    init_db()
    # Seed DB
    with next(get_session()) as session:  # type: ignore
        ensure_seed(session)


# Ensure assets dir exists before mounting static
os.makedirs(settings.assets_dir, exist_ok=True)
# Static assets from mounted folder
app.mount("/static", StaticFiles(directory=settings.assets_dir), name="static")


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/auth")
def auth(body: dict):
    if body.get("password") != settings.demo_password:
        raise HTTPException(status_code=401, detail="Invalid password")
    return {"token": settings.demo_token}


@app.get("/config.json")
def runtime_config():
    return {
        "apiBase": settings.public_base_url,
        "assetsBase": "/static",
        "allowedOrigin": settings.allowed_origin or "http://localhost:8080",
        "locale": "de-AT",
        "currency": "EUR",
    }


# Routers
app.include_router(events_routes.router)
app.include_router(admin_routes.router)
app.include_router(assets_routes.router)
