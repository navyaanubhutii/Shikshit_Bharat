// src/utils/earcon.ts
/**
 * Simple earcon playback using the Web Audio API.
 * Generates short tones for different UI events.
 * Prevents overlap by creating a fresh oscillator each call.
 */
export type EarconType = 'navigate' | 'confirm' | 'error' | 'announcement';

export function playEarcon(type: EarconType) {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Frequency mapping (Hz) – short, non‑intrusive tones
    let freq = 440;
    switch (type) {
      case 'navigate':
        freq = 600;
        break;
      case 'confirm':
        freq = 800;
        break;
      case 'error':
        freq = 200;
        break;
      case 'announcement':
        freq = 1000;
        break;
    }
    osc.frequency.value = freq;
    osc.type = 'sine';
    osc.connect(gain);
    gain.connect(ctx.destination);
    // Short 150 ms tone
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
    // Cleanup
    osc.onended = () => {
      gain.disconnect();
      ctx.close();
    };
  } catch (e) {
    // Silently ignore – earcon is non‑critical
    console.error('Earcon playback failed', e);
  }
}
