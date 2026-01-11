from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI

from backend.api.auth import router as auth_router
from backend.db.base import Base
from backend.db.session import engine

app = FastAPI(title="LeetCode Reminder API")

# DEV ONLY: creates tables automatically
Base.metadata.create_all(bind=engine)

app.include_router(auth_router, prefix="/v1/auth", tags=["auth"])

@app.get("/health")
def health():
    return {"ok": True}
