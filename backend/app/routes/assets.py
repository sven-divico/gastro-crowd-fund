from fastapi import APIRouter, HTTPException
from ..config import settings
import os, json


router = APIRouter(prefix="/assets", tags=["assets"])


@router.get("/menus/{event_id}")
def get_menu(event_id: int):
    path = os.path.join(settings.assets_dir, "menus", f"event-{event_id}.json")
    if not os.path.isfile(path):
        path = os.path.join(settings.assets_dir, "menus", f"{event_id}.json")
    if not os.path.isfile(path):
        raise HTTPException(status_code=404, detail="Menu not found")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

