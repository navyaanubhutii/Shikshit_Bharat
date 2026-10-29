import React, { useEffect, useState } from 'react';
import { ModeSwitcher } from '@/components/ModeSwitcher';
import { SkipLink } from '@/components/SkipLink';
import { StatusBadge } from '@/components/StatusBadge';
import {
  getDeafAnnouncements,
  getLessons,
  getDeafLesson,
  getHealth,
} from '@/services/api';
import {
  DeafAnnouncementView,
  Lesson,
  DeafLessonView,
} from '@/types/api';
import { Eye, Bell, BookOpen, Layers, CheckCircle2, AlertTriangle, ChevronRight } from 'lucide-react';

export const DeafEntryPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<DeafAnnouncementView[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<DeafLessonView | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<'announcements' | 'lessons'>('announcements');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setApiError(null);
      try {
        await getHealth();
        setApiConnected(true);

        const [announcementsData, lessonsData] = await Promise.all([
          getDeafAnnouncements().catch(() => []),
          getLessons({ limit: 5 }).catch(() => []),
        ]);

        setAnnouncements(announcementsData);
        setLessons(lessonsData);
      } catch (err) {
        setApiConnected(false);
        const errorMsg = (err as Error).message || 'Unable to connect to Shikshit Bharat backend.';
        setApiError(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSelectLesson = async (lessonId: number) => {
    try {
      const deafView = await getDeafLesson(lessonId);
      setSelectedLesson(deafView);
    } catch {
      // Handled in UI
    }
  };

  return (
    <div className="min-h-screen bg-ink-50 text-ink-900 flex flex-col justify-between">
      <SkipLink targetId="main-content" label="Skip to main visual content" />

      <ModeSwitcher currentMode="deaf" />

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 max-w-5xl mx-auto w-full px-6 py-8">
        {/* Deaf Mode Header */}
        <div className="border-b border-ink-200 pb-6 mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 rounded-full bg-brand-600" aria-hidden="true" />
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-ink-900">
                Deaf Student Visual Experience
              </h1>
            </div>
            <p className="text-sm text-ink-600 max-w-2xl">
              Visual-first classroom. Indian Sign Language (ISL) Subject-Object-Verb glosses, visual dictionary cues, captions, and high-contrast notifications without audio dependencies.
            </p>
          </div>
          <StatusBadge isOnline={apiConnected} appName="Backend API" />
        </div>

        {/* Visual Features Highlights Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-white border-2 border-brand-200 rounded-lg flex items-start gap-3">
            <Layers className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <h2 className="text-sm font-bold text-ink-900">ISL SOV Grammar</h2>
              <p className="text-xs text-ink-600 mt-0.5">Subject-Object-Verb sign language structure tailored for Indian classrooms.</p>
            </div>
          </div>
          <div className="p-4 bg-white border-2 border-brand-200 rounded-lg flex items-start gap-3">
            <Eye className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <h2 className="text-sm font-bold text-ink-900">Visual Alerts & Captions</h2>
              <p className="text-xs text-ink-600 mt-0.5">Important teacher announcements formatted into high-visibility banners.</p>
            </div>
          </div>
          <div className="p-4 bg-white border-2 border-brand-200 rounded-lg flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <h2 className="text-sm font-bold text-ink-900">Zero Audio Dependency</h2>
              <p className="text-xs text-ink-600 mt-0.5">All educational content and status changes are communicated 100% visually.</p>
            </div>
          </div>
        </div>

        {/* Backend API Error Banner if unreachable */}
        {apiError && (
          <div
            role="alert"
            className="p-4 mb-8 bg-red-50 border border-red-300 rounded-lg text-red-900 text-sm flex items-start gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-semibold text-red-950">Backend Connection Notice</p>
              <p className="text-xs text-red-800 mt-1">{apiError}</p>
              <p className="text-xs text-ink-600 mt-1">
                Make sure the backend is active at <code className="bg-ink-100 px-1 py-0.5 rounded font-mono">http://localhost:8000</code>.
              </p>
            </div>
          </div>
        )}

        {/* Tab Navigation for Visual Organization */}
        <div className="border-b border-ink-200 mb-6 flex gap-4" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'announcements'}
            aria-controls="panel-announcements"
            id="tab-announcements"
            onClick={() => setActiveTab('announcements')}
            className={`pb-3 px-2 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'announcements'
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-ink-600 hover:text-ink-900'
            }`}
          >
            <Bell className="w-4 h-4" aria-hidden="true" />
            <span>Classroom Notices ({announcements.length})</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'lessons'}
            aria-controls="panel-lessons"
            id="tab-lessons"
            onClick={() => setActiveTab('lessons')}
            className={`pb-3 px-2 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'lessons'
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-ink-600 hover:text-ink-900'
            }`}
          >
            <BookOpen className="w-4 h-4" aria-hidden="true" />
            <span>Curriculum Lessons ({lessons.length})</span>
          </button>
        </div>

        {/* Visual Announcements Panel */}
        {activeTab === 'announcements' && (
          <section
            id="panel-announcements"
            role="tabpanel"
            aria-labelledby="tab-announcements"
            className="space-y-4"
          >
            {isLoading ? (
              <p className="text-sm text-ink-600 py-4">Loading visual announcements from classroom server...</p>
            ) : announcements.length === 0 ? (
              <div className="p-8 text-center bg-white border border-ink-200 rounded-lg text-ink-600 text-sm">
                <Bell className="w-8 h-8 text-ink-400 mx-auto mb-2" aria-hidden="true" />
                <p className="font-semibold text-ink-800">No active notices</p>
                <p className="text-xs text-ink-500 mt-1">Teacher announcements with ISL summaries will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {announcements.map((ann) => (
                  <article
                    key={ann.id}
                    className="p-5 bg-white border-2 border-ink-200 rounded-xl shadow-sm hover:border-brand-500 transition-colors"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold uppercase bg-brand-100 text-brand-800 border border-brand-300">
                          Visual Alert: {ann.visual_alert_type}
                        </span>
                        <span className="text-xs text-ink-500 font-medium">By {ann.author_name}</span>
                      </div>
                      <time className="text-xs text-ink-400">{new Date(ann.created_at).toLocaleDateString()}</time>
                    </div>

                    <h3 className="text-lg font-bold text-ink-900 mb-2">{ann.title}</h3>
                    <p className="text-sm text-ink-700 leading-relaxed mb-4">{ann.message}</p>

                    {/* Dedicated ISL Gloss Box */}
                    {ann.isl_gloss && (
                      <div className="p-3 bg-brand-50 border border-brand-200 rounded-lg">
                        <span className="text-xs font-bold text-brand-900 block mb-1">
                          🤟 Indian Sign Language (SOV) Gloss Translation:
                        </span>
                        <p className="font-mono font-bold text-sm text-brand-950 tracking-wide">
                          {ann.isl_gloss}
                        </p>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Visual Lessons Panel */}
        {activeTab === 'lessons' && (
          <section
            id="panel-lessons"
            role="tabpanel"
            aria-labelledby="tab-lessons"
            className="space-y-6"
          >
            {isLoading ? (
              <p className="text-sm text-ink-600 py-4">Loading lessons from curriculum database...</p>
            ) : lessons.length === 0 ? (
              <div className="p-8 text-center bg-white border border-ink-200 rounded-lg text-ink-600 text-sm">
                <BookOpen className="w-8 h-8 text-ink-400 mx-auto mb-2" aria-hidden="true" />
                <p className="font-semibold text-ink-800">No lessons available</p>
                <p className="text-xs text-ink-500 mt-1">Lessons published by teachers will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lessons.map((lesson) => (
                  <article
                    key={lesson.id}
                    className={`p-5 bg-white border-2 rounded-xl transition-all cursor-pointer flex flex-col justify-between ${
                      selectedLesson?.lesson_id === lesson.id
                        ? 'border-brand-600 ring-2 ring-brand-200'
                        : 'border-ink-200 hover:border-brand-400'
                    }`}
                    onClick={() => handleSelectLesson(lesson.id)}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-ink-100 text-ink-800 rounded font-semibold text-xs">
                          {lesson.subject} | {lesson.grade_level}
                        </span>
                        <span className="text-xs text-brand-600 font-semibold">ISL Ready</span>
                      </div>
                      <h3 className="text-base font-bold text-ink-900 mb-2">{lesson.title}</h3>
                      <p className="text-xs text-ink-600 mb-4 line-clamp-3">
                        {lesson.summary || lesson.content.slice(0, 150)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectLesson(lesson.id);
                      }}
                      className="inline-flex items-center justify-between w-full pt-3 border-t border-ink-100 text-xs font-bold text-brand-700 hover:text-brand-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded px-1"
                      aria-label={`View ISL visual breakdown for ${lesson.title}`}
                    >
                      <span>Inspect ISL Sign Breakdown</span>
                      <ChevronRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </article>
                ))}
              </div>
            )}

            {/* Selected Lesson ISL Visual Details Inspector */}
            {selectedLesson && (
              <div className="p-6 bg-white border-2 border-brand-500 rounded-xl shadow-md mt-6">
                <div className="flex items-center justify-between border-b border-brand-100 pb-3 mb-4">
                  <h3 className="text-xl font-extrabold text-ink-900">
                    Visual ISL Breakdown: {selectedLesson.title}
                  </h3>
                  <span className="text-xs px-2.5 py-1 bg-brand-100 text-brand-800 font-bold rounded">
                    {selectedLesson.subject}
                  </span>
                </div>

                {/* ISL SOV Gloss Display */}
                {selectedLesson.isl_gloss && (
                  <div className="mb-5 p-4 bg-brand-50 border border-brand-300 rounded-lg">
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-800 block mb-1">
                      🤟 Indian Sign Language (SOV) Syntax Gloss:
                    </span>
                    <p className="font-mono text-base font-extrabold text-brand-950 tracking-wide">
                      {selectedLesson.isl_gloss}
                    </p>
                  </div>
                )}

                {/* Sign Dictionary Tokens */}
                {selectedLesson.sign_tokens && selectedLesson.sign_tokens.length > 0 && (
                  <div className="mb-5">
                    <span className="text-xs font-bold uppercase tracking-wider text-ink-600 block mb-2">
                      Sign Gesture Dictionary Tokens:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {selectedLesson.sign_tokens.map((token, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-ink-100 text-ink-900 border border-ink-300 rounded-md font-mono text-xs font-semibold"
                        >
                          {String(token)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Visual Anchors / Cues */}
                {selectedLesson.key_visual_cues && selectedLesson.key_visual_cues.length > 0 && (
                  <div className="mb-5">
                    <span className="text-xs font-bold uppercase tracking-wider text-ink-600 block mb-2">
                      Focus Concepts & Terminology Anchors:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {selectedLesson.key_visual_cues.map((cue, index) => (
                        <span
                          key={index}
                          className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-xs font-semibold"
                        >
                          {cue}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Captioned Visual Reading Transcript */}
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-ink-600 block mb-2">
                    Visual Reading Transcript:
                  </span>
                  <div className="p-4 bg-ink-50 border border-ink-200 rounded-lg text-sm text-ink-800 leading-relaxed font-sans whitespace-pre-wrap">
                    {selectedLesson.visual_transcript || selectedLesson.full_content}
                  </div>
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-ink-200 bg-white py-4 px-6 text-center text-xs text-ink-500">
        <p>Shikshit Bharat Visual Experience — Designed for Deaf & Hard-of-Hearing students with full ISL representation.</p>
      </footer>
    </div>
  );
};
