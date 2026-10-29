from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from app.schemas.common import BaseSchema
from app.models.enums import AudioPriority, AlertVisualType


class AnnouncementBase(BaseModel):
    classroom_id: str = Field(default="main_classroom", max_length=100, description="Target classroom")
    title: str = Field(..., min_length=2, max_length=255, description="Announcement headline")
    message: str = Field(..., min_length=1, description="Announcement body")
    author_name: str = Field(default="Teacher", max_length=100, description="Author display name")
    audio_priority: AudioPriority = Field(default=AudioPriority.NORMAL, description="Audio queue priority")
    audio_speech_text: Optional[str] = Field(None, description="Script optimized for speech synthesis/TTS")
    visual_alert_type: AlertVisualType = Field(default=AlertVisualType.BANNER, description="Visual badge/banner type")
    isl_gloss: Optional[str] = Field(None, description="Simplified ISL SOV gloss translation")


class AnnouncementCreate(AnnouncementBase):
    pass


class AnnouncementResponse(AnnouncementBase, BaseSchema):
    id: int
    created_at: datetime


class BlindAnnouncementView(BaseSchema):
    """Audio-prioritized announcement format for blind student interfaces."""
    id: int
    title: str
    audio_priority: AudioPriority
    spoken_text: str
    created_at: datetime
    author_name: str


class DeafAnnouncementView(BaseSchema):
    """Visually prioritized announcement format with ISL hints for deaf student interfaces."""
    id: int
    title: str
    message: str
    visual_alert_type: AlertVisualType
    isl_gloss: Optional[str] = None
    created_at: datetime
    author_name: str
