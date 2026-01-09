from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from .database import Base, engine
from .routers import admin, appointments
from dotenv import load_dotenv
from pathlib import Path

env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Clinic Queue API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://clinic-zp1c.vercel.app"],
    allow_credentials=True,
    allow_methods=["https://clinic-zp1c.vercel.app"],
    allow_headers=["https://clinic-zp1c.vercel.app"],
)


@app.get("/health", tags=["health"])
def health_check() -> dict[str, str]:
    return {"status": "ok"}

print("ADMIN_CONSOLE_PASSWORD:", os.getenv("ADMIN_CONSOLE_PASSWORD"))
app.include_router(admin.router)
app.include_router(appointments.router)
