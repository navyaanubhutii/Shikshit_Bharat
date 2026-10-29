from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Lesson(Base):
    """Core shared lesson entity providing common curriculum content."""
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    subject = Column(String(100), nullable=False, index=True)
    grade_level = Column(String(50), nullable=False)
    summary = Column(Text, nullable=True)
    content = Column(Text, nullable=False)
    language = Column(String(10), default="hi")
    teacher_id = Column(String(100), nullable=True, index=True)
    offline_version = Column(Integer, default=1, nullable=False)
    is_published = Column(Boolean, default=True, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Distinct accessibility adaptations
    blind_adaptation = relationship(
        "LessonBlindAdaptation",
        back_populates="lesson",
        uselist=False,
        cascade="all, delete-orphan"
    )
    deaf_adaptation = relationship(
        "LessonDeafAdaptation",
        back_populates="lesson",
        uselist=False,
        cascade="all, delete-orphan"
    )

    # Relationships to shared ecosystem foundations
    materials = relationship("TeacherMaterial", back_populates="lesson", cascade="all, delete-orphan")
    progress_records = relationship("StudentProgress", back_populates="lesson", cascade="all, delete-orphan")


class LessonBlindAdaptation(Base):
    """Dedicated Blind student adaptation: Audio-first scripts, Braille, and audio queue data."""
    __tablename__ = "lesson_blind_adaptations"

    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id", ondelete="CASCADE"), unique=True, nullable=False)

    # Spoken audio summary tailored for TTS/screenreaders
    audio_summary = Column(Text, nullable=True)

    # Full verbal description of visual diagrams, formulas, and whiteboard elements
    screenreader_description = Column(Text, nullable=True)

    # Braille representations (Virtual Perkins S-D-F / J-K-L input & refreshable displays)
    braille_ascii = Column(Text, nullable=True)
    braille_unicode = Column(Text, nullable=True)

    # Priority audio queue readiness: List of cues [{"cue_id": 1, "priority": "high", "text": "...", "timestamp_ms": 0}]
    priority_audio_cues = Column(JSON, nullable=True, default=list)

    # Pre-rendered audio asset or narration URL
    audio_narration_url = Column(String(500), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    lesson = relationship("Lesson", back_populates="blind_adaptation")


class LessonDeafAdaptation(Base):
    """Dedicated Deaf student adaptation: ISL glossing, gesture tokens, and visual transcripts."""
    __tablename__ = "lesson_deaf_adaptations"

    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id", ondelete="CASCADE"), unique=True, nullable=False)

    # ISL grammatical glossing in Subject-Object-Verb (SOV) order (e.g., "PLANT SUNLIGHT FOOD MAKE")
    isl_gloss = Column(Text, nullable=True)

    # Structured gesture dictionary tokens for animated rendering or video playback
    sign_tokens = Column(JSON, nullable=True, default=list)

    # URL to human ISL demo or animated sign video
    isl_video_url = Column(String(500), nullable=True)

    # Simplified visual text with captions and vocabulary anchors
    visual_transcript = Column(Text, nullable=True)

    # Visual highlights and terminology cues
    key_visual_cues = Column(JSON, nullable=True, default=list)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    lesson = relationship("Lesson", back_populates="deaf_adaptation")
