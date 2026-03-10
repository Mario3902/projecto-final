import { useState } from "react";
import DesktopLayout from "@/components/DesktopLayout";
import DeviceSelection from "@/components/DeviceSelection";
import { Info, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SalaIA = () => {
    const [selectedDevice, setSelectedDevice] = useState<"computer" | null>(null);
    const navigate = useNavigate();

    // If no device selected, show the selection screen
    if (!selectedDevice) {
        return (
            <DeviceSelection
                title="Sala IA 🏫"
                description="Escolha como deseja aceder à sala de aula virtual com o seu professor IA interactivo."
                vrLink="/dashboard/sala-ia"
                onSelectComputer={() => setSelectedDevice("computer")}
                onBack={() => navigate(-1)}
            />
        );
    }

    return (
        <DesktopLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Sala IA 🏫</h1>
                        <p className="text-muted-foreground mt-1">
                            Ambiente 3D interativo com professor de IA
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted rounded-lg px-3 py-2">
                            <Info className="h-4 w-4" />
                            Arraste para explorar • Scroll para zoom
                        </div>
                        <button
                            onClick={() => setSelectedDevice(null)}
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2 bg-muted/50 rounded-lg"
                        >
                            <ArrowLeft className="w-4 h-4" /> Voltar à Seleção
                        </button>
                    </div>
                </div>

                <div className="rounded-xl overflow-hidden border border-border relative" style={{ height: "calc(100vh - 220px)", minHeight: "500px" }}>
                    <iframe
                        src="/ai-school/index.html"
                        title="Sala IA 3D"
                        className="w-full h-full border-0 absolute inset-0"
                        allow="autoplay"
                    />
                </div>
            </div>
        </DesktopLayout>
    );
};

export default SalaIA;
