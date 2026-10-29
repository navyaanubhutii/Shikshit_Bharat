from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import case
from app.models.announcement import ClassroomAnnouncement
from app.models.enums import AudioPriority
from app.schemas.announcement import (
    AnnouncementCreate,
    BlindAnnouncementView,
    DeafAnnouncementView,
)


class AnnouncementService:

    @staticmethod
    def get_announcements(
        db: Session,
        classroom_id: Optional[str] = None,
        skip: int = 0,
        limit: int = 50
    ) -> List[ClassroomAnnouncement]:
        """Fetch general announcements for a classroom."""
        query = db.query(ClassroomAnnouncement)
        if classroom_id:
            query = query.filter(ClassroomAnnouncement.classroom_id == classroom_id)
        return query.order_by(ClassroomAnnouncement.created_at.desc()).offset(skip).limit(limit).all()

    @staticmethod
    def create_announcement(db: Session, announcement_in: AnnouncementCreate) -> ClassroomAnnouncement:
        """Post a classroom announcement with sensory queue metadata."""
        announcement_data = announcement_in.model_dump()
        # Fallback spoken text for blind mode if not explicitly provided
        if not announcement_data.get("audio_speech_text"):
            announcement_data["audio_speech_text"] = (
                f"Attention: {announcement_data['title']}. {announcement_data['message']}"
            )
        # Fallback ISL gloss for deaf mode if not explicitly provided
        if not announcement_data.get("isl_gloss"):
            announcement_data["isl_gloss"] = (
                f"ANNOUNCEMENT {announcement_data['title'].upper()} NOTE"
            )

        db_announcement = ClassroomAnnouncement(**announcement_data)
        db.add(db_announcement)
        db.commit()
        db.refresh(db_announcement)
        return db_announcement

    @staticmethod
    def get_blind_announcements(
        db: Session,
        classroom_id: Optional[str] = None
    ) -> List[BlindAnnouncementView]:
        """Retrieve announcements sorted by audio queue urgency (CRITICAL -> HIGH -> NORMAL -> LOW)."""
        # Priority custom ordering for audio queue orchestration
        priority_order = case(
            {
                AudioPriority.CRITICAL.value: 1,
                AudioPriority.HIGH.value: 2,
                AudioPriority.NORMAL.value: 3,
                AudioPriority.LOW.value: 4,
            },
            value=ClassroomAnnouncement.audio_priority,
            else_=5
        )

        query = db.query(ClassroomAnnouncement)
        if classroom_id:
            query = query.filter(ClassroomAnnouncement.classroom_id == classroom_id)

        records = query.order_by(priority_order, ClassroomAnnouncement.created_at.desc()).all()

        return [
            BlindAnnouncementView(
                id=item.id,
                title=item.title,
                audio_priority=item.audio_priority,
                spoken_text=item.audio_speech_text or f"Notice: {item.title}. {item.message}",
                created_at=item.created_at,
                author_name=item.author_name
            )
            for item in records
        ]

    @staticmethod
    def get_deaf_announcements(
        db: Session,
        classroom_id: Optional[str] = None
    ) -> List[DeafAnnouncementView]:
        """Retrieve announcements formatted for high-contrast visual banners and ISL prompts."""
        query = db.query(ClassroomAnnouncement)
        if classroom_id:
            query = query.filter(ClassroomAnnouncement.classroom_id == classroom_id)

        records = query.order_by(ClassroomAnnouncement.created_at.desc()).all()

        return [
            DeafAnnouncementView(
                id=item.id,
                title=item.title,
                message=item.message,
                visual_alert_type=item.visual_alert_type,
                isl_gloss=item.isl_gloss or f"{item.title.upper()} CLASSROOM NOTICE",
                created_at=item.created_at,
                author_name=item.author_name
            )
            for item in records
        ]


announcement_service = AnnouncementService()
