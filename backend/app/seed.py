from sqlmodel import Session, select
from .models import Event, seed_events


def ensure_seed(session: Session):
    existing = session.exec(select(Event)).all()
    if existing:
        return
    for ev in seed_events():
        session.add(ev)
    session.commit()


def reset_to_seed(session: Session):
    # Reset booked_seats and status to seed defaults
    seed_map = {e.id: e for e in seed_events()}
    events = session.exec(select(Event)).all()
    for ev in events:
        if ev.id in seed_map:
            seed = seed_map[ev.id]
            ev.booked_seats = seed.booked_seats
            ev.status = seed.status
    session.commit()

