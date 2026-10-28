/**
 * Medical Telemetry Audio Synthesizer using Web Audio API
 * Provides realistic, compliant audio alerts for critical and high-priority alarms.
 */

let audioCtx: AudioContext | null = null;
let isMuted = false;
let masterVolume = 0.3;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function setAudioMuted(muted: boolean) {
  isMuted = muted;
}

export function getAudioMuted(): boolean {
  return isMuted;
}

export function setMasterVolume(vol: number) {
  masterVolume = Math.max(0, Math.min(1, vol));
}

export function getMasterVolume(): number {
  return masterVolume;
}

/**
 * Play a double-beep Critical Medical Alarm (IEC 60601-1-8 inspired pattern)
 */
export function playCriticalAlarmSound() {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [960, 960, 960];
    const interval = 0.12;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * interval);

      // Attack & decay envelope
      gain.gain.setValueAtTime(0, now + idx * interval);
      gain.gain.linearRampToValueAtTime(masterVolume * 0.7, now + idx * interval + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * interval + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * interval);
      osc.stop(now + idx * interval + 0.1);
    });
  } catch (err) {
    console.debug('Audio play not allowed yet or error', err);
  }
}

/**
 * Play a single High/Medium Priority alert chime
 */
export function playWarningSound() {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(680, now);
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.18);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(masterVolume * 0.4, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  } catch (err) {
    console.debug('Audio play error', err);
  }
}

/**
 * Play gentle acknowledgment click
 */
export function playAcknowledgeSound() {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(masterVolume * 0.2, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  } catch (err) {
    console.debug('Audio play error', err);
  }
}
