import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { 
  Sparkles, MessageCircle, TrendingUp, ChevronRight, Zap, Target, 
  Clock, BookOpen, Bot, View, Home, Check, Trophy, Briefcase, User,
  Calendar, FileText, AlertCircle
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { api } from "@/lib/api";
import { buildStudentContext, generateStudySuggestions } from "@/lib/gemini";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { xp, level, streak, quizzesCompleted, studyHours, performanceData } = useGame();
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  
  // AI Suggestions
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);

  useEffect(() => {
    api.getUpcomingEvents().then(setUpcomingEvents).catch(() => {});
    
    // Load AI Suggestions
    const loadSuggestions = async () => {
      try {
        const context = await buildStudentContext();
        const sugg = await generateStudySuggestions(context);
        setSuggestions(sugg || []);
      } catch (e) {
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    };
    loadSuggestions();
  }, []);

  const averageAvg = performanceData.length > 0
    ? (performanceData.reduce((acc, curr) => acc + curr.nota, 0) / performanceData.length).toFixed(1)
    : "0.0";

  const nextLevelXP = level * 100;
  const currentLevelXP = xp - ((level - 1) * 100);
  const xpProgress = Math.min((currentLevelXP / 100) * 100, 100);

  // Get user name from localStorage if available
  const userName = localStorage.getItem("userName") || "Estudante";

  const bottomNavItems = [
    { title: "Início", path: "/dashboard", icon: Home },
    { title: "Cursos", path: "/dashboard/subjects", icon: BookOpen },
    { title: "Planner", path: "/dashboard/tasks", icon: Check },
    { title: "IA", path: "/dashboard/chat", icon: Bot },
    { title: "Perfil", path: "/dashboard/performance", icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#0e1710] text-white flex flex-col font-sans pb-24 relative overflow-x-hidden">
      <div className="max-w-md mx-auto w-full px-5 py-6">
        
        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-8 mt-2">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-[#1a261d] border-2 border-[#4ade80]/30 shadow-[0_0_15px_rgba(74,222,128,0.15)] flex items-center justify-center overflow-hidden">
              <span className="text-2xl mt-2">👨🏻‍💼</span>
            </div>
            <div>
              <p className="text-[#4ade80] text-[10px] sm:text-xs font-black tracking-[0.2em] uppercase mb-0.5">BEM-VINDO</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-white m-0">Olá, {userName}!</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-[#141e16] border border-slate-800 px-3 py-1.5 rounded-full">
              <Zap className="h-3.5 w-3.5 text-orange-500 fill-orange-500" />
              <span className="text-xs sm:text-sm font-bold text-slate-300">{streak}</span>
            </div>
          </div>
        </div>

        {/* ── Main Stats Card ── */}
        <div className="bg-[#141e16] border border-[#254238]/60 rounded-3xl p-5 mb-6 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#4ade80]/5 rounded-bl-full -mr-8 -mt-8"></div>
          
          <div className="flex justify-between items-end mb-5 relative z-10">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-[#4ade80]" /> Progresso Geral
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">{xp}</span>
                <span className="text-[#4ade80] text-sm font-bold">XP</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Nível</p>
              <span className="text-2xl font-black text-white">{level}</span>
            </div>
          </div>

          <div className="relative z-10">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-300">Rumo ao Nível {level + 1}</span>
              <span className="text-[10px] font-bold text-[#4ade80] bg-[#4ade80]/10 px-2 py-0.5 rounded-sm">
                Faltam {Math.max(0, 100 - currentLevelXP)} XP
              </span>
            </div>
            <div className="h-2.5 w-full bg-[#0e1710] rounded-full overflow-hidden flex">
              <div className="h-full bg-[#4ade80] transition-all duration-300" style={{ width: `${xpProgress}%` }}></div>
            </div>
          </div>
        </div>

        {/* ── Daily Challenge Banner ── */}
        <button
          onClick={() => navigate("/dashboard/quizzes")}
          className="w-full text-left bg-[#4ade80] p-6 rounded-3xl shadow-[0_10px_30px_rgba(74,222,128,0.15)] relative overflow-hidden mb-6 transition-transform active:scale-95 group"
        >
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/20 rounded-full group-hover:scale-110 transition-transform duration-500" />
          <div className="absolute -bottom-6 -right-8 w-32 h-32 bg-white/10 rounded-full group-hover:scale-110 transition-transform duration-700" />
          
          <div className="relative">
            <p className="text-[#0e1710] text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-1">
              <Sparkles className="h-3 w-3 fill-[#0e1710]" /> Desafio Diário
            </p>
            <h2 className="text-[#0e1710] text-[22px] font-black leading-tight mb-2">Quiz do Dia</h2>
            <p className="text-[#0e1710]/70 text-xs font-bold mb-5 max-w-[200px]">
              Complete o desafio de hoje e dobre seus pontos de experiência.
            </p>
            
            <div className="flex items-center justify-between">
              <div className="bg-[#0e1710]/10 backdrop-blur-sm text-[#0e1710] text-xs px-3 py-1.5 rounded-lg font-bold">
                🎯 {quizzesCompleted} Feitos
              </div>
              <div className="bg-[#0e1710] text-[#4ade80] font-bold text-[13px] px-5 py-2.5 rounded-xl shadow-lg flex items-center gap-1">
                Iniciar <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          </div>
        </button>

        {/* ── AI Study Suggestions ── */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Bot className="h-5 w-5 text-[#4ade80]" /> Recomendações Nzila
            </h3>
          </div>
          
          {loadingSuggestions ? (
            <div className="bg-[#141e16] border border-slate-800/60 rounded-2xl p-6 flex flex-col items-center justify-center">
              <div className="h-6 w-6 border-2 border-[#4ade80] border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-xs font-bold text-slate-400">A cruzar o teu horário com as provas...</p>
            </div>
          ) : suggestions.length > 0 ? (
            <div className="space-y-3">
              {suggestions.map((s, i) => (
                <div key={i} className="bg-[#141e16] border border-slate-800/60 transition-colors hover:border-[#254238] rounded-2xl p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#4ade80] bg-[#4ade80]/10 px-2 py-0.5 rounded-sm">
                      {s.subject_name}
                    </span>
                    <span className={`text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-sm ${
                      s.urgency === "alta" ? "bg-red-500/15 text-red-500" :
                      s.urgency === "media" ? "bg-amber-500/15 text-amber-500" :
                      "bg-blue-500/15 text-blue-500"
                    }`}>
                      Prioridade {s.urgency}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">{s.topic}</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed mb-3">{s.reason}</p>
                  
                  <button 
                    onClick={() => navigate(`/dashboard/tasks?subject=${encodeURIComponent(s.subject_name)}&topic=${encodeURIComponent(s.topic)}`)}
                    className="w-full py-2 bg-[#0e1710] border border-slate-800 rounded-xl text-xs font-bold text-slate-300 hover:text-[#4ade80] hover:border-[#4ade80]/30 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Check className="h-3.5 w-3.5" /> Adicionar ao Planner Domodoro
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#141e16] border border-slate-800/60 rounded-2xl p-5 text-center">
              <p className="text-[11px] text-slate-400 font-bold mb-3">
                Não há provas próximas nem aulas detetadas hoje.
              </p>
              <button 
                onClick={() => navigate("/dashboard/calendar")}
                className="text-xs font-bold text-[#4ade80] bg-[#4ade80]/10 px-4 py-2 rounded-xl"
              >
                Configurar o teu Calendário
              </button>
            </div>
          )}
        </div>

        {/* ── Quick Actions Grid ── */}
        <h3 className="text-lg font-bold mb-4">Acesso Rápido</h3>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => navigate("/dashboard/chat")}
            className="bg-[#141e16] border border-slate-800/60 p-4 rounded-2xl text-left hover:border-[#4ade80]/40 transition-colors group"
          >
            <div className="w-10 h-10 bg-[#1e2e26] rounded-xl flex items-center justify-center mb-3 group-hover:bg-[#4ade80]/10 transition-colors">
              <MessageCircle className="h-5 w-5 text-[#4ade80]" />
            </div>
            <p className="font-bold text-sm text-white mb-0.5">Falar c/ Nzila</p>
            <p className="text-[10px] text-slate-500 font-medium">Tutor Virtual Inteligente</p>
          </button>

          <button
            onClick={() => navigate("/dashboard/sala-ia")}
            className="bg-[#141e16] border border-slate-800/60 p-4 rounded-2xl text-left hover:border-[#4ade80]/40 transition-colors group"
          >
            <div className="w-10 h-10 bg-[#1e2e26] rounded-xl flex items-center justify-center mb-3 group-hover:bg-[#4ade80]/10 transition-colors">
              <Bot className="h-5 w-5 text-purple-400" />
            </div>
            <p className="font-bold text-sm text-white mb-0.5">Sala IA</p>
            <p className="text-[10px] text-slate-500 font-medium">Avatar de Ensino 3D</p>
          </button>
          
          <button
            onClick={() => navigate("/dashboard/ar")}
            className="bg-[#141e16] border border-slate-800/60 p-4 rounded-2xl text-left hover:border-[#4ade80]/40 transition-colors group col-span-2"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#1e2e26] border border-slate-700/50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-[#4ade80]/10 transition-colors">
                <View className="h-6 w-6 text-orange-400" />
              </div>
              <div>
                <p className="font-bold text-[15px] text-white mb-0.5">Ambientes em 3D</p>
                <p className="text-xs text-slate-500 font-medium pt-0.5">Aprende anatomia e sistema solar de forma imersiva.</p>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-600 ml-auto" />
            </div>
          </button>
        </div>

        {/* ── Calendar Card ── */}
        <button
          onClick={() => navigate("/dashboard/calendar")}
          className="w-full text-left bg-[#141e16] border border-slate-800/60 p-5 rounded-2xl hover:border-[#4ade80]/40 transition-colors group mb-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#1e2e26] border border-slate-700/50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-[#4ade80]/10 transition-colors">
              <Calendar className="h-6 w-6 text-[#4ade80]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[15px] text-white mb-0.5">Calendário Acadêmico</p>
              {upcomingEvents.length > 0 ? (
                <p className="text-xs text-slate-400 font-medium truncate">
                  📅 {upcomingEvents[0].title}
                  {upcomingEvents.length > 1 ? ` +${upcomingEvents.length - 1} eventos` : ""}
                </p>
              ) : (
                <p className="text-xs text-slate-500 font-medium">Submete o teu calendário escolar</p>
              )}
            </div>
            <ChevronRight className="h-5 w-5 text-slate-600 ml-auto" />
          </div>
        </button>

        {/* ── Bottom Mini Stats ── */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-[#141e16] border border-slate-800/60 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-[#1e2e26] flex items-center justify-center">
                 <Clock className="h-4 w-4 text-[#4ade80]" />
               </div>
               <div>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Estudo</p>
                 <p className="text-lg font-black leading-none">{studyHours}h</p>
               </div>
            </div>
          </div>
          <div className="bg-[#141e16] border border-slate-800/60 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-[#1e2e26] flex items-center justify-center">
                 <BookOpen className="h-4 w-4 text-yellow-500" />
               </div>
               <div>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Matérias</p>
                 <p className="text-lg font-black leading-none">{performanceData.length}</p>
               </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── Fixed Bottom Navigation ── */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#0e1710]/95 backdrop-blur-xl border-t border-[#1a261d] px-6 py-4 flex justify-between items-center z-50">
        {bottomNavItems.map((item, i) => {
          const isActive = location.pathname === item.path || (item.title === 'Início' && location.pathname === '/dashboard');
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

export default Dashboard;
