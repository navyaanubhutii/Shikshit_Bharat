from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from app.models.lesson import Lesson, LessonBlindAdaptation, LessonDeafAdaptation
from app.models.enums import AudioPriority
from app.schemas.lesson import (
    LessonCreate,
    BlindLessonView,
    DeafLessonView,
)


class LessonService:

    @staticmethod
    def get_lessons(
        db: Session,
        skip: int = 0,
        limit: int = 20,
        subject: Optional[str] = None,
        grade_level: Optional[str] = None,
        published_only: bool = True
    ) -> List[Lesson]:
        """Retrieve paginated lessons with optional subject or grade filters."""
        query = db.query(Lesson).options(
            joinedload(Lesson.blind_adaptation),
            joinedload(Lesson.deaf_adaptation)
        )
        if published_only:
            query = query.filter(Lesson.is_published.is_(True))
        if subject:
            query = query.filter(Lesson.subject.ilike(f"%{subject}%"))
        if grade_level:
            query = query.filter(Lesson.grade_level == grade_level)
        return query.order_by(Lesson.id.desc()).offset(skip).limit(limit).all()

    @staticmethod
    def get_lesson_by_id(db: Session, lesson_id: int) -> Optional[Lesson]:
        """Fetch complete lesson by ID with all sensory adaptations loaded."""
        return (
            db.query(Lesson)
            .options(
                joinedload(Lesson.blind_adaptation),
                joinedload(Lesson.deaf_adaptation)
            )
            .filter(Lesson.id == lesson_id)
            .first()
        )

    @staticmethod
    def create_lesson(db: Session, lesson_in: LessonCreate) -> Lesson:
        """Create a new lesson and establish its distinct blind and deaf adaptations."""
        lesson_data = lesson_in.model_dump(exclude={"blind_adaptation", "deaf_adaptation"})
        db_lesson = Lesson(**lesson_data)
        db.add(db_lesson)
        db.flush()  # Populates db_lesson.id

        # Blind Student Adaptation (audio-first & Braille readiness)
        if lesson_in.blind_adaptation:
            blind_data = lesson_in.blind_adaptation.model_dump()
            db_blind = LessonBlindAdaptation(lesson_id=db_lesson.id, **blind_data)
        else:
            # Generate foundational blind-mode defaults
            default_audio_cues = [
                {
                    "cue_id": f"cue-{db_lesson.id}-intro",
                    "priority": AudioPriority.HIGH.value,
                    "text": f"Lesson title: {db_lesson.title}. Subject: {db_lesson.subject}.",
                    "timestamp_ms": 0
                },
                {
                    "cue_id": f"cue-{db_lesson.id}-body",
                    "priority": AudioPriority.NORMAL.value,
                    "text": db_lesson.summary or db_lesson.content[:200],
                    "timestamp_ms": 3000
                }
            ]
            db_blind = LessonBlindAdaptation(
                lesson_id=db_lesson.id,
                audio_summary=db_lesson.summary or f"Lesson on {db_lesson.title}",
                screenreader_description=f"Overview of {db_lesson.title} for Class {db_lesson.grade_level}",
                priority_audio_cues=default_audio_cues
            )
        db.add(db_blind)

        # Deaf Student Adaptation (ISL-first, SOV glossing & visual cues)
        if lesson_in.deaf_adaptation:
            deaf_data = lesson_in.deaf_adaptation.model_dump()
            db_deaf = LessonDeafAdaptation(lesson_id=db_lesson.id, **deaf_data)
        else:
            # Generate foundational deaf-mode defaults (SOV token placeholder)
            db_deaf = LessonDeafAdaptation(
                lesson_id=db_lesson.id,
                isl_gloss=f"{db_lesson.title.upper()} LESSON START",
                sign_tokens=[db_lesson.subject.upper(), "STUDY", "BEGIN"],
                visual_transcript=db_lesson.summary or db_lesson.content,
                key_visual_cues=[db_lesson.subject, db_lesson.title]
            )
        db.add(db_deaf)

        db.commit()
        db.refresh(db_lesson)
        return db_lesson

    @staticmethod
    def get_blind_lesson_view(db: Session, lesson_id: int) -> Optional[BlindLessonView]:
        """Resolve an audio-first, Braille-ready view tailored specifically for blind learners."""
        lesson = LessonService.get_lesson_by_id(db, lesson_id)
        if not lesson:
            return None

        blind_ad = lesson.blind_adaptation
        cues = blind_ad.priority_audio_cues if (blind_ad and blind_ad.priority_audio_cues) else []
        if not cues:
            cues = [
                {
                    "cue_id": f"cue-{lesson.id}-title",
                    "priority": AudioPriority.HIGH.value,
                    "text": f"{lesson.title}. Subject: {lesson.subject}.",
                    "timestamp_ms": 0
                }
            ]

        return BlindLessonView(
            lesson_id=lesson.id,
            title=lesson.title,
            subject=lesson.subject,
            grade_level=lesson.grade_level,
            audio_summary=blind_ad.audio_summary if blind_ad else lesson.summary,
            screenreader_description=blind_ad.screenreader_description if blind_ad else None,
            braille_ascii=blind_ad.braille_ascii if blind_ad else None,
            braille_unicode=blind_ad.braille_unicode if blind_ad else None,
            priority_audio_cues=cues,
            audio_narration_url=blind_ad.audio_narration_url if blind_ad else None,
            content_transcript=lesson.content
        )

    @staticmethod
    def get_deaf_lesson_view(db: Session, lesson_id: int) -> Optional[DeafLessonView]:
        """Resolve a visual-first, ISL-focused view tailored specifically for deaf learners."""
        lesson = LessonService.get_lesson_by_id(db, lesson_id)
        if not lesson:
            return None

        deaf_ad = lesson.deaf_adaptation

        return DeafLessonView(
            lesson_id=lesson.id,
            title=lesson.title,
            subject=lesson.subject,
            grade_level=lesson.grade_level,
            isl_gloss=deaf_ad.isl_gloss if deaf_ad else f"{lesson.title.upper()} TOPIC",
            sign_tokens=deaf_ad.sign_tokens if (deaf_ad and deaf_ad.sign_tokens) else [lesson.subject.upper()],
            isl_video_url=deaf_ad.isl_video_url if deaf_ad else None,
            visual_transcript=deaf_ad.visual_transcript if (deaf_ad and deaf_ad.visual_transcript) else lesson.content,
            key_visual_cues=deaf_ad.key_visual_cues if (deaf_ad and deaf_ad.key_visual_cues) else [lesson.subject],
            full_content=lesson.content
        )


lesson_service = LessonService()
