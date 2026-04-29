import React, { useState } from "react";
import { Play, ExternalLink, X, Link as LinkIcon } from "lucide-react";

interface VideoPlayerProps {
  topic: string;
  subject: string;
  storageKey?: string;
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/embed\/([^?]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ topic, subject, storageKey }) => {
  const key = storageKey || `nzila_video_${subject}_${topic}`.replace(/\s+/g, "_").toLowerCase();

  const [savedUrl, setSavedUrl] = useState<string>(() => localStorage.getItem(key) || "");
  const [inputUrl, setInputUrl] = useState("");
  const [showInput, setShowInput] = useState(false);

  const videoId = savedUrl ? extractYouTubeId(savedUrl) : null;
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1` : null;

  const youtubeSearch = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${subject} ${topic} explicação`)}`;

  const saveVideo = () => {
    if (!inputUrl.trim()) return;
    const id = extractYouTubeId(inputUrl.trim());
    if (!id) return;
    const url = `https://www.youtube.com/watch?v=${id}`;
    setSavedUrl(url);
    localStorage.setItem(key, url);
    setInputUrl("");
    setShowInput(false);
  };

  const removeVideo = () => {
    setSavedUrl("");
    localStorage.removeItem(key);
  };

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-[#365A08] bg-[#1C2210]">
      {/* Video area */}
      {embedUrl ? (
        <div className="relative">
          <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
            <iframe
              className="absolute inset-0 w-full h-full"
              src={embedUrl}
              title={`${subject} — ${topic}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <button
            onClick={removeVideo}
            className="absolute top-2 right-2 w-7 h-7 bg-black/70 rounded-full flex items-center justify-center hover:bg-black/90 transition-colors z-10"
          >
            <X className="h-3.5 w-3.5 text-white" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 px-4 gap-3">
          <div className="w-14 h-14 bg-[#253510] rounded-2xl flex items-center justify-center mb-1">
            <Play className="h-7 w-7 text-[#72EB3A] ml-1" />
          </div>
          <p className="text-sm font-bold text-white text-center">{topic}</p>
          <p className="text-xs text-slate-500 text-center">Nenhum vídeo adicionado</p>

          {/* Search on YouTube */}
          <a
            href={youtubeSearch}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-red-600/20 border border-red-500/30 text-red-400 px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-600/30 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Pesquisar no YouTube
          </a>

          <button
            onClick={() => setShowInput((v) => !v)}
            className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 hover:text-slate-300 transition-colors"
          >
            <LinkIcon className="h-3 w-3" />
            Adicionar link de vídeo
          </button>
        </div>
      )}

      {/* URL input */}
      {showInput && (
        <div className="p-3 border-t border-[#365A08] flex gap-2 animate-fade-in">
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Cola URL do YouTube..."
            className="flex-1 bg-[#1B1D24] border border-[#365A08] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-[#72EB3A]/50"
          />
          <button
            onClick={saveVideo}
            disabled={!inputUrl.trim()}
            className="px-3 py-2 bg-[#72EB3A] text-[#1B1D24] rounded-xl text-xs font-bold disabled:opacity-40 transition-colors hover:bg-[#5D9D0B]"
          >
            OK
          </button>
        </div>
      )}

      {/* Label bar */}
      <div className="px-4 py-2.5 flex items-center justify-between border-t border-[#365A08]/50">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{subject} · {topic}</span>
        {savedUrl && (
          <button onClick={() => setShowInput((v) => !v)} className="text-[10px] font-bold text-[#72EB3A]">
            Trocar
          </button>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
