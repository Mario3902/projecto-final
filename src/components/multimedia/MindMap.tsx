import React, { useState, useCallback, useRef } from "react";
import { SkillTopic } from "@/lib/gemini";

interface MindMapProps {
  subject: string;
  topics: SkillTopic[];
  onTopicClick?: (topic: SkillTopic) => void;
}

const DIFF_COLORS: Record<string, { stroke: string; fill: string; text: string }> = {
  básico:   { stroke: "#4ade80", fill: "#1a261d", text: "#4ade80" },
  médio:    { stroke: "#fbbf24", fill: "#2a2010", text: "#fbbf24" },
  avançado: { stroke: "#f87171", fill: "#2a1010", text: "#f87171" },
};

function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

// Cubic bezier control points for curved lines
function bezierPath(x1: number, y1: number, x2: number, y2: number) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  return `M ${x1} ${y1} Q ${mx} ${y1} ${x2} ${y2}`;
}

const NODE_R = 34;
const CENTER_R = 48;
const ORBIT_R = 140;
const SUB_ORBIT_R = 70;
const SVG_SIZE = 700;
const CX = SVG_SIZE / 2;
const CY = SVG_SIZE / 2;

const MindMap: React.FC<MindMapProps> = ({ subject, topics, onTopicClick }) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [hovered, setHovered] = useState<string | null>(null);

  const toggleExpand = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const angleStep = topics.length > 0 ? 360 / topics.length : 360;

  // Build subtopic labels from topic description
  const getSubtopics = (t: SkillTopic): string[] =>
    t.description.split(/[,.]/).map((s) => s.trim()).filter((s) => s.length > 2 && s.length < 30).slice(0, 3);

  return (
    <div className="w-full overflow-auto rounded-2xl bg-[#0a120c] border border-[#254238]">
      <svg
        viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
        className="w-full"
        style={{ minHeight: 340, maxHeight: 520 }}
      >
        {/* Background grid dots */}
        {Array.from({ length: 12 }).map((_, row) =>
          Array.from({ length: 12 }).map((_, col) => (
            <circle
              key={`${row}-${col}`}
              cx={col * 64}
              cy={row * 64}
              r={1.5}
              fill="#1a261d"
            />
          ))
        )}

        {/* Center glow */}
        <circle cx={CX} cy={CY} r={CENTER_R + 20} fill="#4ade80" opacity={0.04} />
        <circle cx={CX} cy={CY} r={CENTER_R + 10} fill="#4ade80" opacity={0.06} />

        {topics.map((topic, idx) => {
          const angle = idx * angleStep;
          const pos = polarToXY(CX, CY, ORBIT_R, angle);
          const colors = DIFF_COLORS[topic.difficulty] || DIFF_COLORS.básico;
          const isExp = expanded.has(topic.id);
          const isHov = hovered === topic.id;
          const subtopics = getSubtopics(topic);

          return (
            <g key={topic.id}>
              {/* Connector line center → topic */}
              <path
                d={bezierPath(CX, CY, pos.x, pos.y)}
                stroke={colors.stroke}
                strokeWidth={isExp ? 2.5 : 1.5}
                strokeOpacity={isExp ? 0.8 : 0.3}
                fill="none"
                strokeDasharray={isExp ? "none" : "5 3"}
              />

              {/* Subtopics (expanded) */}
              {isExp && subtopics.map((sub, si) => {
                const subAngle = angle + (si - 1) * 22;
                const subPos = polarToXY(pos.x, pos.y, SUB_ORBIT_R, subAngle);
                return (
                  <g key={si}>
                    <line
                      x1={pos.x} y1={pos.y}
                      x2={subPos.x} y2={subPos.y}
                      stroke={colors.stroke}
                      strokeWidth={1}
                      strokeOpacity={0.4}
                      strokeDasharray="3 2"
                    />
                    <rect
                      x={subPos.x - 38} y={subPos.y - 12}
                      width={76} height={24}
                      rx={12}
                      fill={colors.fill}
                      stroke={colors.stroke}
                      strokeWidth={1}
                      strokeOpacity={0.5}
                    />
                    <text
                      x={subPos.x} y={subPos.y + 4}
                      textAnchor="middle"
                      fill={colors.text}
                      fontSize={9}
                      fontWeight="600"
                      fontFamily="Plus Jakarta Sans, system-ui, sans-serif"
                    >
                      {sub.length > 12 ? sub.slice(0, 12) + "…" : sub}
                    </text>
                  </g>
                );
              })}

              {/* Topic node circle */}
              <circle
                cx={pos.x} cy={pos.y} r={NODE_R + (isHov ? 4 : 0)}
                fill={colors.fill}
                stroke={colors.stroke}
                strokeWidth={isHov || isExp ? 2.5 : 1.5}
                style={{ cursor: "pointer", transition: "r 0.2s" }}
                onClick={() => {
                  toggleExpand(topic.id);
                  onTopicClick?.(topic);
                }}
                onMouseEnter={() => setHovered(topic.id)}
                onMouseLeave={() => setHovered(null)}
              />

              {/* Emoji */}
              <text
                x={pos.x} y={pos.y - 6}
                textAnchor="middle"
                fontSize={17}
                style={{ cursor: "pointer", userSelect: "none" }}
                onClick={() => { toggleExpand(topic.id); onTopicClick?.(topic); }}
              >
                {topic.emoji}
              </text>

              {/* Topic name */}
              <text
                x={pos.x} y={pos.y + 11}
                textAnchor="middle"
                fill={colors.text}
                fontSize={8.5}
                fontWeight="700"
                fontFamily="Plus Jakarta Sans, system-ui, sans-serif"
                style={{ cursor: "pointer", userSelect: "none" }}
                onClick={() => { toggleExpand(topic.id); onTopicClick?.(topic); }}
              >
                {topic.name.length > 12 ? topic.name.slice(0, 12) + "…" : topic.name}
              </text>

              {/* Expand indicator */}
              {isExp && (
                <text x={pos.x + NODE_R - 6} y={pos.y - NODE_R + 8} textAnchor="middle" fontSize={10}>
                  ✕
                </text>
              )}
            </g>
          );
        })}

        {/* Center node */}
        <circle cx={CX} cy={CY} r={CENTER_R} fill="#141e16" stroke="#4ade80" strokeWidth={2.5} />
        <text
          x={CX} y={CY - 8}
          textAnchor="middle"
          fill="#4ade80"
          fontSize={12}
          fontWeight="800"
          fontFamily="Plus Jakarta Sans, system-ui, sans-serif"
        >
          {subject.length > 10 ? subject.slice(0, 10) + "…" : subject}
        </text>
        <text
          x={CX} y={CY + 8}
          textAnchor="middle"
          fill="#4ade80"
          fontSize={9}
          opacity={0.6}
          fontFamily="Plus Jakarta Sans, system-ui, sans-serif"
        >
          {topics.length} tópicos
        </text>
      </svg>

      {/* Legend */}
      <div className="flex gap-3 px-4 py-2 border-t border-[#254238]/50 justify-center">
        {Object.entries(DIFF_COLORS).map(([diff, c]) => (
          <div key={diff} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.stroke }} />
            <span className="text-[10px] font-bold" style={{ color: c.text }}>{diff}</span>
          </div>
        ))}
        <span className="text-[10px] text-slate-600 ml-2">Toca para expandir</span>
      </div>
    </div>
  );
};

export default MindMap;
