import { ExperienceMode } from '@/types/accessibility';

const MODE_STORAGE_KEY = 'shikshit_bharat_mode';

export function getStoredMode(): ExperienceMode {
  if (typeof window === 'undefined') return 'unset';
  try {
    const stored = localStorage.getItem(MODE_STORAGE_KEY);
    if (stored === 'blind' || stored === 'deaf') {
      return stored;
    }
  } catch {
    // LocalStorage might be restricted
  }
  return 'unset';
}

export function setStoredMode(mode: ExperienceMode): void {
  if (typeof window === 'undefined') return;
  try {
    if (mode === 'unset') {
      localStorage.removeItem(MODE_STORAGE_KEY);
    } else {
      localStorage.setItem(MODE_STORAGE_KEY, mode);
    }
  } catch {
    // Ignore storage quota or access errors
  }
}

export function clearStoredMode(): void {
  setStoredMode('unset');
}
