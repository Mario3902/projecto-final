import { useLocation, Link } from "react-router-dom";
import { Trophy, Briefcase, BookOpen, User, Home, Star, Zap, Activity, Award, RefreshCw, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useGame } from "@/context/GameContext";
import { useEffect, useState } from "react";
import { generatePersonalStats, buildStudentContext } from "@/lib/gemini";

interface AIInsight {
  label: string;
  value: string;
  trend: "up" | "down" | "neutral";
}

const Ranking = () => {
  const { xp, level, streak, quizzesCompleted, studyHours, performanceData } = useGame();
  const location = useLocation();

  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(true);

  const bottomNavItems = [
    { title: "Início", path: "/dashboard", icon: Home },
    { title: "Quizzes", path: "/dashboard/quizzes", icon: BookOpen },
    { title: "Progresso", path: "/dashboard/ranking", icon: Activity },
    { title: "Carreira", path: "/dashboard/carreira", icon: Briefcase },
    { title: "Perfil", path: "/dashboard/performance", icon: User },
  ];

  // Calculate real level progress
  const currentLevelXP = xp - ((level - 1) * 100);
  const xpProgress = Math.min((currentLevelXP / 100) * 100, 100);

  // Load AI personal stats insights
  useEffect(() => {
    async function loadInsights() {
      try {
        const cached = sessionStorage.getItem("nzila_personal_stats");
        if (cached) {
          setAiInsights(JSON.parse(cached));
          setInsightsLoading(false);
          return;
        }

        const context = await buildStudentContext();
        const statsString = `XP Total: ${xp}, Nível: ${level}, Streak: ${streak} dias, Quizzes Feitos: ${quizzesCompleted}, Horas de Estudo: ${studyHours}h, Matérias: ${performanceData.length}.\n${context}`;
        
        const generated = await generatePersonalStats(statsString);
        
        if (generated && generated.length > 0) {
          setAiInsights(generated);
          sessionStorage.setItem("nzila_personal_stats", JSON.stringify(generated));
        }
      } catch (error) {
        console.error("Erro ao carregar insights", error);
      } finally {
        setInsightsLoading(false);
      }
    }
    loadInsights();
  }, [xp, level, streak, quizzesCompleted, studyHours]);

  const trendIcon = (trend: string) => {
    if (trend === "up") return <TrendingUp className="h-4 w-4 text-[#4ade80]" />;
    if (trend === "down") return <TrendingDown className="h-4 w-4 text-red-400" />;
    return <Minus className="h-4 w-4 text-yellow-400" />;
  };

  return (
    <div className="min-h-screen bg-[#0e1710] text-white flex flex-col font-sans pb-24 relative overflow-x-hidden">
      <div className="max-w-md mx-auto w-full px-5 py-6 mt-4">
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-[#4ade80] text-[10px] sm:text-xs font-black tracking-[0.2em] uppercase mb-0.5">ESTATÍSTICAS PESSOAIS</h3>
            <h1 className="text-3xl font-bold text-white m-0">Meu Progresso</h1>
          </div>
          <div className="h-10 w-10 min-w-10 rounded-full bg-[#1e2e26] border border-[#4ade80]/30 shadow-[0_0_15px_rgba(74,222,128,0.2)] flex items-center justify-center shrink-0">
            <Activity className="h-5 w-5 text-[#4ade80]" />
          </div>
        </div>

        {/* Highlights – Real Data */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-[#141e16] border border-slate-800 rounded-2xl p-5 flex flex-col">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 text-[#fbbf24]" /> XP Total
            </span>
            <span className="text-3xl font-black text-white">{xp}</span>
            <span className="text-[#4ade80] text-[10px] font-bold mt-1">Nível {level}</span>
          </div>
          
          <div className="bg-[#1a261d] border border-[#254238] rounded-2xl p-5 flex flex-col shadow-[inset_0_0_20px_rgba(74,222,128,0.05)]">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-orange-500" /> Dias Seguidos
            </span>
            <span className="text-3xl font-black text-white">{streak}</span>
            <span className="text-slate-400 text-[10px] font-bold mt-1">{streak > 0 ? "Fogo ardendo! 🔥" : "Começa hoje! 💪"}</span>
          </div>
        </div>

        {/* Nível Atual – Real Calculations */}
        <div className="bg-[#4ade80] rounded-[20px] p-6 mb-8 text-[#0e1710] shadow-[0_10px_30px_rgba(74,222,128,0.15)] relative overflow-hidden">
          <Award className="absolute -right-6 -bottom-6 h-32 w-32 text-[#0e1710] opacity-10" />
          <div className="relative z-10">
            <p className="font-extrabold text-[13px] uppercase tracking-widest mb-1">Nível Atual</p>
            <h2 className="text-4xl font-black mb-4">{level}</h2>
            <div className="bg-[#0e1710]/10 rounded-full h-2 w-full mb-2">
              <div className="bg-[#0e1710] h-full rounded-full transition-all duration-500" style={{ width: `${xpProgress}%` }}></div>
            </div>
            <p className="text-[11px] font-bold flex justify-between">
              <span>Progresso para o Nível {level + 1}</span>
              <span>{Math.round(xpProgress)}%</span>
            </p>
          </div>
        </div>

        {/* Mini Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-[#141e16] border border-slate-800/60 rounded-2xl p-4 text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Quizzes</p>
            <p className="text-xl font-black">{quizzesCompleted}</p>
          </div>
          <div className="bg-[#141e16] border border-slate-800/60 rounded-2xl p-4 text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Horas</p>
            <p className="text-xl font-black">{studyHours}h</p>
          </div>
          <div className="bg-[#141e16] border border-slate-800/60 rounded-2xl p-4 text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Matérias</p>
            <p className="text-xl font-black">{performanceData.length}</p>
          </div>
        </div>

        {/* AI Insights */}
        <div className="mb-4">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            🧠 Análise da IA
          </h3>
          
          {insightsLoading ? (
            <div className="flex flex-col items-center justify-center py-8 opacity-70">
              <RefreshCw className="h-7 w-7 text-[#4ade80] animate-spin mb-3" />
              <p className="text-sm text-[#4ade80] font-bold">A analisar o teu desempenho...</p>
            </div>
          ) : aiInsights.length > 0 ? (
            <div className="space-y-3">
              {aiInsights.map((insight, idx) => (
                <div key={idx} className="bg-[#141e16] border border-[#254238]/60 rounded-2xl p-5">
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      insight.trend === "up" ? "bg-[#4ade80]/15" : 
                      insight.trend === "down" ? "bg-red-500/15" : "bg-yellow-500/15"
                    }`}>
                      {trendIcon(insight.trend)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{insight.label}</p>
                      <p className="text-[13px] text-white leading-relaxed">{insight.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#141e16] border border-slate-800/60 rounded-2xl p-6 text-center">
              <p className="text-sm text-slate-400">Completa mais quizzes para receber análises personalizadas! 📊</p>
            </div>
          )}
        </div>

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

export default Ranking;
