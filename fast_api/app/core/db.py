# # app/core/db.py
# import motor.motor_asyncio
# from typing import AsyncGenerator
# from app.core.config import settings

# # MongoDB connection
# client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGO_URI)
# database = client.manmitra_db  # Specify database name

# async def get_db() -> AsyncGenerator:
#     """Get database instance"""
#     yield database

# New code --
from motor.motor_asyncio import AsyncIOMotorClient
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

class MongoDB:
    client = None
    database = None

    async def connect(self):
        try:
            self.client = AsyncIOMotorClient(settings.MONGO_URI)
            self.database = self.client[settings.MONGO_DB_NAME]
            await self.client.admin.command('ping')
            logger.info("Connected to MongoDB successfully")
        except Exception as e:
            logger.error(f"Error connecting to MongoDB: {e}")
            raise

    async def close(self):
        if self.client:
            self.client.close()
            logger.info("MongoDB connection closed")

    def get_collection(self, collection_name: str):
        if not self.database:
            raise Exception("Database not connected")
        return self.database[collection_name]

mongodb = MongoDB()
