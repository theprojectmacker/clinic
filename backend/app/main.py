from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from pathlib import Path
from dotenv import load_dotenv

from .database import Base, engine
from .routers import admin, appointments

# Load environment variables from .env
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

# Create database tables if they don't exist
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(title="Clinic Queue API", version="0.1.0")

# CORS configuration
# Add localhost for local dev, and production frontend URL
origins = [
    "http://localhost:5173",         # Vite dev server (local)
    "http://127.0.0.1:5173",         # Another possible local dev URL
    "https://clinic-zp1c.vercel.app" # Production frontend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,   # allow requests only from these origins
    allow_credentials=True,
    allow_methods=["*"],     # allow GET, POST, DELETE, PATCH, etc.
    allow_headers=["*"],     # allow Authorization, Content-Type, etc.
)

# Health check route
@app.get("/health", tags=["health"])
def health_check() -> dict[str, str]:
    return {"status": "ok"}

# Print admin console password (optional, for debug)
print("ADMIN_CONSOLE_PASSWORD:", os.getenv("ADMIN_CONSOLE_PASSWORD"))

# Include routers
app.include_router(admin.router)
app.include_router(appointments.router)
console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);
