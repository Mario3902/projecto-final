import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Volume2, VolumeX, ChevronLeft, ChevronRight, RotateCcw, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { StorySlide, StoryScript, StoryQuizOption } from "@/lib/gemini";
import { NziAnimator, NziPose, poseToPose } from "./scenes/NziAnimator";
import { SceneBackground, getSceneForSubject } from "./scenes/SceneBackgrounds";

// ── TTS ────────────────────────────────────────────────────────────────────────
import { speak as ttsSpeak, stopSpeech as ttsStop } from "@/lib/tts";

function narrate(text: string, muted: boolean, onEnd?: () => void) {
  if (muted) { onEnd?.(); return; }
  ttsSpeak(text, onEnd);
}

function stopNarration() { ttsStop(); }

function getSlideNarration(slide: StorySlide): string {
  if (slide.type === "quiz") return `Desafio! ${slide.quizQuestion ?? ""}`;
  if (slide.type === "summary") return (slide.keyPoints ?? []).join(". ");
  return `${slide.title}. ${slide.body}. ${slide.funFact ? "Facto curioso: " + slide.funFact : ""}`;
}

// ── Word-reveal text ───────────────────────────────────────────────────────────

const RevealText: React.FC<{ text: string; highlight?: string; color?: string; fontSize?: number; delay?: number; maxLines?: number }> = ({
  text, highlight = "", color = "#e2e8f0", fontSize = 13, delay = 0, maxLines,
}) => {
  const [count, setCount] = useState(0);
  const words = text.split(" ");
  useEffect(() => {
    setCount(0);
    const t = setTimeout(() => {
      const id = setInterval(() => setCount(c => { if (c >= words.length) { clearInterval(id); return c; } return c + 1; }), 70);
      return () => clearInterval(id);
    }, delay);
    return () => clearTimeout(t);
  }, [text, delay, words.length]);

  return (
    <p style={{ fontSize, color, lineHeight: 1.55, margin: 0, fontFamily: "system-ui, sans-serif", ...(maxLines ? { overflow: "hidden", maxHeight: fontSize * 1.55 * maxLines } : {}) }}>
      {words.map((w, i) => {
        const isKey = highlight && w.toLowerCase().replace(/\W/g, "").includes(highlight.toLowerCase().replace(/\W/g, ""));
        return (
          <motion.span key={i}
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: i < count ? 1 : 0, y: i < count ? 0 : 4 }}
            transition={{ duration: 0.12 }}
            style={{ marginRight: 4, display: "inline-block", color: isKey ? "#72EB3A" : color, fontWeight: isKey ? 800 : 400 }}>
            {w}
          </motion.span>
        );
      })}
    </p>
  );
};

// ── Speech Bubble ──────────────────────────────────────────────────────────────

const Bubble: React.FC<{ text: string; side?: "left" | "right"; color?: string; maxWidth?: number }> = ({
  text, side = "left", color = "#fff", maxWidth = 170,
}) => (
  <motion.div
    initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
    style={{
      background: color, borderRadius: 14, padding: "6px 11px",
      maxWidth, position: "relative", boxShadow: "0 4px 16px #00000050",
    }}
  >
    <p style={{ color: color === "#fff" ? "#1B1D24" : "#fff", fontSize: 11.5, fontWeight: 700, margin: 0, lineHeight: 1.3, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" } as React.CSSProperties}>
      {text}
    </p>
    <div style={{
      position: "absolute", bottom: -7,
      [side === "left" ? "left" : "right"]: 14,
      width: 0, height: 0,
      borderLeft: "7px solid transparent", borderRight: "7px solid transparent",
      borderTop: `7px solid ${color}`,
    }} />
  </motion.div>
);

// ── Progress bar (segments) ────────────────────────────────────────────────────

const SegmentBar: React.FC<{ total: number; current: number; elapsed: number; duration: number }> = ({
  total, current, elapsed, duration,
}) => (
  <div style={{ display: "flex", gap: 3, padding: "0 16px" }}>
    {Array.from({ length: total }).map((_, i) => (
      <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: "#2a3a08", overflow: "hidden", position: "relative" }}>
        {i < current && <div style={{ position: "absolute", inset: 0, background: "#72EB3A" }} />}
        {i === current && (
          <motion.div style={{ position: "absolute", inset: 0, background: "#72EB3A", originX: 0 }}
            initial={{ scaleX: elapsed / duration }} animate={{ scaleX: 1 }}
            transition={{ duration: duration - elapsed, ease: "linear" }} />
        )}
      </div>
    ))}
  </div>
);

// ── SCENE OVERLAYS ─────────────────────────────────────────────────────────────

// Animated label that appears over the scene
const SceneLabel: React.FC<{ icon: string; text: string; color: string }> = ({ icon, text, color }) => (
  <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
    style={{
      position: "absolute", top: 14, left: 14, zIndex: 10,
      background: `${color}22`, border: `1px solid ${color}66`,
      borderRadius: 12, padding: "4px 12px", backdropFilter: "blur(4px)",
    }}>
    <span style={{ color, fontWeight: 900, fontSize: 11, textTransform: "uppercase", letterSpacing: 2 }}>
      {icon} {text}
    </span>
  </motion.div>
);

// Content card overlay
const ContentCard: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
    style={{
      background: "rgba(10,20,12,0.88)",
      border: "1px solid #365A08",
      borderRadius: 22,
      padding: "18px 20px",
      backdropFilter: "blur(12px)",
      ...style,
    }}>
    {children}
  </motion.div>
);

// Fun fact card
const FunFactCard: React.FC<{ text: string }> = ({ text }) => (
  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }}
    style={{
      background: "#72EB3A12", border: "1px solid #72EB3A40",
      borderLeft: "3px solid #72EB3A", borderRadius: 12, padding: "8px 12px",
    }}>
    <p style={{ color: "#72EB3A", fontWeight: 900, fontSize: 9, textTransform: "uppercase", letterSpacing: 2, margin: "0 0 3px" }}>💡 Sabia que...</p>
    <p style={{ color: "#a7f3d0", fontSize: 12, margin: 0, lineHeight: 1.45, overflow: "hidden", maxHeight: 52 }}>{text}</p>
  </motion.div>
);

// ── SLIDE RENDERS ──────────────────────────────────────────────────────────────

const IntroFrame: React.FC<{ slide: StorySlide; subject: string; sceneType: any; muted: boolean }> = ({ slide, subject, sceneType, muted }) => (
  <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
    <SceneBackground type={sceneType} />
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 30%, #141a08e0 100%)" }} />

    <SceneLabel icon="🎬" text={subject} color="#72EB3A" />

    {/* Nzi center top with bubble */}
    <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 32, gap: 6 }}>
      <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}>
        <NziAnimator pose="waving" size={86} onClick={() => narrate(getSlideNarration(slide), muted)} />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <Bubble text={slide.nziSpeech} />
      </motion.div>
    </div>

    {/* Content at bottom */}
    <div style={{ position: "relative", zIndex: 2, padding: "0 16px 12px", marginTop: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
      <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        style={{ color: "#fff", fontSize: 20, fontWeight: 900, margin: 0, lineHeight: 1.2, textShadow: "0 2px 10px #000" }}>
        {slide.title}
      </motion.h1>
      <ContentCard style={{ padding: "12px 14px" }}>
        <RevealText text={slide.body} highlight={slide.highlight} delay={600} fontSize={13} maxLines={4} />
      </ContentCard>
      {slide.funFact && <FunFactCard text={slide.funFact} />}
    </div>
  </div>
);

const ConceptFrame: React.FC<{ slide: StorySlide; subject: string; sceneType: any; muted: boolean }> = ({ slide, subject, sceneType, muted }) => (
  <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
    <SceneBackground type={sceneType} />
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #141a0866 0%, #141a08f2 55%)" }} />
    <SceneLabel icon="💡" text="Conceito" color="#60a5fa" />

    {/* Bottom: Nzi + content in flex row — no absolute pixel hacks */}
    <div style={{ position: "relative", zIndex: 2, marginTop: "auto", padding: "0 14px 16px" }}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, type: "spring", stiffness: 180 }}
        style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>

        {/* Nzi column */}
        <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <motion.div initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7 }}>
            <Bubble text={slide.nziSpeech} />
          </motion.div>
          <motion.div initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2, type: "spring" }}>
            <NziAnimator pose="pointing" size={76} onClick={() => narrate(getSlideNarration(slide), muted)} />
          </motion.div>
        </div>

        {/* Content card */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
          style={{ flex: 1, background: "rgba(8,20,10,0.92)", border: "1px solid #365A08", borderRadius: 18, padding: "11px 13px", backdropFilter: "blur(16px)" }}>
          <p style={{ color: "#60a5fa", fontWeight: 900, fontSize: 8.5, textTransform: "uppercase", letterSpacing: 2, margin: "0 0 4px" }}>{subject}</p>
          <h2 style={{ color: "#fff", fontSize: 15, fontWeight: 900, margin: "0 0 7px", lineHeight: 1.2 }}>{slide.title}</h2>
          <RevealText text={slide.body} highlight={slide.highlight} delay={500} fontSize={12.5} maxLines={5} />
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
            style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 7 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#72EB3A", flexShrink: 0 }} />
            <span style={{ color: "#72EB3A", fontWeight: 900, fontSize: 10.5 }}>{slide.highlight}</span>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  </div>
);

const ExampleFrame: React.FC<{ slide: StorySlide; subject: string; sceneType: any; muted: boolean }> = ({ slide, subject, sceneType, muted }) => (
  <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
    <SceneBackground type={sceneType} />
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #141a0866 0%, #141a08f5 60%)" }} />

    <SceneLabel icon="📌" text="Exemplo Prático" color="#fbbf24" />

    {/* Big emoji floating top-left (away from Nzi on right) */}
    <motion.div style={{ position: "absolute", top: 28, left: 16, zIndex: 3, fontSize: 60, lineHeight: 1 }}
      animate={{ y: [0, -8, 0], rotate: [-3, 3, -3] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
      {slide.emoji}
    </motion.div>

    {/* Bottom: content card + Nzi in flex row — no absolute pixel hacks */}
    <div style={{ position: "relative", zIndex: 2, marginTop: "auto", padding: "0 14px 16px" }}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, type: "spring", stiffness: 180 }}
        style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>

        {/* Content card */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
          style={{ flex: 1, background: "rgba(12,8,0,0.90)", border: "1px solid #78350f44", borderLeft: "4px solid #fbbf24", borderRadius: 20, padding: "14px 16px", backdropFilter: "blur(16px)" }}>
          <p style={{ color: "#fbbf24", fontWeight: 900, fontSize: 10, textTransform: "uppercase", letterSpacing: 2, margin: "0 0 6px" }}>
            Exemplo Real
          </p>
          <h2 style={{ color: "#fff", fontSize: 15, fontWeight: 900, margin: "0 0 7px" }}>{slide.title}</h2>
          <RevealText text={slide.body} highlight={slide.highlight} color="#fde68a" delay={500} fontSize={12.5} maxLines={5} />
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
            style={{ display: "inline-block", marginTop: 7, background: "#fbbf2420", border: "1px solid #fbbf24", borderRadius: 10, padding: "2px 10px", color: "#fbbf24", fontWeight: 900, fontSize: 10.5 }}>
            ✨ {slide.highlight}
          </motion.span>
        </motion.div>

        {/* Nzi column on right with bubble above */}
        <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <motion.div initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 }}>
            <Bubble text={slide.nziSpeech} side="right" />
          </motion.div>
          <motion.div initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3, type: "spring" }}>
            <NziAnimator pose="jumping" size={76} flipX onClick={() => narrate(getSlideNarration(slide), muted)} />
          </motion.div>
        </div>

      </motion.div>
    </div>
  </div>
);

const QuizFrame: React.FC<{ slide: StorySlide; onAnswer: (c: boolean) => void; muted: boolean }> = ({ slide, onAnswer, muted }) => {
  const [sel, setSel] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const opts = slide.quizOptions ?? [];

  const pick = (i: number) => {
    if (done) return;
    setSel(i); setDone(true);
    const ok = opts[i]?.correct ?? false;
    narrate(ok ? "Correto! Excelente raciocínio!" : `Não desta vez. A resposta certa é: ${opts.find(o => o.correct)?.text}`, muted);
    setTimeout(() => onAnswer(ok), 2500);
  };

  return (
    <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", padding: "12px 14px", gap: 8, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #141a08 0%, #0f0a1a 100%)" }} />

      <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        {/* Nzi with bubble */}
        <div style={{ display: "flex", justifyContent: "center", gap: 12, alignItems: "flex-end" }}>
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}>
            <NziAnimator pose="explaining" size={80} onClick={() => narrate(slide.quizQuestion ?? "", muted)} />
          </motion.div>
          <div style={{ paddingBottom: 14 }}>
            <Bubble text={slide.nziSpeech} />
          </div>
        </div>

        {/* Question card */}
        <ContentCard style={{ padding: "10px 13px" }}>
          <p style={{ color: "#60a5fa", fontWeight: 900, fontSize: 9, textTransform: "uppercase", letterSpacing: 2, margin: "0 0 5px" }}>🧠 Pergunta</p>
          <p style={{ color: "#fff", fontSize: 14, fontWeight: 700, margin: 0, lineHeight: 1.4 }}>{slide.quizQuestion}</p>
        </ContentCard>

        {/* Options */}
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {opts.map((opt, i) => {
            const picked = sel === i;
            const correct = opt.correct;
            let bg = "rgba(10,20,12,0.7)", border = "#365A08", color = "#e2e8f0";
            if (done && picked && correct) { bg = "rgba(20,83,45,0.9)"; border = "#72EB3A"; color = "#72EB3A"; }
            else if (done && picked && !correct) { bg = "rgba(69,10,10,0.9)"; border = "#ef4444"; color = "#ef4444"; }
            else if (done && correct) { bg = "rgba(20,83,45,0.4)"; border = "#72EB3A55"; color = "#a7f3d0"; }

            return (
              <motion.button key={i} onClick={() => pick(i)} disabled={done}
                whileHover={!done ? { scale: 1.02, borderColor: "#72EB3A66" } : {}}
                whileTap={!done ? { scale: 0.97 } : {}}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 + 0.3 }}
                style={{
                  background: bg, border: `2px solid ${border}`, borderRadius: 13,
                  padding: "9px 12px", cursor: done ? "default" : "pointer",
                  display: "flex", alignItems: "center", gap: 10,
                  backdropFilter: "blur(8px)",
                }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", flexShrink: 0, background: done && correct ? "#72EB3A" : done && picked ? "#ef4444" : "#2a3a08", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {done && correct ? <CheckCircle2 size={13} color="#1B1D24" />
                    : done && picked ? <XCircle size={13} color="#fff" />
                    : <span style={{ color: "#72EB3A", fontWeight: 900, fontSize: 11 }}>{["A", "B", "C"][i]}</span>}
                </div>
                <span style={{ color, fontSize: 13, fontWeight: 600, textAlign: "left", lineHeight: 1.35 }}>{opt.text}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const DeepdiveFrame: React.FC<{ slide: StorySlide; subject: string; sceneType: any; muted: boolean }> = ({ slide, subject, sceneType, muted }) => {
  const steps = slide.body.split(/(?<=[.!?])\s+/).filter(s => s.length > 8);

  return (
    <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <SceneBackground type={sceneType} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #141a0888 0%, #141a08f8 55%)" }} />

      <SceneLabel icon="⚙️" text="Mecanismo" color="#a78bfa" />

      {/* Nzi top-right with bubble — flex column, no negative offsets */}
      <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "flex-end", padding: "30px 10px 0" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <motion.div initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7 }}>
            <Bubble text={slide.nziSpeech} side="right" maxWidth={150} />
          </motion.div>
          <motion.div initial={{ x: 80, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2, type: "spring" }}>
            <NziAnimator pose="writing" size={70} flipX onClick={() => narrate(getSlideNarration(slide), muted)} />
          </motion.div>
        </div>
      </div>

      {/* Steps pushed to bottom */}
      <div style={{ position: "relative", zIndex: 2, flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "0 14px 14px", gap: 7 }}>
        <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          style={{ color: "#fff", fontSize: 16, fontWeight: 900, margin: "0 0 4px" }}>{slide.title}</motion.h2>
        {steps.slice(0, 3).map((step, i) => {
          const colors = ["#72EB3A", "#60a5fa", "#a78bfa"];
          const c = colors[i % 3];
          return (
            <motion.div key={i}
              initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.2, type: "spring" }}
              style={{ background: "rgba(8,18,10,0.88)", border: `1px solid ${c}44`, borderLeft: `3px solid ${c}`, borderRadius: 12, padding: "8px 12px", display: "flex", gap: 10, backdropFilter: "blur(8px)" }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: `${c}22`, border: `2px solid ${c}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ color: c, fontWeight: 900, fontSize: 10 }}>{i + 1}</span>
              </div>
              <p style={{ color: "#d1fae5", fontSize: 12.5, margin: 0, lineHeight: 1.45 }}>{step}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

const SummaryFrame: React.FC<{ slide: StorySlide; onFinish: () => void; muted: boolean }> = ({ slide, onFinish, muted }) => {
  const [vis, setVis] = useState(0);
  const pts = slide.keyPoints ?? [];
  useEffect(() => { pts.forEach((_, i) => setTimeout(() => setVis(v => Math.max(v, i + 1)), 500 + i * 600)); }, [pts.length]);

  return (
    <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", padding: "12px 14px 14px", gap: 8, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #050e08 0%, #0f0a1a 100%)" }} />

      {/* Confetti bg */}
      {["#72EB3A", "#fbbf24", "#60a5fa", "#a78bfa", "#f472b6"].map((c, i) => (
        <motion.div key={i} style={{ position: "absolute", top: 0, left: `${10 + i * 18}%`, width: 5, height: 5, background: c, borderRadius: 2, zIndex: 1 }}
          animate={{ y: [0, 340], rotate: [0, 720], opacity: [1, 0] }}
          transition={{ duration: 3, repeat: Infinity, delay: i * 0.4, ease: "linear" }} />
      ))}

      <div style={{ position: "relative", zIndex: 2, flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        {/* Nzi celebrating */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}>
            <NziAnimator pose="celebrating" size={82} onClick={() => narrate(getSlideNarration(slide), muted)} />
          </motion.div>
          <Bubble text={slide.nziSpeech} />
        </div>

        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} style={{ textAlign: "center" }}>
          <p style={{ color: "#a78bfa", fontWeight: 900, fontSize: 9, textTransform: "uppercase", letterSpacing: 3, margin: "0 0 2px" }}>Lição completa!</p>
          <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 900, margin: 0 }}>{slide.title}</h2>
        </motion.div>

        {/* Key points */}
        <div style={{ display: "flex", flexDirection: "column", gap: 7, flex: 1 }}>
          {pts.map((pt, i) => {
            const c = ["#72EB3A", "#60a5fa", "#a78bfa"][i % 3];
            return (
              <motion.div key={i}
                animate={{ opacity: i < vis ? 1 : 0, x: i < vis ? 0 : -30 }}
                transition={{ type: "spring", stiffness: 200 }}
                style={{ background: "rgba(8,18,10,0.8)", border: `1px solid ${c}30`, borderLeft: `3px solid ${c}`, borderRadius: 12, padding: "9px 12px", display: "flex", gap: 10 }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: c, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "#1B1D24", fontWeight: 900, fontSize: 11 }}>✓</span>
                </div>
                <p style={{ color: "#e2e8f0", fontSize: 13, margin: 0, lineHeight: 1.4 }}>{pt}</p>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <AnimatePresence>
          {vis >= pts.length && (
            <motion.button onClick={onFinish}
              initial={{ opacity: 0, scale: 0.8, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0 }} transition={{ type: "spring", stiffness: 300 }}
              style={{ background: "#72EB3A", color: "#1B1D24", border: "none", borderRadius: 16, padding: "12px", fontWeight: 900, fontSize: 14, cursor: "pointer", width: "100%" }}>
              🎯 Fazer o Quiz Final
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ── MAIN PLAYER ────────────────────────────────────────────────────────────────

interface PlayerProps { script: StoryScript; onClose: () => void; onFinished: () => void; }

const SLIDE_DURATION = 12; // seconds per slide (auto-advance)

export const StoryPlayer: React.FC<PlayerProps> = ({ script, onClose, onFinished }) => {
  const slides = script.slides;
  const [idx, setIdx] = useState(0);
  const [muted, setMuted] = useState(false);
  const [dir, setDir] = useState<1 | -1>(1);
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const [quizResult, setQuizResult] = useState<boolean | null>(null);
  const narrated = useRef(new Set<number>());

  const sceneType = getSceneForSubject(script.subject);
  const current = slides[idx];
  const isQuiz = current.type === "quiz";
  const isSummary = current.type === "summary";

  // Auto-narrate on slide change
  useEffect(() => {
    if (narrated.current.has(idx) || muted || isQuiz) return;
    const t = setTimeout(() => {
      narrate(getSlideNarration(current), muted);
      narrated.current.add(idx);
    }, 600);
    return () => clearTimeout(t);
  }, [idx, muted, current, isQuiz]);

  // Auto-advance timer — Date.now() based to avoid stale closure drift
  useEffect(() => {
    if (paused || isQuiz || isSummary) { setElapsed(0); return; }
    setElapsed(0);
    const t0 = Date.now();
    const id = setInterval(() => {
      const e = (Date.now() - t0) / 1000;
      if (e >= SLIDE_DURATION) {
        clearInterval(id);
        if (idx < slides.length - 1) {
          stopNarration();
          setDir(1);
          setQuizResult(null);
          setElapsed(0);
          setIdx(idx + 1);
        }
      } else {
        setElapsed(e);
      }
    }, 200);
    return () => clearInterval(id);
  }, [idx, paused, isQuiz, isSummary, slides.length]);

  // Mute
  useEffect(() => { if (muted) stopNarration(); }, [muted]);
  useEffect(() => () => stopNarration(), []);

  const goTo = useCallback((next: number, d: 1 | -1) => {
    if (next < 0 || next >= slides.length) return;
    stopNarration();
    setDir(d);
    setQuizResult(null);
    setElapsed(0);
    setIdx(next);
  }, [slides.length]);

  const handleQuizAnswer = (correct: boolean) => {
    setQuizResult(correct);
    setTimeout(() => goTo(idx + 1, 1), 2500);
  };

  const renderFrame = () => {
    switch (current.type) {
      case "intro":    return <IntroFrame slide={current} subject={script.subject} sceneType={sceneType} muted={muted} />;
      case "concept":  return <ConceptFrame slide={current} subject={script.subject} sceneType={sceneType} muted={muted} />;
      case "example":  return <ExampleFrame slide={current} subject={script.subject} sceneType={sceneType} muted={muted} />;
      case "quiz":     return <QuizFrame slide={current} onAnswer={handleQuizAnswer} muted={muted} />;
      case "deepdive": return <DeepdiveFrame slide={current} subject={script.subject} sceneType={sceneType} muted={muted} />;
      case "summary":  return <SummaryFrame slide={current} onFinish={onFinished} muted={muted} />;
      default:         return <ConceptFrame slide={current} subject={script.subject} sceneType={sceneType} muted={muted} />;
    }
  };

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0 }),
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 999,
      background: "#050e08",
      display: "flex", flexDirection: "column",
      maxWidth: 430, margin: "0 auto",
      fontFamily: "system-ui, -apple-system, sans-serif",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", padding: "10px 14px 6px", gap: 10, flexShrink: 0, zIndex: 20 }}>
        <button onClick={() => { stopNarration(); onClose(); }} style={{ background: "#ffffff12", border: "none", borderRadius: 10, padding: 7, cursor: "pointer", color: "#94a3b8", display: "flex" }}>
          <X size={18} />
        </button>
        <div style={{ flex: 1 }}>
          <p style={{ color: "#72EB3A", fontWeight: 900, fontSize: 10, textTransform: "uppercase", letterSpacing: 2, margin: 0 }}>{script.subject}</p>
          <p style={{ color: "#fff", fontWeight: 700, fontSize: 13, margin: 0 }}>{script.topic}</p>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {!isQuiz && !isSummary && (
            <button onClick={() => setPaused(p => !p)} style={{ background: "#1C2210", border: "1px solid #365A08", borderRadius: 10, padding: "6px 10px", cursor: "pointer", color: "#94a3b8", fontSize: 11, fontWeight: 700 }}>
              {paused ? "▶" : "⏸"}
            </button>
          )}
          <button onClick={() => { narrated.current.delete(idx); narrate(getSlideNarration(current), muted); }}
            style={{ background: "#1C2210", border: "1px solid #365A08", borderRadius: 10, padding: 7, cursor: "pointer", color: "#94a3b8", display: "flex" }}>
            <RotateCcw size={15} />
          </button>
          <button onClick={() => setMuted(m => !m)} style={{ background: muted ? "#450a0a" : "#1C2210", border: `1px solid ${muted ? "#ef4444" : "#365A08"}`, borderRadius: 10, padding: 7, cursor: "pointer", color: muted ? "#ef4444" : "#72EB3A", display: "flex" }}>
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>
      </div>

      {/* Progress */}
      <div style={{ flexShrink: 0, paddingBottom: 6, zIndex: 20 }}>
        <SegmentBar total={slides.length} current={idx} elapsed={elapsed} duration={SLIDE_DURATION} />
      </div>

      {/* Slide area */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <AnimatePresence custom={dir} mode="wait">
          <motion.div key={idx} custom={dir}
            variants={slideVariants} initial="enter" animate="center" exit="exit"
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
            {renderFrame()}
          </motion.div>
        </AnimatePresence>

        {/* Quiz result banner */}
        <AnimatePresence>
          {quizResult !== null && (
            <motion.div initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -60, opacity: 0 }}
              style={{ position: "absolute", top: 12, left: 14, right: 14, zIndex: 30,
                background: quizResult ? "#365A08" : "#450a0a",
                border: `1px solid ${quizResult ? "#72EB3A" : "#ef4444"}`,
                borderRadius: 16, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10,
                backdropFilter: "blur(12px)",
              }}>
              <span style={{ fontSize: 22 }}>{quizResult ? "🎉" : "💪"}</span>
              <p style={{ color: quizResult ? "#72EB3A" : "#ef4444", fontWeight: 700, fontSize: 14, margin: 0 }}>
                {quizResult ? "Correto! Incrível raciocínio!" : "Quase! Vê a resposta destacada acima."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      {!isSummary && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px 20px", flexShrink: 0, borderTop: "1px solid #2a3a08", zIndex: 20 }}>
          <button onClick={() => goTo(idx - 1, -1)} disabled={idx === 0}
            style={{ background: "#1C2210", border: "1px solid #365A08", borderRadius: 14, padding: "11px 18px", cursor: idx === 0 ? "not-allowed" : "pointer", opacity: idx === 0 ? 0.3 : 1, color: "#fff", display: "flex", alignItems: "center", gap: 6 }}>
            <ChevronLeft size={18} />
            <span style={{ fontWeight: 700, fontSize: 13 }}>Anterior</span>
          </button>

          <div style={{ display: "flex", gap: 4 }}>
            {slides.map((_, i) => (
              <motion.div key={i}
                animate={{ width: i === idx ? 22 : 7, background: i === idx ? "#72EB3A" : i < idx ? "#72EB3A55" : "#2a3a08" }}
                transition={{ duration: 0.3 }}
                style={{ height: 7, borderRadius: 4, cursor: "pointer" }}
                onClick={() => goTo(i, i > idx ? 1 : -1)} />
            ))}
          </div>

          <button onClick={() => isQuiz ? undefined : goTo(idx + 1, 1)} disabled={isQuiz || idx === slides.length - 1}
            style={{ background: isQuiz ? "#1C2210" : "#72EB3A", border: "none", borderRadius: 14, padding: "11px 18px", cursor: (isQuiz || idx === slides.length - 1) ? "not-allowed" : "pointer", opacity: (isQuiz || idx === slides.length - 1) ? 0.4 : 1, color: isQuiz ? "#94a3b8" : "#1B1D24", fontWeight: 900, fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
            <span>{isQuiz ? "Responde" : "Próximo"}</span>
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

// ── Loader ─────────────────────────────────────────────────────────────────────

export const StoryVideoLoader: React.FC<{
  subject: string; topic: string; topicDescription?: string;
  onClose: () => void; onFinished: () => void;
}> = ({ subject, topic, topicDescription, onClose, onFinished }) => {
  const [script, setScript] = useState<StoryScript | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    import("@/lib/gemini").then(({ generateStoryScript }) =>
      generateStoryScript(subject, topic, topicDescription).then(setScript).catch(() => setError(true))
    );
  }, [subject, topic, topicDescription]);

  if (error) return (
    <div style={{ position: "fixed", inset: 0, zIndex: 999, background: "#050e08", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18 }}>
      <span style={{ fontSize: 56 }}>😔</span>
      <p style={{ color: "#ef4444", fontWeight: 900, fontSize: 17, margin: 0 }}>Erro ao gerar lição</p>
      <button onClick={onClose} style={{ background: "#72EB3A", color: "#1B1D24", border: "none", borderRadius: 14, padding: "12px 28px", fontWeight: 900, fontSize: 14, cursor: "pointer" }}>Fechar</button>
    </div>
  );

  if (!script) return (
    <div style={{ position: "fixed", inset: 0, zIndex: 999, background: "#050e08", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18 }}>
      <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "#ffffff12", border: "none", borderRadius: 10, padding: 8, cursor: "pointer", color: "#94a3b8", display: "flex" }}><X size={20} /></button>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
        <Loader2 size={40} color="#72EB3A" />
      </motion.div>
      <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <NziAnimator pose="thinking" size={90} />
        <p style={{ color: "#fff", fontWeight: 900, fontSize: 16, margin: 0 }}>A preparar a tua lição animada...</p>
        <p style={{ color: "#72EB3A", fontSize: 13, margin: 0 }}>{topic} · {subject}</p>
      </div>
    </div>
  );

  return <StoryPlayer script={script} onClose={onClose} onFinished={onFinished} />;
};
