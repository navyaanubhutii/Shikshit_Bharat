export type ExperienceMode = 'blind' | 'deaf' | 'unset';

export interface KeyShortcut {
  key: string;
  description: string;
  action: () => void;
}

export interface SpeechStatus {
  isSpeaking: boolean;
  isPaused: boolean;
  supported: boolean;
}
