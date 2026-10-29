from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field
from app.schemas.common import BaseSchema
from app.models.enums import AudioPriority


class AudioCueItem(BaseModel):
    """Segment in a priority audio queue."""
    cue_id: str = Field(..., description="Unique identifier for audio segment")
    priority: AudioPriority = Field(default=AudioPriority.NORMAL, description="Playback priority")
    text: str = Field(..., description="Text for synthesis or screenreader announcement")
    timestamp_ms: int = Field(default=0, description="Offset timestamp in milliseconds")


# ── Blind Adaptation Schemas ──

class BlindAdaptationBase(BaseModel):
    audio_summary: Optional[str] = Field(None, description="Concise audio overview for TTS")
    screenreader_description: Optional[str] = Field(None, description="Detailed auditory descriptions for visuals/diagrams")
    braille_ascii: Optional[str] = Field(None, description="ASCII Braille format transcript")
    braille_unicode: Optional[str] = Field(None, description="6-dot Unicode Braille characters")
    priority_audio_cues: Optional[List[Dict[str, Any]]] = Field(default_factory=list, description="Ordered audio queue cues")
    audio_narration_url: Optional[str] = Field(None, description="Audio stream URL")


class BlindAdaptationCreate(BlindAdaptationBase):
    pass


class BlindAdaptationResponse(BlindAdaptationBase, BaseSchema):
    id: int
    lesson_id: int
    created_at: datetime


# ── Deaf Adaptation Schemas ──

class DeafAdaptationBase(BaseModel):
    isl_gloss: Optional[str] = Field(None, description="Subject-Object-Verb (SOV) ISL grammatical gloss")
    sign_tokens: Optional[List[Any]] = Field(default_factory=list, description="ISL gesture tokens and dictionary ids")
    isl_video_url: Optional[str] = Field(None, description="Link to sign language demonstration video/animation")
    visual_transcript: Optional[str] = Field(None, description="High-legibility visual transcript with subtitles")
    key_visual_cues: Optional[List[str]] = Field(default_factory=list, description="Visual focus cues and vocabulary anchors")


class DeafAdaptationCreate(DeafAdaptationBase):
    pass


class DeafAdaptationResponse(DeafAdaptationBase, BaseSchema):
    id: int
    lesson_id: int
    created_at: datetime


# ── Shared Lesson Schemas ──

class LessonBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=255, description="Lesson title")
    subject: str = Field(..., min_length=2, max_length=100, description="Subject (e.g. Science, Maths)")
    grade_level: str = Field(..., max_length=50, description="Target grade/class level")
    summary: Optional[str] = Field(None, description="General lesson summary")
    content: str = Field(..., description="Full lesson content in markdown format")
    language: str = Field(default="hi", max_length=10, description="Primary language code (e.g., 'hi', 'en')")
    teacher_id: Optional[str] = Field(None, description="Identifier of the teacher")
    offline_version: int = Field(default=1, description="Version counter for offline sync")
    is_published: bool = Field(default=True, description="Publish status")


class LessonCreate(LessonBase):
    blind_adaptation: Optional[BlindAdaptationCreate] = None
    deaf_adaptation: Optional[DeafAdaptationCreate] = None


class LessonUpdate(BaseModel):
    title: Optional[str] = None
    subject: Optional[str] = None
    grade_level: Optional[str] = None
    summary: Optional[str] = None
    content: Optional[str] = None
    language: Optional[str] = None
    offline_version: Optional[int] = None
    is_published: Optional[bool] = None
    blind_adaptation: Optional[BlindAdaptationCreate] = None
    deaf_adaptation: Optional[DeafAdaptationCreate] = None


class LessonResponse(LessonBase, BaseSchema):
    id: int
    created_at: datetime
    updated_at: datetime
    blind_adaptation: Optional[BlindAdaptationResponse] = None
    deaf_adaptation: Optional[DeafAdaptationResponse] = None


# ── Distinct Client Views ──

class BlindLessonView(BaseSchema):
    """Tailored specifically for blind learners and screen-readers."""
    lesson_id: int
    title: str
    subject: str
    grade_level: str
    audio_summary: Optional[str] = None
    screenreader_description: Optional[str] = None
    braille_ascii: Optional[str] = None
    braille_unicode: Optional[str] = None
    priority_audio_cues: List[Dict[str, Any]] = Field(default_factory=list)
    audio_narration_url: Optional[str] = None
    content_transcript: str


class DeafLessonView(BaseSchema):
    """Tailored specifically for deaf learners, visual parsing and ISL signing."""
    lesson_id: int
    title: str
    subject: str
    grade_level: str
    isl_gloss: Optional[str] = None
    sign_tokens: List[Any] = Field(default_factory=list)
    isl_video_url: Optional[str] = None
    visual_transcript: Optional[str] = None
    key_visual_cues: List[str] = Field(default_factory=list)
    full_content: str
