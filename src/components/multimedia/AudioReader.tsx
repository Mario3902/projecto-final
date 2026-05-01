import React, { useState, useEffect, useCallback } from "react";
import { Volume2 } from "lucide-react";
import { speak, stopSpeech } from "@/lib/tts";

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

  // Stop when text changes
  useEffect(() => {
    if (playing) { stopSpeech(); setPlaying(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  // Cleanup on unmount
  useEffect(() => () => { stopSpeech(); }, []);

  const toggle = useCallback(async () => {
    if (playing) {
      await stopSpeech();
      setPlaying(false);
    } else {
      setPlaying(true);
      await speak(text, () => setPlaying(false));
    }
  }, [playing, text]);

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
