import React, { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, ImageDown, Loader2, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { SkillTopic } from "@/lib/gemini";

// ── Design tokens ──────────────────────────────────────────────────────────────
const C = {
  básico:   { ring: "#72EB3A", fill: "#1B1D24", glow: "#72EB3A30", label: "#72EB3A", dim: "#365A08" },
  médio:    { ring: "#fbbf24", fill: "#231a06", glow: "#fbbf2430", label: "#fbbf24", dim: "#92400e" },
  avançado: { ring: "#f87171", fill: "#230c0c", glow: "#f8717130", label: "#f87171", dim: "#991b1b" },
} as const;

type Diff = keyof typeof C;

// ── Layout ─────────────────────────────────────────────────────────────────────
const S   = 740;          // SVG canvas size
const CX  = S / 2;
const CY  = S / 2;
const CR  = 56;           // center radius
const OR  = 168;          // orbit radius (topic nodes)
const SR  = 82;           // sub-orbit radius
const NR  = 42;           // node radius

function polar(cx: number, cy: number, r: number, deg: number) {
  const a = (deg - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function cubicPath(x1: number, y1: number, x2: number, y2: number) {
  const cpx = (x1 + x2) / 2;
  return `M ${x1} ${y1} C ${cpx} ${y1} ${cpx} ${y2} ${x2} ${y2}`;
}

// ── Types ──────────────────────────────────────────────────────────────────────
interface MindMapProps {
  subject: string;
  topics: SkillTopic[];
  onTopicClick?: (topic: SkillTopic) => void;
}

// ── Component ──────────────────────────────────────────────────────────────────
const MindMap: React.FC<MindMapProps> = ({ subject, topics, onTopicClick }) => {
  const [selected, setSelected]     = useState<string | null>(null);
  const [hovered,  setHovered]      = useState<string | null>(null);
  const [zoom,     setZoom]         = useState(1);
  const [generating, setGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const step = topics.length > 0 ? 360 / topics.length : 0;

  const subtopicsOf = (t: SkillTopic) =>
    t.description.split(/[,.]/).map(s => s.trim()).filter(s => s.length > 3 && s.length < 36).slice(0, 4);

  const handleClick = useCallback((t: SkillTopic) => {
    setSelected(p => (p === t.id ? null : t.id));
    onTopicClick?.(t);
  }, [onTopicClick]);

  // ── PNG export ──────────────────────────────────────────────────────────────
  const generateImage = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;
    setGenerating(true);
    setPreviewUrl(null);
    try {
      const clone = svg.cloneNode(true) as SVGSVGElement;
      clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      clone.setAttribute("viewBox", `0 0 ${S} ${S}`);
      const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      bg.setAttribute("width", String(S)); bg.setAttribute("height", String(S)); bg.setAttribute("fill", "#0f1209");
      clone.insertBefore(bg, clone.firstChild);
      const svgStr  = new XMLSerializer().serializeToString(clone);
      const blob    = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
      const url     = URL.createObjectURL(blob);
      const scale   = 2;
      const canvas  = document.createElement("canvas");
      canvas.width  = S * scale; canvas.height = S * scale;
      const ctx     = canvas.getContext("2d")!;
      ctx.scale(scale, scale);
      const img     = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, S, S);
        URL.revokeObjectURL(url);
        setPreviewUrl(canvas.toDataURL("image/png"));
        setGenerating(false);
      };
      img.onerror = () => { URL.revokeObjectURL(url); setGenerating(false); };
      img.src = url;
    } catch { setGenerating(false); }
  }, []);

  const downloadImage = useCallback(() => {
    if (!previewUrl) return;
    const a = document.createElement("a");
    a.href = previewUrl;
    a.download = `mapa-mental-${subject.toLowerCase().replace(/\s+/g, "-")}.png`;
    a.click();
  }, [previewUrl, subject]);

  // ── Zoom viewBox ────────────────────────────────────────────────────────────
  const vSize   = S / zoom;
  const vOffset = (S - vSize) / 2;
  const vb      = `${vOffset} ${vOffset} ${vSize} ${vSize}`;

  return (
    <div className="flex flex-col gap-3">
      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <button onClick={() => setZoom(z => Math.min(z + 0.3, 2.5))}
            className="p-2 rounded-xl bg-[#1C2210] border border-[#365A08] text-[#72EB3A] hover:bg-[#2a3a08] transition-colors">
            <ZoomIn className="h-4 w-4" />
          </button>
          <button onClick={() => setZoom(1)}
            className="px-2.5 py-1.5 rounded-xl bg-[#1C2210] border border-[#365A08] text-slate-400 text-[10px] font-black hover:text-white transition-colors">
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => setZoom(z => Math.max(z - 0.3, 0.5))}
            className="p-2 rounded-xl bg-[#1C2210] border border-[#365A08] text-[#72EB3A] hover:bg-[#2a3a08] transition-colors">
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="text-[10px] text-slate-600 font-bold ml-1">{Math.round(zoom * 100)}%</span>
        </div>
        <button onClick={generateImage} disabled={generating}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#72EB3A]/10 border border-[#72EB3A]/30 text-[#72EB3A] text-[10px] font-black hover:bg-[#72EB3A]/20 transition-colors disabled:opacity-40">
          {generating ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />A gerar...</> : <><ImageDown className="h-3.5 w-3.5" />Gerar Imagem</>}
        </button>
      </div>

      {/* ── SVG ── */}
      <div className="w-full rounded-2xl bg-[#0f1209] border border-[#2a3a08] overflow-hidden">
        <svg ref={svgRef} viewBox={vb} className="w-full" style={{ minHeight: 360, maxHeight: 560, transition: "0.35s ease" }}>
          <defs>
            {/* Radial gradients */}
            <radialGradient id="cGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#163d22" /><stop offset="100%" stopColor="#0f1209" />
            </radialGradient>
            {(Object.keys(C) as Diff[]).map(d => (
              <radialGradient key={d} id={`g-${d}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={C[d].fill} /><stop offset="100%" stopColor="#0f1209" />
              </radialGradient>
            ))}
            {/* Glow filter */}
            <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="8" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            {/* Soft shadow */}
            <filter id="sh" x="-25%" y="-25%" width="150%" height="150%">
              <feDropShadow dx="0" dy="3" stdDeviation="6" floodColor="#000" floodOpacity="0.6" />
            </filter>
            {/* Subtle node shadow */}
            <filter id="ns" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#000" floodOpacity="0.5" />
            </filter>
          </defs>

          {/* Background grid */}
          {Array.from({ length: 14 }).map((_, r) =>
            Array.from({ length: 14 }).map((_, c) => (
              <circle key={`${r}-${c}`} cx={c * 56} cy={r * 56} r={1.2} fill="#0d1f10" />
            ))
          )}

          {/* Orbit ring (decorative) */}
          <circle cx={CX} cy={CY} r={OR} fill="none" stroke="#2a3a08" strokeWidth={1} strokeDasharray="6 10" opacity={0.5} />
          <circle cx={CX} cy={CY} r={OR + 28} fill="none" stroke="#2a3a08" strokeWidth={0.5} strokeDasharray="2 14" opacity={0.3} />

          {/* Center pulse rings */}
          {[88, 110, 132].map((r, i) => (
            <motion.circle key={r} cx={CX} cy={CY} r={r} fill="none" stroke="#72EB3A"
              animate={{ opacity: [0.04, 0.12, 0.04], r: [r, r + 4, r] }}
              transition={{ duration: 3.5, repeat: Infinity, delay: i * 0.9, ease: "easeInOut" }} />
          ))}

          {/* ── Connection lines ── */}
          {topics.map((t, i) => {
            const pos  = polar(CX, CY, OR, i * step);
            const diff = (C[t.difficulty as Diff] ? t.difficulty : "básico") as Diff;
            const col  = C[diff];
            const isSel = selected === t.id;
            return (
              <motion.path key={`line-${t.id}`}
                d={cubicPath(CX, CY, pos.x, pos.y)}
                stroke={col.ring}
                strokeWidth={isSel ? 2.5 : 1.5}
                strokeOpacity={isSel ? 0.85 : 0.28}
                fill="none"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.9, delay: i * 0.07, ease: "easeOut" }} />
            );
          })}

          {/* ── Topic nodes ── */}
          {topics.map((t, i) => {
            const pos   = polar(CX, CY, OR, i * step);
            const diff  = (C[t.difficulty as Diff] ? t.difficulty : "básico") as Diff;
            const col   = C[diff];
            const isSel = selected === t.id;
            const isHov = hovered === t.id;
            const subs  = subtopicsOf(t);

            return (
              <g key={t.id}>
                {/* ── Subtopics ── */}
                <AnimatePresence>
                  {isSel && subs.map((sub, si) => {
                    const subAngle = i * step + (si - (subs.length - 1) / 2) * 28;
                    const sp = polar(pos.x, pos.y, SR, subAngle);
                    return (
                      <motion.g key={si}
                        initial={{ opacity: 0, scale: 0.4 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.4 }}
                        transition={{ type: "spring", stiffness: 260, damping: 22, delay: si * 0.06 }}>
                        <line x1={pos.x} y1={pos.y} x2={sp.x} y2={sp.y}
                          stroke={col.ring} strokeWidth={1.5} strokeOpacity={0.45} strokeDasharray="4 3" />
                        {/* Pill */}
                        <rect x={sp.x - 44} y={sp.y - 14} width={88} height={28} rx={14}
                          fill="#0f1209" stroke={col.ring} strokeWidth={1.5} strokeOpacity={0.65} filter="url(#ns)" />
                        <rect x={sp.x - 44} y={sp.y - 14} width={88} height={28} rx={14}
                          fill={col.glow} />
                        <text x={sp.x} y={sp.y + 5} textAnchor="middle" fill={col.label}
                          fontSize={9.5} fontWeight="600" fontFamily="system-ui,sans-serif" style={{ userSelect: "none" }}>
                          {sub.length > 15 ? sub.slice(0, 15) + "…" : sub}
                        </text>
                      </motion.g>
                    );
                  })}
                </AnimatePresence>

                {/* Node glow halo */}
                <AnimatePresence>
                  {(isSel || isHov) && (
                    <motion.circle cx={pos.x} cy={pos.y} r={NR + 22}
                      fill={col.glow} filter="url(#glow)"
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      transition={{ duration: 0.2 }} />
                  )}
                </AnimatePresence>

                {/* Main node */}
                <motion.g
                  style={{ cursor: "pointer", transformOrigin: `${pos.x}px ${pos.y}px` }}
                  whileHover={{ scale: 1.13 }}
                  whileTap={{ scale: 0.93 }}
                  onClick={() => handleClick(t)}
                  onMouseEnter={() => setHovered(t.id)}
                  onMouseLeave={() => setHovered(null)}
                  initial={{ opacity: 0, scale: 0.3 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 220, damping: 18, delay: 0.15 + i * 0.07 }}>

                  {/* Outer glow ring (selected) */}
                  {isSel && (
                    <motion.circle cx={pos.x} cy={pos.y} r={NR + 8}
                      fill="none" stroke={col.ring} strokeWidth={1.5} strokeOpacity={0.3}
                      animate={{ r: [NR + 8, NR + 12, NR + 8] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }} />
                  )}

                  {/* Node body */}
                  <circle cx={pos.x} cy={pos.y} r={NR}
                    fill={`url(#g-${diff})`}
                    stroke={col.ring}
                    strokeWidth={isSel ? 3 : isHov ? 2.5 : 1.8}
                    filter="url(#ns)" />

                  {/* Inner ring */}
                  <circle cx={pos.x} cy={pos.y} r={NR - 7}
                    fill="none" stroke={col.ring} strokeWidth={1} strokeOpacity={isSel ? 0.35 : 0.15} />

                  {/* Difficulty dot (top-right) */}
                  <circle cx={pos.x + NR * 0.62} cy={pos.y - NR * 0.62} r={5.5}
                    fill={col.ring} filter="url(#ns)" />

                  {/* Emoji */}
                  <text x={pos.x} y={pos.y - 4} textAnchor="middle" fontSize={19} style={{ userSelect: "none" }}>
                    {t.emoji}
                  </text>

                  {/* Name */}
                  <text x={pos.x} y={pos.y + 16} textAnchor="middle" fill={col.label}
                    fontSize={9} fontWeight="800" fontFamily="system-ui,sans-serif"
                    letterSpacing="0.3" style={{ userSelect: "none" }}>
                    {t.name.length > 11 ? t.name.slice(0, 11) + "…" : t.name}
                  </text>
                </motion.g>

                {/* Hover tooltip */}
                <AnimatePresence>
                  {isHov && !isSel && (
                    <motion.g
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.18 }}>
                      {/* Tooltip box */}
                      <rect x={pos.x - 70} y={pos.y + NR + 8} width={140} height={36} rx={10}
                        fill="#141a08" stroke={col.ring} strokeWidth={1.5} strokeOpacity={0.6} filter="url(#ns)" />
                      <text x={pos.x} y={pos.y + NR + 22} textAnchor="middle" fill="#e2e8f0"
                        fontSize={9} fontFamily="system-ui,sans-serif" style={{ userSelect: "none" }}>
                        {t.description.length > 28 ? t.description.slice(0, 28) + "…" : t.description}
                      </text>
                      <text x={pos.x} y={pos.y + NR + 35} textAnchor="middle" fill={col.label}
                        fontSize={8} fontWeight="700" fontFamily="system-ui,sans-serif" style={{ userSelect: "none" }}>
                        {diff} · toca para expandir
                      </text>
                    </motion.g>
                  )}
                </AnimatePresence>
              </g>
            );
          })}

          {/* ── Center node ── */}
          <motion.g
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 180, damping: 16 }}>
            {/* Outer glow */}
            <circle cx={CX} cy={CY} r={CR + 18} fill="#72EB3A" opacity={0.05} filter="url(#glow)" />
            {/* Body */}
            <circle cx={CX} cy={CY} r={CR} fill="url(#cGrad)" stroke="#72EB3A" strokeWidth={2.5} filter="url(#sh)" />
            {/* Inner ring */}
            <circle cx={CX} cy={CY} r={CR - 9} fill="none" stroke="#72EB3A" strokeWidth={1} strokeOpacity={0.3} />
            {/* Label */}
            <text x={CX} y={CY - 7} textAnchor="middle" fill="#72EB3A"
              fontSize={13} fontWeight="900" fontFamily="system-ui,sans-serif">
              {subject.length > 9 ? subject.slice(0, 9) + "…" : subject}
            </text>
            <text x={CX} y={CY + 11} textAnchor="middle" fill="#72EB3A"
              fontSize={9} opacity={0.45} fontFamily="system-ui,sans-serif">
              {topics.length} tópicos
            </text>
          </motion.g>
        </svg>

        {/* ── Legend ── */}
        <div className="flex items-center gap-3 px-4 py-2.5 border-t border-[#2a3a08] justify-between">
          <div className="flex gap-4">
            {(Object.keys(C) as Diff[]).map(d => (
              <div key={d} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: C[d].ring, boxShadow: `0 0 6px ${C[d].ring}66` }} />
                <span className="text-[10px] font-bold" style={{ color: C[d].label }}>{d}</span>
              </div>
            ))}
          </div>
          <span className="text-[10px] text-slate-600">Passa o rato · toca para expandir</span>
        </div>
      </div>

      {/* ── Image preview ── */}
      <AnimatePresence>
        {previewUrl && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="rounded-2xl overflow-hidden border border-[#365A08] bg-[#0f1209]">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#365A08]/60">
              <span className="text-xs font-black text-white">📸 Mapa Mental</span>
              <button onClick={downloadImage}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#72EB3A] text-[#1B1D24] text-[10px] font-black hover:bg-[#72EB3A]/90 transition-colors">
                <Download className="h-3 w-3" /> Guardar PNG
              </button>
            </div>
            <img src={previewUrl} alt={`Mapa mental ${subject}`} className="w-full" style={{ imageRendering: "crisp-edges" }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MindMap;
