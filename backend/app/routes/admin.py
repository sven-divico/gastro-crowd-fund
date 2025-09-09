from fastapi import APIRouter, Depends
from sqlmodel import Session
from ..db import get_session
from ..auth import require_token
from ..seed import reset_to_seed


router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_token)])


@router.post("/reset")
def reset(session: Session = Depends(get_session)):
    reset_to_seed(session)
    return {"ok": True}

