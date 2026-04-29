import React, { useState, useEffect, useRef, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Volume2, VolumeX, RotateCcw, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { StorySlide, StoryScript, StoryQuizOption } from "@/lib/gemini";
import { NziSVG } from "@/components/nzi/NziCharacter";
import type { NziExpression } from "@/context/NziContext";

// ── TTS — smart voice selection ────────────────────────────────────────────────

function getPortugueseVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis?.getVoices() ?? [];
  const priority = [
    (v: SpeechSynthesisVoice) => /francisca|helia|vitoria/i.test(v.name) && /pt/i.test(v.lang),
    (v: SpeechSynthesisVoice) => /natural|neural|online/i.test(v.name) && v.lang === "pt-PT",
    (v: SpeechSynthesisVoice) => v.lang === "pt-PT",
    (v: SpeechSynthesisVoice) => /natural|neural/i.test(v.name) && /pt/i.test(v.lang),
    (v: SpeechSynthesisVoice) => v.lang.startsWith("pt"),
  ];
  for (const test of priority) {
    const found = voices.find(test);
    if (found) return found;
  }
  return null;
}

function speakText(text: string, muted: boolean, onEnd?: () => void) {
  if (muted || !window.speechSynthesis) { onEnd?.(); return; }
  window.speechSynthesis.cancel();

  const utt = new SpeechSynthesisUtterance(text);
  const voice = getPortugueseVoice();
  if (voice) utt.voice = voice;
  utt.lang = "pt-PT";
  utt.rate = 0.82;
  utt.pitch = 1.08;
  utt.volume = 1;
  if (onEnd) utt.onend = onEnd;
  window.speechSynthesis.speak(utt);
}

function stopSpeech() { window.speechSynthesis?.cancel(); }

function getNarration(slide: StorySlide): string {
  if (slide.type === "intro") return `${slide.title}. ${slide.body}. ${slide.funFact ? "Facto curioso: " + slide.funFact : ""}`;
  if (slide.type === "quiz") return `Desafio! ${slide.quizQuestion}`;
  if (slide.type === "summary") return `Parabéns! ${(slide.keyPoints ?? []).join(". ")}`;
  return `${slide.title}. ${slide.body}`;
}

// ── Image with subject fallback ────────────────────────────────────────────────

const SUBJECT_PALETTES: Record<string, { from: string; to: string }> = {
  matemática: { from: "#064e3b", to: "#1B1D24" },
  física:     { from: "#1e3a5f", to: "#1B1D24" },
  química:    { from: "#3b1f5e", to: "#1B1D24" },
  biologia:   { from: "#365A08", to: "#1B1D24" },
  história:   { from: "#7c2d12", to: "#1B1D24" },
  geografia:  { from: "#164e63", to: "#1B1D24" },
  português:  { from: "#831843", to: "#1B1D24" },
  inglês:     { from: "#713f12", to: "#1B1D24" },
};

function getPalette(subject: string) {
  const key = Object.keys(SUBJECT_PALETTES).find(k => subject.toLowerCase().includes(k));
  return SUBJECT_PALETTES[key ?? ""] ?? { from: "#1a2e1f", to: "#1B1D24" };
}

const SlideImage: React.FC<{
  keyword: string; subject: string;
  className?: string; style?: React.CSSProperties;
}> = ({ keyword, subject, className, style }) => {
  const [err, setErr] = useState(false);
  const pal = getPalette(subject);
  if (!keyword || err) {
    return (
      <div className={className} style={{
        background: `linear-gradient(135deg, ${pal.from} 0%, ${pal.to} 100%)`,
        ...style,
      }} />
    );
  }
  return (
    <img
      src={`https://source.unsplash.com/800x500/?${encodeURIComponent(keyword)}`}
      alt=""
      onError={() => setErr(true)}
      className={className}
      style={{ objectFit: "cover", ...style }}
    />
  );
};

// ── Nzi with bounce/float ──────────────────────────────────────────────────────

const NziAnimated: React.FC<{
  expression: NziExpression; size: number;
  onClick?: () => void; label?: string;
}> = ({ expression, size, onClick, label }) => {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 50);
    return () => clearInterval(id);
  }, []);

  const floatY = Math.sin((tick / 8) * Math.PI) * 5;
  const rotate = expression === "waving" ? Math.sin((tick / 5) * Math.PI) * 6
    : expression === "excited" ? Math.sin((tick / 4) * Math.PI) * 4
    : 0;
  const scale = expression === "celebrate" ? 1 + Math.sin((tick / 5) * Math.PI) * 0.05 : 1;

  return (
    <button
      onClick={onClick}
      title={label}
      style={{
        background: "none", border: "none", padding: 0, cursor: onClick ? "pointer" : "default",
        transform: `translateY(${floatY}px) rotate(${rotate}deg) scale(${scale})`,
        transition: "transform 0.05s linear",
        display: "inline-block",
        filter: onClick ? "drop-shadow(0 0 12px #72EB3A44)" : "none",
      }}
    >
      <NziSVG expression={expression} size={size} />
    </button>
  );
};

// ── Speech bubble ──────────────────────────────────────────────────────────────

const SpeechBubble: React.FC<{ text: string; side?: "left" | "right" }> = ({ text, side = "left" }) => (
  <div style={{
    background: "#fff", borderRadius: 16, padding: "8px 13px",
    maxWidth: 190, position: "relative",
    boxShadow: "0 4px 20px #00000040",
    animation: "bubble-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both",
  }}>
    <p style={{
      color: "#1B1D24", fontSize: 12.5, fontWeight: 700,
      margin: 0, lineHeight: 1.35,
    }}>{text}</p>
    <div style={{
      position: "absolute", bottom: -7,
      [side === "left" ? "left" : "right"]: 18,
      width: 0, height: 0,
      borderLeft: "7px solid transparent",
      borderRight: "7px solid transparent",
      borderTop: "7px solid white",
    }} />
  </div>
);

// ── Progress dots ──────────────────────────────────────────────────────────────

const ProgressDots: React.FC<{ total: number; current: number }> = ({ total, current }) => (
  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
    {Array.from({ length: total }).map((_, i) => (
      <div key={i} style={{
        height: i === current ? 8 : 6,
        width: i === current ? 22 : 6,
        borderRadius: 4,
        background: i === current ? "#72EB3A" : i < current ? "#72EB3A66" : "#2a3a08",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }} />
    ))}
  </div>
);

// ── INTRO SLIDE ────────────────────────────────────────────────────────────────

const IntroSlide: React.FC<{ slide: StorySlide; subject: string; muted: boolean }> = ({ slide, subject, muted }) => {
  const [show, setShow] = useState(false);
  useEffect(() => { setTimeout(() => setShow(true), 100); }, []);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Hero image */}
      <div style={{ position: "relative", height: 220, flexShrink: 0, overflow: "hidden" }}>
        <SlideImage keyword={slide.imageKeyword} subject={subject} style={{ width: "100%", height: "100%" }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(180deg, #1B1D2433 0%, #1B1D24ee 100%)",
        }} />
        {/* Subject badge */}
        <div style={{
          position: "absolute", top: 14, left: 14,
          background: "#72EB3A", color: "#1B1D24",
          fontWeight: 900, fontSize: 11, padding: "3px 12px",
          borderRadius: 20, textTransform: "uppercase", letterSpacing: 2,
        }}>
          {subject}
        </div>
        {/* Big emoji */}
        <div style={{
          position: "absolute", bottom: 20, right: 20,
          fontSize: 64, lineHeight: 1,
          filter: "drop-shadow(0 4px 12px #00000066)",
          animation: show ? "emoji-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both" : "none",
        }}>
          {slide.emoji}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "20px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Title */}
        <h1 style={{
          color: "#fff", fontSize: 26, fontWeight: 900, margin: 0, lineHeight: 1.2,
          animation: show ? "slide-up 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.1s both" : "none",
        }}>
          {slide.title}
        </h1>

        {/* Body */}
        <p style={{
          color: "#cbd5e1", fontSize: 15, lineHeight: 1.65, margin: 0,
          animation: show ? "slide-up 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.2s both" : "none",
        }}>
          {slide.body}
        </p>

        {/* Fun fact card */}
        {slide.funFact && (
          <div style={{
            background: "#72EB3A12", border: "1px solid #72EB3A30",
            borderLeft: "4px solid #72EB3A", borderRadius: 14,
            padding: "12px 14px",
            animation: show ? "slide-up 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.3s both" : "none",
          }}>
            <p style={{ color: "#72EB3A", fontWeight: 900, fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, margin: "0 0 4px" }}>
              💡 Sabia que...
            </p>
            <p style={{ color: "#a7f3d0", fontSize: 13.5, margin: 0, lineHeight: 1.5 }}>
              {slide.funFact}
            </p>
          </div>
        )}

        {/* Nzi + bubble */}
        <div style={{
          display: "flex", alignItems: "flex-end", gap: 10, marginTop: "auto",
          animation: show ? "slide-up 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.35s both" : "none",
        }}>
          <NziAnimated
            expression={slide.nziExpression as NziExpression}
            size={78}
            onClick={() => speakText(getNarration(slide), muted)}
            label="Toca para ouvir"
          />
          <div style={{ paddingBottom: 10 }}>
            <SpeechBubble text={slide.nziSpeech} />
          </div>
        </div>
      </div>
    </div>
  );
};

// ── CONCEPT SLIDE ──────────────────────────────────────────────────────────────

const ConceptSlide: React.FC<{ slide: StorySlide; subject: string; muted: boolean }> = ({ slide, subject, muted }) => {
  const [reveal, setReveal] = useState(0);
  const words = slide.body.split(" ");
  useEffect(() => {
    const id = setInterval(() => {
      setReveal(r => {
        if (r >= words.length) { clearInterval(id); return r; }
        return r + 1;
      });
    }, 80);
    return () => clearInterval(id);
  }, [words.length]);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Image with Nzi overlap */}
      <div style={{ position: "relative", height: 200, flexShrink: 0, overflow: "hidden" }}>
        <SlideImage keyword={slide.imageKeyword} subject={subject} style={{ width: "100%", height: "100%" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #1B1D2422 0%, #1B1D24f0 100%)" }} />
        {/* Type badge */}
        <div style={{ position: "absolute", top: 14, left: 14, background: "#60a5fa22", border: "1px solid #60a5fa66", borderRadius: 12, padding: "4px 12px" }}>
          <span style={{ color: "#60a5fa", fontWeight: 900, fontSize: 11, textTransform: "uppercase", letterSpacing: 2 }}>💡 Conceito</span>
        </div>
        {/* Nzi peeking from bottom */}
        <div style={{ position: "absolute", bottom: -18, left: 16, zIndex: 10 }}>
          <NziAnimated
            expression={slide.nziExpression as NziExpression} size={88}
            onClick={() => speakText(getNarration(slide), muted)}
            label="Ouvir explicação"
          />
        </div>
        {/* Bubble */}
        <div style={{ position: "absolute", bottom: 18, left: 110, zIndex: 11 }}>
          <SpeechBubble text={slide.nziSpeech} />
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "28px 22px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
        <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 900, margin: 0 }}>{slide.title}</h2>

        {/* Word-by-word reveal */}
        <div style={{
          background: "#1C2210", border: "1px solid #365A08",
          borderRadius: 18, padding: "16px 18px", flex: 1,
        }}>
          <p style={{ color: "#e2e8f0", fontSize: 15.5, lineHeight: 1.7, margin: 0 }}>
            {words.map((w, i) => {
              const isKey = w.toLowerCase().replace(/[^a-záéíóú]/g, "").includes(
                slide.highlight.toLowerCase().replace(/[^a-záéíóú]/g, "")
              );
              return (
                <span key={i} style={{
                  opacity: i < reveal ? 1 : 0,
                  color: isKey ? "#72EB3A" : "#e2e8f0",
                  fontWeight: isKey ? 900 : 400,
                  marginRight: 4,
                  display: "inline-block",
                  transition: "opacity 0.1s",
                  textDecoration: isKey ? "underline" : "none",
                  textDecorationColor: "#72EB3A60",
                }}>
                  {w}
                </span>
              );
            })}
          </p>
        </div>

        {/* Keyword badge */}
        {reveal >= words.length && (
          <div style={{ display: "flex", gap: 8, alignItems: "center", animation: "bubble-in 0.3s both" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#72EB3A" }} />
            <span style={{ color: "#72EB3A", fontWeight: 900, fontSize: 13 }}>{slide.highlight}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// ── EXAMPLE SLIDE ──────────────────────────────────────────────────────────────

const ExampleSlide: React.FC<{ slide: StorySlide; subject: string; muted: boolean }> = ({ slide, subject, muted }) => {
  const [show, setShow] = useState(false);
  useEffect(() => { setTimeout(() => setShow(true), 150); }, []);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Image */}
      <div style={{ position: "relative", height: 180, flexShrink: 0, overflow: "hidden" }}>
        <SlideImage keyword={slide.imageKeyword} subject={subject} style={{ width: "100%", height: "100%" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #1B1D2422 0%, #1B1D24f0 100%)" }} />
        <div style={{ position: "absolute", top: 14, left: 14, background: "#fbbf2422", border: "1px solid #fbbf2466", borderRadius: 12, padding: "4px 12px" }}>
          <span style={{ color: "#fbbf24", fontWeight: 900, fontSize: 11, textTransform: "uppercase", letterSpacing: 2 }}>🌍 Angola</span>
        </div>
        <div style={{ position: "absolute", bottom: 14, right: 16, fontSize: 52, animation: show ? "emoji-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both" : "none" }}>
          {slide.emoji}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "16px 22px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
        <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 900, margin: 0, animation: show ? "slide-up 0.3s 0.1s both" : "none" }}>
          {slide.title}
        </h2>

        {/* Nzi inline */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 10, animation: show ? "slide-up 0.3s 0.15s both" : "none" }}>
          <NziAnimated
            expression={slide.nziExpression as NziExpression} size={76}
            onClick={() => speakText(getNarration(slide), muted)}
            label="Ouvir"
          />
          <div style={{ paddingBottom: 10 }}>
            <SpeechBubble text={slide.nziSpeech} />
          </div>
        </div>

        {/* Example card */}
        <div style={{
          background: "#1e1a0e", border: "1px solid #78350f40",
          borderLeft: "4px solid #fbbf24", borderRadius: 16,
          padding: "14px 16px", flex: 1,
          animation: show ? "slide-up 0.3s 0.2s both" : "none",
        }}>
          <p style={{ color: "#fde68a", fontSize: 15.5, lineHeight: 1.65, margin: 0 }}>
            {slide.body}
          </p>
        </div>

        {/* Keyword */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, animation: show ? "slide-up 0.3s 0.3s both" : "none" }}>
          <span style={{ background: "#fbbf2420", border: "1px solid #fbbf24", borderRadius: 14, padding: "4px 12px", color: "#fbbf24", fontWeight: 900, fontSize: 12 }}>
            ✨ {slide.highlight}
          </span>
        </div>
      </div>
    </div>
  );
};

// ── QUIZ SLIDE ─────────────────────────────────────────────────────────────────

const QuizSlide: React.FC<{ slide: StorySlide; muted: boolean; onAnswer: (correct: boolean) => void }> = ({ slide, muted, onAnswer }) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const opts = slide.quizOptions ?? [];

  const handleAnswer = (i: number) => {
    if (answered) return;
    setSelected(i);
    setAnswered(true);
    const correct = opts[i]?.correct ?? false;
    speakText(correct ? "Correto! Muito bem!" : `Errado. A resposta certa era: ${opts.find(o => o.correct)?.text}`, muted);
    setTimeout(() => onAnswer(correct), 2200);
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "24px 22px", gap: 20 }}>
      {/* Nzi header */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 12, justifyContent: "center" }}>
        <NziAnimated expression={slide.nziExpression as NziExpression} size={90} />
        <div style={{ paddingBottom: 14 }}>
          <SpeechBubble text={slide.nziSpeech} />
        </div>
      </div>

      {/* Question */}
      <div style={{ background: "#1C2210", border: "1px solid #72EB3A30", borderRadius: 18, padding: "18px 18px" }}>
        <p style={{ color: "#72EB3A", fontWeight: 900, fontSize: 11, textTransform: "uppercase", letterSpacing: 2, margin: "0 0 8px" }}>
          🧠 Pergunta
        </p>
        <p style={{ color: "#fff", fontSize: 17, fontWeight: 700, margin: 0, lineHeight: 1.4 }}>
          {slide.quizQuestion}
        </p>
      </div>

      {/* Options */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {opts.map((opt, i) => {
          const isSelected = selected === i;
          const isCorrect = opt.correct;
          let bg = "#1C2210", border = "#365A08", color = "#e2e8f0";
          if (answered && isSelected && isCorrect) { bg = "#365A08"; border = "#72EB3A"; color = "#72EB3A"; }
          else if (answered && isSelected && !isCorrect) { bg = "#450a0a"; border = "#ef4444"; color = "#ef4444"; }
          else if (answered && isCorrect) { bg = "#365A0840"; border = "#72EB3A60"; color = "#a7f3d0"; }

          return (
            <button key={i} onClick={() => handleAnswer(i)} disabled={answered} style={{
              background: bg, border: `2px solid ${border}`, borderRadius: 14,
              padding: "13px 16px", textAlign: "left", cursor: answered ? "default" : "pointer",
              transition: "all 0.25s", display: "flex", alignItems: "center", gap: 10,
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                background: answered && isCorrect ? "#72EB3A" : answered && isSelected ? "#ef4444" : "#2a3a08",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {answered && isCorrect ? <CheckCircle2 size={16} color="#1B1D24" />
                  : answered && isSelected ? <XCircle size={16} color="#fff" />
                  : <span style={{ color: "#72EB3A", fontWeight: 900, fontSize: 12 }}>{String.fromCharCode(65 + i)}</span>}
              </div>
              <span style={{ color, fontSize: 14.5, fontWeight: 600, lineHeight: 1.3 }}>{opt.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ── DEEPDIVE SLIDE ─────────────────────────────────────────────────────────────

const DeepdiveSlide: React.FC<{ slide: StorySlide; subject: string; muted: boolean }> = ({ slide, subject, muted }) => {
  const [show, setShow] = useState(false);
  useEffect(() => { setTimeout(() => setShow(true), 100); }, []);

  const steps = slide.body.split(/\.|,/).map(s => s.trim()).filter(s => s.length > 10);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ position: "relative", height: 180, flexShrink: 0, overflow: "hidden" }}>
        <SlideImage keyword={slide.imageKeyword} subject={subject} style={{ width: "100%", height: "100%" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #1B1D2422 0%, #1B1D24f5 100%)" }} />
        <div style={{ position: "absolute", top: 14, left: 14, background: "#a78bfa22", border: "1px solid #a78bfa66", borderRadius: 12, padding: "4px 12px" }}>
          <span style={{ color: "#a78bfa", fontWeight: 900, fontSize: 11, textTransform: "uppercase", letterSpacing: 2 }}>⚙️ Mecanismo</span>
        </div>
        <div style={{ position: "absolute", bottom: -18, right: 16, zIndex: 10 }}>
          <NziAnimated expression={slide.nziExpression as NziExpression} size={85}
            onClick={() => speakText(getNarration(slide), muted)} />
        </div>
        <div style={{ position: "absolute", bottom: 18, right: 110, zIndex: 11 }}>
          <SpeechBubble text={slide.nziSpeech} side="right" />
        </div>
      </div>

      <div style={{ flex: 1, padding: "28px 22px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
        <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 900, margin: 0 }}>{slide.title}</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
          {steps.slice(0, 4).map((step, i) => (
            <div key={i} style={{
              display: "flex", gap: 12, alignItems: "flex-start",
              animation: show ? `slide-up 0.35s cubic-bezier(0.4,0,0.2,1) ${i * 0.08 + 0.1}s both` : "none",
            }}>
              <div style={{
                width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                background: ["#72EB3A", "#60a5fa", "#a78bfa", "#fbbf24"][i % 4] + "22",
                border: `2px solid ${["#72EB3A", "#60a5fa", "#a78bfa", "#fbbf24"][i % 4]}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ color: ["#72EB3A", "#60a5fa", "#a78bfa", "#fbbf24"][i % 4], fontWeight: 900, fontSize: 11 }}>{i + 1}</span>
              </div>
              <p style={{ color: "#cbd5e1", fontSize: 14.5, margin: 0, lineHeight: 1.5, paddingTop: 2 }}>{step}</p>
            </div>
          ))}
        </div>

        <div style={{ animation: show ? "slide-up 0.3s 0.4s both" : "none" }}>
          <span style={{ background: "#a78bfa20", border: "1px solid #a78bfa", borderRadius: 14, padding: "4px 12px", color: "#a78bfa", fontWeight: 900, fontSize: 12 }}>
            ⚙️ {slide.highlight}
          </span>
        </div>
      </div>
    </div>
  );
};

// ── SUMMARY SLIDE ──────────────────────────────────────────────────────────────

const SummarySlide: React.FC<{ slide: StorySlide; muted: boolean; onFinish: () => void }> = ({ slide, muted, onFinish }) => {
  const [visibleCount, setVisibleCount] = useState(0);
  const points = slide.keyPoints ?? [];
  useEffect(() => {
    points.forEach((_, i) => {
      setTimeout(() => setVisibleCount(v => Math.max(v, i + 1)), i * 700 + 400);
    });
  }, [points.length]);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "24px 22px", gap: 16, background: "linear-gradient(180deg, #1B1D24 0%, #0f0a1a 100%)" }}>
      {/* Nzi celebrating */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
        <NziAnimated expression="celebrate" size={110} onClick={() => speakText(getNarration(slide), muted)} />
        <SpeechBubble text={slide.nziSpeech} />
      </div>

      {/* Title */}
      <div style={{ textAlign: "center" }}>
        <p style={{ color: "#a78bfa", fontWeight: 900, fontSize: 11, textTransform: "uppercase", letterSpacing: 3, margin: "0 0 4px" }}>Lição completa</p>
        <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 900, margin: 0 }}>{slide.title}</h2>
      </div>

      {/* Key points */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        {points.map((point, i) => {
          const colors = ["#72EB3A", "#60a5fa", "#a78bfa"];
          const c = colors[i % 3];
          return (
            <div key={i} style={{
              background: "#1C2210", border: `1px solid ${c}30`,
              borderLeft: `4px solid ${c}`, borderRadius: 14,
              padding: "13px 15px", display: "flex", gap: 12, alignItems: "flex-start",
              opacity: i < visibleCount ? 1 : 0,
              transform: i < visibleCount ? "translateX(0)" : "translateX(-30px)",
              transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: c, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#1B1D24", fontWeight: 900, fontSize: 12 }}>✓</span>
              </div>
              <p style={{ color: "#e2e8f0", fontSize: 14.5, margin: 0, lineHeight: 1.45 }}>{point}</p>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      {visibleCount >= points.length && (
        <button onClick={onFinish} style={{
          background: "#72EB3A", color: "#1B1D24",
          border: "none", borderRadius: 18,
          padding: "15px", fontWeight: 900, fontSize: 16,
          cursor: "pointer", width: "100%",
          animation: "bubble-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        }}>
          🎯 Fazer o Quiz Final
        </button>
      )}
    </div>
  );
};

// ── MAIN SLIDESHOW ─────────────────────────────────────────────────────────────

interface SlideshowProps {
  script: StoryScript;
  onClose: () => void;
  onFinished: () => void;
}

export const StorySlideshow: React.FC<SlideshowProps> = ({ script, onClose, onFinished }) => {
  const slides = script.slides;
  const [idx, setIdx] = useState(0);
  const [muted, setMuted] = useState(false);
  const [dir, setDir] = useState<"next" | "prev">("next");
  const [animating, setAnimating] = useState(false);
  const [quizResult, setQuizResult] = useState<boolean | null>(null);
  const narrated = useRef<Set<number>>(new Set());

  const current = slides[idx];

  // Auto-narrate each slide once
  useEffect(() => {
    if (narrated.current.has(idx) || muted) return;
    if (current.type === "quiz") return;
    const t = setTimeout(() => {
      speakText(getNarration(current), muted);
      narrated.current.add(idx);
    }, 400);
    return () => clearTimeout(t);
  }, [idx, current, muted]);

  // Stop speech on mute toggle
  useEffect(() => { if (muted) stopSpeech(); }, [muted]);
  useEffect(() => () => stopSpeech(), []);

  const navigate = useCallback((direction: "next" | "prev") => {
    if (animating) return;
    const next = direction === "next" ? idx + 1 : idx - 1;
    if (next < 0 || next >= slides.length) return;
    stopSpeech();
    setDir(direction);
    setAnimating(true);
    setQuizResult(null);
    setTimeout(() => {
      setIdx(next);
      setAnimating(false);
    }, 260);
  }, [animating, idx, slides.length]);

  const handleQuizAnswer = (correct: boolean) => {
    setQuizResult(correct);
    setTimeout(() => navigate("next"), 2200);
  };

  const renderSlide = () => {
    switch (current.type) {
      case "intro":    return <IntroSlide slide={current} subject={script.subject} muted={muted} />;
      case "concept":  return <ConceptSlide slide={current} subject={script.subject} muted={muted} />;
      case "example":  return <ExampleSlide slide={current} subject={script.subject} muted={muted} />;
      case "quiz":     return <QuizSlide slide={current} muted={muted} onAnswer={handleQuizAnswer} />;
      case "deepdive": return <DeepdiveSlide slide={current} subject={script.subject} muted={muted} />;
      case "summary":  return <SummarySlide slide={current} muted={muted} onFinish={onFinished} />;
      default:         return <ConceptSlide slide={current} subject={script.subject} muted={muted} />;
    }
  };

  return (
    <>
      <style>{`
        @keyframes slide-up { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes emoji-pop { from { opacity:0; transform:scale(0.3); } to { opacity:1; transform:scale(1); } }
        @keyframes bubble-in { from { opacity:0; transform:scale(0.7); } to { opacity:1; transform:scale(1); } }
        @keyframes slide-in-right { from { opacity:0; transform:translateX(60px); } to { opacity:1; transform:translateX(0); } }
        @keyframes slide-in-left { from { opacity:0; transform:translateX(-60px); } to { opacity:1; transform:translateX(0); } }
        @keyframes slide-out-left { from { opacity:1; transform:translateX(0); } to { opacity:0; transform:translateX(-60px); } }
        @keyframes slide-out-right { from { opacity:1; transform:translateX(0); } to { opacity:0; transform:translateX(60px); } }
      `}</style>

      <div style={{
        position: "fixed", inset: 0, zIndex: 999,
        background: "#1B1D24",
        display: "flex", flexDirection: "column",
        maxWidth: 430, margin: "0 auto",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 16px 10px",
          borderBottom: "1px solid #2a3a08",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => { stopSpeech(); onClose(); }} style={{
              background: "#ffffff12", border: "none", borderRadius: 10,
              padding: "6px", cursor: "pointer", color: "#94a3b8",
              display: "flex", alignItems: "center",
            }}>
              <X size={18} />
            </button>
            <div>
              <p style={{ color: "#72EB3A", fontWeight: 900, fontSize: 10, textTransform: "uppercase", letterSpacing: 2, margin: 0 }}>
                {script.subject}
              </p>
              <p style={{ color: "#fff", fontWeight: 700, fontSize: 13, margin: 0 }}>{script.topic}</p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={() => setMuted(m => !m)} style={{
              background: muted ? "#450a0a" : "#1C2210",
              border: `1px solid ${muted ? "#ef4444" : "#365A08"}`,
              borderRadius: 10, padding: "6px", cursor: "pointer",
              color: muted ? "#ef4444" : "#72EB3A", display: "flex",
            }}>
              {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            {!muted && (
              <button onClick={() => speakText(getNarration(current), muted)} style={{
                background: "#1C2210", border: "1px solid #365A08",
                borderRadius: 10, padding: "6px", cursor: "pointer", color: "#94a3b8", display: "flex",
              }}>
                <RotateCcw size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Progress */}
        <div style={{ padding: "10px 16px 4px", flexShrink: 0 }}>
          <ProgressDots total={slides.length} current={idx} />
        </div>

        {/* Slide area */}
        <div
          key={idx}
          style={{
            flex: 1, display: "flex", flexDirection: "column", overflow: "hidden",
            animation: animating ? "none"
              : dir === "next" ? "slide-in-right 0.28s cubic-bezier(0.4,0,0.2,1) both"
              : "slide-in-left 0.28s cubic-bezier(0.4,0,0.2,1) both",
          }}
        >
          {renderSlide()}
        </div>

        {/* Quiz feedback banner */}
        {quizResult !== null && (
          <div style={{
            position: "absolute", top: 80, left: 16, right: 16,
            background: quizResult ? "#365A08" : "#450a0a",
            border: `1px solid ${quizResult ? "#72EB3A" : "#ef4444"}`,
            borderRadius: 16, padding: "12px 16px", zIndex: 10,
            display: "flex", alignItems: "center", gap: 10,
            animation: "bubble-in 0.3s both",
          }}>
            <span style={{ fontSize: 24 }}>{quizResult ? "🎉" : "💪"}</span>
            <p style={{ color: quizResult ? "#72EB3A" : "#ef4444", fontWeight: 700, fontSize: 14, margin: 0 }}>
              {quizResult ? "Correto! Muito bem!" : "Quase! Vê a resposta correta acima."}
            </p>
          </div>
        )}

        {/* Navigation */}
        {current.type !== "quiz" && current.type !== "summary" && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 16px 20px", flexShrink: 0,
            borderTop: "1px solid #2a3a08",
          }}>
            <button onClick={() => navigate("prev")} disabled={idx === 0} style={{
              background: "#1C2210", border: "1px solid #365A08",
              borderRadius: 14, padding: "11px 20px",
              cursor: idx === 0 ? "not-allowed" : "pointer",
              opacity: idx === 0 ? 0.35 : 1,
              color: "#fff", display: "flex", alignItems: "center", gap: 6,
            }}>
              <ChevronLeft size={18} /> Anterior
            </button>

            <span style={{ color: "#72EB3A", fontWeight: 900, fontSize: 13 }}>
              {idx + 1} / {slides.length}
            </span>

            <button onClick={() => navigate("next")} disabled={idx === slides.length - 1} style={{
              background: "#72EB3A", border: "none",
              borderRadius: 14, padding: "11px 20px",
              cursor: idx === slides.length - 1 ? "not-allowed" : "pointer",
              opacity: idx === slides.length - 1 ? 0.4 : 1,
              color: "#1B1D24", fontWeight: 900, fontSize: 14,
              display: "flex", alignItems: "center", gap: 6,
            }}>
              Próximo <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

// ── Loader wrapper ─────────────────────────────────────────────────────────────

export const StoryVideoLoader: React.FC<{
  subject: string; topic: string; topicDescription?: string;
  onClose: () => void; onFinished: () => void;
}> = ({ subject, topic, topicDescription, onClose, onFinished }) => {
  const [script, setScript] = useState<StoryScript | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    import("@/lib/gemini").then(({ generateStoryScript }) =>
      generateStoryScript(subject, topic, topicDescription)
        .then(setScript)
        .catch(() => setError(true))
    );
  }, [subject, topic, topicDescription]);

  if (error) return (
    <div style={{ position: "fixed", inset: 0, zIndex: 999, background: "#1B1D24", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
      <span style={{ fontSize: 48 }}>😔</span>
      <p style={{ color: "#ef4444", fontWeight: 900, fontSize: 16 }}>Erro ao gerar lição</p>
      <button onClick={onClose} style={{ background: "#72EB3A", color: "#1B1D24", border: "none", borderRadius: 12, padding: "10px 24px", fontWeight: 900, cursor: "pointer", fontSize: 14 }}>Fechar</button>
    </div>
  );

  if (!script) return (
    <div style={{ position: "fixed", inset: 0, zIndex: 999, background: "#1B1D24", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
      <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "#ffffff12", border: "none", borderRadius: 10, padding: 8, cursor: "pointer", color: "#94a3b8" }}>
        <X size={20} />
      </button>
      <div style={{ fontSize: 72 }}>✨</div>
      <Loader2 size={36} color="#72EB3A" style={{ animation: "spin 1s linear infinite" }} />
      <div style={{ textAlign: "center" }}>
        <p style={{ color: "#fff", fontWeight: 900, fontSize: 16, margin: "0 0 6px" }}>A preparar a tua lição...</p>
        <p style={{ color: "#72EB3A", fontSize: 13, margin: 0 }}>{topic} · {subject}</p>
      </div>
    </div>
  );

  return <StorySlideshow script={script} onClose={onClose} onFinished={onFinished} />;
};
