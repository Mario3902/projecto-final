import { useLocation, Link } from "react-router-dom";
import { Briefcase, Trophy, BookOpen, User, Home, Lock, CheckCircle2, Zap, BrainCircuit, RefreshCw } from "lucide-react";
import { useGame } from "@/context/GameContext";
import { useEffect, useState } from "react";
import { generateCareerPath } from "@/lib/gemini";
import { api } from "@/lib/api";

interface Milestone {
  id: number;
  title: string;
  desc: string;
  xpReq: number;
  icon: string;
  isUnlocked: boolean;
}

const Carreira = () => {
  const { level, xp } = useGame();
  const location = useLocation();

  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const bottomNavItems = [
    { title: "Início", path: "/dashboard", icon: Home },
    { title: "Quizzes", path: "/dashboard/quizzes", icon: BookOpen },
    { title: "Ranking", path: "/dashboard/ranking", icon: Trophy },
    { title: "Carreira", path: "/dashboard/carreira", icon: Briefcase },
    { title: "Perfil", path: "/dashboard/performance", icon: User },
  ];

  useEffect(() => {
    async function loadCareerPath() {
      try {
        const cached = localStorage.getItem("nzila_career_path");
        if (cached) {
          const parsed = JSON.parse(cached);
          // Atualiza unlocks baseados no XP atual
          setMilestones(parsed.map((m: Milestone) => ({ ...m, isUnlocked: xp >= m.xpReq })));
          setIsLoading(false);
          return;
        }

        const profile = await api.getProfile().catch(() => ({ course: "Geral" }));
        const course = profile?.course || "Ciências Gerais";
        
        const generated = await generateCareerPath(course);
        
        if (generated && generated.length > 0) {
          const xpSteps = [0, 500, 1500, 3500, 6000];
          const icons = ["🎯", "⚡", "🚀", "👑"]; // Default icons
          
          const newMilestones: Milestone[] = generated.map((step: any, idx: number) => ({
            id: idx + 1,
            title: step.title,
            desc: step.description,
            xpReq: xpSteps[idx] || (idx * 2000), // Fallback if AI generates more steps
            icon: icons[idx] || "🎓",
            isUnlocked: xp >= (xpSteps[idx] || (idx * 2000))
          }));
          
          localStorage.setItem("nzila_career_path", JSON.stringify(newMilestones));
          setMilestones(newMilestones);
        } else {
          // Fallback if AI fails
          setMilestones([
            { id: 1, title: "Estudante Caloiro", desc: "A começar a jornada", xpReq: 0, icon: "🎓", isUnlocked: true },
            { id: 2, title: "Aprendiz Focado", desc: "Domínio das bases", xpReq: 500, icon: "📚", isUnlocked: xp >= 500 }
          ]);
        }
      } catch (error) {
        console.error("Erro a carregar trilha", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadCareerPath();
  }, [xp]);

  const nextMilestone = milestones.find(m => !m.isUnlocked) || milestones[milestones.length - 1];
  const currentMilestone = milestones.slice().reverse().find(m => m.isUnlocked) || milestones[0];
  
  const progressToNext = nextMilestone && currentMilestone && nextMilestone.xpReq > currentMilestone.xpReq 
    ? ((xp - currentMilestone.xpReq) / (nextMilestone.xpReq - currentMilestone.xpReq)) * 100 
    : 100;

  return (
    <div className="min-h-screen bg-[#0e1710] text-white flex flex-col font-sans pb-24 relative overflow-x-hidden">
      <div className="max-w-md mx-auto w-full px-5 py-6 mt-4">
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-[#4ade80] text-[10px] sm:text-xs font-black tracking-[0.2em] uppercase mb-0.5">TRILHA PROFISSIONAL</h3>
            <h1 className="text-3xl font-bold text-white m-0">Carreira</h1>
          </div>
          <div className="h-10 w-10 min-w-10 rounded-full bg-[#1e2e26] border border-[#4ade80]/30 shadow-[0_0_15px_rgba(74,222,128,0.2)] flex items-center justify-center shrink-0">
            <Briefcase className="h-5 w-5 text-[#4ade80]" />
          </div>
        </div>

        {/* Current Objective Card */}
        <div className="bg-[#4ade80] rounded-[24px] p-6 mb-8 relative overflow-hidden shadow-[0_10px_40px_rgba(74,222,128,0.15)]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full -mr-8 -mt-8 flex items-end justify-start pb-6 pl-6">
            <span className="text-4xl filter drop-shadow-md">{nextMilestone?.icon}</span>
          </div>

          <div className="relative z-10 pr-16">
            <h4 className="text-[#0e1710] text-sm font-black tracking-widest uppercase mb-1 flex items-center gap-1.5">
              <Zap className="h-4 w-4 fill-[#0e1710]" /> Próxima Meta
            </h4>
            <h2 className="text-[22px] font-black text-[#0e1710] leading-tight mb-4">{nextMilestone?.title}</h2>
            
            <div className="bg-[#0e1710]/10 rounded-xl p-3 mb-2 backdrop-blur-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[#0e1710] font-bold text-xs">{xp} XP</span>
                <span className="text-[#0e1710]/70 font-bold text-xs">{nextMilestone?.xpReq} XP</span>
              </div>
              <div className="h-2 w-full bg-[#0e1710]/20 rounded-full overflow-hidden">
                <div className="h-full bg-[#0e1710] rounded-full" style={{ width: `${Math.min(progressToNext, 100)}%` }}></div>
              </div>
            </div>
            <p className="text-[11px] font-bold text-[#0e1710]/70 mt-3 flex items-center gap-1">
              Faltam {Math.max(0, (nextMilestone?.xpReq || 0) - xp)} XP para alcançar este nível
            </p>
          </div>
        </div>

        {/* Timeline Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-10 opacity-70">
            <RefreshCw className="h-8 w-8 text-[#4ade80] animate-spin mb-3" />
            <p className="text-sm text-[#4ade80] font-bold">A inteligência artificial está a desenhar a tua Trilha Pessoal...</p>
          </div>
        )}

        {/* Timeline */}
        {!isLoading && milestones.length > 0 && (
          <div className="px-2">
          <h3 className="text-lg font-bold mb-6">Etapas da Trilha</h3>
          
          <div className="relative border-l-2 border-[#1e2e26] ml-6 pb-4 space-y-8">
            {milestones.map((milestone, idx) => (
              <div key={milestone.id} className="relative pl-8">
                {/* Node Icon */}
                <div 
                  className={`absolute -left-[21px] top-1 h-10 w-10 rounded-full border-4 border-[#0e1710] flex items-center justify-center text-lg z-10 transition-all ${
                    milestone.isUnlocked 
                      ? "bg-[#4ade80] shadow-[0_0_15px_rgba(74,222,128,0.4)]" 
                      : "bg-[#1a261d] opacity-60 filter grayscale"
                  }`}
                >
                  {milestone.isUnlocked ? milestone.icon : <Lock className="h-4 w-4 text-slate-500" />}
                </div>

                {/* Content Card */}
                <div 
                  className={`rounded-2xl p-4 border transition-all ${
                    milestone.isUnlocked 
                      ? "bg-[#141e16] border-[#4ade80]/30 shadow-sm" 
                      : "bg-[#141e16]/50 border-slate-800/50"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <h4 className={`font-bold text-[15px] ${milestone.isUnlocked ? "text-white" : "text-slate-400"} leading-tight`}>
                      {milestone.title}
                    </h4>
                    {milestone.isUnlocked && <CheckCircle2 className="h-4 w-4 text-[#4ade80] shrink-0" />}
                  </div>
                  <p className={`text-[12px] leading-relaxed mb-3 ${milestone.isUnlocked ? "text-slate-300" : "text-slate-500"}`}>
                    {milestone.desc}
                  </p>
                  
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                    <span className={milestone.isUnlocked ? "text-[#4ade80]" : "text-slate-600"}>NÍVEL {idx + 1}</span>
                    <span className="text-slate-500 flex items-center gap-1">
                      {!milestone.isUnlocked && `${milestone.xpReq} XP Req.`}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        )}

      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#0e1710]/95 backdrop-blur-xl border-t border-[#1a261d] px-6 py-4 flex justify-between items-center z-50">
        {bottomNavItems.map((item, i) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={i} 
              to={item.path} 
              className={`flex flex-col items-center gap-1.5 transition-colors ${isActive ? "text-[#4ade80]" : "text-slate-500 hover:text-slate-300"}`}
            >
              <item.icon className={`h-[22px] w-[22px] ${isActive ? "stroke-[2.5]" : "stroke-2"}`} />
              <span className={`text-[10px] font-bold tracking-wide ${isActive ? "text-[#4ade80]" : ""}`}>
                {item.title}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Carreira;
