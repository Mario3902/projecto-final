import React from "react";
import { motion } from "framer-motion";

export type NziPose = "idle" | "pointing" | "writing" | "jumping" | "thinking" | "waving" | "celebrating" | "explaining";

interface NziAnimatorProps {
  pose: NziPose;
  size?: number;
  flipX?: boolean;
  onClick?: () => void;
}

// ── Palette ────────────────────────────────────────────────────────────────────
const SKIN  = "#C68642";
const SKIN2 = "#A0522D";
const HAIR  = "#1a0a00";
const SHIRT = "#5D9D0B";
const PANTS = "#1e3a5f";
const SHOE  = "#0d0d0d";

// ── Coordinate system ──────────────────────────────────────────────────────────
// viewBox: "-10 0 120 158"
// Head center: (50, 36)  r=27
// Neck: (43-57, 60-68)
// Torso: x 22-78, y 65-115
// Left shoulder pivot:  (22, 68)
// Right shoulder pivot: (78, 68)
// Left hip:  (35, 115)
// Right hip: (65, 115)

// ── Shared primitives ──────────────────────────────────────────────────────────

const Head: React.FC<{ eyes?: "normal" | "happy" | "think"; mouth?: "smile" | "big" | "open" }> = ({
  eyes = "normal", mouth = "smile",
}) => (
  <>
    {/* Neck */}
    <rect x="43" y="60" width="14" height="10" rx="5" fill={SKIN} />
    {/* Head sphere */}
    <circle cx="50" cy="36" r="27" fill={SKIN} />
    {/* Afro */}
    <ellipse cx="50"  cy="15" rx="25" ry="11" fill={HAIR} />
    <ellipse cx="28"  cy="22" rx="13" ry="15" fill={HAIR} />
    <ellipse cx="72"  cy="22" rx="13" ry="15" fill={HAIR} />
    <ellipse cx="50"  cy="18" rx="21" ry="9"  fill={HAIR} />
    {/* Ears */}
    <ellipse cx="23" cy="36" rx="5" ry="7" fill={SKIN} />
    <ellipse cx="77" cy="36" rx="5" ry="7" fill={SKIN} />
    <ellipse cx="23" cy="36" rx="3" ry="4" fill={SKIN2} />
    <ellipse cx="77" cy="36" rx="3" ry="4" fill={SKIN2} />
    {/* Eyes */}
    {eyes === "happy" ? (
      <>
        <path d="M35 35 Q40 42 45 35" stroke={HAIR} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M55 35 Q60 42 65 35" stroke={HAIR} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </>
    ) : eyes === "think" ? (
      <>
        <circle cx="40" cy="36" r="5" fill={HAIR} />
        <circle cx="60" cy="36" r="5" fill={HAIR} />
        <circle cx="41.5" cy="34" r="2" fill="white" />
        <circle cx="61.5" cy="34" r="2" fill="white" />
        {/* Furrowed brows */}
        <path d="M34 27 Q40 23 46 27" stroke={HAIR} strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M54 27 Q60 23 66 27" stroke={HAIR} strokeWidth="2" fill="none" strokeLinecap="round" />
      </>
    ) : (
      <>
        <circle cx="40" cy="36" r="5" fill={HAIR} />
        <circle cx="60" cy="36" r="5" fill={HAIR} />
        <circle cx="41.5" cy="34" r="2" fill="white" />
        <circle cx="61.5" cy="34" r="2" fill="white" />
      </>
    )}
    {/* Mouth */}
    {mouth === "big"  && <path d="M34 50 Q50 64 66 50" stroke={HAIR} strokeWidth="2.5" fill="none" strokeLinecap="round" />}
    {mouth === "open" && (
      <>
        <path d="M36 50 Q50 62 64 50" stroke={HAIR} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <ellipse cx="50" cy="53" rx="9" ry="5" fill="#5a1a1a" opacity="0.4" />
      </>
    )}
    {mouth === "smile" && <path d="M38 50 Q50 59 62 50" stroke={HAIR} strokeWidth="2" fill="none" strokeLinecap="round" />}
  </>
);

const Body: React.FC = () => (
  <>
    <path d="M22 68 Q50 80 78 68 L74 115 Q50 124 26 115 Z" fill={SHIRT} />
    <path d="M42 68 L50 79 L58 68" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <circle cx="50" cy="88" r="7.5" fill="#0d1f14" stroke="#72EB3A" strokeWidth="1.5" />
    <text x="47.5" y="92" fontSize="8" fill="#72EB3A" fontWeight="bold">N</text>
  </>
);

const Legs: React.FC = () => (
  <>
    <rect x="30" y="112" width="16" height="28" rx="7" fill={PANTS} />
    <rect x="54" y="112" width="16" height="28" rx="7" fill={PANTS} />
    <ellipse cx="38"  cy="140" rx="10" ry="5" fill={SHOE} />
    <ellipse cx="62"  cy="140" rx="10" ry="5" fill={SHOE} />
  </>
);

// Arm helper — shoulder is at origin (0,0), arm hangs or is rotated
const Arm: React.FC<{ up?: boolean }> = ({ up = false }) => (
  <>
    <rect x="-7" y={up ? -36 : 0} width="14" height="36" rx="7" fill={SHIRT} />
    <circle cx="0" cy={up ? -43 : 43} r="7.5" fill={SKIN} />
  </>
);

// ── Pose components ────────────────────────────────────────────────────────────

const IdleNzi: React.FC = () => (
  <motion.g
    animate={{ y: [0, -7, 0] }}
    transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
  >
    <Head />
    <Body />
    {/* Left arm down */}
    <g transform="translate(22, 68)"><Arm /></g>
    {/* Right arm down */}
    <g transform="translate(78, 68)"><Arm /></g>
    <Legs />
    <text x="62" y="15" fontSize="18">💡</text>
  </motion.g>
);

const WavingNzi: React.FC = () => (
  <motion.g
    animate={{ y: [0, -6, 0] }}
    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
  >
    <Head eyes="happy" mouth="big" />
    <Body />
    {/* Left arm down */}
    <g transform="translate(22, 68)"><Arm /></g>
    {/* Right arm waving — rotate around shoulder (0,0) */}
    <g transform="translate(78, 68)">
      <motion.g
        animate={{ rotate: [-38, 38, -38] }}
        transition={{ duration: 0.65, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "0px 0px" }}
      >
        <Arm up />
      </motion.g>
    </g>
    <Legs />
    <text x="64" y="9" fontSize="20">👋</text>
  </motion.g>
);

const PointingNzi: React.FC = () => (
  <motion.g
    animate={{ x: [0, 3, 0] }}
    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
  >
    <Head eyes="normal" mouth="smile" />
    <Body />
    {/* Left arm down */}
    <g transform="translate(22, 68)"><Arm /></g>
    {/* Right arm pointing — rotated ~-55° from rest */}
    <g transform="translate(78, 68)">
      <motion.g
        animate={{ rotate: [-5, 5, -5] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "0px 0px" }}
      >
        <g transform="rotate(-55)">
          <rect x="-7" y="-36" width="14" height="36" rx="7" fill={SHIRT} />
          <circle cx="0" cy="-43" r="7.5" fill={SKIN} />
          {/* Index finger */}
          <line x1="0" y1="-50" x2="0" y2="-60" stroke={SKIN} strokeWidth="5" strokeLinecap="round" />
        </g>
      </motion.g>
    </g>
    <Legs />
    {/* Animated arrow */}
    <motion.text
      x="76" y="20" fontSize="18" fill="#72EB3A"
      animate={{ x: [76, 86, 76], opacity: [0.2, 1, 0.2] }}
      transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
    >→</motion.text>
  </motion.g>
);

const ExplainingNzi: React.FC = () => (
  <motion.g
    animate={{ y: [0, -4, 0] }}
    transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut" }}
  >
    <Head eyes="happy" mouth="open" />
    <Body />
    {/* Left arm gesturing */}
    <g transform="translate(22, 68)">
      <motion.g
        animate={{ rotate: [-28, 12, -28] }}
        transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "0px 0px" }}
      >
        <g transform="rotate(20)"><Arm up /></g>
      </motion.g>
    </g>
    {/* Right arm gesturing (offset phase) */}
    <g transform="translate(78, 68)">
      <motion.g
        animate={{ rotate: [28, -12, 28] }}
        transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        style={{ transformOrigin: "0px 0px" }}
      >
        <g transform="rotate(-20)"><Arm up /></g>
      </motion.g>
    </g>
    <Legs />
    {/* Speech dots */}
    {[0, 1, 2].map(i => (
      <motion.circle key={i} cx={66 + i * 9} cy={16 - i * 5} r={3 - i * 0.5}
        fill="#72EB3A"
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 1, repeat: Infinity, delay: i * 0.28 }} />
    ))}
  </motion.g>
);

const WritingNzi: React.FC = () => (
  <motion.g>
    <Head eyes="think" mouth="smile" />
    <Body />
    {/* Left arm down */}
    <g transform="translate(22, 68)"><Arm /></g>
    {/* Right arm writing */}
    <g transform="translate(78, 68)">
      <motion.g
        animate={{ rotate: [-12, 12, -12] }}
        transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "0px 0px" }}
      >
        <g transform="rotate(25)">
          <rect x="-7" y="0" width="14" height="30" rx="7" fill={SHIRT} />
          <circle cx="0" cy="36" r="7" fill={SKIN} />
          {/* Pen */}
          <rect x="-3" y="42" width="6" height="14" rx="3" fill="#fbbf24" />
          <polygon points="-3,56 3,56 0,63" fill="#fbbf24" />
        </g>
      </motion.g>
    </g>
    <Legs />
    <text x="60" y="14" fontSize="16">✏️</text>
    {/* Writing lines */}
    {[0, 1, 2].map(i => (
      <motion.line key={i}
        x1={2} y1={76 + i * 8} x2={2} y2={76 + i * 8}
        stroke="#72EB3A99" strokeWidth="2.5" strokeLinecap="round"
        animate={{ x2: [2, 22, 22] }}
        transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.3, repeatDelay: 0.3 }} />
    ))}
  </motion.g>
);

const JumpingNzi: React.FC = () => (
  <motion.g
    animate={{ y: [0, -28, 0] }}
    transition={{ duration: 0.72, repeat: Infinity, ease: [0.33, 1, 0.68, 1] }}
  >
    <Head eyes="happy" mouth="big" />
    <Body />
    {/* Both arms up */}
    <g transform="translate(22, 68)"><g transform="rotate(-50)"><Arm up /></g></g>
    <g transform="translate(78, 68)"><g transform="rotate(50)"><Arm up /></g></g>
    {/* Bent legs */}
    <g transform="translate(38, 112)">
      <motion.g
        animate={{ rotate: [0, 18, 0] }}
        transition={{ duration: 0.72, repeat: Infinity }}
        style={{ transformOrigin: "0px 0px" }}
      >
        <rect x="-8" y="0" width="16" height="24" rx="7" fill={PANTS} />
        <ellipse cx="0" cy="30" rx="10" ry="5" fill={SHOE} />
      </motion.g>
    </g>
    <g transform="translate(62, 112)">
      <motion.g
        animate={{ rotate: [0, -18, 0] }}
        transition={{ duration: 0.72, repeat: Infinity }}
        style={{ transformOrigin: "0px 0px" }}
      >
        <rect x="-8" y="0" width="16" height="24" rx="7" fill={PANTS} />
        <ellipse cx="0" cy="30" rx="10" ry="5" fill={SHOE} />
      </motion.g>
    </g>
    {/* Ground shadow */}
    <motion.ellipse cx="50" cy="150" rx="22" ry="5" fill="#00000033"
      animate={{ scaleX: [0.4, 1, 0.4], opacity: [0.1, 0.35, 0.1] }}
      transition={{ duration: 0.72, repeat: Infinity }} />
    <text x="2"  y="16" fontSize="14">⭐</text>
    <text x="68" y="13" fontSize="12">✨</text>
  </motion.g>
);

const ThinkingNzi: React.FC = () => (
  <motion.g
    animate={{ y: [0, -3, 0] }}
    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
  >
    <Head eyes="think" mouth="smile" />
    <Body />
    {/* Left arm down */}
    <g transform="translate(22, 68)"><Arm /></g>
    {/* Right arm raised to chin (static rotate) */}
    <g transform="translate(78, 68)">
      <g transform="rotate(-38)">
        <rect x="-7" y="-24" width="14" height="28" rx="7" fill={SHIRT} />
        <circle cx="0" cy="-30" r="7.5" fill={SKIN} />
      </g>
    </g>
    <Legs />
    <text x="62" y="15" fontSize="18">🤔</text>
    {/* Thought bubbles */}
    {[0, 1, 2].map(i => (
      <motion.circle key={i}
        cx={72 + i * 11} cy={28 - i * 13} r={4 + i * 2}
        fill="none" stroke="#72EB3A55" strokeWidth="1.5"
        animate={{ opacity: [0.2, 0.85, 0.2], scale: [0.9, 1.1, 0.9] }}
        transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.4 }} />
    ))}
  </motion.g>
);

const CelebratingNzi: React.FC = () => (
  <g>
    {/* Confetti particles */}
    {["#72EB3A", "#fbbf24", "#60a5fa", "#a78bfa", "#f472b6"].map((c, i) => (
      <motion.rect key={i}
        x={6 + i * 21} y={0} width="7" height="7" rx="2" fill={c}
        animate={{ y: [0, 158], rotate: [0, 360 * (i % 2 === 0 ? 1 : -1)], opacity: [1, 0.8, 0] }}
        transition={{ duration: 1.7, repeat: Infinity, delay: i * 0.26, ease: "linear" }} />
    ))}
    {/* Whole body wobble — pivot at waist (50, 88) */}
    <g transform="translate(50, 88)">
      <motion.g
        animate={{ rotate: [-6, 6, -6] }}
        transition={{ duration: 0.42, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "0px 0px" }}
      >
        <g transform="translate(-50, -88)">
          <Head eyes="happy" mouth="big" />
          <Body />
          {/* Both arms up */}
          <g transform="translate(22, 68)"><g transform="rotate(-50)"><Arm up /></g></g>
          <g transform="translate(78, 68)"><g transform="rotate(50)"><Arm up /></g></g>
          <Legs />
        </g>
      </motion.g>
    </g>
    <text x="2"  y="15" fontSize="15">🌟</text>
    <text x="67" y="13" fontSize="13">✨</text>
  </g>
);

// ── Main component ─────────────────────────────────────────────────────────────

export const NziAnimator: React.FC<NziAnimatorProps> = ({ pose, size = 120, flipX = false, onClick }) => {
  const poseMap: Record<NziPose, React.ReactNode> = {
    idle:       <IdleNzi />,
    waving:     <WavingNzi />,
    pointing:   <PointingNzi />,
    explaining: <ExplainingNzi />,
    writing:    <WritingNzi />,
    jumping:    <JumpingNzi />,
    thinking:   <ThinkingNzi />,
    celebrating:<CelebratingNzi />,
  };

  return (
    <motion.div
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default", display: "inline-block", userSelect: "none" }}
      whileTap={onClick ? { scale: 0.92 } : {}}
    >
      <svg
        width={size}
        height={Math.round(size * 1.32)}
        viewBox="-10 0 120 158"
        style={{ transform: flipX ? "scaleX(-1)" : "none", overflow: "visible" }}
      >
        {poseMap[pose]}
      </svg>
    </motion.div>
  );
};

export function poseToPose(expression: string): NziPose {
  const map: Record<string, NziPose> = {
    waving: "waving", hint: "pointing", pointing: "pointing",
    thinking: "thinking", excited: "jumping", jumping: "jumping",
    celebrate: "celebrating", celebrating: "celebrating",
    determined: "explaining", explaining: "explaining",
    writing: "writing", idle: "idle", sad: "thinking", happy: "waving",
  };
  return map[expression] ?? "explaining";
}
