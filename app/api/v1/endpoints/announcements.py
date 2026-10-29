from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.services.announcement_service import announcement_service
from app.schemas.announcement import (
    AnnouncementResponse,
    AnnouncementCreate,
    BlindAnnouncementView,
    DeafAnnouncementView,
)

router = APIRouter()


@router.get(
    "",
    response_model=List[AnnouncementResponse],
    summary="List Classroom Announcements",
    description="Retrieve all announcements for a classroom."
)
def list_announcements(
    classroom_id: Optional[str] = Query(None, description="Classroom identifier"),
    skip: int = Query(0, ge=0, description="Offset for pagination"),
    limit: int = Query(50, ge=1, le=100, description="Page limit"),
    db: Session = Depends(get_db)
) -> List[AnnouncementResponse]:
    return announcement_service.get_announcements(
        db=db,
        classroom_id=classroom_id,
        skip=skip,
        limit=limit
    )


@router.post(
    "",
    response_model=AnnouncementResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Classroom Announcement",
    description="Publish a teacher announcement with priority sensory delivery flags for blind and deaf students."
)
def create_announcement(
    announcement_in: AnnouncementCreate,
    db: Session = Depends(get_db)
) -> AnnouncementResponse:
    return announcement_service.create_announcement(db=db, announcement_in=announcement_in)


@router.get(
    "/blind",
    response_model=List[BlindAnnouncementView],
    summary="Blind Student Announcements (Audio Priority Queue)",
    description="Retrieve classroom announcements ordered strictly by audio priority for TTS screenreader queuing."
)
def get_blind_announcements(
    classroom_id: Optional[str] = Query(None, description="Classroom identifier"),
    db: Session = Depends(get_db)
) -> List[BlindAnnouncementView]:
    return announcement_service.get_blind_announcements(db=db, classroom_id=classroom_id)


@router.get(
    "/deaf",
    response_model=List[DeafAnnouncementView],
    summary="Deaf Student Announcements (Visual & ISL Delivery)",
    description="Retrieve classroom announcements formatted with visual alert styling and ISL grammatical glossing."
)
def get_deaf_announcements(
    classroom_id: Optional[str] = Query(None, description="Classroom identifier"),
    db: Session = Depends(get_db)
) -> List[DeafAnnouncementView]:
    return announcement_service.get_deaf_announcements(db=db, classroom_id=classroom_id)
