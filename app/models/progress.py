from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
from app.models.enums import AccessibilityMode, ProgressStatus


class StudentProgress(Base):
    """Shared foundation for tracking student progress, offline sync, and accessibility metrics."""
    __tablename__ = "student_progress"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String(100), nullable=False, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False, index=True)
    accessibility_mode = Column(
        SAEnum(AccessibilityMode, values_callable=lambda x: [e.value for e in x]),
        default=AccessibilityMode.UNIVERSAL,
        nullable=False
    )
    status = Column(
        SAEnum(ProgressStatus, values_callable=lambda x: [e.value for e in x]),
        default=ProgressStatus.NOT_STARTED,
        nullable=False
    )
    completion_percentage = Column(Float, default=0.0, nullable=False)

    # Audio queue position readiness (for blind-mode resume)
    audio_queue_position = Column(Integer, default=0, nullable=False)

    # Offline learning sync readiness
    last_synced_at = Column(DateTime(timezone=True), nullable=True)
    offline_version_cached = Column(Integer, default=0, nullable=False)

    # Quiz & Teacher Analytics readiness
    quiz_score = Column(Float, nullable=True)
    quiz_attempts = Column(Integer, default=0, nullable=False)
    time_spent_seconds = Column(Integer, default=0, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    lesson = relationship("Lesson", back_populates="progress_records")
