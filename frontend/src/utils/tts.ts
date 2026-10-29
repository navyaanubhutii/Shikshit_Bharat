/**
 * Web Speech Synthesis utility with queuing, repeat, and interruption controls.
 */

class TextToSpeechController {
  private lastSpokenText: string = '';
  private voice: SpeechSynthesisVoice | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.initVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.initVoices();
      }
    }
  }

  private initVoices(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    // Prefer Indian English or Hindi English voice if available, otherwise default natural voice
    this.voice =
      voices.find((v) => v.lang === 'en-IN' || v.name.includes('India')) ||
      voices.find((v) => v.lang.startsWith('en')) ||
      voices[0] ||
      null;
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public isSpeaking(): boolean {
    if (!this.isSupported()) return false;
    return window.speechSynthesis.speaking;
  }

  public speak(
    text: string,
    options?: {
      rate?: number;
      pitch?: number;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (err: unknown) => void;
    }
  ): boolean {
    if (!this.isSupported() || !text.trim()) return false;

    // Cancel current speech before speaking new instructions
    this.stop();

    this.lastSpokenText = text;
    const utterance = new SpeechSynthesisUtterance(text);
    if (this.voice) {
      utterance.voice = this.voice;
    }
    utterance.rate = options?.rate ?? 0.95; // Slightly slower for crisp comprehension
    utterance.pitch = options?.pitch ?? 1.0;

    utterance.onstart = () => {
      options?.onStart?.();
    };

    utterance.onend = () => {
      options?.onEnd?.();
    };

    utterance.onerror = (e) => {
      // 'interrupted' or 'canceled' are normal when stop() is called
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        options?.onError?.(e);
      }
    };

    window.speechSynthesis.speak(utterance);
    return true;
  }

  public stop(): void {
    if (!this.isSupported()) return;
    window.speechSynthesis.cancel();
  }

  public pause(): void {
    if (!this.isSupported()) return;
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
    }
  }

  public resume(): void {
    if (!this.isSupported()) return;
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  }

  public repeat(): boolean {
    if (this.lastSpokenText) {
      return this.speak(this.lastSpokenText);
    }
    return false;
  }

  public getLastSpokenText(): string {
    return this.lastSpokenText;
  }
}

export const tts = new TextToSpeechController();
