import {
  HealthResponse,
  DatabaseHealthResponse,
  Lesson,
  BlindLessonView,
  DeafLessonView,
  Announcement,
  BlindAnnouncementView,
  DeafAnnouncementView,
} from '@/types/api';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1').replace(/\/+$/, '');

export class ApiError extends Error {
  constructor(public status: number, message: string, public details?: unknown) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const headers = new Headers(options?.headers);
  if (!headers.has('Content-Type') && options?.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorDetail = response.statusText;
      try {
        const errorJson = await response.json();
        errorDetail = errorJson.detail || errorJson.message || response.statusText;
      } catch {
        // Response was not JSON
      }
      throw new ApiError(response.status, `API request failed (${response.status}): ${errorDetail}`);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network errors (e.g. backend server offline, CORS block, timeout)
    const err = error as Error;
    throw new ApiError(
      0,
      `Network connection to Shikshit Bharat backend failed: ${err.message || 'Server unreachable at ' + API_BASE_URL}`
    );
  }
}

// ── Health Endpoints ──

export async function getHealth(): Promise<HealthResponse> {
  return request<HealthResponse>('/health');
}

export async function getDatabaseHealth(): Promise<DatabaseHealthResponse> {
  return request<DatabaseHealthResponse>('/health/db');
}

// ── Lesson Endpoints ──

export interface LessonFilterParams {
  skip?: number;
  limit?: number;
  subject?: string;
  grade_level?: string;
}

export async function getLessons(params?: LessonFilterParams): Promise<Lesson[]> {
  const searchParams = new URLSearchParams();
  if (params?.skip !== undefined) searchParams.set('skip', params.skip.toString());
  if (params?.limit !== undefined) searchParams.set('limit', params.limit.toString());
  if (params?.subject) searchParams.set('subject', params.subject);
  if (params?.grade_level) searchParams.set('grade_level', params.grade_level);

  const query = searchParams.toString();
  return request<Lesson[]>(`/lessons${query ? `?${query}` : ''}`);
}

export async function getLesson(lessonId: number): Promise<Lesson> {
  return request<Lesson>(`/lessons/${lessonId}`);
}

export async function getBlindLesson(lessonId: number): Promise<BlindLessonView> {
  return request<BlindLessonView>(`/lessons/${lessonId}/blind`);
}

export async function getDeafLesson(lessonId: number): Promise<DeafLessonView> {
  return request<DeafLessonView>(`/lessons/${lessonId}/deaf`);
}

// ── Announcement Endpoints ──

export interface AnnouncementFilterParams {
  classroom_id?: string;
  skip?: number;
  limit?: number;
}

export async function getAnnouncements(params?: AnnouncementFilterParams): Promise<Announcement[]> {
  const searchParams = new URLSearchParams();
  if (params?.classroom_id) searchParams.set('classroom_id', params.classroom_id);
  if (params?.skip !== undefined) searchParams.set('skip', params.skip.toString());
  if (params?.limit !== undefined) searchParams.set('limit', params.limit.toString());

  const query = searchParams.toString();
  return request<Announcement[]>(`/announcements${query ? `?${query}` : ''}`);
}

export async function getBlindAnnouncements(classroomId?: string): Promise<BlindAnnouncementView[]> {
  const query = classroomId ? `?classroom_id=${encodeURIComponent(classroomId)}` : '';
  return request<BlindAnnouncementView[]>(`/announcements/blind${query}`);
}

export async function getDeafAnnouncements(classroomId?: string): Promise<DeafAnnouncementView[]> {
  const query = classroomId ? `?classroom_id=${encodeURIComponent(classroomId)}` : '';
  return request<DeafAnnouncementView[]>(`/announcements/deaf${query}`);
}
