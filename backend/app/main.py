from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from .database import Base, engine
from .routers import admin, appointments
from dotenv import load_dotenv
from pathlib import Path

# Load env
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

# Create tables
Base.metadata.create_all(bind=engine)

# Initialize app
app = FastAPI(title="Clinic Queue API", version="0.1.0")

# ✅ Correct CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://clinic-zp1c.vercel.app",  # production frontend
        "http://localhost:5173",           # local dev
        "http://127.0.0.1:5173",           # local dev alternate
    ],
    allow_credentials=True,
    allow_methods=["*"],   # allow GET, POST, DELETE, PATCH, OPTIONS
    allow_headers=["*"],   # allow all headers
)

# Health check
@app.get("/health", tags=["health"])
def health_check() -> dict[str, str]:
    return {"status": "ok"}

# Optional debug
print("ADMIN_CONSOLE_PASSWORD:", os.getenv("ADMIN_CONSOLE_PASSWORD"))

# Include routers
app.include_router(admin.router)
app.include_router(appointments.router)
