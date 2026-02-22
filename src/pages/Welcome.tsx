import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "@/components/Logo";

const Welcome = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"logo" | "text" | "exit">("logo");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("text"), 800);
    const t2 = setTimeout(() => setPhase("exit"), 2500);
    const t3 = setTimeout(() => navigate("/login"), 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [navigate]);

  return (
    <div className="fixed inset-0 gradient-hero flex flex-col items-center justify-center overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-1/4 -left-20 w-60 h-60 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-accent/10 blur-3xl" />

      <div
        className={`flex flex-col items-center gap-6 transition-all duration-700 ${
          phase === "exit" ? "opacity-0 scale-95" : "opacity-100 scale-100"
        }`}
      >
        <div className={`animate-logo-reveal ${phase !== "logo" ? "" : ""}`}>
          <div className="animate-float">
            <div className="gradient-primary rounded-3xl p-5 text-primary-foreground animate-pulse-glow">
              <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>
          </div>
        </div>

        <div
          className={`text-center transition-all duration-500 ${
            phase === "text" || phase === "exit"
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4"
          }`}
        >
          <h1 className="text-5xl font-bold text-primary-foreground mb-3 tracking-tight">
            Edu<span className="text-primary">Flow</span>
          </h1>
          <p className="text-lg text-primary-foreground/70 font-medium">
            Bem-vindo ao futuro do aprendizado! 🚀
          </p>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
