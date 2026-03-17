import { planets, Planet } from "@/data/planets";

interface PlanetListProps {
  onPlanetClick: (planet: Planet) => void;
  onSunClick: () => void;
  activePlanet: string | null;
}

export default function PlanetList({ onPlanetClick, onSunClick, activePlanet }: PlanetListProps) {
  return (
    <div className="absolute left-0 top-0 bottom-0 w-16 md:w-[72px] solar-glass-strong z-30 flex flex-col items-center py-4 gap-2.5 overflow-y-auto">
      {/* Sun */}
      <button
        onClick={onSunClick}
        className="solar-tooltip-planet group relative flex items-center justify-center w-11 h-11 md:w-12 md:h-12 rounded-full transition-all hover:scale-110 cursor-pointer mb-1 flex-shrink-0"
        data-tooltip="☀️ Sol"
        style={{
          background: "radial-gradient(circle at 30% 30%, #ffffff, #fff700 20%, #ffcc00 50%, #ff7700)",
          boxShadow: "0 0 15px #ffaa0080, 0 0 30px #ff660030",
        }}
      >
        <div className="absolute inset-0 rounded-full animate-pulse" style={{
          boxShadow: "0 0 20px #ffaa0060",
        }} />
      </button>

      <div className="w-8 h-px bg-white/10 my-0.5 flex-shrink-0" />

      {/* Planets */}
      {planets.map((planet) => {
        const isActive = activePlanet === planet.id;
        const btnSize = Math.max(28, Math.min(planet.size * 1.4, 46));
        return (
          <button
            key={planet.id}
            onClick={() => onPlanetClick(planet)}
            className="solar-tooltip-planet group relative flex items-center justify-center rounded-full transition-all hover:scale-110 cursor-pointer flex-shrink-0"
            data-tooltip={planet.namePt}
            style={{
              width: `${btnSize}px`,
              height: `${btnSize}px`,
              background: planet.texture,
              boxShadow: isActive
                ? `0 0 15px ${planet.color}80, 0 0 30px ${planet.color}30`
                : `0 0 6px ${planet.color}30`,
              border: isActive ? `2px solid ${planet.color}60` : "1px solid transparent",
              transform: isActive ? "scale(1.15)" : undefined,
            }}
          >
            {/* Specular */}
            <div className="absolute rounded-full" style={{
              top: "10%", left: "15%", width: "30%", height: "20%",
              background: "radial-gradient(ellipse, rgba(255,255,255,0.2), transparent)",
            }} />
            {/* Shadow */}
            <div className="absolute inset-0 rounded-full" style={{
              background: "linear-gradient(120deg, transparent 40%, rgba(0,0,0,0.4) 100%)",
            }} />

            {/* Ring for Saturn/Uranus */}
            {planet.ringColor && (
              <div className="absolute top-1/2 left-1/2 rounded-full pointer-events-none" style={{
                width: `${btnSize * 1.5}px`,
                height: `${btnSize * 0.35}px`,
                transform: "translate(-50%, -50%) rotateX(75deg)",
                border: `1px solid ${planet.ringColor}60`,
                borderRadius: "50%",
              }} />
            )}

            {/* Active indicator */}
            {isActive && (
              <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full" style={{
                backgroundColor: planet.color,
                boxShadow: `0 0 6px ${planet.color}`,
              }} />
            )}
          </button>
        );
      })}
    </div>
  );
}
