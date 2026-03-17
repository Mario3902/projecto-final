import { useState, useEffect, useRef } from "react";
import { planets, Planet } from "../data/planets";

interface SolarSystemProps {
  onPlanetClick: (planet: Planet) => void;
  onSunClick: () => void;
  isPaused: boolean;
  zoomedPlanet: string | null;
}

export default function SolarSystem({ onPlanetClick, onSunClick, isPaused, zoomedPlanet }: SolarSystemProps) {
  const [time, setTime] = useState(0);
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [center, setCenter] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const animRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    const updateCenter = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCenter({ x: rect.width / 2, y: rect.height / 2 });
        const minDim = Math.min(rect.width, rect.height);
        setScale(minDim / 1050);
      }
    };
    updateCenter();
    window.addEventListener("resize", updateCenter);
    return () => window.removeEventListener("resize", updateCenter);
  }, []);

  useEffect(() => {
    if (isPaused) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }
    const animate = (timestamp: number) => {
      if (lastTimeRef.current) {
        const delta = (timestamp - lastTimeRef.current) / 1000;
        setTime(t => t + delta * 0.3);
      }
      lastTimeRef.current = timestamp;
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      lastTimeRef.current = 0;
    };
  }, [isPaused]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: (e.clientX - rect.left - rect.width / 2) * 0.005,
        y: (e.clientY - rect.top - rect.height / 2) * 0.005,
      });
    }
  };

  const getPlanetPosition = (planet: Planet) => {
    const angle = time * planet.orbitSpeed * 0.06;
    const r = planet.orbitRadius * scale;
    return {
      x: center.x + Math.cos(angle) * r,
      y: center.y + Math.sin(angle) * r * 0.4,
      depth: Math.sin(angle),
    };
  };

  // Sort planets by depth for proper z-ordering
  const sortedPlanets = [...planets]
    .map(p => ({ ...p, pos: getPlanetPosition(p) }))
    .sort((a, b) => a.pos.depth - b.pos.depth);

  const containerStyle: React.CSSProperties = zoomedPlanet
    ? {
        transform: `scale(0.1) rotate(10deg)`,
        opacity: 0,
        transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
      }
    : {
        transform: `perspective(1500px) rotateX(${2 + mousePos.y}deg) rotateY(${mousePos.x}deg)`,
        opacity: 1,
        transition: "transform 0.1s ease-out, opacity 0.5s",
      };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      onMouseMove={handleMouseMove}
      style={containerStyle}
    >
      {/* Orbit paths */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          {planets.map(planet => (
            <linearGradient key={`grad-${planet.id}`} id={`orbit-grad-${planet.id}`}>
              <stop offset="0%" stopColor={planet.color} stopOpacity="0.15" />
              <stop offset="50%" stopColor={planet.color} stopOpacity="0.05" />
              <stop offset="100%" stopColor={planet.color} stopOpacity="0.15" />
            </linearGradient>
          ))}
        </defs>
        {planets.map((planet) => (
          <ellipse
            key={`orbit-${planet.id}`}
            cx={center.x}
            cy={center.y}
            rx={planet.orbitRadius * scale}
            ry={planet.orbitRadius * scale * 0.4}
            fill="none"
            stroke={hoveredPlanet === planet.id ? `${planet.color}40` : `url(#orbit-grad-${planet.id})`}
            strokeWidth={hoveredPlanet === planet.id ? 2 : 1}
            strokeDasharray={hoveredPlanet === planet.id ? "none" : "6 4"}
            className="orbit-line"
            style={{ transition: "stroke 0.3s, stroke-width 0.3s" }}
          />
        ))}
      </svg>

      {/* Sun glow layers */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          left: center.x - 120 * scale,
          top: center.y - 120 * scale,
          width: 240 * scale,
          height: 240 * scale,
          background: "radial-gradient(circle, rgba(255,170,0,0.15) 0%, rgba(255,100,0,0.05) 40%, transparent 70%)",
          filter: "blur(10px)",
        }}
      />
      <div
        className="absolute rounded-full pointer-events-none atmosphere-glow"
        style={{
          left: center.x - 80 * scale,
          top: center.y - 80 * scale,
          width: 160 * scale,
          height: 160 * scale,
          background: "radial-gradient(circle, rgba(255,200,0,0.12) 0%, rgba(255,140,0,0.04) 50%, transparent 70%)",
        }}
      />

      {/* Sun */}
      <button
        onClick={onSunClick}
        className="absolute cursor-pointer group z-10"
        style={{
          left: center.x - 40 * scale,
          top: center.y - 40 * scale,
          width: 80 * scale,
          height: 80 * scale,
        }}
      >
        <div
          className="w-full h-full rounded-full transition-transform group-hover:scale-110 relative"
          style={{
            background: "radial-gradient(circle at 30% 30%, #ffffff, #fff700 20%, #ffcc00 40%, #ffaa00 60%, #ff7700 80%, #ff4400)",
            boxShadow: `0 0 ${30 * scale}px #ffcc00, 0 0 ${60 * scale}px #ffaa0080, 0 0 ${120 * scale}px #ff660040`,
          }}
        >
          {/* Sun surface texture */}
          <div
            className="absolute inset-1 rounded-full opacity-40 planet-3d"
            style={{
              background: "repeating-radial-gradient(circle at 40% 40%, transparent 0%, rgba(255,150,0,0.3) 3%, transparent 6%)",
              mixBlendMode: "overlay",
            }}
          />
          {/* Corona wisps */}
          <div className="absolute -inset-3 rounded-full opacity-30 animate-pulse"
            style={{
              background: "radial-gradient(circle, transparent 45%, rgba(255,200,0,0.2) 55%, transparent 65%)",
            }}
          />
        </div>
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-yellow-300 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap drop-shadow-lg">
          ☀️ Sol
        </div>
      </button>

      {/* Planets */}
      {sortedPlanets.map((planet) => {
        const pos = planet.pos;
        const isHovered = hoveredPlanet === planet.id;
        const depthScale = 0.7 + (pos.depth + 1) * 0.2;
        const planetSize = planet.size * scale * depthScale;
        const depthOpacity = 0.6 + (pos.depth + 1) * 0.25;

        return (
          <button
            key={planet.id}
            className="absolute cursor-pointer group"
            style={{
              left: pos.x - planetSize,
              top: pos.y - planetSize,
              width: planetSize * 2,
              height: planetSize * 2,
              zIndex: Math.round((pos.depth + 1) * 100),
              transition: "filter 0.3s",
              transform: isHovered ? "scale(1.35)" : "scale(1)",
              filter: `brightness(${isHovered ? 1.3 : depthOpacity})`,
            }}
            onClick={() => onPlanetClick(planet)}
            onMouseEnter={() => setHoveredPlanet(planet.id)}
            onMouseLeave={() => setHoveredPlanet(null)}
          >
            {/* Atmosphere glow */}
            {planet.hasAtmosphere && (
              <div
                className="absolute rounded-full atmosphere-glow"
                style={{
                  inset: `-${planetSize * 0.2}px`,
                  background: `radial-gradient(circle, ${planet.atmosphereColor}, transparent 70%)`,
                  opacity: isHovered ? 0.8 : 0.4,
                }}
              />
            )}

            {/* Planet body */}
            <div
              className="w-full h-full rounded-full relative overflow-hidden"
              style={{
                background: planet.texture,
                boxShadow: isHovered
                  ? `0 0 ${25 * scale}px ${planet.color}80, 0 0 ${50 * scale}px ${planet.color}40, inset -${planetSize * 0.15}px -${planetSize * 0.1}px ${planetSize * 0.3}px rgba(0,0,0,0.5)`
                  : `0 0 ${8 * scale}px ${planet.color}30, inset -${planetSize * 0.15}px -${planetSize * 0.1}px ${planetSize * 0.3}px rgba(0,0,0,0.5)`,
                transition: "box-shadow 0.3s",
              }}
            >
              {/* Rotating surface */}
              <div
                className="absolute inset-0 rounded-full planet-3d opacity-30"
                style={{
                  background: `repeating-linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 25%, transparent 50%)`,
                  backgroundSize: "200% 100%",
                  mixBlendMode: "overlay",
                }}
              />
              {/* Specular highlight */}
              <div
                className="absolute rounded-full"
                style={{
                  top: "8%",
                  left: "12%",
                  width: "35%",
                  height: "25%",
                  background: "radial-gradient(ellipse, rgba(255,255,255,0.25), transparent)",
                  filter: "blur(2px)",
                }}
              />
              {/* Terminator shadow */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: "linear-gradient(100deg, transparent 30%, rgba(0,0,0,0.3) 55%, rgba(0,0,0,0.7) 100%)",
                }}
              />
            </div>

            {/* Ring for Saturn/Uranus */}
            {planet.ringColor && (
              <>
                <div
                  className="absolute top-1/2 left-1/2 rounded-full pointer-events-none"
                  style={{
                    width: planetSize * 3,
                    height: planetSize * 0.8,
                    transform: "translate(-50%, -50%) rotateX(75deg)",
                    background: `linear-gradient(90deg, transparent 5%, ${planet.ringColor}20 15%, ${planet.ringColor}50 30%, ${planet.ringColor}30 50%, ${planet.ringColor}50 70%, ${planet.ringColor}20 85%, transparent 95%)`,
                    border: `1px solid ${planet.ringColor}30`,
                    borderRadius: "50%",
                    boxShadow: `0 0 8px ${planet.ringColor}20`,
                  }}
                />
                <div
                  className="absolute top-1/2 left-1/2 rounded-full pointer-events-none"
                  style={{
                    width: planetSize * 2.4,
                    height: planetSize * 0.6,
                    transform: "translate(-50%, -50%) rotateX(75deg)",
                    border: `1px solid ${planet.ringColor}40`,
                    borderRadius: "50%",
                  }}
                />
              </>
            )}

            {/* Name tooltip */}
            <div
              className="absolute left-1/2 -translate-x-1/2 font-bold whitespace-nowrap pointer-events-none transition-all duration-300"
              style={{
                bottom: -(22 * scale),
                color: planet.color,
                opacity: isHovered ? 1 : 0,
                fontSize: `${Math.max(11, 13 * scale)}px`,
                textShadow: `0 0 10px ${planet.color}80`,
                transform: `translateX(-50%) translateY(${isHovered ? 0 : 5}px)`,
              }}
            >
              {planet.namePt}
              <span className="block text-center text-[9px] opacity-60 font-normal">clique para mergulhar</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
