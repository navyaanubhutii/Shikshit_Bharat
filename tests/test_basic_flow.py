import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base
from app.api.deps import get_db
from app.main import app
from app.models.enums import AudioPriority, AlertVisualType


# Isolated in-memory database for minimal test verification
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    app.dependency_overrides[get_db] = override_get_db
    yield
    Base.metadata.drop_all(bind=engine)
    app.dependency_overrides.clear()


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


def test_health_endpoints(client):
    # Root check
    res = client.get("/")
    assert res.status_code == 200
    assert res.json()["status"] == "online"

    # API v1 health
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"


def test_lesson_lifecycle_and_distinct_views(client):
    payload = {
        "title": "Photosynthesis and Plant Nutrition",
        "subject": "Science",
        "grade_level": "Class 7",
        "summary": "How plants convert sunlight, water, and carbon dioxide into food.",
        "content": "# Photosynthesis\n\nPlants absorb light through chlorophyll.",
        "language": "hi",
        "blind_adaptation": {
            "audio_summary": "In this lesson, you will learn how leaves capture sunlight to make food.",
            "screenreader_description": "A diagram shows a green leaf with sun rays entering and glucose forming.",
            "braille_ascii": ",plants make food",
            "braille_unicode": "⠠⠏⠇⠁⠝⠞⠎",
            "priority_audio_cues": [
                {
                    "cue_id": "cue-intro",
                    "priority": AudioPriority.HIGH.value,
                    "text": "Welcome to Photosynthesis. Press Space to pause audio.",
                    "timestamp_ms": 0
                }
            ]
        },
        "deaf_adaptation": {
            "isl_gloss": "PLANT SUNLIGHT WATER FOOD MAKE PROCESS",
            "sign_tokens": ["PLANT", "SUN", "LIGHT", "WATER", "FOOD", "MAKE"],
            "visual_transcript": "Plants take light + water + carbon dioxide = Glucose + Oxygen",
            "key_visual_cues": ["Chlorophyll", "Glucose", "Stomata"]
        }
    }

    # 1. Create lesson
    res = client.post("/api/v1/lessons", json=payload)
    assert res.status_code == 201
    created_lesson = res.json()
    lesson_id = created_lesson["id"]
    assert created_lesson["title"] == payload["title"]
    assert created_lesson["blind_adaptation"]["braille_ascii"] == ",plants make food"
    assert created_lesson["deaf_adaptation"]["isl_gloss"] == "PLANT SUNLIGHT WATER FOOD MAKE PROCESS"

    # 2. Get full lesson
    res = client.get(f"/api/v1/lessons/{lesson_id}")
    assert res.status_code == 200
    assert res.json()["id"] == lesson_id

    # 3. Get distinct blind-student experience
    res = client.get(f"/api/v1/lessons/{lesson_id}/blind")
    assert res.status_code == 200
    blind_view = res.json()
    assert blind_view["lesson_id"] == lesson_id
    assert "audio_summary" in blind_view
    assert blind_view["braille_unicode"] == "⠠⠏⠇⠁⠝⠞⠎"
    assert len(blind_view["priority_audio_cues"]) >= 1

    # 4. Get distinct deaf-student experience
    res = client.get(f"/api/v1/lessons/{lesson_id}/deaf")
    assert res.status_code == 200
    deaf_view = res.json()
    assert deaf_view["lesson_id"] == lesson_id
    assert deaf_view["isl_gloss"] == "PLANT SUNLIGHT WATER FOOD MAKE PROCESS"
    assert "PLANT" in deaf_view["sign_tokens"]


def test_announcements_sensory_priority(client):
    # Post high priority audio announcement
    announcement_payload = {
        "classroom_id": "class-7-a",
        "title": "Science Practical Relocation",
        "message": "Today's lab will take place in Room 204 instead of the main hall.",
        "author_name": "Sharma Sir",
        "audio_priority": AudioPriority.CRITICAL.value,
        "audio_speech_text": "Important announcement: Today's lab will take place in Room 204.",
        "visual_alert_type": AlertVisualType.BANNER.value,
        "isl_gloss": "LAB TODAY ROOM 204 CHANGE NOTICE"
    }

    res = client.post("/api/v1/announcements", json=announcement_payload)
    assert res.status_code == 201

    # Check Blind announcements (ordered by audio queue urgency)
    res = client.get("/api/v1/announcements/blind?classroom_id=class-7-a")
    assert res.status_code == 200
    blind_list = res.json()
    assert len(blind_list) >= 1
    assert blind_list[0]["audio_priority"] == AudioPriority.CRITICAL.value
    assert "Important announcement" in blind_list[0]["spoken_text"]

    # Check Deaf announcements (visual banner with ISL gloss)
    res = client.get("/api/v1/announcements/deaf?classroom_id=class-7-a")
    assert res.status_code == 200
    deaf_list = res.json()
    assert len(deaf_list) >= 1
    assert deaf_list[0]["visual_alert_type"] == AlertVisualType.BANNER.value
    assert deaf_list[0]["isl_gloss"] == "LAB TODAY ROOM 204 CHANGE NOTICE"
