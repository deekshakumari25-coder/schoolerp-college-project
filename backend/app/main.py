from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import ensure_indexes
from app.routers import admin, auth, school, student, teacher


@asynccontextmanager
async def lifespan(_: FastAPI):
    await ensure_indexes()
    yield


app = FastAPI(title="School API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_prefix = "/api"

app.include_router(auth.router, prefix=api_prefix)
app.include_router(school.router, prefix=api_prefix)
app.include_router(teacher.router, prefix=api_prefix)
app.include_router(student.router, prefix=api_prefix)
app.include_router(admin.router, prefix=api_prefix)


@app.get("/api/health")
async def health():
    return {"ok": True}
