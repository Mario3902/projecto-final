import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import DeviceSelection from "@/components/DeviceSelection";

const SistemaSolar = () => {
    const [selectedDevice, setSelectedDevice] = useState<"computer" | null>(null);
    const navigate = useNavigate();

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
        <div className="w-screen h-screen overflow-hidden bg-[#020010] relative">
            {/* Voltar para a secção anterior */}
            <button
                onClick={() => setSelectedDevice(null)}
                className="absolute top-6 left-6 z-50 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-full p-3 backdrop-blur-md transition-all shadow-lg flex items-center justify-center group"
                title="Voltar à Sala de Seleção"
            >
                <ArrowLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
            </button>

            {/* Iframe em Fullscreen */}
            <iframe
                src="http://localhost:5173"
                title="Sistema Solar 3D"
                className="w-full h-full border-0 absolute inset-0"
                allow="autoplay"
            />
        </div>
    );
};

export default SistemaSolar;
