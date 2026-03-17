import { useState } from "react";
import { Planet, SUN_DATA } from "@/data/planets";

type Tab = "overview" | "structure" | "surface" | "exploration" | "compare";

interface PlanetDiveProps {
  planet: Planet | null;
  showSun: boolean;
  onClose: () => void;
}

export default function PlanetDive({ planet, showSun, onClose }: PlanetDiveProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [hoveredLayer, setHoveredLayer] = useState<number | null>(null);
  const [expandedFeature, setExpandedFeature] = useState<number | null>(null);

  if (!planet && !showSun) return null;

  const tabs: { id: Tab; label: string; icon: string }[] = planet ? [
    { id: "overview", label: "Visão Geral", icon: "🌍" },
    { id: "structure", label: "Estrutura", icon: "🔬" },
    { id: "surface", label: "Superfície", icon: "🗺️" },
    { id: "exploration", label: "Exploração", icon: "🚀" },
    { id: "compare", label: "Comparar", icon: "📊" },
  ] : [];

  // Sun view
  if (showSun) {
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center solar-animate-zoomDive" style={{ background: "radial-gradient(circle at center, rgba(40,20,0,0.95), rgba(2,0,16,0.98))" }}>
        {/* Sun ambient glow */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(circle at 35% 45%, rgba(255,170,0,0.15) 0%, transparent 50%)"
        }} />

        <button onClick={onClose}
          className="absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2.5 solar-glass rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-all cursor-pointer text-sm font-medium">
          ← Voltar ao Sistema Solar
        </button>

        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16 max-w-6xl w-full px-6 max-h-[90vh] overflow-y-auto">
          {/* Sun visual */}
          <div className="flex-shrink-0 solar-animate-fadeIn">
            <div className="relative">
              <div className="w-48 h-48 md:w-64 md:h-64 rounded-full relative" style={{
                background: "radial-gradient(circle at 30% 30%, #ffffff, #fff700 20%, #ffcc00 40%, #ffaa00 60%, #ff7700 80%, #ff4400)",
                boxShadow: "0 0 60px #ffcc00, 0 0 120px #ffaa0060, 0 0 200px #ff660030",
              }}>
                <div className="absolute inset-2 rounded-full solar-planet-3d opacity-40" style={{
                  background: "repeating-radial-gradient(circle, transparent 0%, rgba(255,100,0,0.4) 3%, transparent 6%)",
                  mixBlendMode: "overlay"
                }} />
              </div>
              {/* Layers diagram for sun */}
              <div className="mt-8 flex flex-col gap-2">
                {SUN_DATA.layers.map((layer, i) => (
                  <div key={i} className="flex items-center gap-3 solar-glass rounded-lg px-3 py-2 solar-animate-fadeInUp" style={{ animationDelay: `${i * 0.1}s` }}>
                    <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: layer.color, boxShadow: `0 0 8px ${layer.color}` }} />
                    <div>
                      <div className="text-white text-xs font-semibold">{layer.name}</div>
                      <div className="text-gray-400 text-[10px]">{layer.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sun Info */}
          <div className="flex-1 max-w-xl solar-animate-slideInRight">
            <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 mb-2">{SUN_DATA.name}</h1>
            <p className="text-yellow-200/50 text-sm mb-6">Estrela central do Sistema Solar</p>
            <p className="text-gray-300 leading-relaxed mb-6">{SUN_DATA.description}</p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {Object.entries(SUN_DATA.facts).map(([key, value], i) => {
                const labels: Record<string, string> = {
                  diameter: "⭕ Diâmetro", temperature: "🌡️ Temperatura", age: "📅 Idade",
                  type: "⭐ Tipo", mass: "⚖️ Massa", composition: "🧪 Composição",
                };
                return (
                  <div key={key} className="solar-glass rounded-xl p-3 solar-animate-fadeInUp" style={{ animationDelay: `${i * 0.08}s` }}>
                    <div className="text-yellow-400/60 text-xs font-medium mb-1">{labels[key] || key}</div>
                    <div className="text-white text-sm font-semibold">{value}</div>
                  </div>
                );
              })}
            </div>

            <div className="solar-glass rounded-xl p-4" style={{ borderColor: "rgba(255,170,0,0.2)" }}>
              <div className="text-yellow-400 font-bold text-sm mb-2">💡 Curiosidade</div>
              <p className="text-gray-300 text-sm leading-relaxed">{SUN_DATA.funFact}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!planet) return null;

  return (
    <div className="absolute inset-0 z-50 solar-animate-zoomDive" style={{
      background: `radial-gradient(circle at 30% 50%, ${planet.color}15, rgba(2,0,16,0.98) 60%)`
    }}>
      {/* Ambient particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="absolute rounded-full solar-animate-float" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 3 + 1}px`,
            height: `${Math.random() * 3 + 1}px`,
            backgroundColor: `${planet.color}40`,
            animationDelay: `${Math.random() * 4}s`,
            animationDuration: `${3 + Math.random() * 4}s`,
          }} />
        ))}
      </div>

      {/* Back button */}
      <button onClick={onClose}
        className="absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2.5 solar-glass rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-all cursor-pointer text-sm font-medium">
        ← Voltar ao Sistema Solar
      </button>

      {/* Planet name header */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 text-center">
        <h1 className="text-3xl md:text-4xl font-bold solar-animate-fadeIn" style={{ color: planet.color, textShadow: `0 0 30px ${planet.color}50` }}>
          {planet.namePt}
        </h1>
        <div className="flex items-center justify-center gap-3 mt-1">
          <span className="text-gray-400 text-xs">{planet.type}</span>
          <span className="text-gray-600">•</span>
          <span className="text-gray-400 text-xs">{planet.order}º planeta</span>
        </div>
      </div>

      {/* Content layout */}
      <div className="flex flex-col lg:flex-row h-full pt-20 pb-4 px-4 lg:px-8 gap-6 overflow-hidden">
        {/* Left: Planet visual */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center lg:w-[380px]">
          <div className="relative solar-animate-fadeIn">
            {/* Outer atmosphere */}
            {planet.hasAtmosphere && (
              <div className="absolute rounded-full solar-atmosphere-glow" style={{
                inset: "-20px",
                background: `radial-gradient(circle, ${planet.atmosphereColor}, transparent 60%)`,
              }} />
            )}
            {/* Planet */}
            <div className="w-48 h-48 md:w-60 md:h-60 rounded-full relative overflow-hidden solar-animate-float" style={{
              background: planet.texture,
              boxShadow: `0 0 40px ${planet.color}40, 0 0 80px ${planet.color}20, inset -20px -15px 40px rgba(0,0,0,0.5)`,
            }}>
              {/* Rotating surface */}
              <div className="absolute inset-0 rounded-full solar-planet-3d" style={{
                background: `repeating-linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 20%, transparent 40%)`,
                backgroundSize: "200% 100%",
                mixBlendMode: "overlay",
              }} />
              {/* Specular */}
              <div className="absolute rounded-full" style={{
                top: "10%", left: "15%", width: "30%", height: "20%",
                background: "radial-gradient(ellipse, rgba(255,255,255,0.2), transparent)",
                filter: "blur(3px)",
              }} />
              {/* Terminator */}
              <div className="absolute inset-0 rounded-full" style={{
                background: "linear-gradient(110deg, transparent 35%, rgba(0,0,0,0.3) 55%, rgba(0,0,0,0.7) 100%)",
              }} />
            </div>

            {/* Ring */}
            {planet.ringColor && (
              <div className="absolute top-1/2 left-1/2 rounded-full pointer-events-none" style={{
                width: "340px", height: "85px",
                transform: "translate(-50%, -50%) rotateX(75deg)",
                background: `linear-gradient(90deg, transparent 5%, ${planet.ringColor}20 15%, ${planet.ringColor}50 30%, ${planet.ringColor}30 50%, ${planet.ringColor}50 70%, ${planet.ringColor}20 85%, transparent 95%)`,
                border: `1px solid ${planet.ringColor}30`,
                borderRadius: "50%",
              }} />
            )}
          </div>

          {/* Quick stats below planet */}
          <div className="mt-6 grid grid-cols-2 gap-2 w-full max-w-[280px]">
            {[
              { label: "Diâmetro", value: planet.facts.diameter, icon: "⭕" },
              { label: "Gravidade", value: planet.facts.gravity, icon: "⬇️" },
              { label: "Temperatura", value: planet.facts.temperature, icon: "🌡️" },
              { label: "Luas", value: planet.facts.moons, icon: "🌙" },
            ].map((stat, i) => (
              <div key={i} className="solar-glass rounded-lg px-3 py-2 text-center solar-animate-fadeInUp" style={{ animationDelay: `${0.3 + i * 0.1}s` }}>
                <div className="text-[10px] text-gray-400">{stat.icon} {stat.label}</div>
                <div className="text-white text-xs font-bold mt-0.5">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Info panel */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Tabs */}
          <div className="flex gap-1.5 mb-4 flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setExpandedFeature(null); setHoveredLayer(null); }}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                  activeTab === tab.id ? "solar-tab-active" : "border-transparent text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto pr-2 solar-animate-fadeIn" key={activeTab}>
            {activeTab === "overview" && (
              <div className="space-y-4">
                <p className="text-gray-300 leading-relaxed text-sm">{planet.description}</p>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(planet.facts).map(([key, value], i) => {
                    const labels: Record<string, string> = {
                      diameter: "⭕ Diâmetro", distanceSun: "☀️ Distância do Sol",
                      orbitalPeriod: "🔄 Período Orbital", rotationPeriod: "🌀 Rotação",
                      moons: "🌙 Luas", temperature: "🌡️ Temperatura",
                      gravity: "⬇️ Gravidade", atmosphere: "🌫️ Atmosfera",
                    };
                    return (
                      <div key={key} className="solar-glass rounded-xl p-3 solar-animate-fadeInUp hover:bg-white/5 transition-colors" style={{ animationDelay: `${i * 0.06}s` }}>
                        <div className="text-xs font-medium mb-1" style={{ color: `${planet.color}aa` }}>
                          {labels[key] || key}
                        </div>
                        <div className="text-white text-sm font-semibold">{value}</div>
                      </div>
                    );
                  })}
                </div>
                <div className="solar-glass rounded-xl p-4" style={{ borderColor: `${planet.color}25` }}>
                  <div className="font-bold text-sm mb-2" style={{ color: planet.color }}>💡 Curiosidade</div>
                  <p className="text-gray-300 text-sm leading-relaxed">{planet.funFact}</p>
                </div>
              </div>
            )}

            {activeTab === "structure" && (
              <div className="space-y-6">
                <p className="text-gray-400 text-sm">Explore as camadas internas de {planet.namePt}. Passe o mouse sobre cada camada para mais detalhes.</p>
                {/* Interactive layer diagram */}
                <div className="flex justify-center py-4">
                  <div className="relative" style={{ width: "240px", height: "240px" }}>
                    {[...planet.layers].reverse().map((layer, i) => {
                      const idx = planet.layers.length - 1 - i;
                      const size = layer.radius * 2.4;
                      const isHovered = hoveredLayer === idx;
                      return (
                        <div
                          key={i}
                          className="absolute rounded-full solar-layer-ring cursor-pointer flex items-center justify-center"
                          style={{
                            width: `${size}px`,
                            height: `${size}px`,
                            left: `${120 - size / 2}px`,
                            top: `${120 - size / 2}px`,
                            background: layer.color,
                            border: isHovered ? `2px solid ${planet.color}` : "1px solid rgba(255,255,255,0.1)",
                            boxShadow: isHovered ? `0 0 20px ${layer.color}80, inset 0 0 20px rgba(0,0,0,0.3)` : `inset 0 0 20px rgba(0,0,0,0.3)`,
                            zIndex: planet.layers.length - i,
                            transition: "transform 0.3s, box-shadow 0.3s, border 0.3s",
                            opacity: hoveredLayer !== null && !isHovered ? 0.6 : 1,
                          }}
                          onMouseEnter={() => setHoveredLayer(idx)}
                          onMouseLeave={() => setHoveredLayer(null)}
                        >
                          {(isHovered || (idx === 0 && hoveredLayer === null)) && (
                            <span className="text-white text-[9px] font-bold text-center leading-tight drop-shadow-lg px-1" style={{
                              textShadow: "0 1px 3px rgba(0,0,0,0.8)"
                            }}>
                              {layer.name}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Layer descriptions */}
                <div className="space-y-2">
                  {planet.layers.map((layer, i) => (
                    <div
                      key={i}
                      className={`solar-glass rounded-xl p-3 transition-all cursor-pointer ${hoveredLayer === i ? "ring-1 bg-white/5" : ""}`}
                      style={{ borderColor: hoveredLayer === i ? `${planet.color}50` : "transparent" }}
                      onMouseEnter={() => setHoveredLayer(i)}
                      onMouseLeave={() => setHoveredLayer(null)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full flex-shrink-0" style={{
                          background: layer.color,
                          boxShadow: `0 0 8px ${layer.color}60`
                        }} />
                        <div className="flex-1">
                          <div className="text-white text-sm font-semibold">{layer.name}</div>
                          <div className="text-gray-400 text-xs">{layer.description}</div>
                        </div>
                        <div className="text-gray-500 text-xs">{layer.radius}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "surface" && (
              <div className="space-y-4">
                <p className="text-gray-400 text-sm">Características mais notáveis da superfície de {planet.namePt}:</p>
                {planet.surfaceFeatures.map((feature, i) => (
                  <div
                    key={i}
                    className="solar-glass rounded-xl overflow-hidden cursor-pointer transition-all hover:bg-white/5 solar-animate-fadeInUp"
                    style={{ animationDelay: `${i * 0.1}s` }}
                    onClick={() => setExpandedFeature(expandedFeature === i ? null : i)}
                  >
                    <div className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{feature.emoji}</span>
                        <div className="flex-1">
                          <h3 className="text-white font-bold text-sm">{feature.name}</h3>
                          <p className={`text-gray-400 text-xs mt-1 leading-relaxed transition-all ${expandedFeature === i ? "" : "line-clamp-1"}`}>
                            {feature.description}
                          </p>
                        </div>
                        <span className={`text-gray-500 transition-transform ${expandedFeature === i ? "rotate-180" : ""}`}>▼</span>
                      </div>
                    </div>
                    {expandedFeature === i && (
                      <div className="px-4 pb-4 solar-animate-fadeIn">
                        <div className="h-24 rounded-lg overflow-hidden" style={{
                          background: `linear-gradient(135deg, ${planet.color}20, ${planet.gradient[0]}40, ${planet.gradient[2]}20)`,
                          border: `1px solid ${planet.color}20`,
                        }}>
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-5xl">{feature.emoji}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === "exploration" && (
              <div className="space-y-4 solar-animate-fadeIn">
                <div className="solar-glass rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">🚀</span>
                    <h3 className="text-white font-bold text-lg">Exploração Espacial</h3>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">{planet.exploration}</p>
                </div>

                {planet.yearDiscovered && (
                  <div className="solar-glass rounded-xl p-4">
                    <div className="text-gray-400 text-xs mb-1">📅 Descoberto</div>
                    <div className="text-white text-sm font-semibold">{planet.yearDiscovered}</div>
                  </div>
                )}

                {/* Orbital data */}
                <div className="solar-glass rounded-xl p-4">
                  <h4 className="text-white text-sm font-bold mb-4">Dados Orbitais</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">Distância do Sol</span>
                        <span className="text-white font-medium">{planet.facts.distanceSun}</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div className="h-2 rounded-full transition-all duration-1000 solar-size-comparison-bar" style={{
                          width: `${Math.min((planet.order / 8) * 100, 100)}%`,
                          background: `linear-gradient(90deg, ${planet.color}, ${planet.gradient[2]})`,
                        }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">Velocidade Orbital</span>
                        <span className="text-white font-medium">{planet.facts.orbitalPeriod}</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div className="h-2 rounded-full transition-all duration-1000 solar-size-comparison-bar" style={{
                          width: `${Math.max(10, 100 - (planet.order / 8) * 80)}%`,
                          background: `linear-gradient(90deg, ${planet.gradient[2]}, ${planet.color})`,
                          animationDelay: "0.3s",
                        }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "compare" && (
              <div className="space-y-5 solar-animate-fadeIn">
                <p className="text-gray-400 text-sm">Comparação de {planet.namePt} com a Terra:</p>

                {/* Size comparison */}
                <div className="solar-glass rounded-xl p-5">
                  <h4 className="text-white text-sm font-bold mb-4">📏 Comparação de Tamanho</h4>
                  <div className="flex items-end justify-center gap-8 py-4">
                    <div className="flex flex-col items-center gap-2">
                      <div className="rounded-full" style={{
                        width: `${Math.min(planet.compareSizeToEarth * 80, 160)}px`,
                        height: `${Math.min(planet.compareSizeToEarth * 80, 160)}px`,
                        background: planet.texture,
                        boxShadow: `0 0 20px ${planet.color}40, inset -8px -6px 15px rgba(0,0,0,0.5)`,
                        minWidth: "30px",
                        minHeight: "30px",
                      }} />
                      <span className="text-xs font-bold" style={{ color: planet.color }}>{planet.namePt}</span>
                      <span className="text-[10px] text-gray-500">{planet.facts.diameter}</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div className="rounded-full" style={{
                        width: "80px",
                        height: "80px",
                        background: "radial-gradient(circle at 35% 30%, #76d7c4, #4da6ff, #2d7dd2, #1a3d6e)",
                        boxShadow: "0 0 20px #4da6ff40, inset -8px -6px 15px rgba(0,0,0,0.5)",
                      }} />
                      <span className="text-xs font-bold text-blue-400">Terra</span>
                      <span className="text-[10px] text-gray-500">12.742 km</span>
                    </div>
                  </div>
                  <div className="text-center mt-2">
                    <span className="text-white text-sm font-bold">
                      {planet.compareSizeToEarth > 1
                        ? `${planet.compareSizeToEarth.toFixed(1)}x maior que a Terra`
                        : `${(planet.compareSizeToEarth * 100).toFixed(0)}% do tamanho da Terra`}
                    </span>
                  </div>
                </div>

                {/* Gravity comparison */}
                <div className="solar-glass rounded-xl p-5">
                  <h4 className="text-white text-sm font-bold mb-4">⬇️ Gravidade — Seu Peso</h4>
                  <p className="text-gray-400 text-xs mb-3">Se você pesa 70 kg na Terra:</p>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-blue-400">🌍 Terra</span>
                        <span className="text-white font-bold">70 kg</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-3">
                        <div className="h-3 rounded-full bg-blue-500" style={{ width: "100%" }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span style={{ color: planet.color }}>{planet.namePt}</span>
                        <span className="text-white font-bold">
                          {(70 * parseFloat(planet.facts.gravity.replace(",", ".")) / 9.8).toFixed(1)} kg
                        </span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-3">
                        <div className="h-3 rounded-full solar-size-comparison-bar" style={{
                          width: `${Math.min((parseFloat(planet.facts.gravity.replace(",", ".")) / 9.8) * 100, 100)}%`,
                          background: `linear-gradient(90deg, ${planet.color}, ${planet.gradient[2]})`,
                        }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Day length comparison */}
                <div className="solar-glass rounded-xl p-5">
                  <h4 className="text-white text-sm font-bold mb-3">⏰ Comparação de Tempo</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 rounded-lg p-3 text-center">
                      <div className="text-[10px] text-gray-400 mb-1">🔄 Um dia em {planet.namePt}</div>
                      <div className="text-white text-sm font-bold">{planet.facts.rotationPeriod}</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 text-center">
                      <div className="text-[10px] text-gray-400 mb-1">🌀 Um ano em {planet.namePt}</div>
                      <div className="text-white text-sm font-bold">{planet.facts.orbitalPeriod}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
