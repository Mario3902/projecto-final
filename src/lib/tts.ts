import { TextToSpeech } from '@capacitor-community/text-to-speech';

const PROXY_URL = import.meta.env.VITE_PROXY_URL ||
  `http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:3001`;

// Detect Capacitor at runtime (not at module load — bridge may not be ready yet)
function isCapacitor(): boolean {
  return typeof window !== 'undefined' && !!(window as any).Capacitor?.isNativePlatform?.();
}

// ── Web audio unlock (needed for <audio>.play() on some browsers) ────────────
let unlocked = false;
function ensureUnlocked() {
  if (unlocked) return;
  unlocked = true;
  // Warm up AudioContext
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    ctx.resume().then(() => ctx.close());
  } catch {}
}
if (typeof window !== 'undefined') {
  ['touchstart', 'touchend', 'click'].forEach(ev =>
    window.addEventListener(ev, ensureUnlocked, { once: true, passive: true })
  );
}

// ── Play audio from proxy (works in Android WebView) ─────────────────────────
function playFromProxy(text: string, onEnd?: () => void): HTMLAudioElement {
  const url = `${PROXY_URL}/api/tts?text=${encodeURIComponent(text.slice(0, 500))}&lang=pt`;
  const audio = new Audio(url);
  audio.onended = () => onEnd?.();
  audio.onerror = () => onEnd?.(); // silently skip on network error
  audio.play().catch(() => onEnd?.());
  return audio;
}

// ── Web speechSynthesis fallback (desktop browsers only) ─────────────────────
function getBestPtVoice(): SpeechSynthesisVoice | null {
  const vs = window.speechSynthesis?.getVoices() ?? [];
  const rank = [
    (v: SpeechSynthesisVoice) => /francisca|helia/i.test(v.name) && v.lang === 'pt-PT',
    (v: SpeechSynthesisVoice) => /natural|neural/i.test(v.name) && v.lang === 'pt-PT',
    (v: SpeechSynthesisVoice) => v.lang === 'pt-PT',
    (v: SpeechSynthesisVoice) => v.lang.startsWith('pt'),
  ];
  for (const fn of rank) { const f = vs.find(fn); if (f) return f; }
  return null;
}

function speakWeb(text: string, onEnd?: () => void) {
  if (!window.speechSynthesis) { onEnd?.(); return; }
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = 'pt-PT'; utt.rate = 0.88; utt.pitch = 1.05; utt.volume = 1.0;
  const v = getBestPtVoice(); if (v) utt.voice = v;
  const words = text.split(/\s+/).length;
  const timer = setTimeout(() => onEnd?.(), Math.max(3000, (words / 2.5) * 1000) + 1500);
  utt.onend  = () => { clearTimeout(timer); onEnd?.(); };
  utt.onerror = () => { clearTimeout(timer); onEnd?.(); };
  window.speechSynthesis.speak(utt);
}

// Pre-load voices on web
if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.addEventListener('voiceschanged', () => window.speechSynthesis.getVoices());
}

// ── Current audio ref for stop() ─────────────────────────────────────────────
let _current: HTMLAudioElement | null = null;

// ── Public API ────────────────────────────────────────────────────────────────

/** Speak text. On Android Capacitor: native plugin → proxy MP3. On web: speechSynthesis. */
export async function speak(text: string, onEnd?: () => void): Promise<void> {
  if (!text?.trim()) { onEnd?.(); return; }

  // 1. Proxy MP3 (ElevenLabs quality) — works in Android WebView AND web
  //    On Android: <audio> element plays fine; speechSynthesis is broken (Chromium WontFix)
  try {
    _current = playFromProxy(text, onEnd);
    return;
  } catch {
    // Proxy unreachable → fall through
  }

  // 2. Native Capacitor TTS plugin fallback (offline / proxy down)
  if (isCapacitor()) {
    try {
      await TextToSpeech.stop();
      await TextToSpeech.speak({ text, lang: 'pt-PT', rate: 0.9, pitch: 1.0, volume: 1.0 });
      onEnd?.();
      return;
    } catch {}
  }

  // 3. Web speechSynthesis (desktop browsers only)
  speakWeb(text, onEnd);
}

/** Stop any ongoing speech. */
export async function stopSpeech(): Promise<void> {
  if (_current) { try { _current.pause(); _current.src = ''; } catch {} _current = null; }
  if (isCapacitor()) { try { await TextToSpeech.stop(); } catch {} return; }
  window.speechSynthesis?.cancel();
}
