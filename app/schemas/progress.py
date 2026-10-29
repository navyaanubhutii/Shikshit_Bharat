from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from app.schemas.common import BaseSchema
from app.models.enums import AccessibilityMode, ProgressStatus


class StudentProgressBase(BaseModel):
    student_id: str = Field(..., max_length=100, description="Student unique identifier")
    lesson_id: int = Field(..., description="Referenced lesson ID")
    accessibility_mode: AccessibilityMode = Field(
        default=AccessibilityMode.UNIVERSAL,
        description="Active mode (blind, deaf, or universal)"
    )
    status: ProgressStatus = Field(default=ProgressStatus.NOT_STARTED, description="Progress state")
    completion_percentage: float = Field(default=0.0, ge=0.0, le=100.0, description="Completion percentage 0-100")
    audio_queue_position: int = Field(default=0, ge=0, description="Last played audio queue cue index")
    offline_version_cached: int = Field(default=0, ge=0, description="Version cached on local device")
    quiz_score: Optional[float] = Field(None, ge=0.0, le=100.0, description="Score on lesson quiz")
    quiz_attempts: int = Field(default=0, ge=0, description="Number of quiz attempts")
    time_spent_seconds: int = Field(default=0, ge=0, description="Time engaged with lesson in seconds")


class StudentProgressCreate(StudentProgressBase):
    pass


class StudentProgressUpdate(BaseModel):
    status: Optional[ProgressStatus] = None
    completion_percentage: Optional[float] = Field(None, ge=0.0, le=100.0)
    audio_queue_position: Optional[int] = Field(None, ge=0)
    offline_version_cached: Optional[int] = Field(None, ge=0)
    quiz_score: Optional[float] = Field(None, ge=0.0, le=100.0)
    quiz_attempts: Optional[int] = Field(None, ge=0)
    time_spent_seconds: Optional[int] = Field(None, ge=0)


class StudentProgressResponse(StudentProgressBase, BaseSchema):
    id: int
    last_synced_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
