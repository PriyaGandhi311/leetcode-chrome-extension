from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.auth import router as auth_router
from backend.api.reminders import router as reminders_router
from backend.db.base import Base
from backend.db.session import engine

app = FastAPI(title="LeetCode Reminder API")

# DEV ONLY: allow all origins (easy for extension + localhost dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,  # must be False if allow_origins=["*"]
    allow_methods=["*"],
    allow_headers=["*"],
)

# DEV ONLY: creates tables automatically
Base.metadata.create_all(bind=engine)

app.include_router(auth_router, prefix="/v1/auth", tags=["auth"])
app.include_router(reminders_router, prefix="/v1/reminders", tags=["reminders"])

@app.get("/health")
def health():
    return {"ok": True}
