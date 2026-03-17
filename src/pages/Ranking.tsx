import { useLocation, Link } from "react-router-dom";
import { Trophy, Briefcase, BookOpen, User, Home, Star, Zap, Activity, Award } from "lucide-react";
import { useGame } from "@/context/GameContext";

const Ranking = () => {
  const { xp, level, streak } = useGame();
  const location = useLocation();

  const bottomNavItems = [
    { title: "Início", path: "/dashboard", icon: Home },
    { title: "Quizzes", path: "/dashboard/quizzes", icon: BookOpen },
    { title: "Progresso", path: "/dashboard/ranking", icon: Activity },
    { title: "Carreira", path: "/dashboard/carreira", icon: Briefcase },
    { title: "Perfil", path: "/dashboard/performance", icon: User },
  ];

  const XP_HISTORY = [
    { day: "Segunda", xp: 120 },
    { day: "Terça", xp: 350 },
    { day: "Quarta", xp: 200 },
    { day: "Quinta", xp: 0 },
    { day: "Sexta", xp: 450 },
    { day: "Sábado", xp: 150 },
    { day: "Hoje", xp: 80 },
  ];

  const maxDailyXp = Math.max(...XP_HISTORY.map(d => d.xp), 1);

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

        {/* Highlights */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-[#141e16] border border-slate-800 rounded-2xl p-5 flex flex-col">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 text-[#fbbf24]" /> XP Total
            </span>
            <span className="text-3xl font-black text-white">{xp}</span>
            <span className="text-[#4ade80] text-[10px] font-bold mt-1">+80 hoje</span>
          </div>
          
          <div className="bg-[#1a261d] border border-[#254238] rounded-2xl p-5 flex flex-col shadow-[inset_0_0_20px_rgba(74,222,128,0.05)]">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-orange-500" /> Dias Seguidos
            </span>
            <span className="text-3xl font-black text-white">{streak}</span>
            <span className="text-slate-400 text-[10px] font-bold mt-1">Fogo ardendo! 🔥</span>
          </div>
        </div>

        {/* Nível Atual */}
        <div className="bg-[#4ade80] rounded-[20px] p-6 mb-8 text-[#0e1710] shadow-[0_10px_30px_rgba(74,222,128,0.15)] relative overflow-hidden">
          <Award className="absolute -right-6 -bottom-6 h-32 w-32 text-[#0e1710] opacity-10" />
          <div className="relative z-10">
            <p className="font-extrabold text-[13px] uppercase tracking-widest mb-1">Nível Atual</p>
            <h2 className="text-4xl font-black mb-4">{level}</h2>
            <div className="bg-[#0e1710]/10 rounded-full h-2 w-full mb-2">
              <div className="bg-[#0e1710] h-full rounded-full" style={{ width: '65%' }}></div>
            </div>
            <p className="text-[11px] font-bold flex justify-between">
              <span>Progresso para o Nível {level + 1}</span>
              <span>65%</span>
            </p>
          </div>
        </div>

        {/* Gráfico da Semana */}
        <div className="mb-4">
          <h3 className="text-lg font-bold mb-6">Atividade da Semana</h3>
          
          <div className="bg-[#141e16] border border-[#254238]/60 rounded-3xl p-6">
            <div className="flex justify-between items-end h-32 gap-2 mt-4">
              {XP_HISTORY.map((day, i) => (
                <div key={i} className="flex flex-col items-center gap-2 flex-1">
                  <div className="w-full flex justify-center group relative">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-8 bg-[#1e2e26] text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {day.xp} XP
                    </div>
                    {/* Bar */}
                    <div 
                      className={`w-full max-w-[12px] rounded-full transition-all duration-500 ${day.xp > 0 ? "bg-[#4ade80]" : "bg-slate-800"}`}
                      style={{ height: `${Math.max((day.xp / maxDailyXp) * 100, 4)}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase">{day.day.charAt(0)}</span>
                </div>
              ))}
            </div>
          </div>
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
              className={`flex flex-col items-center gap-1.5 transition-colors ${isActive || item.path === '/dashboard/ranking' ? "text-[#4ade80]" : "text-slate-500 hover:text-slate-300"}`}
            >
              <item.icon className={`h-[22px] w-[22px] ${isActive || item.path === '/dashboard/ranking' ? "stroke-[2.5]" : "stroke-2"}`} />
              <span className={`text-[10px] font-bold tracking-wide ${isActive || item.path === '/dashboard/ranking' ? "text-[#4ade80]" : ""}`}>
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
