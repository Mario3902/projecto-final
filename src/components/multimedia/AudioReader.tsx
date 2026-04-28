import React, { useState, useEffect, useCallback } from "react";
import { Volume2, VolumeX, Loader2 } from "lucide-react";

interface AudioReaderProps {
  text: string;
  lang?: string;
  size?: "sm" | "md";
  className?: string;
}

const AudioReader: React.FC<AudioReaderProps> = ({
  text,
  lang = "pt-PT",
  size = "md",
  className = "",
}) => {
  const [playing, setPlaying] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (!("speechSynthesis" in window)) setSupported(false);
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  // Stop when text changes
  useEffect(() => {
    if (playing) {
      window.speechSynthesis.cancel();
      setPlaying(false);
    }
  }, [text]);

  const toggle = useCallback(() => {
    if (!supported) return;
    if (playing) {
      window.speechSynthesis.cancel();
      setPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang;
    utter.rate = 0.95;
    utter.pitch = 1;

    // Pick a Portuguese voice if available
    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find(
      (v) => v.lang.startsWith("pt") && v.localService
    ) || voices.find((v) => v.lang.startsWith("pt"));
    if (ptVoice) utter.voice = ptVoice;

    utter.onend = () => setPlaying(false);
    utter.onerror = () => setPlaying(false);

    setPlaying(true);
    window.speechSynthesis.speak(utter);
  }, [playing, supported, text, lang]);

  if (!supported) return null;

  const sizeClass = size === "sm"
    ? "h-7 w-7 rounded-lg"
    : "h-9 w-9 rounded-xl";

  return (
    <button
      onClick={toggle}
      title={playing ? "Parar leitura" : "Ouvir em voz alta"}
      className={`shrink-0 flex items-center justify-center border transition-all active:scale-95 ${sizeClass} ${
        playing
          ? "border-[#4ade80] bg-[#4ade80]/20 text-[#4ade80]"
          : "border-slate-700 bg-[#141e16] text-slate-400 hover:border-[#4ade80]/50 hover:text-[#4ade80]"
      } ${className}`}
    >
      {playing
        ? <Volume2 className={size === "sm" ? "h-3.5 w-3.5 animate-pulse" : "h-4 w-4 animate-pulse"} />
        : <Volume2 className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />}
    </button>
  );
};

export default AudioReader;
