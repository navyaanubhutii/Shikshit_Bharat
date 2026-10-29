from sqlalchemy import Column, Integer, String, Text, DateTime, Enum as SAEnum
from sqlalchemy.sql import func
from app.core.database import Base
from app.models.enums import AudioPriority, AlertVisualType


class ClassroomAnnouncement(Base):
    """Shared classroom announcements with differentiated sensory delivery metadata."""
    __tablename__ = "classroom_announcements"

    id = Column(Integer, primary_key=True, index=True)
    classroom_id = Column(String(100), default="main_classroom", nullable=False, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    author_name = Column(String(100), default="Teacher", nullable=False)

    # Blind student delivery readiness: priority audio queuing
    audio_priority = Column(
        SAEnum(AudioPriority, values_callable=lambda x: [e.value for e in x]),
        default=AudioPriority.NORMAL,
        nullable=False
    )
    audio_speech_text = Column(Text, nullable=True)  # Screen-reader or TTS tuned script

    # Deaf student delivery readiness: visual alerts & ISL summary
    visual_alert_type = Column(
        SAEnum(AlertVisualType, values_callable=lambda x: [e.value for e in x]),
        default=AlertVisualType.BANNER,
        nullable=False
    )
    isl_gloss = Column(Text, nullable=True)  # ISL SOV gloss representation

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
