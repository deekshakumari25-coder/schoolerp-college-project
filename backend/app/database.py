from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.config import settings

_client: AsyncIOMotorClient | None = None


def get_client() -> AsyncIOMotorClient:
    global _client
    if _client is None:
        _client = AsyncIOMotorClient(settings.mongo_url)
    return _client


def get_db() -> AsyncIOMotorDatabase:
    return get_client()[settings.database_name]


async def ensure_indexes() -> None:
    db = get_db()
    await db.users.create_index("username", unique=True)
    await db.attendance.create_index([("studentId", 1), ("date", 1)], unique=True)
