from __future__ import annotations
from datetime import datetime, timedelta
from typing import Optional, Any
from enum import Enum
from sqlmodel import SQLModel, Field
from sqlalchemy import Column
from sqlalchemy.types import JSON
from sqlalchemy import Enum as SAEnum


class EventStatus(str, Enum):
    PLANNED = "PLANNED"
    CONFIRMED = "CONFIRMED"
    CANCELLED = "CANCELLED"


class Event(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    description: str = ""
    start_at: datetime
    cutoff_at: datetime
    total_seats: int
    booked_seats: int = 0
    menus: dict | None = Field(default=None, sa_column=Column(JSON))  # holds reference info, e.g., {"menu_url": "/assets/menus/1001"}
    perks: dict | None = Field(default=None, sa_column=Column(JSON))
    status: EventStatus = Field(default=EventStatus.PLANNED, sa_column=Column(SAEnum(EventStatus)))
    hero_media: dict | None = Field(default=None, sa_column=Column(JSON))  # {"image": "hero-velden-01.jpg", "video": "hero.mp4", "autoplay": false, "muted": true, "loop": true}
    location: str = ""


def compute_status(ev: Event, now: datetime | None = None) -> str:
    now = now or datetime.utcnow()
    # Manual overrides respected
    if ev.status in ("CONFIRMED", "CANCELLED"):
        return ev.status
    # Business rules
    if ev.booked_seats >= ev.total_seats:
        return "CONFIRMED"
    if now >= ev.cutoff_at:
        # After cutoff: confirm only if quota met
        return "CONFIRMED" if ev.booked_seats >= ev.total_seats else "CANCELLED"
    return "PLANNED"


def computed_fields(ev: Event, now: datetime | None = None) -> dict[str, Any]:
    now = now or datetime.utcnow()
    progress = (ev.booked_seats / ev.total_seats) if ev.total_seats else 0.0
    return {
        "progressPct": round(progress * 100, 1),
        "seatsRemaining": max(ev.total_seats - ev.booked_seats, 0),
        "almostThere": (progress >= 0.8 and now < ev.cutoff_at),
        "status": compute_status(ev, now),
    }


def default_hero_media(image: str | None = None, video: str | None = None) -> dict:
    return {
        "image": image,
        "video": video,
        # Spec: default to NOT autoplay; flags can toggle
        "autoplay": False,
        "muted": True,
        "loop": True,
    }


def seed_events() -> list[Event]:
    base_start = datetime.utcnow() + timedelta(days=3)
    base_cutoff = base_start - timedelta(days=2)
    events: list[Event] = []
    for i, (eid, name, booked, total) in enumerate(
        [
            (1001, "Alpe-Adria Opening", 22, 30),
            (1002, "Italian Night", 15, 25),
            (1003, "Seafood Friday", 8, 20),
            (1004, "Vegan Tasting", 5, 18),
            (1005, "Steak & Wine", 12, 24),
            (1006, "Family Brunch", 10, 40),
            (1007, "Chef's Table", 6, 10),
        ]
    ):
        start = base_start + timedelta(days=i)
        cutoff = base_cutoff + timedelta(days=i)
        events.append(
            Event(
                id=eid,
                name=name,
                description="Special crowd-powered night.",
                start_at=start,
                cutoff_at=cutoff,
                total_seats=total,
                booked_seats=booked,
                menus={"menu_url": f"/assets/menus/{eid}"},
                perks={"free_dessert": True, "loyalty_points": 200},
                status="PLANNED",
                hero_media=default_hero_media(
                    image="hero-velden-01.jpg",
                    video="hero-event-italian.mp4" if eid == 1002 else None,
                ),
                location="Velden am Wörthersee",
            )
        )
    return events
