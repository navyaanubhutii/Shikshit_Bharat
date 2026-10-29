# Shikshit Bharat

Shikshit Bharat is an inclusive digital education platform engineered to empower sensory-impaired students in Indian classrooms. Inspired by accessibility research and Indian classroom dynamics, it bridges the gap for **Blind** and **Deaf** students without demanding expensive proprietary hardware.

---

## 🏛️ Architecture Overview

The backend is built with **FastAPI**, **SQLAlchemy**, and **PostgreSQL**. It enforces a clean separation of concerns:

- **API Layer (`app/api/`)**: Versioned REST endpoints (`/api/v1`) with distinct endpoints and views tailored for blind and deaf learners.
- **Service Layer (`app/services/`)**: Business logic, sensory adaptation synthesis, and prioritized queuing.
- **Data Models (`app/models/`)**: Relational PostgreSQL models with shared curriculum foundations (`Lesson`, `TeacherMaterial`, `ClassroomAnnouncement`, `StudentProgress`) coupled with dedicated sensory adaptations (`LessonBlindAdaptation`, `LessonDeafAdaptation`).
- **Schemas (`app/schemas/`)**: Pydantic validation schemas defining shared models alongside dedicated sensory views (`BlindLessonView`, `DeafLessonView`, `BlindAnnouncementView`, `DeafAnnouncementView`).
- **Core Configuration (`app/core/`)**: Environment-driven settings using Pydantic Settings, pooled SQLAlchemy sessions, and automated table migrations.

---

## 🤝 Distinct Accessibility Tracks

Rather than treating accessibility as an afterthought or a generic switch, Shikshit Bharat treats Blind and Deaf experiences as distinct first-class tracks in the API:

### 1. Blind Student Track (`/api/v1/lessons/{id}/blind`, `/api/v1/announcements/blind`)
- **Audio-First Delivery**: Structured audio narration transcripts and screen-reader descriptive notes for visual formulas and diagrams.
- **Priority Audio Queue Readiness**: Announcements and instructional cues categorized by audio urgency (`CRITICAL`, `HIGH`, `NORMAL`) for queue orchestration.
- **Braille Readiness**: Dual-format Braille transcripts (ASCII Braille and 6-dot Unicode Braille) ready for virtual Perkins keyboard input (`S-D-F` / `J-K-L`) and refreshable Braille displays.

### 2. Deaf Student Track (`/api/v1/lessons/{id}/deaf`, `/api/v1/announcements/deaf`)
- **ISL-First Representation**: Indian Sign Language (ISL) Subject-Object-Verb (SOV) grammatical glossing.
- **Gesture Token Sequences**: Tokenized sign dictionary identifiers and media pointers for client-side animated signing.
- **Visual Alerting & Captions**: Visual banners, highlighted vocabulary cues, and simplified captioned transcripts.

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm
- PostgreSQL (or local SQLite for lightweight development)

### 1. Clone & Set Up Environment

```bash
cd Shikshit_Bharat
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
```

### 2. Configure Environment

Copy the example configuration:
```bash
cp .env.example .env
```

Update `DATABASE_URL` in `.env` with your PostgreSQL credentials:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/shikshit_bharat
```
*(Note: For local development without a running PostgreSQL server, configure `DATABASE_URL=sqlite:///./shikshit_bharat.db` in your `.env` file).*

### 3. Run the Backend

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Interactive API documentation will be available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

---

## 📡 Initial Endpoints (v1)

### Health
- `GET /api/v1/health` - Basic service health check
- `GET /api/v1/health/db` - Database connectivity verification

### Lessons
- `GET /api/v1/lessons` - List lessons (with optional filtering by subject or grade)
- `POST /api/v1/lessons` - Create a lesson with optional Blind and Deaf sensory adaptations
- `GET /api/v1/lessons/{id}` - Full lesson payload with all adaptations
- `GET /api/v1/lessons/{id}/blind` - Tailored audio-first and Braille delivery
- `GET /api/v1/lessons/{id}/deaf` - Tailored ISL gloss and visual sign token delivery

### Classroom Announcements
- `GET /api/v1/announcements` - List classroom announcements
- `POST /api/v1/announcements` - Post a teacher announcement with sensory urgency metadata
- `GET /api/v1/announcements/blind` - Announcements ordered by audio queue priority
- `GET /api/v1/announcements/deaf` - Announcements formatted for visual popups and ISL delivery

---

## 🖥️ Frontend

The frontend is a React + TypeScript + Vite application in `frontend/` with Tailwind CSS and React Router.

### 4. Set Up the Frontend

```bash
cd frontend
cp .env.example .env    # defaults to http://localhost:8000/api/v1
npm install
npm run dev             # starts dev server on http://localhost:3000
```

### Entry Routes

| Route | Experience | Description |
|-------|-----------|-------------|
| `/` | Gateway | Accessible experience selector with keyboard shortcuts (B/1 or D/2) |
| `/blind` | Blind (Audio-First) | Keyboard-driven, speech synthesis narration, priority audio cues, Braille display |
| `/deaf` | Deaf (Visual-First) | ISL SOV glosses, sign tokens, visual alerts, captions, zero audio dependency |

### Frontend Structure

```
frontend/src/
├── main.tsx              # React entry point
├── App.tsx               # Router with /, /blind, /deaf routes
├── index.css             # Tailwind directives, focus rings, reduced-motion
├── vite-env.d.ts         # Vite ImportMeta types
├── types/
│   ├── api.ts            # Backend response type mirrors
│   └── accessibility.ts  # Experience mode and speech types
├── services/
│   └── api.ts            # Typed fetch client for all backend endpoints
├── utils/
│   ├── tts.ts            # Web Speech Synthesis controller
│   └── preferences.ts    # localStorage experience preference
├── components/
│   ├── SkipLink.tsx       # Screen-reader skip navigation
│   ├── LiveAnnouncer.tsx  # ARIA live region announcer
│   ├── ModeSwitcher.tsx   # Header bar with mode switch controls
│   └── StatusBadge.tsx    # Backend connectivity indicator
└── pages/
    ├── LandingPage.tsx    # Gateway experience selector
    ├── BlindEntryPage.tsx # Audio-first entry with TTS and keyboard nav
    └── DeafEntryPage.tsx  # Visual-first entry with ISL glosses and tabs
```

---

## 🔮 Future Architecture Readiness

The data models and service structure are prepared for forthcoming modules:
- **Priority Audio Queue Engine**: Timed audio playback priority and collision resolution for blind users.
- **Virtual Perkins Brailler**: Client-to-server Braille input translation.
- **ISL Video & Gesture Pipeline**: MediaPipe sign recognition and real-time animation broadcast.
- **Offline Learning Sync**: Content versioning (`offline_version`) and cached student sync tracking (`StudentProgress`).
- **Accessible Quizzes & Analytics**: Performance metrics, attempt counts, and engagement analytics for educators.
