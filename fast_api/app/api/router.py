from fastapi import APIRouter
from app.api.endpoints import chat, moderation, status

api_router = APIRouter()

api_router.include_router(chat.router, prefix="/chat", tags=["Bestie Chat"])
api_router.include_router(moderation.router, prefix="/moderation", tags=["Content Moderation"])
api_router.include_router(status.router, prefix="/status", tags=["API Status"])
