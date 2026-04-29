import React, { useState } from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Sequence } from "remotion";
import { StoryScene } from "@/lib/gemini";
import { NziSVG } from "@/components/nzi/NziCharacter";
import type { NziExpression } from "@/context/NziContext";

// ── Image with fallback ────────────────────────────────────────────────────────

const SUBJECT_COLORS: Record<string, string> = {
  matemática: "#72EB3A", física: "#60a5fa", química: "#a78bfa",
  biologia: "#34d399", história: "#fb923c", geografia: "#22d3ee",
  português: "#f472b6", inglês: "#fbbf24",
};

const SceneImage: React.FC<{ keyword: string; subject: string; opacity?: number }> = ({
  keyword, subject, opacity = 1,
}) => {
  const [err, setErr] = useState(false);
  const color = Object.entries(SUBJECT_COLORS).find(([k]) =>
    subject.toLowerCase().includes(k)
  )?.[1] ?? "#72EB3A";

  if (err) {
    return (
      <div style={{
        width: "100%", height: "100%",
        background: `radial-gradient(ellipse at 30% 40%, ${color}22 0%, #1B1D24 70%)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        opacity,
      }}>
        <div style={{ fontSize: 72, opacity: 0.25 }}>🌍</div>
      </div>
    );
  }

  return (
    <img
      src={`https://source.unsplash.com/800x450/?${encodeURIComponent(keyword)}`}
      alt=""
      onError={() => setErr(true)}
      style={{
        width: "100%", height: "100%",
        objectFit: "cover",
        opacity,
        display: "block",
      }}
    />
  );
};

// ── Nzi with float animation ───────────────────────────────────────────────────

const AnimatedNzi: React.FC<{
  expression: NziExpression;
  size: number;
  frame: number;
  style?: React.CSSProperties;
}> = ({ expression, size, frame, style }) => {
  const floatY = Math.sin((frame / 22) * Math.PI) * 5;
  const rotate = expression === "waving"
    ? Math.sin((frame / 12) * Math.PI) * 4
    : expression === "excited"
    ? Math.sin((frame / 8) * Math.PI) * 3
    : 0;

  return (
    <div style={{
      transform: `translateY(${floatY}px) rotate(${rotate}deg)`,
      transition: "none",
      ...style,
    }}>
      <NziSVG expression={expression} size={size} />
    </div>
  );
};

// ── Speech Bubble ──────────────────────────────────────────────────────────────

const SpeechBubble: React.FC<{
  text: string;
  frame: number;
  startFrame?: number;
  side?: "left" | "right";
}> = ({ text, frame, startFrame = 0, side = "left" }) => {
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - startFrame, fps, config: { damping: 18, stiffness: 130 } });
  const opacity = interpolate(frame - startFrame, [0, 8], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const scaleX = interpolate(s, [0, 1], [0.7, 1]);
  const translateX = side === "left"
    ? interpolate(s, [0, 1], [-20, 0])
    : interpolate(s, [0, 1], [20, 0]);

  return (
    <div style={{
      opacity,
      transform: `scaleX(${scaleX}) translateX(${translateX}px)`,
      transformOrigin: side === "left" ? "left center" : "right center",
      background: "#ffffff",
      borderRadius: 14,
      padding: "8px 13px",
      maxWidth: 200,
      position: "relative",
      boxShadow: "0 4px 20px #00000040",
    }}>
      <p style={{
        color: "#1B1D24", fontSize: 13, fontWeight: 700,
        margin: 0, lineHeight: 1.35, fontFamily: "system-ui, sans-serif",
      }}>
        {text}
      </p>
      {/* Tail */}
      <div style={{
        position: "absolute",
        bottom: -8,
        [side]: 16,
        width: 0, height: 0,
        borderLeft: "7px solid transparent",
        borderRight: "7px solid transparent",
        borderTop: "8px solid white",
      }} />
    </div>
  );
};

// ── Animated text (word by word) ───────────────────────────────────────────────

const RevealText: React.FC<{
  text: string;
  highlight: string;
  frame: number;
  startFrame?: number;
  fontSize?: number;
  color?: string;
}> = ({ text, highlight, frame, startFrame = 0, fontSize = 17, color = "#e2e8f0" }) => {
  const words = text.split(" ");
  const visibleCount = Math.floor(
    interpolate(frame - startFrame, [0, Math.max(words.length * 2.5, 20)], [0, words.length], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    })
  );

  return (
    <p style={{
      color, fontSize, lineHeight: 1.65, margin: 0,
      fontFamily: "system-ui, sans-serif",
      textAlign: "left",
    }}>
      {words.map((word, i) => {
        const isKey = word.toLowerCase().replace(/[^a-záéíóúàâãêôç]/g, "")
          .includes(highlight.toLowerCase().replace(/[^a-záéíóúàâãêôç]/g, ""));
        return (
          <span key={i} style={{
            opacity: i < visibleCount ? 1 : 0,
            color: isKey ? "#72EB3A" : color,
            fontWeight: isKey ? 900 : 400,
            marginRight: 4,
            display: "inline-block",
            transition: "opacity 0.12s",
          }}>
            {word}
          </span>
        );
      })}
    </p>
  );
};

// ── Keyword badge ──────────────────────────────────────────────────────────────

const KeyBadge: React.FC<{ text: string; frame: number; startFrame?: number; color?: string }> = ({
  text, frame, startFrame = 0, color = "#72EB3A",
}) => {
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - startFrame, fps, config: { damping: 14, stiffness: 120 } });
  const opacity = interpolate(frame - startFrame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: `${color}15`,
      border: `1.5px solid ${color}`,
      borderRadius: 20,
      padding: "5px 14px",
      opacity,
      transform: `scale(${interpolate(s, [0, 1], [0.85, 1])})`,
    }}>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />
      <span style={{
        color, fontWeight: 900, fontSize: 13,
        fontFamily: "system-ui, sans-serif",
      }}>
        {text}
      </span>
    </div>
  );
};

// ── TITLE SCENE ────────────────────────────────────────────────────────────────

const TitleScene: React.FC<{ scene: StoryScene; subject: string }> = ({ scene, subject }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const color = Object.entries(SUBJECT_COLORS).find(([k]) =>
    subject.toLowerCase().includes(k)
  )?.[1] ?? "#72EB3A";

  const titleSpring = spring({ frame: frame - 8, fps, config: { damping: 14, stiffness: 100 } });
  const bodyOpacity = interpolate(frame, [18, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const nziSpring = spring({ frame: frame - 4, fps, config: { damping: 16, stiffness: 90 } });
  const nziY = interpolate(nziSpring, [0, 1], [80, 0]);
  const nziOpacity = interpolate(frame, [4, 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Decorative particles
  const particles = [
    { x: 12, y: 20, size: 8 }, { x: 78, y: 15, size: 6 },
    { x: 5, y: 65, size: 5 }, { x: 85, y: 70, size: 7 },
    { x: 50, y: 8, size: 5 }, { x: 22, y: 85, size: 6 },
  ];

  return (
    <AbsoluteFill style={{
      background: `radial-gradient(ellipse at 50% 30%, ${color}18 0%, #1B1D24 65%)`,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "32px 28px",
      fontFamily: "system-ui, sans-serif",
      overflow: "hidden",
    }}>
      {/* Background image (blurred, low opacity) */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0 }}>
        <SceneImage keyword={scene.imageKeyword} subject={subject} opacity={0.08} />
      </div>

      {/* Particles */}
      {particles.map((p, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${p.x}%`, top: `${p.y}%`,
          width: p.size, height: p.size,
          borderRadius: "50%",
          background: color,
          opacity: 0.15 + (Math.sin(frame / 20 + i) * 0.1),
          transform: `scale(${0.8 + Math.sin(frame / 15 + i * 0.5) * 0.2})`,
          zIndex: 1,
        }} />
      ))}

      <div style={{ position: "relative", zIndex: 2, width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        {/* Subject badge */}
        <div style={{
          background: color, color: "#1B1D24",
          fontWeight: 900, fontSize: 11, padding: "4px 16px",
          borderRadius: 20, textTransform: "uppercase", letterSpacing: 2,
          marginBottom: 20,
          opacity: interpolate(frame, [0, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}>
          {subject}
        </div>

        {/* Emoji */}
        <div style={{
          fontSize: 88, marginBottom: 20, lineHeight: 1,
          transform: `scale(${1 + 0.05 * Math.sin((frame / 18) * Math.PI)})`,
        }}>
          {scene.emoji}
        </div>

        {/* Title */}
        <h1 style={{
          color: "#fff", fontSize: 36, fontWeight: 900,
          textAlign: "center", margin: "0 0 14px", lineHeight: 1.18,
          opacity: interpolate(frame - 8, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          transform: `translateY(${interpolate(titleSpring, [0, 1], [30, 0])}px)`,
        }}>
          {scene.title}
        </h1>

        {/* Body */}
        <p style={{
          color: "#94a3b8", fontSize: 16, textAlign: "center",
          maxWidth: 300, lineHeight: 1.55, margin: "0 0 28px",
          opacity: bodyOpacity,
        }}>
          {scene.body}
        </p>

        {/* Nzi with speech bubble */}
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
          opacity: nziOpacity,
          transform: `translateY(${nziY}px)`,
        }}>
          <SpeechBubble text={scene.nziSpeech} frame={frame} startFrame={20} />
          <AnimatedNzi expression={scene.nziExpression as NziExpression} size={110} frame={frame} />
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        position: "absolute", bottom: 28,
        width: "55%", height: 3,
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        borderRadius: 2, zIndex: 2,
      }} />
    </AbsoluteFill>
  );
};

// ── CONCEPT SCENE ──────────────────────────────────────────────────────────────

const ConceptScene: React.FC<{ scene: StoryScene; subject: string }> = ({ scene, subject }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const imgOpacity = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const headerSlide = spring({ frame: frame - 8, fps, config: { damping: 16, stiffness: 110 } });
  const cardSpring = spring({ frame: frame - 14, fps, config: { damping: 14, stiffness: 100 } });
  const nziSpring = spring({ frame: frame - 6, fps, config: { damping: 12, stiffness: 80 } });

  return (
    <AbsoluteFill style={{
      background: "#1B1D24",
      display: "flex", flexDirection: "column",
      fontFamily: "system-ui, sans-serif",
      overflow: "hidden",
    }}>
      {/* Top image panel */}
      <div style={{ width: "100%", height: 230, position: "relative", flexShrink: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, opacity: imgOpacity }}>
          <SceneImage keyword={scene.imageKeyword} subject={subject} opacity={1} />
        </div>
        {/* Gradient overlay for readability */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(180deg, #1B1D2444 0%, #1B1D24 100%)",
        }} />
        {/* Scene type label */}
        <div style={{
          position: "absolute", top: 14, left: 14,
          background: "#72EB3A22", border: "1px solid #72EB3A66",
          borderRadius: 12, padding: "4px 12px",
        }}>
          <span style={{ color: "#72EB3A", fontWeight: 900, fontSize: 11, textTransform: "uppercase", letterSpacing: 2 }}>
            💡 Conceito
          </span>
        </div>

        {/* Nzi overlapping the image bottom-left */}
        <div style={{
          position: "absolute", bottom: -30, left: 16,
          opacity: interpolate(frame - 6, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          transform: `translateY(${interpolate(nziSpring, [0, 1], [40, 0])}px)`,
          zIndex: 10,
        }}>
          <AnimatedNzi expression={scene.nziExpression as NziExpression} size={95} frame={frame} />
        </div>

        {/* Speech bubble — right of Nzi */}
        <div style={{
          position: "absolute", bottom: 6, left: 110,
          zIndex: 11,
        }}>
          <SpeechBubble text={scene.nziSpeech} frame={frame} startFrame={16} side="left" />
        </div>
      </div>

      {/* Content panel */}
      <div style={{ flex: 1, padding: "44px 22px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Title */}
        <div style={{
          opacity: interpolate(frame - 8, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          transform: `translateX(${interpolate(headerSlide, [0, 1], [-30, 0])}px)`,
        }}>
          <p style={{ color: "#72EB3A", fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: 3, margin: "0 0 5px" }}>
            {subject}
          </p>
          <h2 style={{ color: "#fff", fontSize: 26, fontWeight: 900, margin: 0, lineHeight: 1.2 }}>
            {scene.title}
          </h2>
        </div>

        {/* Content card */}
        <div style={{
          background: "#1C2210",
          border: "1px solid #365A08",
          borderRadius: 20, padding: "20px 18px",
          opacity: interpolate(frame - 14, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          transform: `translateY(${interpolate(cardSpring, [0, 1], [20, 0])}px)`,
          flex: 1,
        }}>
          <RevealText
            text={scene.body}
            highlight={scene.highlight}
            frame={frame}
            startFrame={16}
            fontSize={16}
          />
        </div>

        {/* Keyword badge */}
        <KeyBadge text={`🔑 ${scene.highlight}`} frame={frame} startFrame={30} />
      </div>
    </AbsoluteFill>
  );
};

// ── EXAMPLE SCENE ──────────────────────────────────────────────────────────────

const ExampleScene: React.FC<{ scene: StoryScene; subject: string }> = ({ scene, subject }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const nziSpring = spring({ frame: frame - 10, fps, config: { damping: 14, stiffness: 100 } });
  const cardSpring = spring({ frame: frame - 16, fps, config: { damping: 16, stiffness: 110 } });

  return (
    <AbsoluteFill style={{
      background: "#1B1D24",
      display: "flex", flexDirection: "column",
      fontFamily: "system-ui, sans-serif",
      overflow: "hidden",
    }}>
      {/* Top image */}
      <div style={{ width: "100%", height: 200, position: "relative", flexShrink: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0 }}>
          <SceneImage keyword={scene.imageKeyword} subject={subject} opacity={interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
        </div>
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(180deg, #fbbf2408 0%, #1B1D24 100%)",
        }} />
        {/* Scene type badge */}
        <div style={{
          position: "absolute", top: 14, left: 14,
          background: "#fbbf2422", border: "1px solid #fbbf2466",
          borderRadius: 12, padding: "4px 12px",
        }}>
          <span style={{ color: "#fbbf24", fontWeight: 900, fontSize: 11, textTransform: "uppercase", letterSpacing: 2 }}>
            🌍 Exemplo Real
          </span>
        </div>

        {/* Emoji overlay */}
        <div style={{
          position: "absolute", bottom: 12, right: 16,
          fontSize: 52,
          opacity: interpolate(frame, [6, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          transform: `scale(${1 + 0.04 * Math.sin((frame / 16) * Math.PI)})`,
        }}>
          {scene.emoji}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "16px 22px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Header */}
        <div style={{
          opacity: interpolate(frame - 8, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}>
          <p style={{ color: "#fbbf24", fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: 3, margin: "0 0 4px" }}>
            {subject} · Exemplo
          </p>
          <h2 style={{ color: "#fff", fontSize: 24, fontWeight: 900, margin: 0 }}>{scene.title}</h2>
        </div>

        {/* Nzi + speech bubble inline */}
        <div style={{
          display: "flex", alignItems: "flex-end", gap: 10,
          opacity: interpolate(frame - 10, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          transform: `translateX(${interpolate(nziSpring, [0, 1], [-30, 0])}px)`,
        }}>
          <AnimatedNzi expression={scene.nziExpression as NziExpression} size={80} frame={frame} />
          <div style={{ paddingBottom: 12 }}>
            <SpeechBubble text={scene.nziSpeech} frame={frame} startFrame={14} />
          </div>
        </div>

        {/* Example card */}
        <div style={{
          background: "#1e1a0e",
          border: "1px solid #78350f40",
          borderLeft: "4px solid #fbbf24",
          borderRadius: 18, padding: "16px 16px",
          opacity: interpolate(frame - 16, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          transform: `translateY(${interpolate(cardSpring, [0, 1], [20, 0])}px)`,
          flex: 1,
        }}>
          <RevealText
            text={scene.body}
            highlight={scene.highlight}
            frame={frame}
            startFrame={18}
            fontSize={15}
            color="#f1e0c6"
          />
        </div>

        {/* Keyword badge */}
        <KeyBadge text={`✨ ${scene.highlight}`} frame={frame} startFrame={32} color="#fbbf24" />
      </div>
    </AbsoluteFill>
  );
};

// ── SUMMARY SCENE ──────────────────────────────────────────────────────────────

const SummaryScene: React.FC<{ scene: StoryScene; subject: string }> = ({ scene, subject }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const points = scene.body.split("|").map(s => s.trim()).filter(Boolean);
  const titleSpring = spring({ frame: frame - 4, fps, config: { damping: 16, stiffness: 120 } });
  const nziSpring = spring({ frame: frame - 2, fps, config: { damping: 12, stiffness: 80 } });

  return (
    <AbsoluteFill style={{
      background: "linear-gradient(180deg, #1B1D24 0%, #130e1f 100%)",
      display: "flex", flexDirection: "column",
      padding: "32px 22px 24px",
      fontFamily: "system-ui, sans-serif",
      overflow: "hidden",
    }}>
      {/* Nzi centered top with speech bubble */}
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
        marginBottom: 20,
        opacity: interpolate(frame - 2, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        transform: `translateY(${interpolate(nziSpring, [0, 1], [-30, 0])}px)`,
      }}>
        <AnimatedNzi expression={scene.nziExpression as NziExpression} size={105} frame={frame} />
        <SpeechBubble text={scene.nziSpeech} frame={frame} startFrame={10} />
      </div>

      {/* Header */}
      <div style={{
        marginBottom: 20,
        opacity: interpolate(frame - 4, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        transform: `translateY(${interpolate(titleSpring, [0, 1], [20, 0])}px)`,
        textAlign: "center",
      }}>
        <p style={{ color: "#a78bfa", fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: 3, margin: "0 0 4px" }}>
          Resumo · {subject}
        </p>
        <h2 style={{ color: "#fff", fontSize: 24, fontWeight: 900, margin: 0 }}>{scene.title}</h2>
      </div>

      {/* Points */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
        {points.map((point, i) => {
          const startF = i * 14 + 16;
          const s = spring({ frame: frame - startF, fps, config: { damping: 14, stiffness: 110 } });
          const opacity = interpolate(frame - startF, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const colors = ["#72EB3A", "#60a5fa", "#a78bfa"];
          const c = colors[i % colors.length];

          return (
            <div key={i} style={{
              background: "#1C2210",
              border: `1px solid ${c}30`,
              borderLeft: `4px solid ${c}`,
              borderRadius: 16, padding: "14px 16px",
              display: "flex", alignItems: "flex-start", gap: 12,
              opacity,
              transform: `translateX(${interpolate(s, [0, 1], [-60, 0])}px)`,
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: c, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ color: "#1B1D24", fontWeight: 900, fontSize: 13 }}>✓</span>
              </div>
              <p style={{ color: "#e2e8f0", fontSize: 15, margin: 0, lineHeight: 1.45 }}>{point}</p>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{
        textAlign: "center", marginTop: 16,
        opacity: interpolate(frame, [points.length * 14 + 24, points.length * 14 + 36], [0, 1], {
          extrapolateLeft: "clamp", extrapolateRight: "clamp",
        }),
      }}>
        <p style={{ color: "#72EB3A", fontWeight: 900, fontSize: 15, margin: 0 }}>
          🏆 Pronto para o Quiz!
        </p>
      </div>
    </AbsoluteFill>
  );
};

// ── Main Composition ───────────────────────────────────────────────────────────

export interface StoryCompositionProps {
  scenes: StoryScene[];
  subject: string;
  topic: string;
}

export const StoryComposition: React.FC<StoryCompositionProps> = ({ scenes, subject }) => {
  const { fps } = useVideoConfig();

  let offset = 0;
  return (
    <AbsoluteFill style={{ background: "#1B1D24" }}>
      {scenes.map((scene) => {
        const durationInFrames = scene.durationSeconds * fps;
        const from = offset;
        offset += durationInFrames;

        const SceneEl = () => {
          if (scene.type === "title") return <TitleScene scene={scene} subject={subject} />;
          if (scene.type === "example") return <ExampleScene scene={scene} subject={subject} />;
          if (scene.type === "summary") return <SummaryScene scene={scene} subject={subject} />;
          return <ConceptScene scene={scene} subject={subject} />;
        };

        return (
          <Sequence key={scene.id} from={from} durationInFrames={durationInFrames}>
            <SceneEl />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
