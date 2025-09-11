import os
from typing import List, Any
from pydantic_settings import BaseSettings
from pydantic import Field, field_validator

class Settings(BaseSettings):
    # Environment
    ENVIRONMENT: str = Field(default="development", env="ENVIRONMENT")
    
    # API Configuration
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "ManMitra AI Service"
    
    # CORS Configuration
    CORS_ORIGINS: Any = Field(
        default=["http://localhost:3000", "http://localhost:5173"],
        env="CORS_ORIGINS"
    )
    
    @field_validator('CORS_ORIGINS', mode='before')
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            if v.strip() == '':
                return ["http://localhost:3000", "http://localhost:5173"]
            return [origin.strip() for origin in v.split(',') if origin.strip()]
        return v
    
    # Gemini AI Configuration
    GEMINI_API_KEY: str = Field(default="", env="GEMINI_API_KEY")
    GEMINI_MODEL: str = Field(default="gemini-2.0-flash-exp", env="GEMINI_MODEL")
    
    # AI Service Configuration
    MAX_CHAT_HISTORY: int = Field(default=10, env="MAX_CHAT_HISTORY")
    MAX_MESSAGE_LENGTH: int = Field(default=1000, env="MAX_MESSAGE_LENGTH")
    AI_RESPONSE_TIMEOUT: int = Field(default=30, env="AI_RESPONSE_TIMEOUT")
    
    # Crisis Detection Configuration
    CRISIS_KEYWORDS: str = Field(
        default="suicide,kill myself,end it,don't want to live,self harm,hurt myself,die,death,dead,not worth living,better off dead,end my life",
        env="CRISIS_KEYWORDS"
    )
    
    @property
    def crisis_keywords_list(self) -> List[str]:
        """Get crisis keywords as a list"""
        if not self.CRISIS_KEYWORDS or self.CRISIS_KEYWORDS.strip() == "":
            return [
                "suicide", "kill myself", "end it", "don't want to live",
                "self harm", "hurt myself", "die", "death", "dead",
                "not worth living", "better off dead", "end my life"
            ]
        return [keyword.strip() for keyword in self.CRISIS_KEYWORDS.split(',')]
    
    # Safety Configuration
    SAFETY_TEMPERATURE: float = Field(default=0.2, env="SAFETY_TEMPERATURE")
    CHAT_TEMPERATURE: float = Field(default=0.7, env="CHAT_TEMPERATURE")
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = Field(default=60, env="RATE_LIMIT_PER_MINUTE")
    
    # Logging
    LOG_LEVEL: str = Field(default="INFO", env="LOG_LEVEL")
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"

# Create settings instance
settings = Settings()
