import { useState } from "react";
import { Monitor, Glasses, ArrowLeft, Smartphone, Link as LinkIcon, Copy, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/useIsMobile";

interface DeviceSelectionProps {
    title: string;
    description?: string;
    vrLink: string;
    onSelectComputer: () => void;
    onBack: () => void;
}

const DeviceSelection = ({ title, description, vrLink, onSelectComputer, onBack }: DeviceSelectionProps) => {
    const [showVRInfo, setShowVRInfo] = useState(false);
    const [copied, setCopied] = useState(false);
    const isMobileDevice = useIsMobile();

    // Get the full URL for the VR link based on the current origin
    const fullUrl = `${window.location.origin}${vrLink}`;
    // Generate a QR code URL using a public API
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(fullUrl)}`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(fullUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="w-screen h-screen overflow-hidden bg-[#020010] relative flex items-center justify-center p-4">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-[#020010] to-purple-900/10 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />

            <button
                onClick={showVRInfo ? () => setShowVRInfo(false) : onBack}
                className="absolute top-6 left-6 z-50 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-full p-3 backdrop-blur-md transition-all shadow-lg flex items-center justify-center group"
                title="Voltar"
            >
                <ArrowLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
            </button>

            <div className="max-w-2xl w-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 relative z-10 shadow-2xl">
                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-black text-white mb-3 flex items-center justify-center gap-3">
                        {isMobileDevice && <AlertTriangle className="text-yellow-500 w-8 h-8" />}
                        {title}
                    </h1>
                    <p className="text-white/60 text-lg">
                        {isMobileDevice
                            ? "Ambiente Imersivo não otimizado para pequenos ecrãs."
                            : description || "Escolha como pretende aceder a este ambiente 3D."}
                    </p>
                </div>

                {isMobileDevice ? (
                    <div className="animate-in fade-in zoom-in-95 duration-300 flex flex-col items-center text-center">
                        <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mb-6">
                            <Smartphone className="w-10 h-10 text-amber-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">
                            Apenas Computador ou VR
                        </h3>
                        <p className="text-white/70 max-w-md mb-6 text-sm">
                            Devido à complexidade e interatividade destes ambientes 3D, a experiência está reservada para ecrãs maiores.
                            Por favor, <strong>aceda a esta funcionalidade através de um Computador ou Óculos VR/AR</strong>.
                        </p>

                        <div className="w-full bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-3 text-left mb-6">
                            <p className="text-white/80 text-xs mb-1">Para aceder mais tarde no seu PC/VR, guarde este link:</p>
                            <div className="flex items-center gap-2">
                                <LinkIcon className="text-white/40 w-4 h-4 flex-shrink-0" />
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-white font-mono text-xs truncate select-all">
                                        {fullUrl}
                                    </p>
                                </div>
                                <Button
                                    onClick={copyToClipboard}
                                    variant="secondary"
                                    className="bg-white/10 hover:bg-white/20 text-white border-0 py-1 h-8 text-xs px-2"
                                >
                                    <Copy className="w-3 h-3 mr-1" />
                                    {copied ? "Copiado!" : "Copiar"}
                                </Button>
                            </div>
                        </div>

                        <Button
                            onClick={onBack}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8"
                        >
                            Voltar ao Painel
                        </Button>
                    </div>
                ) : !showVRInfo ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4 duration-500">
                        <button
                            onClick={onSelectComputer}
                            className="flex flex-col items-center justify-center p-8 bg-white/5 hover:bg-primary/20 border-2 border-transparent hover:border-primary/50 text-white rounded-2xl transition-all group"
                        >
                            <div className="w-20 h-20 mb-6 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Monitor className="w-10 h-10 text-primary" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Computador</h3>
                            <p className="text-white/50 text-center text-sm">
                                Entrar diretamente no browser atual com rato e teclado.
                            </p>
                        </button>

                        <button
                            onClick={() => setShowVRInfo(true)}
                            className="flex flex-col items-center justify-center p-8 bg-white/5 hover:bg-purple-500/20 border-2 border-transparent hover:border-purple-500/50 text-white rounded-2xl transition-all group"
                        >
                            <div className="w-20 h-20 mb-6 rounded-full bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Glasses className="w-10 h-10 text-purple-400" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Óculos VR / AR</h3>
                            <p className="text-white/50 text-center text-sm">
                                Receber o link para abrir no óculos ou smartphone.
                            </p>
                        </button>
                    </div>
                ) : (
                    <div className="animate-in fade-in zoom-in-95 duration-300 flex flex-col items-center">
                        <div className="bg-white p-4 rounded-2xl mb-6 inline-block">
                            <img src={qrCodeUrl} alt="QR Code para abrir no VR" className="w-48 h-48" />
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-2">Conecte o seu Headset</h3>
                        <p className="text-white/60 text-center max-w-md mb-8 text-sm md:text-base">
                            Aponte a câmara do seu telemóvel ou óculos VR/AR para o QR Code acima, ou digite o link abaixo no browser do seu dispositivo.
                        </p>

                        <div className="w-full bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
                            <LinkIcon className="text-white/40 w-5 h-5 flex-shrink-0" />
                            <div className="flex-1 overflow-hidden">
                                <p className="text-white font-mono text-sm truncate select-all">
                                    {fullUrl}
                                </p>
                            </div>
                            <Button
                                onClick={copyToClipboard}
                                variant="secondary"
                                className="bg-white/10 hover:bg-white/20 text-white border-0"
                            >
                                <Copy className="w-4 h-4 mr-2" />
                                {copied ? "Copiado!" : "Copiar"}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeviceSelection;
