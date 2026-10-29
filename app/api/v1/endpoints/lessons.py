from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.services.lesson_service import lesson_service
from app.schemas.lesson import (
    LessonResponse,
    LessonCreate,
    BlindLessonView,
    DeafLessonView,
)

router = APIRouter()


@router.get(
    "",
    response_model=List[LessonResponse],
    summary="List Lessons",
    description="Retrieve accessible lessons with optional filtering by subject or grade level."
)
def list_lessons(
    skip: int = Query(0, ge=0, description="Offset for pagination"),
    limit: int = Query(20, ge=1, le=100, description="Page limit"),
    subject: Optional[str] = Query(None, description="Filter by subject"),
    grade_level: Optional[str] = Query(None, description="Filter by grade/class level"),
    db: Session = Depends(get_db)
) -> List[LessonResponse]:
    return lesson_service.get_lessons(db=db, skip=skip, limit=limit, subject=subject, grade_level=grade_level)


@router.post(
    "",
    response_model=LessonResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Lesson",
    description="Create a curriculum lesson with corresponding Blind and Deaf sensory adaptations."
)
def create_lesson(
    lesson_in: LessonCreate,
    db: Session = Depends(get_db)
) -> LessonResponse:
    return lesson_service.create_lesson(db=db, lesson_in=lesson_in)


@router.get(
    "/{lesson_id}",
    response_model=LessonResponse,
    summary="Get Full Lesson",
    description="Retrieve comprehensive lesson data including all associated sensory tracks."
)
def get_lesson(
    lesson_id: int,
    db: Session = Depends(get_db)
) -> LessonResponse:
    lesson = lesson_service.get_lesson_by_id(db=db, lesson_id=lesson_id)
    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lesson with ID {lesson_id} not found."
        )
    return lesson


@router.get(
    "/{lesson_id}/blind",
    response_model=BlindLessonView,
    summary="Blind Student Lesson Experience",
    description="Retrieve an audio-first, Braille-ready view with prioritized audio queue cues and screenreader notes."
)
def get_blind_lesson(
    lesson_id: int,
    db: Session = Depends(get_db)
) -> BlindLessonView:
    view = lesson_service.get_blind_lesson_view(db=db, lesson_id=lesson_id)
    if not view:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lesson with ID {lesson_id} not found."
        )
    return view


@router.get(
    "/{lesson_id}/deaf",
    response_model=DeafLessonView,
    summary="Deaf Student Lesson Experience",
    description="Retrieve a visual-first view featuring ISL SOV grammatical glosses, gesture tokens, and captioned transcripts."
)
def get_deaf_lesson(
    lesson_id: int,
    db: Session = Depends(get_db)
) -> DeafLessonView:
    view = lesson_service.get_deaf_lesson_view(db=db, lesson_id=lesson_id)
    if not view:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lesson with ID {lesson_id} not found."
        )
    return view
