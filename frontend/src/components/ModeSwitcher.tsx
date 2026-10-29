import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ExperienceMode } from '@/types/accessibility';
import { setStoredMode } from '@/utils/preferences';
import { Volume2, Eye, RefreshCw } from 'lucide-react';

interface ModeSwitcherProps {
  currentMode: ExperienceMode;
  onModeChange?: (mode: ExperienceMode) => void;
}

export const ModeSwitcher: React.FC<ModeSwitcherProps> = ({ currentMode, onModeChange }) => {
  const navigate = useNavigate();

  const handleSwitch = (newMode: ExperienceMode) => {
    setStoredMode(newMode);
    onModeChange?.(newMode);
    if (newMode === 'blind') {
      navigate('/blind');
    } else if (newMode === 'deaf') {
      navigate('/deaf');
    } else {
      navigate('/');
    }
  };

  return (
    <header className="border-b border-ink-100 bg-white px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="font-bold text-lg text-ink-900 tracking-tight">
            शिक्षित भारत <span className="text-brand-600 font-normal">| Shikshit Bharat</span>
          </span>
          <span
            className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-ink-100 text-ink-700"
            role="status"
          >
            {currentMode === 'blind'
              ? 'Mode: Blind (Audio-First)'
              : currentMode === 'deaf'
              ? 'Mode: Deaf (Visual-First)'
              : 'Mode: Gateway'}
          </span>
        </div>

        <nav aria-label="Experience switcher" className="flex items-center gap-2">
          {currentMode !== 'blind' && (
            <button
              type="button"
              onClick={() => handleSwitch('blind')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-md border border-ink-600 bg-white text-ink-900 hover:bg-ink-50 focus:outline-none focus-visible:ring-3 focus-visible:ring-brand-500"
              aria-label="Switch to Blind Audio-first experience"
            >
              <Volume2 className="w-4 h-4 text-brand-600" aria-hidden="true" />
              <span>Switch to Blind Mode</span>
            </button>
          )}

          {currentMode !== 'deaf' && (
            <button
              type="button"
              onClick={() => handleSwitch('deaf')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-md border border-ink-600 bg-white text-ink-900 hover:bg-ink-50 focus:outline-none focus-visible:ring-3 focus-visible:ring-brand-500"
              aria-label="Switch to Deaf Visual-first experience"
            >
              <Eye className="w-4 h-4 text-brand-600" aria-hidden="true" />
              <span>Switch to Deaf Mode</span>
            </button>
          )}

          {currentMode !== 'unset' && (
            <button
              type="button"
              onClick={() => handleSwitch('unset')}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs sm:text-sm font-medium text-ink-600 hover:text-ink-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-500 rounded"
              title="Return to Experience Gateway"
              aria-label="Reset preference and return to Gateway"
            >
              <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Change Mode</span>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};
