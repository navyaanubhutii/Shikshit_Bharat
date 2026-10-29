import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredMode, setStoredMode } from '@/utils/preferences';
import { getHealth } from '@/services/api';
import { SkipLink } from '@/components/SkipLink';
import { LiveAnnouncer } from '@/components/LiveAnnouncer';
import { StatusBadge } from '@/components/StatusBadge';
import { Volume2, Eye, ArrowRight, Keyboard } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [announcement, setAnnouncement] = useState<string>('');
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);
  const [previousMode, setPreviousMode] = useState<'blind' | 'deaf' | 'unset'>('unset');

  useEffect(() => {
    // Check stored mode
    const stored = getStoredMode();
    setPreviousMode(stored);

    // Announce to screen readers on mount
    setAnnouncement(
      'Welcome to Shikshit Bharat. Press B or 1 for Blind Audio-first experience. Press D or 2 for Deaf Visual-first experience.'
    );

    // Health check
    getHealth()
      .then(() => setApiConnected(true))
      .catch(() => setApiConnected(false));
  }, []);

  // Global single-key listener: users don't need to visually locate buttons
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if an input is somehow focused
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      const key = e.key.toLowerCase();
      if (key === 'b' || key === '1') {
        e.preventDefault();
        selectMode('blind');
      } else if (key === 'd' || key === '2') {
        e.preventDefault();
        selectMode('deaf');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const selectMode = (mode: 'blind' | 'deaf') => {
    setStoredMode(mode);
    if (mode === 'blind') {
      navigate('/blind');
    } else {
      navigate('/deaf');
    }
  };

  return (
    <div className="min-h-screen bg-ink-50 text-ink-900 flex flex-col justify-between">
      <SkipLink targetId="main-content" />
      <LiveAnnouncer assertiveMessage={announcement} />

      {/* Top Header */}
      <header className="border-b border-ink-100 bg-white px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-ink-900">
              शिक्षित भारत <span className="text-brand-600 font-normal">| Shikshit Bharat</span>
            </h1>
          </div>
          <StatusBadge isOnline={apiConnected} appName="Shikshit Bharat API" />
        </div>
      </header>

      {/* Main Experience Selector */}
      <main id="main-content" className="flex-1 max-w-4xl mx-auto px-6 py-12 flex flex-col justify-center">
        {/* Previous Mode Shortcut Banner if already remembered */}
        {previousMode !== 'unset' && (
          <div className="mb-8 p-4 bg-brand-50 border border-brand-200 rounded-lg flex items-center justify-between">
            <div className="text-sm text-brand-900">
              Previously visited in <strong>{previousMode === 'blind' ? 'Blind Mode' : 'Deaf Mode'}</strong>.
            </div>
            <button
              type="button"
              onClick={() => selectMode(previousMode as 'blind' | 'deaf')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-brand-700 text-white hover:bg-brand-800 focus:outline-none focus-visible:ring-3 focus-visible:ring-brand-500"
            >
              <span>Resume {previousMode === 'blind' ? 'Blind' : 'Deaf'} Experience</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        )}

        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-ink-900 mb-3 tracking-tight">
            Inclusive Classroom Learning Platform
          </h2>
          <p className="text-base sm:text-lg text-ink-600 max-w-2xl mx-auto">
            Choose your learning track. Each environment is purpose-built for distinct sensory requirements with zero specialized hardware.
          </p>
        </div>

        {/* Keyboard Quick Navigation Hint */}
        <div
          role="note"
          aria-label="Keyboard shortcuts"
          className="bg-white border border-ink-200 rounded-lg p-3 mb-8 text-center text-sm text-ink-700 flex items-center justify-center gap-2"
        >
          <Keyboard className="w-4 h-4 text-brand-600" aria-hidden="true" />
          <span>
            Instant keyboard entry: Press <kbd className="px-2 py-0.5 bg-ink-100 border border-ink-300 rounded font-mono font-bold text-xs">B</kbd> or <kbd className="px-2 py-0.5 bg-ink-100 border border-ink-300 rounded font-mono font-bold text-xs">1</kbd> for Blind Mode, or <kbd className="px-2 py-0.5 bg-ink-100 border border-ink-300 rounded font-mono font-bold text-xs">D</kbd> or <kbd className="px-2 py-0.5 bg-ink-100 border border-ink-300 rounded font-mono font-bold text-xs">2</kbd> for Deaf Mode.
          </span>
        </div>

        {/* Dual Mode Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Blind Mode Card */}
          <button
            type="button"
            onClick={() => selectMode('blind')}
            className="group text-left p-8 bg-white border-2 border-ink-200 rounded-xl hover:border-brand-600 hover:shadow-md focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-600 transition-all flex flex-col justify-between"
            aria-label="Enter Blind Student Experience. Audio-first narration, Perkins Braille keyboard navigation, and priority audio queuing. Shortcut key: B or 1."
          >
            <div>
              <div className="w-12 h-12 rounded-lg bg-brand-50 border border-brand-200 text-brand-700 flex items-center justify-center mb-5 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                <Volume2 className="w-6 h-6" aria-hidden="true" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-bold text-ink-900">Blind Experience</h3>
                <span className="text-xs px-2 py-0.5 bg-brand-100 text-brand-800 rounded font-mono font-semibold">
                  Press B
                </span>
              </div>
              <p className="text-sm text-ink-600 mb-6 leading-relaxed">
                Audio-first classroom. Spoken narration, priority audio queues, descriptive diagram notes, and digital Perkins Braille keyboard integration.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 group-hover:text-brand-800">
              <span>Activate Audio Experience</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </div>
          </button>

          {/* Deaf Mode Card */}
          <button
            type="button"
            onClick={() => selectMode('deaf')}
            className="group text-left p-8 bg-white border-2 border-ink-200 rounded-xl hover:border-brand-600 hover:shadow-md focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-600 transition-all flex flex-col justify-between"
            aria-label="Enter Deaf Student Experience. Visual-first learning, Indian Sign Language SOV glosses, sign gesture dictionary references, and visual alerts. Shortcut key: D or 2."
          >
            <div>
              <div className="w-12 h-12 rounded-lg bg-brand-50 border border-brand-200 text-brand-700 flex items-center justify-center mb-5 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                <Eye className="w-6 h-6" aria-hidden="true" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-bold text-ink-900">Deaf Experience</h3>
                <span className="text-xs px-2 py-0.5 bg-brand-100 text-brand-800 rounded font-mono font-semibold">
                  Press D
                </span>
              </div>
              <p className="text-sm text-ink-600 mb-6 leading-relaxed">
                Visual-first classroom. Indian Sign Language (ISL) Subject-Object-Verb glosses, visual dictionary cues, captions, and high-contrast visual alerts.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 group-hover:text-brand-800">
              <span>Activate Visual Experience</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </div>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-ink-100 bg-white py-4 px-6 text-center text-xs text-ink-500">
        <p>Shikshit Bharat — Built for inclusive accessibility in Indian education without specialized hardware.</p>
      </footer>
    </div>
  );
};
