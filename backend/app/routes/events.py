from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from datetime import datetime
from typing import Any

from ..db import get_session
from ..models import Event, computed_fields, compute_status
from ..auth import require_token
from ..config import settings
import os, json


router = APIRouter(prefix="/events", tags=["events"], dependencies=[Depends(require_token)])


@router.get("")
def list_events(from_: str | None = None, to: str | None = None, session: Session = Depends(get_session)):
    now = datetime.utcnow()
    events = session.exec(select(Event)).all()
    items: list[dict[str, Any]] = []
    for ev in events:
        data = ev.model_dump()
        data.update(computed_fields(ev, now))
        items.append(data)
    return {"items": items}


@router.get("/{event_id}")
def get_event(event_id: int, session: Session = Depends(get_session)):
    ev = session.get(Event, event_id)
    if not ev:
        raise HTTPException(status_code=404, detail="Event not found")
    data = ev.model_dump()
    data.update(computed_fields(ev))
    return data


@router.post("/{event_id}/book")
def book_event(event_id: int, payload: dict, session: Session = Depends(get_session)):
    qty = int(payload.get("quantity", 1))
    ev = session.get(Event, event_id)
    if not ev:
        raise HTTPException(status_code=404, detail="Event not found")
    before = ev.booked_seats
    ev.booked_seats = min(ev.total_seats, ev.booked_seats + max(qty, 0))
    clamped = ev.booked_seats != before + max(qty, 0)
    # Persist optimistic update
    session.add(ev)
    session.commit()
    session.refresh(ev)
    data = ev.model_dump()
    data.update(computed_fields(ev))
    if clamped:
        data["message"] = "Booking clamped to available seats"
    return data


@router.post("/{event_id}/status/confirm")
def confirm_event(event_id: int, session: Session = Depends(get_session)):
    ev = session.get(Event, event_id)
    if not ev:
        raise HTTPException(status_code=404, detail="Event not found")
    ev.status = "CONFIRMED"
    session.add(ev)
    session.commit()
    return {"status": ev.status}


@router.post("/{event_id}/status/cancel")
def cancel_event(event_id: int, session: Session = Depends(get_session)):
    ev = session.get(Event, event_id)
    if not ev:
        raise HTTPException(status_code=404, detail="Event not found")
    ev.status = "CANCELLED"
    session.add(ev)
    session.commit()
    return {"status": ev.status}


@router.put("/{event_id}")
def update_event(event_id: int, payload: dict, session: Session = Depends(get_session)):
    ev = session.get(Event, event_id)
    if not ev:
        raise HTTPException(status_code=404, detail="Event not found")
    for key, val in payload.items():
        if hasattr(ev, key) and key not in ("id",):
            setattr(ev, key, val)
    session.add(ev)
    session.commit()
    session.refresh(ev)
    data = ev.model_dump()
    data.update(computed_fields(ev))
    return data


 
