from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
from app.models.enums import MaterialType


class TeacherMaterial(Base):
    """Shared teacher-created educational materials, lecture notes, and board transcripts."""
    __tablename__ = "teacher_materials"

    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id", ondelete="CASCADE"), nullable=True, index=True)
    title = Column(String(255), nullable=False)
    material_type = Column(
        SAEnum(MaterialType, values_callable=lambda x: [e.value for e in x]),
        default=MaterialType.NOTES,
        nullable=False
    )
    content = Column(Text, nullable=True)
    file_url = Column(String(500), nullable=True)
    accessibility_notes = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    lesson = relationship("Lesson", back_populates="materials")
