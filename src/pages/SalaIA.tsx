import DashboardLayout from "@/components/DashboardLayout";
import { Info } from "lucide-react";

const SalaIA = () => {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Sala IA 🏫</h1>
                        <p className="text-muted-foreground mt-1">
                            Ambiente 3D interativo com professor de IA
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted rounded-lg px-3 py-2">
                        <Info className="h-4 w-4" />
                        Arraste para explorar • Scroll para zoom
                    </div>
                </div>

                <div className="rounded-xl overflow-hidden border border-border" style={{ height: "calc(100vh - 220px)", minHeight: "500px" }}>
                    <iframe
                        src="/ai-school/index.html"
                        title="Sala IA 3D"
                        className="w-full h-full border-0"
                        allow="autoplay"
                    />
                </div>
            </div>
        </DashboardLayout>
    );
};

export default SalaIA;
