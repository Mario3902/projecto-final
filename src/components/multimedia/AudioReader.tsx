import React, { useState, useEffect, useCallback } from "react";
import { Volume2 } from "lucide-react";

interface AudioReaderProps {
  text: string;
  lang?: string;
  size?: "sm" | "md";
  className?: string;
}

// Priority: online neural voices first (Google/Microsoft), then local
function pickVoice(lang: string): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const base = lang.slice(0, 2); // "pt"

  const tiers = [
    // Online pt-PT
    (v: SpeechSynthesisVoice) => v.lang === "pt-PT" && !v.localService,
    // Online pt-BR (fallback — still natural)
    (v: SpeechSynthesisVoice) => v.lang === "pt-BR" && !v.localService,
    // Any online Portuguese
    (v: SpeechSynthesisVoice) => v.lang.startsWith(base) && !v.localService,
    // Local pt-PT
    (v: SpeechSynthesisVoice) => v.lang === "pt-PT",
    // Local pt-BR
    (v: SpeechSynthesisVoice) => v.lang === "pt-BR",
    // Any Portuguese
    (v: SpeechSynthesisVoice) => v.lang.startsWith(base),
  ];

  for (const tier of tiers) {
    const found = voices.find(tier);
    if (found) return found;
  }
  return null;
}

const AudioReader: React.FC<AudioReaderProps> = ({
  text,
  lang = "pt-PT",
  size = "md",
  className = "",
}) => {
  const [playing, setPlaying]     = useState(false);
  const [supported, setSupported] = useState(true);
  const [ready, setReady]         = useState(false);

  // Detect support + wait for voices to load
  useEffect(() => {
    if (!("speechSynthesis" in window)) { setSupported(false); return; }
    const onLoaded = () => setReady(true);
    if (window.speechSynthesis.getVoices().length > 0) {
      setReady(true);
    } else {
      window.speechSynthesis.addEventListener("voiceschanged", onLoaded);
      return () => window.speechSynthesis.removeEventListener("voiceschanged", onLoaded);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => () => { window.speechSynthesis?.cancel(); }, []);

  // Stop when text changes
  useEffect(() => {
    if (playing) { window.speechSynthesis.cancel(); setPlaying(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  const speak = useCallback(() => {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang;
    utter.rate  = 0.88;   // slightly slower = more natural pacing
    utter.pitch = 1.0;
    utter.volume = 1.0;

    const voice = pickVoice(lang);
    if (voice) utter.voice = voice;

    utter.onend   = () => setPlaying(false);
    utter.onerror = () => setPlaying(false);

    setPlaying(true);
    window.speechSynthesis.speak(utter);
  }, [text, lang]);

  const toggle = useCallback(() => {
    if (!supported) return;
    if (playing) {
      window.speechSynthesis.cancel();
      setPlaying(false);
    } else {
      speak();
    }
  }, [playing, supported, speak]);

  if (!supported) return null;

  const sm = size === "sm";
  return (
    <button
      onClick={toggle}
      title={playing ? "Parar leitura" : "Ouvir em voz alta"}
      className={`shrink-0 flex items-center justify-center border transition-all active:scale-95 ${
        sm ? "h-7 w-7 rounded-lg" : "h-9 w-9 rounded-xl"
      } ${
        playing
          ? "border-[#72EB3A] bg-[#72EB3A]/20 text-[#72EB3A]"
          : "border-slate-700 bg-[#1C2210] text-slate-400 hover:border-[#72EB3A]/50 hover:text-[#72EB3A]"
      } ${className}`}
    >
      <Volume2 className={`${sm ? "h-3.5 w-3.5" : "h-4 w-4"} ${playing ? "animate-pulse" : ""}`} />
    </button>
  );
};

export default AudioReader;
