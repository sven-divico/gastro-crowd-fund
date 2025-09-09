from sqlmodel import SQLModel, create_engine, Session
from .config import settings
import os


os.makedirs(os.path.dirname(settings.db_path), exist_ok=True)

engine = create_engine(f"sqlite:///{settings.db_path}", echo=False)


def init_db():
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session

