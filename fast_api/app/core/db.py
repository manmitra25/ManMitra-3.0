# app/core/db.py
import motor.motor_asyncio
from typing import AsyncGenerator
from app.core.config import settings

# MongoDB connection
client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGO_URI)
database = client.manmitra_db  # Specify database name

async def get_db() -> AsyncGenerator:
    """Get database instance"""
    yield database
