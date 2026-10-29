import React, { useEffect, useState, useCallback, useRef } from 'react';
import { ModeSwitcher } from '@/components/ModeSwitcher';
import { SkipLink } from '@/components/SkipLink';
import { LiveAnnouncer } from '@/components/LiveAnnouncer';
import { StatusBadge } from '@/components/StatusBadge';
import { tts } from '@/utils/tts';
import {
  getBlindAnnouncements,
  getLessons,
  getBlindLesson,
  getHealth,
} from '@/services/api';
import {
  BlindAnnouncementView,
  Lesson,
  BlindLessonView,
} from '@/types/api';
import { Volume2, VolumeX, RotateCcw, Play, BookOpen, Bell, AlertTriangle } from 'lucide-react';

export const BlindEntryPage: React.FC = () => {
  const [isActivated, setIsActivated] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [announcements, setAnnouncements] = useState<BlindAnnouncementView[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<BlindLessonView | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);
  const [ariaMessage, setAriaMessage] = useState<string>('');

  const activateButtonRef = useRef<HTMLButtonElement>(null);

  // Focus activate button on mount for zero-hunt keyboard accessibility
  useEffect(() => {
    activateButtonRef.current?.focus();
    setAriaMessage(
      'Blind Mode loaded. Press Enter to activate speech narration and listen to classroom updates.'
    );
  }, []);

  // Fetch announcements and lessons from real backend
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setApiError(null);
      try {
        await getHealth();
        setApiConnected(true);

        const [announcementsData, lessonsData] = await Promise.all([
          getBlindAnnouncements().catch(() => []),
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

  // Helper to speak with state tracking
  const speakText = useCallback((text: string) => {
    tts.speak(text, {
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
    setAriaMessage(text);
  }, []);

  // Primary activation flow (satisfies browser speech synthesis gesture permission requirement)
  const handleActivate = () => {
    setIsActivated(true);
    let intro = 'Blind mode activated. Spoken narration is now active. ';
    intro += 'Keyboard instructions: Press Space to stop or pause audio. Press R to repeat the last announcement. ';
    
    if (announcements.length > 0) {
      const top = announcements[0];
      intro += `Top classroom announcement from ${top.author_name}: ${top.title}. ${top.spoken_text}. `;
    } else {
      intro += 'No new classroom announcements at this time. ';
    }

    if (lessons.length > 0) {
      intro += `You have ${lessons.length} available lessons. The first lesson is: ${lessons[0].title}. Press 2 to jump to the lessons list, or press Enter on any lesson to hear its audio description.`;
    } else {
      intro += 'No lessons are published yet.';
    }

    speakText(intro);
  };

  const handleStopSpeech = () => {
    tts.stop();
    setIsSpeaking(false);
    setAriaMessage('Audio stopped.');
  };

  const handleRepeatSpeech = () => {
    tts.repeat();
    setIsSpeaking(true);
    setAriaMessage('Repeating audio narration.');
  };

  const handleSelectLesson = async (lessonId: number) => {
    speakText('Loading audio-first lesson description...');
    try {
      const blindView = await getBlindLesson(lessonId);
      setSelectedLesson(blindView);

      let text = `Lesson: ${blindView.title}. Subject: ${blindView.subject}, ${blindView.grade_level}. `;
      if (blindView.audio_summary) {
        text += `Summary: ${blindView.audio_summary}. `;
      }
      if (blindView.screenreader_description) {
        text += `Visual and diagram description: ${blindView.screenreader_description}. `;
      }
      if (blindView.braille_ascii) {
        text += `Braille notation is available. `;
      }
      if (blindView.priority_audio_cues && blindView.priority_audio_cues.length > 0) {
        text += `First instructional cue: ${blindView.priority_audio_cues[0].text}. `;
      }
      text += 'Press Space to pause audio, or R to repeat.';
      speakText(text);
    } catch {
      speakText('Could not load lesson audio details from the server.');
    }
  };

  // Keyboard shortcut controller
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow keyboard shortcuts across the page
      if (e.code === 'Space') {
        // Prevent page scroll when pausing speech
        e.preventDefault();
        if (isSpeaking) {
          handleStopSpeech();
        } else {
          handleRepeatSpeech();
        }
      } else if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        handleRepeatSpeech();
      } else if (e.key === '1') {
        // Jump to Announcements
        const el = document.getElementById('announcements-section');
        el?.focus();
        speakText('Focused on Classroom Announcements.');
      } else if (e.key === '2') {
        // Jump to Lessons
        const el = document.getElementById('lessons-section');
        el?.focus();
        speakText('Focused on Available Lessons.');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSpeaking, speakText]);

  return (
    <div className="min-h-screen bg-ink-900 text-white flex flex-col justify-between">
      <SkipLink targetId="main-content" label="Skip to main audio controls" />
      <LiveAnnouncer assertiveMessage={ariaMessage} />

      <ModeSwitcher currentMode="blind" />

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        {/* Audio Mode Header */}
        <div className="border-b border-ink-700 pb-6 mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" aria-hidden="true" />
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Blind Student Audio Experience
              </h1>
            </div>
            <p className="text-sm text-ink-300">
              Audio-first classroom. Digital Perkins Braille readiness, screen-reader synthesized notes, and priority audio queues.
            </p>
          </div>
          <StatusBadge isOnline={apiConnected} appName="Backend API" />
        </div>

        {/* Primary Activation Banner */}
        {!isActivated ? (
          <div className="p-8 bg-ink-800 border-2 border-brand-500 rounded-xl text-center mb-8 focus-within:ring-4 focus-within:ring-brand-400">
            <Volume2 className="w-12 h-12 text-brand-400 mx-auto mb-4" aria-hidden="true" />
            <h2 className="text-2xl font-bold mb-2">Press Enter to Activate Speech</h2>
            <p className="text-ink-300 max-w-md mx-auto mb-6 text-sm">
              Modern browsers require a single key press or tap to permit speech synthesis. Press Enter or click below to hear spoken instructions.
            </p>
            <button
              ref={activateButtonRef}
              type="button"
              onClick={handleActivate}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-brand-500 hover:bg-brand-600 text-ink-900 font-bold text-base focus:outline-none focus-visible:ring-4 focus-visible:ring-white transition-all shadow-lg"
              aria-label="Activate audio narration. Press Enter to begin spoken instructions."
            >
              <Play className="w-5 h-5 fill-current" aria-hidden="true" />
              <span>Activate Audio Narration (Press Enter)</span>
            </button>
          </div>
        ) : (
          <div className="p-4 bg-ink-800 border border-brand-600 rounded-lg mb-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span
                className={`w-3 h-3 rounded-full ${
                  isSpeaking ? 'bg-emerald-400 animate-ping' : 'bg-ink-500'
                }`}
                aria-hidden="true"
              />
              <span className="text-sm font-semibold text-white">
                {isSpeaking ? 'Speaking audio instructions...' : 'Audio Ready (Paused)'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={isSpeaking ? handleStopSpeech : handleRepeatSpeech}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-ink-700 hover:bg-ink-600 text-xs font-semibold text-white border border-ink-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
                aria-label={isSpeaking ? 'Stop current speech (Space key)' : 'Repeat last speech (Space key)'}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-4 h-4 text-amber-400" aria-hidden="true" />
                    <span>Stop Speech (Space)</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                    <span>Repeat Speech (R)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Keyboard Quick Navigation Guide */}
        <section aria-label="Audio navigation instructions" className="mb-8">
          <h2 className="text-base font-bold text-ink-200 mb-3 flex items-center gap-2">
            <span>Audio & Keyboard Navigation Keys</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-ink-800 border border-ink-700 rounded text-center">
              <kbd className="px-2 py-0.5 bg-ink-900 border border-ink-600 rounded text-xs font-mono font-bold text-amber-300">
                Space
              </kbd>
              <div className="text-xs text-ink-300 mt-1">Pause / Stop</div>
            </div>
            <div className="p-3 bg-ink-800 border border-ink-700 rounded text-center">
              <kbd className="px-2 py-0.5 bg-ink-900 border border-ink-600 rounded text-xs font-mono font-bold text-amber-300">
                R
              </kbd>
              <div className="text-xs text-ink-300 mt-1">Repeat Speech</div>
            </div>
            <div className="p-3 bg-ink-800 border border-ink-700 rounded text-center">
              <kbd className="px-2 py-0.5 bg-ink-900 border border-ink-600 rounded text-xs font-mono font-bold text-amber-300">
                1
              </kbd>
              <div className="text-xs text-ink-300 mt-1">Announcements</div>
            </div>
            <div className="p-3 bg-ink-800 border border-ink-700 rounded text-center">
              <kbd className="px-2 py-0.5 bg-ink-900 border border-ink-600 rounded text-xs font-mono font-bold text-amber-300">
                2
              </kbd>
              <div className="text-xs text-ink-300 mt-1">Lessons List</div>
            </div>
          </div>
        </section>

        {/* Backend API Error Banner if unreachable */}
        {apiError && (
          <div
            role="alert"
            className="p-4 mb-8 bg-red-950/60 border border-red-800 rounded-lg text-red-200 text-sm flex items-start gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-semibold text-white">Backend connection notice</p>
              <p className="text-xs text-red-300 mt-1">{apiError}</p>
              <p className="text-xs text-ink-300 mt-1">
                Ensure the FastAPI backend is running via <code className="text-amber-300">uvicorn app.main:app --port 8000</code>.
              </p>
            </div>
          </div>
        )}

        {/* Classroom Announcements Section */}
        <section
          id="announcements-section"
          tabIndex={-1}
          aria-labelledby="announcements-heading"
          className="mb-8 focus:outline-none"
        >
          <div className="flex items-center justify-between mb-3 border-b border-ink-700 pb-2">
            <h2 id="announcements-heading" className="text-lg font-bold text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-400" aria-hidden="true" />
              <span>Priority Audio Announcements</span>
            </h2>
            <span className="text-xs text-ink-400">Shortcut: Press 1</span>
          </div>

          {isLoading ? (
            <p className="text-sm text-ink-400 py-3">Loading classroom announcements...</p>
          ) : announcements.length === 0 ? (
            <p className="text-sm text-ink-400 py-3 italic">
              No classroom announcements posted yet. When teachers publish announcements, they are queued here according to audio priority.
            </p>
          ) : (
            <div className="space-y-3">
              {announcements.map((ann) => (
                <article
                  key={ann.id}
                  className="p-4 bg-ink-800 border border-ink-700 rounded-lg hover:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="font-bold text-white text-base">{ann.title}</h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-mono font-semibold uppercase ${
                        ann.audio_priority === 'critical'
                          ? 'bg-red-900 text-red-200'
                          : ann.audio_priority === 'high'
                          ? 'bg-amber-900 text-amber-200'
                          : 'bg-ink-700 text-ink-300'
                      }`}
                    >
                      Priority: {ann.audio_priority}
                    </span>
                  </div>
                  <p className="text-sm text-ink-200 mb-2">{ann.spoken_text}</p>
                  <div className="flex items-center justify-between text-xs text-ink-400">
                    <span>By: {ann.author_name}</span>
                    <button
                      type="button"
                      onClick={() => speakText(`Announcement: ${ann.title}. ${ann.spoken_text}`)}
                      className="text-amber-300 hover:text-amber-200 underline focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded px-1"
                      aria-label={`Read announcement: ${ann.title}`}
                    >
                      Read aloud
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Lessons Section */}
        <section
          id="lessons-section"
          tabIndex={-1}
          aria-labelledby="lessons-heading"
          className="mb-8 focus:outline-none"
        >
          <div className="flex items-center justify-between mb-3 border-b border-ink-700 pb-2">
            <h2 id="lessons-heading" className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" aria-hidden="true" />
              <span>Available Audio Lessons</span>
            </h2>
            <span className="text-xs text-ink-400">Shortcut: Press 2</span>
          </div>

          {isLoading ? (
            <p className="text-sm text-ink-400 py-3">Loading lessons from curriculum database...</p>
          ) : lessons.length === 0 ? (
            <p className="text-sm text-ink-400 py-3 italic">
              No lessons loaded yet. Add lessons to the backend via POST /api/v1/lessons.
            </p>
          ) : (
            <div className="space-y-3">
              {lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="p-4 bg-ink-800 border border-ink-700 rounded-lg hover:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="font-bold text-white text-base">{lesson.title}</h3>
                    <span className="text-xs px-2 py-0.5 bg-ink-700 text-ink-300 rounded">
                      {lesson.subject} | {lesson.grade_level}
                    </span>
                  </div>
                  <p className="text-sm text-ink-300 mb-3">{lesson.summary || lesson.content.slice(0, 150)}</p>
                  <button
                    type="button"
                    onClick={() => handleSelectLesson(lesson.id)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-ink-900 rounded font-bold text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-white transition-colors"
                    aria-label={`Listen to lesson: ${lesson.title}. Subject: ${lesson.subject}`}
                  >
                    <Volume2 className="w-4 h-4" aria-hidden="true" />
                    <span>Play Audio Description (Enter)</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Detailed Lesson Audio Inspection Panel if a lesson is selected */}
        {selectedLesson && (
          <section
            aria-labelledby="active-lesson-heading"
            className="p-6 bg-ink-800 border border-brand-500 rounded-xl mb-8"
          >
            <h2 id="active-lesson-heading" className="text-xl font-bold text-amber-300 mb-3">
              Active Audio Lesson: {selectedLesson.title}
            </h2>
            <div className="space-y-4 text-sm">
              {selectedLesson.audio_summary && (
                <div>
                  <h3 className="font-semibold text-ink-200">Audio Summary:</h3>
                  <p className="text-ink-100">{selectedLesson.audio_summary}</p>
                </div>
              )}
              {selectedLesson.screenreader_description && (
                <div>
                  <h3 className="font-semibold text-ink-200">Screenreader Diagram Description:</h3>
                  <p className="text-ink-100">{selectedLesson.screenreader_description}</p>
                </div>
              )}
              {selectedLesson.braille_unicode && (
                <div>
                  <h3 className="font-semibold text-ink-200">Braille Transcript:</h3>
                  <p className="font-mono text-base text-amber-200 tracking-wider">
                    {selectedLesson.braille_unicode}
                  </p>
                </div>
              )}
              {selectedLesson.priority_audio_cues?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-ink-200">Priority Audio Queue Cues:</h3>
                  <ul className="list-disc pl-5 space-y-1 text-ink-300">
                    {selectedLesson.priority_audio_cues.map((cue, idx) => (
                      <li key={idx}>
                        <span className="font-mono font-bold text-amber-300">[{cue.priority}]</span> {cue.text}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-ink-800 bg-ink-950 py-4 px-6 text-center text-xs text-ink-400">
        <p>Shikshit Bharat Audio Experience — Press Space to pause audio, R to repeat, 1 for Announcements, 2 for Lessons.</p>
      </footer>
    </div>
  );
};
