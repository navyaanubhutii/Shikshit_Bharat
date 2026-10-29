/**
 * Mirror of Shikshit Bharat FastAPI backend schemas.
 * Derived directly from app/schemas/.
 */

export type AudioPriority = 'critical' | 'high' | 'normal' | 'low';
export type AlertVisualType = 'banner' | 'subtitle' | 'isl_popup';
export type AccessibilityMode = 'blind' | 'deaf' | 'universal';

export interface HealthResponse {
  status: string;
  app_name: string;
  version: string;
  environment: string;
}

export interface DatabaseHealthResponse {
  status: string;
  database: string;
  connection: string;
}

export interface AudioCueItem {
  cue_id: string;
  priority: AudioPriority;
  text: string;
  timestamp_ms: number;
}

export interface BlindAdaptation {
  id?: number;
  lesson_id?: number;
  audio_summary?: string | null;
  screenreader_description?: string | null;
  braille_ascii?: string | null;
  braille_unicode?: string | null;
  priority_audio_cues?: AudioCueItem[];
  audio_narration_url?: string | null;
  created_at?: string;
}

export interface DeafAdaptation {
  id?: number;
  lesson_id?: number;
  isl_gloss?: string | null;
  sign_tokens?: string[];
  isl_video_url?: string | null;
  visual_transcript?: string | null;
  key_visual_cues?: string[];
  created_at?: string;
}

export interface Lesson {
  id: number;
  title: string;
  subject: string;
  grade_level: string;
  summary?: string | null;
  content: string;
  language: string;
  teacher_id?: string | null;
  offline_version: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  blind_adaptation?: BlindAdaptation | null;
  deaf_adaptation?: DeafAdaptation | null;
}

export interface BlindLessonView {
  lesson_id: number;
  title: string;
  subject: string;
  grade_level: string;
  audio_summary?: string | null;
  screenreader_description?: string | null;
  braille_ascii?: string | null;
  braille_unicode?: string | null;
  priority_audio_cues: AudioCueItem[];
  audio_narration_url?: string | null;
  content_transcript: string;
}

export interface DeafLessonView {
  lesson_id: number;
  title: string;
  subject: string;
  grade_level: string;
  isl_gloss?: string | null;
  sign_tokens: string[];
  isl_video_url?: string | null;
  visual_transcript?: string | null;
  key_visual_cues: string[];
  full_content: string;
}

export interface Announcement {
  id: number;
  classroom_id: string;
  title: string;
  message: string;
  author_name: string;
  audio_priority: AudioPriority;
  audio_speech_text?: string | null;
  visual_alert_type: AlertVisualType;
  isl_gloss?: string | null;
  created_at: string;
}

export interface BlindAnnouncementView {
  id: number;
  title: string;
  audio_priority: AudioPriority;
  spoken_text: string;
  created_at: string;
  author_name: string;
}

export interface DeafAnnouncementView {
  id: number;
  title: string;
  message: string;
  visual_alert_type: AlertVisualType;
  isl_gloss?: string | null;
  created_at: string;
  author_name: string;
}
