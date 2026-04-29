import React from "react";
import { motion } from "framer-motion";

// ── Shared animated elements ───────────────────────────────────────────────────

const Star: React.FC<{ x: number; y: number; size: number; delay: number }> = ({ x, y, size, delay }) => (
  <motion.circle cx={x} cy={y} r={size} fill="#fff"
    animate={{ opacity: [0.2, 0.9, 0.2], scale: [0.8, 1.2, 0.8] }}
    transition={{ duration: 2 + delay, repeat: Infinity, delay }}
  />
);

const FloatingParticle: React.FC<{ x: number; color: string; delay: number }> = ({ x, color, delay }) => (
  <motion.circle cx={x} r={3} fill={color}
    initial={{ cy: 320 }}
    animate={{ cy: -10, opacity: [0, 1, 0] }}
    transition={{ duration: 3 + delay, repeat: Infinity, delay, ease: "linear" }}
  />
);

// ── CLASSROOM SCENE ────────────────────────────────────────────────────────────

export const ClassroomScene: React.FC = () => (
  <svg viewBox="0 0 390 320" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} preserveAspectRatio="xMidYMid slice">
    {/* Sky / wall */}
    <rect width="390" height="320" fill="#141a08" />
    <rect y="220" width="390" height="100" fill="#071209" />

    {/* Ceiling light */}
    <rect x="160" y="0" width="70" height="6" rx="3" fill="#253510" />
    <motion.ellipse cx="195" cy="20" rx="50" ry="18" fill="#72EB3A08"
      animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2.5, repeat: Infinity }} />
    <motion.ellipse cx="195" cy="16" rx="30" ry="10" fill="#72EB3A15"
      animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2.5, repeat: Infinity, delay: 0.3 }} />

    {/* Blackboard */}
    <rect x="40" y="40" width="310" height="140" rx="8" fill="#0d2a18" stroke="#365A08" strokeWidth="3" />
    <rect x="46" y="46" width="298" height="128" rx="5" fill="#0f3020" />
    {/* Board lines (writing) */}
    <motion.line x1="60" y1="80" x2="330" y2="80" stroke="#72EB3A22" strokeWidth="1"
      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, delay: 0.5 }} />
    <motion.line x1="60" y1="110" x2="280" y2="110" stroke="#72EB3A22" strokeWidth="1"
      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, delay: 0.8 }} />
    <motion.line x1="60" y1="140" x2="240" y2="140" stroke="#72EB3A22" strokeWidth="1"
      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, delay: 1.1 }} />

    {/* Chalk tray */}
    <rect x="40" y="178" width="310" height="7" rx="3" fill="#253510" />

    {/* Floor */}
    <rect y="220" width="390" height="6" fill="#253510" />

    {/* Desk */}
    <rect x="60" y="240" width="120" height="8" rx="3" fill="#2a3a08" />
    <rect x="70" y="248" width="6" height="50" fill="#142218" />
    <rect x="164" y="248" width="6" height="50" fill="#142218" />

    {/* Books on desk */}
    <rect x="80" y="230" width="18" height="10" rx="1" fill="#72EB3A44" />
    <rect x="100" y="228" width="15" height="12" rx="1" fill="#60a5fa44" />
    <rect x="117" y="231" width="12" height="9" rx="1" fill="#a78bfa44" />

    {/* Window right */}
    <rect x="310" y="50" width="60" height="80" rx="4" fill="#0f2a1a" stroke="#253510" strokeWidth="2" />
    <line x1="340" y1="50" x2="340" y2="130" stroke="#253510" strokeWidth="2" />
    <line x1="310" y1="90" x2="370" y2="90" stroke="#253510" strokeWidth="2" />
    {/* Stars through window */}
    <Star x={325} y={65} size={1.5} delay={0} />
    <Star x={355} y={72} size={1} delay={0.5} />
    <Star x={330} y={105} size={1.2} delay={1} />
    <Star x={358} y={108} size={0.8} delay={0.3} />

    {/* Floating particles */}
    <FloatingParticle x={80} color="#72EB3A40" delay={0} />
    <FloatingParticle x={200} color="#60a5fa40" delay={1.2} />
    <FloatingParticle x={320} color="#a78bfa40" delay={0.6} />
  </svg>
);

// ── LABORATORY SCENE ───────────────────────────────────────────────────────────

export const LaboratoryScene: React.FC = () => (
  <svg viewBox="0 0 390 320" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} preserveAspectRatio="xMidYMid slice">
    <rect width="390" height="320" fill="#080d1a" />
    <rect y="230" width="390" height="90" fill="#060a12" />

    {/* Lab table */}
    <rect x="0" y="230" width="390" height="10" rx="0" fill="#0f1e35" />

    {/* Beaker 1 - glowing green */}
    <motion.g animate={{ y: [0, -4, 0] }} transition={{ duration: 2.5, repeat: Infinity }}>
      <path d="M80 180 L70 230 L120 230 L110 180 Z" fill="#0a2a1a" stroke="#72EB3A66" strokeWidth="1.5" />
      <motion.ellipse cx="95" cy="215" rx="20" ry="8" fill="#72EB3A44"
        animate={{ opacity: [0.4, 0.9, 0.4] }} transition={{ duration: 1.8, repeat: Infinity }} />
      <motion.rect x="71" y="210" width="48" height="20" rx="0" fill="#72EB3A22"
        animate={{ height: [20, 24, 20] }} transition={{ duration: 2, repeat: Infinity }} />
      {/* Bubbles */}
      {[85, 92, 100].map((x, i) => (
        <motion.circle key={i} cx={x} r={2} fill="#72EB3A66"
          initial={{ cy: 228 }} animate={{ cy: 185, opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.5 }} />
      ))}
    </motion.g>

    {/* Beaker 2 - blue */}
    <motion.g animate={{ y: [0, -3, 0] }} transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}>
      <path d="M160 190 L152 230 L198 230 L190 190 Z" fill="#0a1a2a" stroke="#60a5fa66" strokeWidth="1.5" />
      <motion.ellipse cx="175" cy="220" rx="18" ry="7" fill="#60a5fa44"
        animate={{ opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 2.2, repeat: Infinity }} />
      {[165, 175, 183].map((x, i) => (
        <motion.circle key={i} cx={x} r={1.5} fill="#60a5fa88"
          initial={{ cy: 228 }} animate={{ cy: 195, opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.7 }} />
      ))}
    </motion.g>

    {/* Microscope */}
    <g transform="translate(260,150)">
      <rect x="10" y="60" width="50" height="6" rx="3" fill="#1a2a3a" />
      <rect x="30" y="10" width="6" height="56" rx="2" fill="#1a2a3a" />
      <rect x="10" y="10" width="26" height="8" rx="2" fill="#243040" />
      <circle cx="23" cy="10" r="8" fill="#1a2a3a" stroke="#60a5fa44" strokeWidth="1" />
      <motion.circle cx="23" cy="10" r="5" fill="#60a5fa22"
        animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 2, repeat: Infinity }} />
      <rect x="32" y="18" width="5" height="28" rx="2" fill="#243040" />
      <circle cx="34" cy="48" r="4" fill="#1a2a3a" stroke="#60a5fa33" strokeWidth="1" />
    </g>

    {/* Test tubes rack */}
    {[300, 316, 332, 348].map((x, i) => (
      <motion.g key={i} animate={{ y: [0, -2, 0] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}>
        <rect x={x} y="180" width="8" height="50" rx="4" fill="#0a1a2a" stroke="#60a5fa33" strokeWidth="1" />
        <motion.rect x={x + 1} y={220 - i * 8} width="6" height={10 + i * 8} rx="4"
          fill={["#72EB3A66", "#fbbf2466", "#a78bfa66", "#60a5fa66"][i]}
          animate={{ height: [10 + i * 8, 14 + i * 8, 10 + i * 8] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4 }} />
      </motion.g>
    ))}

    {/* Glow on floor */}
    <motion.ellipse cx="195" cy="232" rx="180" ry="10" fill="#72EB3A08"
      animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 3, repeat: Infinity }} />

    {/* Stars */}
    {[[30, 30], [360, 50], [20, 120], [370, 150], [200, 20]].map(([x, y], i) => (
      <Star key={i} x={x} y={y} size={1 + Math.random()} delay={i * 0.4} />
    ))}
  </svg>
);

// ── ANGOLA OUTDOORS SCENE ──────────────────────────────────────────────────────

export const AngolaScene: React.FC = () => (
  <svg viewBox="0 0 390 320" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} preserveAspectRatio="xMidYMid slice">
    {/* Sky gradient */}
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#0a1628" />
        <stop offset="100%" stopColor="#2a3a08" />
      </linearGradient>
      <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1a2a12" />
        <stop offset="100%" stopColor="#0d1a0a" />
      </linearGradient>
    </defs>
    <rect width="390" height="220" fill="url(#sky)" />
    <rect y="210" width="390" height="110" fill="url(#ground)" />

    {/* Moon */}
    <motion.circle cx="340" cy="50" r="22" fill="#fef3c7"
      animate={{ opacity: [0.8, 1, 0.8] }} transition={{ duration: 4, repeat: Infinity }} />
    <circle cx="332" cy="44" r="16" fill="#1a2e40" />

    {/* Stars */}
    {[[20,25],[60,15],[100,35],[150,10],[200,28],[250,18],[300,30],[30,80],[80,60],[140,75]].map(([x, y], i) => (
      <Star key={i} x={x} y={y} size={1 + (i % 3) * 0.5} delay={i * 0.25} />
    ))}

    {/* Baobab tree left */}
    <g transform="translate(-10, 80)">
      <rect x="30" y="90" width="22" height="110" rx="8" fill="#1a2e10" />
      <ellipse cx="41" cy="85" rx="45" ry="50" fill="#1a3514" />
      <ellipse cx="20" cy="100" rx="25" ry="35" fill="#163010" />
      <ellipse cx="62" cy="95" rx="22" ry="30" fill="#163010" />
    </g>

    {/* Baobab tree right */}
    <g transform="translate(330, 60)">
      <rect x="10" y="100" width="20" height="120" rx="7" fill="#1a2e10" />
      <ellipse cx="20" cy="95" rx="38" ry="42" fill="#1a3514" />
      <motion.ellipse cx="20" cy="93" rx="35" ry="40" fill="#163a14"
        animate={{ scaleX: [1, 1.02, 1] }} transition={{ duration: 4, repeat: Infinity }} />
    </g>

    {/* Luanda cityscape (silhouette) */}
    {[[180, 150, 16, 60],[200, 140, 20, 70],[225, 155, 14, 55],[245, 148, 18, 62],[165, 158, 12, 52]].map(([x, y, w, h], i) => (
      <motion.rect key={i} x={x} y={y} width={w} height={h} fill="#0f1e14"
        animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 3, repeat: Infinity, delay: i * 0.4 }} />
    ))}
    {/* Building windows */}
    {[[184,160],[188,172],[204,148],[208,160],[229,163],[249,152]].map(([x, y], i) => (
      <motion.rect key={i} x={x} y={y} width={4} height={5} rx={1} fill="#72EB3A44"
        animate={{ opacity: [0, 1, 0, 1] }} transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.8 }} />
    ))}

    {/* Ground details */}
    <motion.ellipse cx="195" cy="212" rx="195" ry="8" fill="#1a3a12"
      animate={{ scaleX: [1, 1.02, 1] }} transition={{ duration: 5, repeat: Infinity }} />
    {/* Grass tufts */}
    {[40, 120, 200, 280, 350].map((x, i) => (
      <g key={i}>
        <line x1={x} y1="215" x2={x - 5} y2="202" stroke="#2a4a18" strokeWidth="2" />
        <line x1={x + 4} y1="215" x2={x + 1} y2="200" stroke="#2a5018" strokeWidth="2" />
        <line x1={x + 8} y1="215" x2={x + 11} y2="203" stroke="#2a4a18" strokeWidth="2" />
      </g>
    ))}

    {/* Floating particles */}
    <FloatingParticle x={60} color="#72EB3A40" delay={0} />
    <FloatingParticle x={190} color="#fbbf2430" delay={1.5} />
    <FloatingParticle x={330} color="#72EB3A40" delay={0.8} />
  </svg>
);

// ── SPACE/PHYSICS SCENE ────────────────────────────────────────────────────────

export const SpaceScene: React.FC = () => (
  <svg viewBox="0 0 390 320" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} preserveAspectRatio="xMidYMid slice">
    <rect width="390" height="320" fill="#050812" />

    {/* Stars */}
    {Array.from({ length: 30 }, (_, i) => [
      (i * 67) % 380 + 5, (i * 43) % 300 + 5
    ]).map(([x, y], i) => (
      <Star key={i} x={x} y={y} size={0.8 + (i % 3) * 0.5} delay={i * 0.15} />
    ))}

    {/* Planet 1 */}
    <motion.g animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      style={{ transformOrigin: "195px 160px" }}>
      <circle cx="320" cy="80" r="35" fill="#1a1040" />
      <circle cx="320" cy="80" r="35" fill="url(#planetGrad)" opacity="0.8" />
      <ellipse cx="320" cy="80" rx="55" ry="12" fill="none" stroke="#a78bfa44" strokeWidth="3" />
    </motion.g>

    <defs>
      <radialGradient id="planetGrad" cx="35%" cy="35%">
        <stop offset="0%" stopColor="#6d28d9" />
        <stop offset="100%" stopColor="#1a1040" />
      </radialGradient>
    </defs>

    {/* Earth */}
    <motion.circle cx="80" cy="240" r="50" fill="#1a3a5e"
      animate={{ scale: [1, 1.01, 1] }} transition={{ duration: 5, repeat: Infinity }} />
    <motion.ellipse cx="80" cy="228" rx="35" ry="18" fill="#1a5c34" opacity="0.8"
      animate={{ rotate: [0, 5, 0] }} transition={{ duration: 8, repeat: Infinity }} style={{ transformOrigin: "80px 228px" }} />
    <motion.ellipse cx="70" cy="250" rx="25" ry="14" fill="#1a5c34" opacity="0.6"
      animate={{ rotate: [0, -3, 0] }} transition={{ duration: 6, repeat: Infinity }} style={{ transformOrigin: "70px 250px" }} />

    {/* Orbit line */}
    <motion.path d="M 80 190 Q 195 100 310 190 Q 195 280 80 190" fill="none" stroke="#60a5fa22" strokeWidth="1" strokeDasharray="6 4"
      animate={{ strokeDashoffset: [0, -100] }} transition={{ duration: 5, repeat: Infinity, ease: "linear" }} />

    {/* Satellite */}
    <motion.g
      animate={{ offsetDistance: ["0%", "100%"] }}
      style={{ offsetPath: "path('M 80 190 Q 195 100 310 190 Q 195 280 80 190')" }}
      transition={{ duration: 5, repeat: Infinity, ease: "linear" }}>
      <rect x="-8" y="-4" width="16" height="8" rx="2" fill="#1a3050" />
      <rect x="-18" y="-3" width="10" height="6" rx="1" fill="#60a5fa66" />
      <rect x="8" y="-3" width="10" height="6" rx="1" fill="#60a5fa66" />
    </motion.g>

    {/* Nebula glow */}
    <motion.ellipse cx="195" cy="160" rx="100" ry="60" fill="#72EB3A06"
      animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.05, 1] }} transition={{ duration: 6, repeat: Infinity }} />
  </svg>
);

// ── HISTORY/MAP SCENE ──────────────────────────────────────────────────────────

export const HistoryScene: React.FC = () => (
  <svg viewBox="0 0 390 320" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} preserveAspectRatio="xMidYMid slice">
    <rect width="390" height="320" fill="#0f0800" />

    {/* Parchment / old map feel */}
    <motion.rect width="390" height="320" fill="#1a0e02" opacity="0.8"
      animate={{ opacity: [0.6, 0.85, 0.6] }} transition={{ duration: 6, repeat: Infinity }} />

    {/* Map grid lines */}
    {[60, 120, 180, 240, 300].map(x => (
      <line key={x} x1={x} y1="0" x2={x} y2="320" stroke="#2a1a0522" strokeWidth="1" />
    ))}
    {[60, 120, 180, 240].map(y => (
      <line key={y} x1="0" y1={y} x2="390" y2={y} stroke="#2a1a0522" strokeWidth="1" />
    ))}

    {/* Africa silhouette (simplified) */}
    <motion.path
      d="M160 40 L200 35 L240 50 L260 80 L270 130 L265 180 L250 230 L230 270 L200 290 L170 280 L150 240 L140 190 L135 140 L140 90 Z"
      fill="#2a1a06" stroke="#78350f44" strokeWidth="2"
      animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 5, repeat: Infinity }} />

    {/* Angola highlight */}
    <motion.path
      d="M148 175 L170 168 L200 172 L218 185 L215 210 L195 225 L168 222 L150 210 Z"
      fill="#dc262644" stroke="#dc2626" strokeWidth="1.5"
      animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2.5, repeat: Infinity }} />
    <motion.circle cx="182" cy="196" r="4" fill="#dc2626"
      animate={{ scale: [1, 1.8, 1], opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }} />

    {/* Decorative compass */}
    <g transform="translate(50, 250)">
      <circle cx="0" cy="0" r="28" fill="none" stroke="#78350f44" strokeWidth="1.5" />
      <circle cx="0" cy="0" r="22" fill="#0f0800" stroke="#78350f33" strokeWidth="1" />
      {["N","S","E","O"].map((d, i) => (
        <text key={d} x={[0, 0, 16, -16][i]} y={[-15, 18, 5, 5][i]}
          fill="#78350f" fontSize="8" fontWeight="bold" textAnchor="middle">{d}</text>
      ))}
      <motion.g animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "0px 0px" }}>
        <polygon points="0,-18 3,0 -3,0" fill="#dc2626" />
        <polygon points="0,18 3,0 -3,0" fill="#78350f" />
      </motion.g>
    </g>

    {/* Old scroll on right */}
    <motion.g animate={{ y: [0, -3, 0] }} transition={{ duration: 4, repeat: Infinity }}>
      <rect x="290" y="80" width="80" height="100" rx="4" fill="#1a0e02" stroke="#78350f44" strokeWidth="1.5" />
      {[95, 108, 121, 134, 147].map((y, i) => (
        <line key={i} x1="298" y1={y} x2={360 - i * 5} y2={y} stroke="#78350f33" strokeWidth="1" />
      ))}
    </motion.g>

    {/* Floating embers */}
    {[80, 160, 250, 340].map((x, i) => (
      <motion.circle key={i} cx={x} r={2} fill="#fb923c66"
        initial={{ cy: 320 }} animate={{ cy: 0, opacity: [0, 0.8, 0] }}
        transition={{ duration: 5 + i, repeat: Infinity, delay: i * 1.2, ease: "linear" }} />
    ))}
  </svg>
);

// ── Scene selector ─────────────────────────────────────────────────────────────

export type SceneType = "classroom" | "laboratory" | "angola" | "space" | "history";

const SUBJECT_SCENE: Record<string, SceneType> = {
  matemática: "classroom", física: "space", química: "laboratory",
  biologia: "laboratory", história: "history", geografia: "angola",
  português: "classroom", inglês: "classroom",
};

export function getSceneForSubject(subject: string): SceneType {
  const key = Object.keys(SUBJECT_SCENE).find(k => subject.toLowerCase().includes(k));
  return SUBJECT_SCENE[key ?? ""] ?? "classroom";
}

export const SceneBackground: React.FC<{ type: SceneType }> = ({ type }) => {
  switch (type) {
    case "laboratory": return <LaboratoryScene />;
    case "angola":     return <AngolaScene />;
    case "space":      return <SpaceScene />;
    case "history":    return <HistoryScene />;
    default:           return <ClassroomScene />;
  }
};
