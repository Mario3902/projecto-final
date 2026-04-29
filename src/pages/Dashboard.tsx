import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  Sparkles, MessageCircle, ChevronRight, Zap, Target,
  Clock, BookOpen, Bot, Home, Check, User,
  Calendar, Heart
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { useNzi } from "@/context/NziContext";
import { api } from "@/lib/api";
import { buildStudentContext, generateStudySuggestions } from "@/lib/gemini";
import DailyGoal from "@/components/gamification/DailyGoal";
import { useStreakNotification } from "@/hooks/useStreakNotification";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { xp, level, streak, quizzesCompleted, studyHours, performanceData, hearts, cauris, isGodMode } = useGame();
  const { showMessage } = useNzi();
  useStreakNotification();
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);

  const userName = localStorage.getItem("userName") || "Estudante";

  useEffect(() => {
    const greetings = [
      `Olá, ${userName}! Pronto para aprender hoje? 🌟`,
      "Hoje é um bom dia para estudar! Vamos lá! 📚",
      streak > 0 ? `Incrível! ${streak} dias seguidos! 🔥` : "Começa a tua sequência hoje! 💪",
      "Cada lição te aproxima dos teus sonhos! ✨",
    ];
    setTimeout(() => showMessage(greetings[Math.floor(Math.random() * greetings.length)], "idle", 5000), 1500);

    api.getUpcomingEvents().then(setUpcomingEvents).catch(() => {});

    const loadSuggestions = async () => {
      try {
        const context = await buildStudentContext();
        setSuggestions((await generateStudySuggestions(context)) || []);
      } catch {
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    };
    loadSuggestions();
  }, []);

  const currentLevelXP = xp - (level - 1) * 100;
  const xpProgress = Math.min((currentLevelXP / 100) * 100, 100);

  const bottomNavItems = [
    { title: "Início",  path: "/dashboard",             icon: Home     },
    { title: "Cursos",  path: "/dashboard/subjects",     icon: BookOpen },
    { title: "Planner", path: "/dashboard/tasks",        icon: Check    },
    { title: "IA",      path: "/dashboard/chat",         icon: Bot      },
    { title: "Perfil",  path: "/dashboard/performance",  icon: User     },
  ];

  return (
    <div className="min-h-screen bg-[#1B1D24] text-white flex flex-col font-sans pb-24 relative overflow-x-hidden">
      <div className="max-w-md mx-auto w-full px-5 py-6">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-6 mt-2">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-[#253510] border-2 border-[#72EB3A]/30 shadow-[0_0_15px_rgba(74,222,128,0.15)] flex items-center justify-center overflow-hidden">
              <span className="text-2xl mt-2">👨🏻‍💼</span>
            </div>
            <div>
              <p className="text-[#72EB3A] text-[10px] font-black tracking-[0.2em] uppercase mb-0.5">BEM-VINDO</p>
              <h1 className="text-2xl font-bold text-white m-0">Olá, {userName}!</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-[#1C2210] border border-slate-800 px-2.5 py-1.5 rounded-full">
              <span className="text-sm">🪙</span>
              <span className="text-xs font-bold text-yellow-400">{cauris}</span>
            </div>
            <div className="flex items-center gap-0.5 bg-[#1C2210] border border-slate-800 px-2.5 py-1.5 rounded-full">
              {isGodMode ? (
                <span className="text-xs font-black text-red-500 px-0.5">∞</span>
              ) : (
                Array.from({ length: 5 }).map((_, i) => (
                  <Heart key={i} className={`h-3.5 w-3.5 ${i < hearts ? "text-red-500 fill-red-500" : "text-slate-700"}`} />
                ))
              )}
            </div>
            <div className="flex items-center gap-1.5 bg-[#1C2210] border border-slate-800 px-3 py-1.5 rounded-full">
              <Zap className="h-3.5 w-3.5 text-orange-500 fill-orange-500" />
              <span className="text-xs font-bold text-slate-300">{streak}</span>
            </div>
          </div>
        </div>

        {/* ── XP + Stats card ── */}
        <div className="bg-[#1C2210] border border-[#365A08]/60 rounded-3xl p-5 mb-5 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#72EB3A]/5 rounded-bl-full -mr-8 -mt-8" />
          <div className="flex justify-between items-end mb-4 relative z-10">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-[#72EB3A]" /> Progresso Geral
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">{xp}</span>
                <span className="text-[#72EB3A] text-sm font-bold">XP</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Nível</p>
              <span className="text-2xl font-black text-white">{level}</span>
            </div>
          </div>
          <div className="relative z-10 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-300">Rumo ao Nível {level + 1}</span>
              <span className="text-[10px] font-bold text-[#72EB3A] bg-[#72EB3A]/10 px-2 py-0.5 rounded-sm">
                Faltam {Math.max(0, 100 - currentLevelXP)} XP
              </span>
            </div>
            <div className="h-2.5 w-full bg-[#1B1D24] rounded-full overflow-hidden">
              <div className="h-full bg-[#72EB3A] transition-all duration-300" style={{ width: `${xpProgress}%` }} />
            </div>
          </div>
          {/* Mini stats row */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#365A08]/40">
            <div className="text-center">
              <p className="text-lg font-black text-white leading-none">{studyHours}h</p>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Estudo</p>
            </div>
            <div className="text-center border-x border-[#365A08]/40">
              <p className="text-lg font-black text-white leading-none">{quizzesCompleted}</p>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Quizzes</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-black text-white leading-none">{performanceData.length}</p>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Matérias</p>
            </div>
          </div>
        </div>

        {/* ── Daily Challenge Banner ── */}
        <button
          onClick={() => navigate("/dashboard/quizzes")}
          className="w-full text-left bg-[#72EB3A] p-5 rounded-3xl shadow-[0_10px_30px_rgba(74,222,128,0.15)] relative overflow-hidden mb-5 transition-transform active:scale-95 group"
        >
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/20 rounded-full group-hover:scale-110 transition-transform duration-500" />
          <div className="absolute -bottom-6 -right-8 w-32 h-32 bg-white/10 rounded-full group-hover:scale-110 transition-transform duration-700" />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-[#1B1D24] text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-1">
                <Sparkles className="h-3 w-3 fill-[#1B1D24]" /> Desafio Diário
              </p>
              <h2 className="text-[#1B1D24] text-xl font-black leading-tight mb-1">Quiz do Dia</h2>
              <p className="text-[#1B1D24]/60 text-xs font-bold">🎯 {quizzesCompleted} feitos hoje</p>
            </div>
            <div className="bg-[#1B1D24] text-[#72EB3A] font-bold text-sm px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-1 shrink-0">
              Iniciar <ChevronRight className="h-4 w-4" />
            </div>
          </div>
        </button>

        {/* ── Daily Goal ── */}
        <DailyGoal />

        {/* ── Ferramentas de Aprendizagem ── */}
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-3 mt-6">Ferramentas de Aprendizagem</h3>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <button
            onClick={() => navigate("/dashboard/skill-tree")}
            className="bg-[#1C2210] border border-[#365A08] p-4 rounded-2xl text-left hover:border-[#72EB3A]/40 transition-colors group"
          >
            <div className="w-10 h-10 bg-[#253510] rounded-xl flex items-center justify-center mb-3 text-xl group-hover:bg-[#72EB3A]/10 transition-colors">🌳</div>
            <p className="font-bold text-sm text-white mb-0.5">Árvore</p>
            <p className="text-[10px] text-slate-500 font-medium">Caminho de aprendizagem</p>
          </button>

          <button
            onClick={() => navigate("/dashboard/leagues")}
            className="bg-[#1C2210] border border-[#365A08] p-4 rounded-2xl text-left hover:border-yellow-500/40 transition-colors group"
          >
            <div className="w-10 h-10 bg-[#253510] rounded-xl flex items-center justify-center mb-3 text-xl group-hover:bg-yellow-500/10 transition-colors">🏆</div>
            <p className="font-bold text-sm text-white mb-0.5">Ligas</p>
            <p className="text-[10px] text-slate-500 font-medium">Competição semanal</p>
          </button>

          <button
            onClick={() => navigate("/dashboard/flashcards")}
            className="bg-[#1C2210] border border-[#365A08] p-4 rounded-2xl text-left hover:border-purple-500/40 transition-colors group"
          >
            <div className="w-10 h-10 bg-[#253510] rounded-xl flex items-center justify-center mb-3 text-xl group-hover:bg-purple-500/10 transition-colors">🃏</div>
            <p className="font-bold text-sm text-white mb-0.5">Flashcards</p>
            <p className="text-[10px] text-slate-500 font-medium">Revisão espaçada SRS</p>
          </button>

          <button
            onClick={() => navigate("/dashboard/mindmap")}
            className="bg-[#1C2210] border border-[#365A08] p-4 rounded-2xl text-left hover:border-cyan-500/40 transition-colors group"
          >
            <div className="w-10 h-10 bg-[#253510] rounded-xl flex items-center justify-center mb-3 text-xl group-hover:bg-cyan-500/10 transition-colors">🕸️</div>
            <p className="font-bold text-sm text-white mb-0.5">Mapa Mental</p>
            <p className="text-[10px] text-slate-500 font-medium">Visão geral dos tópicos</p>
          </button>
        </div>

        {/* Story Mode — full width */}
        <button
          onClick={() => navigate("/dashboard/story")}
          className="w-full bg-gradient-to-r from-[#1a1a0a] to-[#1a100a] border border-orange-500/20 p-4 rounded-2xl text-left hover:border-orange-500/40 transition-colors group mb-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center text-2xl shrink-0">📖</div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-white mb-0.5">Modo História</p>
              <p className="text-[11px] text-slate-500">Aventuras narrativas por matéria · capítulos desbloqueáveis</p>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-600 shrink-0" />
          </div>
        </button>

        {/* Chat IA — full width */}
        <button
          onClick={() => navigate("/dashboard/chat")}
          className="w-full bg-gradient-to-r from-[#0f1a10] to-[#111a16] border border-[#365A08] p-4 rounded-2xl text-left hover:border-[#72EB3A]/40 transition-colors group mb-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#72EB3A]/10 rounded-xl flex items-center justify-center shrink-0">
              <MessageCircle className="h-6 w-6 text-[#72EB3A]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-white mb-0.5">Falar com Nzila</p>
              <p className="text-[11px] text-slate-500">Tutor IA · responde dúvidas em tempo real</p>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-600 shrink-0" />
          </div>
        </button>

        {/* ── Recomendações IA ── */}
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-3">Recomendações Nzila</h3>
        {loadingSuggestions ? (
          <div className="bg-[#1C2210] border border-slate-800/60 rounded-2xl p-6 flex flex-col items-center justify-center mb-5">
            <div className="h-6 w-6 border-2 border-[#72EB3A] border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs font-bold text-slate-400">A cruzar o teu horário com as provas...</p>
          </div>
        ) : suggestions.length > 0 ? (
          <div className="space-y-3 mb-5">
            {suggestions.map((s, i) => (
              <div key={i} className="bg-[#1C2210] border border-slate-800/60 hover:border-[#365A08] transition-colors rounded-2xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#72EB3A] bg-[#72EB3A]/10 px-2 py-0.5 rounded-sm">
                    {s.subject_name}
                  </span>
                  <span className={`text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-sm ${
                    s.urgency === "alta"  ? "bg-red-500/15 text-red-500"   :
                    s.urgency === "media" ? "bg-amber-500/15 text-amber-500" :
                                           "bg-blue-500/15 text-blue-500"
                  }`}>
                    {s.urgency}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white mb-1">{s.topic}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-3">{s.reason}</p>
                <button
                  onClick={() => navigate(`/dashboard/tasks?subject=${encodeURIComponent(s.subject_name)}&topic=${encodeURIComponent(s.topic)}`)}
                  className="w-full py-2 bg-[#1B1D24] border border-slate-800 rounded-xl text-xs font-bold text-slate-300 hover:text-[#72EB3A] hover:border-[#72EB3A]/30 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Check className="h-3.5 w-3.5" /> Adicionar ao Planner
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#1C2210] border border-slate-800/60 rounded-2xl p-5 text-center mb-5">
            <p className="text-[11px] text-slate-400 font-bold mb-3">Sem provas próximas detetadas.</p>
            <button
              onClick={() => navigate("/dashboard/calendar")}
              className="text-xs font-bold text-[#72EB3A] bg-[#72EB3A]/10 px-4 py-2 rounded-xl"
            >
              Configurar Calendário
            </button>
          </div>
        )}

        {/* ── Calendário ── */}
        <button
          onClick={() => navigate("/dashboard/calendar")}
          className="w-full text-left bg-[#1C2210] border border-slate-800/60 p-4 rounded-2xl hover:border-[#72EB3A]/40 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#253510] border border-slate-700/50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-[#72EB3A]/10 transition-colors">
              <Calendar className="h-5 w-5 text-[#72EB3A]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-white mb-0.5">Calendário Académico</p>
              {upcomingEvents.length > 0 ? (
                <p className="text-xs text-slate-400 font-medium truncate">
                  📅 {upcomingEvents[0].title}{upcomingEvents.length > 1 ? ` +${upcomingEvents.length - 1}` : ""}
                </p>
              ) : (
                <p className="text-xs text-slate-500 font-medium">Adiciona provas e eventos escolares</p>
              )}
            </div>
            <ChevronRight className="h-4 w-4 text-slate-600 shrink-0" />
          </div>
        </button>

      </div>

      {/* ── Bottom Navigation ── */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#1B1D24]/95 backdrop-blur-xl border-t border-[#253510] px-6 py-4 flex justify-between items-center z-50">
        {bottomNavItems.map((item, i) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={i}
              to={item.path}
              className={`flex flex-col items-center gap-1.5 transition-colors ${isActive ? "text-[#72EB3A]" : "text-slate-500 hover:text-slate-300"}`}
            >
              <item.icon className={`h-[22px] w-[22px] ${isActive ? "stroke-[2.5]" : "stroke-2"}`} />
              <span className={`text-[10px] font-bold tracking-wide ${isActive ? "text-[#72EB3A]" : ""}`}>
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
