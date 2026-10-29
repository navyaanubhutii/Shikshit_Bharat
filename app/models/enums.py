from enum import Enum


class AccessibilityMode(str, Enum):
    """Primary accessibility tracks for students."""
    BLIND = "blind"
    DEAF = "deaf"
    UNIVERSAL = "universal"


class AudioPriority(str, Enum):
    """Urgency level for blind-mode audio queue scheduling."""
    CRITICAL = "critical"   # High priority alerts, emergency announcements
    HIGH = "high"           # Teacher speech, direct questions, board notes
    NORMAL = "normal"       # Standard lesson audio, ambient explanations
    LOW = "low"             # Background reading, optional annotations


class AlertVisualType(str, Enum):
    """Visual display styling for deaf-mode announcements."""
    BANNER = "banner"
    SUBTITLE = "subtitle"
    ISL_POPUP = "isl_popup"


class MaterialType(str, Enum):
    """Teacher-created resource category."""
    NOTES = "notes"
    TRANSCRIPT = "transcript"
    DIAGRAM = "diagram"
    ASSIGNMENT = "assignment"


class ProgressStatus(str, Enum):
    """Student completion state."""
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
