import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import DeviceSelection from "@/components/DeviceSelection";
import Stars from "@/components/solar/Stars";
import SolarSystem from "@/components/solar/SolarSystem";
import PlanetDive from "@/components/solar/PlanetDive";
import PlanetList from "@/components/solar/PlanetList";
import Quiz from "@/components/solar/Quiz";
import { Planet } from "@/data/planets";

const SistemaSolar = () => {
    const [selectedDevice, setSelectedDevice] = useState<"computer" | null>(null);
    const navigate = useNavigate();

    const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
    const [showSun, setShowSun] = useState(false);
    const [showQuiz, setShowQuiz] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isDiving, setIsDiving] = useState(false);
    const [zoomedPlanet, setZoomedPlanet] = useState<string | null>(null);
    const [showSpeedControl, setShowSpeedControl] = useState(false);

    const handlePlanetClick = useCallback((planet: Planet) => {
        setZoomedPlanet(planet.id);
        setTimeout(() => {
            setSelectedPlanet(planet);
            setShowSun(false);
            setIsDiving(true);
        }, 400);
    }, []);

    const handleSunClick = useCallback(() => {
        setZoomedPlanet("sun");
        setTimeout(() => {
            setShowSun(true);
            setSelectedPlanet(null);
            setIsDiving(true);
        }, 400);
    }, []);

    const handleClose = useCallback(() => {
        setIsDiving(false);
        setSelectedPlanet(null);
        setShowSun(false);
        setZoomedPlanet(null);
    }, []);

    if (!selectedDevice) {
        return (
            <DeviceSelection
                title="Sistema Solar 🌌"
                description="Escolha como deseja explorar esta simulação interactiva 3D do Sistema Solar em Ecrã Inteiro."
                vrLink="/dashboard/sistema-solar"
                onSelectComputer={() => setSelectedDevice("computer")}
                onBack={() => navigate(-1)}
            />
        );
    }

    return (
        <div className="w-screen h-screen overflow-hidden bg-[#020010] relative select-none">
            {/* Stars Background */}
            <Stars />

            {/* Voltar para a secção anterior */}
            <button
                onClick={() => setSelectedDevice(null)}
                className="absolute top-6 left-6 z-50 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-full p-3 backdrop-blur-md transition-all shadow-lg flex items-center justify-center group"
                title="Voltar à Sala de Seleção"
                style={{ zIndex: isDiving ? 0 : 50 }}
            >
                <ArrowLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
            </button>

            {/* Title */}
            {!isDiving && (
                <div className="absolute top-5 left-1/2 -translate-x-1/2 z-20 text-center solar-animate-fadeIn">
                    <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg">
                        🌌 Sistema Solar Interativo
                    </h1>
                    <p className="text-gray-500 text-[11px] md:text-xs mt-1.5 font-medium">
                        Clique em qualquer planeta para mergulhar e explorar
                    </p>
                </div>
            )}

            {/* Side Planet List */}
            {!isDiving && (
                <PlanetList
                    onPlanetClick={handlePlanetClick}
                    onSunClick={handleSunClick}
                    activePlanet={zoomedPlanet}
                />
            )}

            {/* Controls */}
            {!isDiving && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2.5 solar-animate-fadeIn">
                    <button
                        onClick={() => setIsPaused(!isPaused)}
                        className="px-4 py-2.5 solar-glass hover:bg-white/10 text-white rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-2"
                    >
                        {isPaused ? "▶️ Continuar" : "⏸️ Pausar"}
                    </button>
                    <button
                        onClick={() => setShowSpeedControl(!showSpeedControl)}
                        className="px-4 py-2.5 solar-glass hover:bg-white/10 text-white rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-2"
                    >
                        ⚡ Controlos
                    </button>
                    <button
                        onClick={() => setShowQuiz(true)}
                        className="px-4 py-2.5 text-white rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-2"
                        style={{
                            background: "linear-gradient(135deg, rgba(99,102,241,0.7), rgba(168,85,247,0.7))",
                            border: "1px solid rgba(99,102,241,0.3)",
                        }}
                    >
                        🧠 Quiz Espacial
                    </button>
                </div>
            )}

            {/* Instructions tooltip */}
            {showSpeedControl && !isDiving && (
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 solar-glass rounded-xl p-4 max-w-xs solar-animate-fadeInUp">
                    <div className="text-white text-sm font-bold mb-2">🎮 Como usar</div>
                    <ul className="text-gray-300 text-xs space-y-1.5">
                        <li>🖱️ <strong>Clique</strong> em um planeta para mergulhar</li>
                        <li>🔍 Explore <strong>5 abas</strong> de informações</li>
                        <li>🏗️ Veja a <strong>estrutura interna</strong></li>
                        <li>📊 <strong>Compare</strong> com a Terra</li>
                        <li>🧠 Teste seu conhecimento no <strong>Quiz</strong></li>
                        <li>🖱️ Mova o mouse para efeito <strong>parallax 3D</strong></li>
                    </ul>
                    <button onClick={() => setShowSpeedControl(false)} className="mt-3 text-indigo-400 text-xs cursor-pointer hover:text-indigo-300">
                        Fechar ✕
                    </button>
                </div>
            )}

            {/* Solar System */}
            {!isDiving && (
                <div className="absolute inset-0 pl-16 md:pl-[72px]">
                    <SolarSystem
                        onPlanetClick={handlePlanetClick}
                        onSunClick={handleSunClick}
                        isPaused={isPaused}
                        zoomedPlanet={zoomedPlanet}
                    />
                </div>
            )}

            {/* Dive View */}
            {isDiving && (
                <PlanetDive
                    planet={selectedPlanet}
                    showSun={showSun}
                    onClose={handleClose}
                />
            )}

            {/* Quiz Modal */}
            {showQuiz && <Quiz onClose={() => setShowQuiz(false)} />}
        </div>
    );
};

export default SistemaSolar;
