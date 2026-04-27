import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Brain, Gamepad2, Rocket, ChevronRight, ArrowRight } from "lucide-react";

interface Slide {
  icon: React.ReactNode;
  title: string;
  highlight: string;
  description: string;
  gradient: string;
  accentColor: string;
  bgOrbs: [string, string];
}

const slides: Slide[] = [
  {
    icon: <GraduationCap className="h-16 w-16" />,
    title: "O teu",
    highlight: "Caminho",
    description:
      "Nzila — palavra Kimbundu que significa \"caminho\" — é a plataforma que acompanha o estudante angolano desde o ensino médio até ao mercado de trabalho, de forma integrada e personalizada.",
    gradient: "from-[hsl(174,72%,40%)] to-[hsl(190,80%,45%)]",
    accentColor: "hsl(174,72%,40%)",
    bgOrbs: ["bg-[hsl(174,72%,40%)]/20", "bg-[hsl(190,80%,45%)]/15"],
  },
  {
    icon: <Brain className="h-16 w-16" />,
    title: "Inteligência",
    highlight: "Artificial",
    description:
      "Um tutor de IA que conhece o teu ritmo e estilo de aprendizagem. Recebe explicações personalizadas, orientação vocacional e apoio contínuo ao teu desempenho académico.",
    gradient: "from-[hsl(262,60%,58%)] to-[hsl(290,60%,50%)]",
    accentColor: "hsl(262,60%,58%)",
    bgOrbs: ["bg-[hsl(262,60%,58%)]/20", "bg-[hsl(290,60%,50%)]/15"],
  },
  {
    icon: <Gamepad2 className="h-16 w-16" />,
    title: "Aprende",
    highlight: "Jogando",
    description:
      "Gamificação que transforma o estudo em aventura. Ganha XP, sobe de nível, desbloqueia conquistas e compete no ranking com outros estudantes angolanos.",
    gradient: "from-[hsl(45,93%,58%)] to-[hsl(25,95%,55%)]",
    accentColor: "hsl(45,93%,58%)",
    bgOrbs: ["bg-[hsl(45,93%,58%)]/20", "bg-[hsl(25,95%,55%)]/15"],
  },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [isAnimating, setIsAnimating] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      if (isAnimating || index === current) return;
      setDirection(index > current ? "next" : "prev");
      setIsAnimating(true);
      setTimeout(() => {
        setCurrent(index);
        setIsAnimating(false);
      }, 300);
    },
    [current, isAnimating],
  );

  const next = () => {
    if (current < slides.length - 1) goTo(current + 1);
    else navigate("/login");
  };

  const skip = () => navigate("/login");

  const slide = slides[current];

  return (
    <div className="fixed inset-0 bg-[hsl(220,25%,7%)] flex flex-col overflow-hidden select-none">
      {/* ── Animated background orbs ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className={`absolute -top-32 -left-32 w-[420px] h-[420px] rounded-full ${slide.bgOrbs[0]} blur-[120px] transition-all duration-700`}
        />
        <div
          className={`absolute -bottom-40 -right-32 w-[500px] h-[500px] rounded-full ${slide.bgOrbs[1]} blur-[140px] transition-all duration-700`}
        />
        {/* subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* ── Skip button ── */}
      <div className="relative z-10 flex justify-end p-6 pb-0">
        <button
          onClick={skip}
          className="text-sm font-medium text-white/50 hover:text-white/80 transition-colors px-4 py-2 rounded-full hover:bg-white/5"
        >
          Pular
        </button>
      </div>

      {/* ── Main content ── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 gap-10">
        {/* Icon container */}
        <div
          className={`transition-all duration-500 ${isAnimating ? "opacity-0 scale-90" : "opacity-100 scale-100"}`}
        >
          <div className="relative">
            {/* Glow ring */}
            <div
              className="absolute inset-0 rounded-[2rem] blur-2xl opacity-40 animate-pulse"
              style={{ background: `linear-gradient(135deg, ${slide.accentColor}, transparent)` }}
            />
            <div
              className={`relative bg-gradient-to-br ${slide.gradient} rounded-[2rem] p-7 text-white shadow-2xl`}
              style={{ boxShadow: `0 20px 60px -10px ${slide.accentColor}40` }}
            >
              {slide.icon}
            </div>
          </div>
        </div>

        {/* Text */}
        <div
          className={`text-center max-w-md transition-all duration-500 ${
            isAnimating
              ? direction === "next"
                ? "opacity-0 translate-x-12"
                : "opacity-0 -translate-x-12"
              : "opacity-100 translate-x-0"
          }`}
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
            {slide.title}{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: `linear-gradient(135deg, ${slide.accentColor}, white)` }}
            >
              {slide.highlight}
            </span>
          </h1>
          <p className="text-base sm:text-lg text-white/60 leading-relaxed">{slide.description}</p>
        </div>
      </div>

      {/* ── Bottom controls ── */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-8 pb-12">
        {/* Dots */}
        <div className="flex gap-3">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="group relative p-1"
              aria-label={`Tela ${i + 1}`}
            >
              <span
                className={`block rounded-full transition-all duration-500 ${
                  i === current
                    ? "w-8 h-3"
                    : "w-3 h-3 bg-white/20 group-hover:bg-white/40"
                }`}
                style={i === current ? { background: `linear-gradient(135deg, ${slide.accentColor}, white)` } : {}}
              />
            </button>
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={next}
          className={`w-full max-w-xs flex items-center justify-center gap-3 py-4 px-8 rounded-2xl text-white font-bold text-lg shadow-xl transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] bg-gradient-to-r ${slide.gradient}`}
          style={{ boxShadow: `0 12px 40px -8px ${slide.accentColor}50` }}
        >
          {current < slides.length - 1 ? (
            <>
              Continuar
              <ChevronRight className="h-5 w-5" />
            </>
          ) : (
            <>
              Começar Agora
              <Rocket className="h-5 w-5" />
            </>
          )}
        </button>
      </div>

      {/* ── Floating decorative particles ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-white/20"
            style={{
              top: `${15 + i * 14}%`,
              left: `${10 + i * 15}%`,
              animation: `float ${3 + i * 0.5}s ease-in-out ${i * 0.3}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Onboarding;
