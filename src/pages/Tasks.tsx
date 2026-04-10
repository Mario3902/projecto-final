import { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { Play, Pause, BookOpen, Brain, Trophy, Home, User, Check, Plus, Medal, Flame, Bot, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { useGame } from "@/context/GameContext";
import { toast } from "sonner";

interface SubjectData {
  id: string;
  name: string;
  emoji: string;
}

const AI_TOPICS: Record<string, string[]> = {
  "Matemática": ["Análise Combinatória", "Funções Exponenciais", "Probabilidade e Estatística", "Geometria Espacial"],
  "Física": ["Leis de Newton", "Termodinâmica", "Ondulatória", "Eletromagnetismo"],
  "Química": ["Estequiometria", "Química Orgânica", "Termoquímica", "Ligações Químicas"],
  "Biologia": ["Genética Mendeliana", "Ecologia", "Citologia", "Fisiologia Humana"],
  "História": ["Revolução Industrial", "Primeira Guerra Mundial", "Guerra Fria", "História de Angola"],
  "Geografia": ["Geopolítica Atual", "Climatologia", "Globalização", "Geografia Económica"],
  "Português": ["Interpretação de Texto", "Gramática Aplicada", "Literatura", "Redação"],
  "Inglês": ["Tempos Verbais", "Phrasal Verbs", "Leitura e Compreensão", "Vocabulário de Negócios"],
};

const getSuggestionsForSubject = (subjectName: string): string[] => {
  for (const [key, topics] of Object.entries(AI_TOPICS)) {
    if (subjectName.toLowerCase().includes(key.toLowerCase())) {
      return topics;
    }
  }
  return ["Revisão Geral", "Resolução de Exercícios", "Leitura do Manual", "Preparação para Teste"];
};

const Tasks = () => {
  const { xp, level, addXP, tasks, toggleTask, pomodoroCalendar, pomodoroSessions, savePomodoroSession } = useGame();
  const location = useLocation();

  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  
  // Pomodoro Setup State
  const [selectedSubject, setSelectedSubject] = useState<SubjectData | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [isConfiguring, setIsConfiguring] = useState<boolean>(true);

  // Pomodoro Timer State
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  // Load Subjects from LocalStorage
  useEffect(() => {
    const stored = localStorage.getItem("nzila_course_data");
    let loadedSubjects: SubjectData[] = [];
    if (stored) {
      const data = JSON.parse(stored);
      if (data.subjects && data.subjects.length > 0) {
        setSubjects(data.subjects);
        loadedSubjects = data.subjects;
      }
    }

    // Check for query parameters (?subject=...&topic=...)
    const searchParams = new URLSearchParams(location.search);
    const qSubject = searchParams.get("subject");
    const qTopic = searchParams.get("topic");

    if (qSubject && loadedSubjects.length > 0) {
      // Find subject by name similarity
      const found = loadedSubjects.find(s => s.name.toLowerCase().includes(qSubject.toLowerCase()));
      if (found) {
        setSelectedSubject(found);
      } else {
        // If not found, maybe create a free text one or just leave blank
        setSelectedTopic(`[${qSubject}] ` + (qTopic || ""));
      }
    }
    if (qTopic) {
      setSelectedTopic(prev => prev ? prev : qTopic);
    }
  }, [location.search]);

  // Calendar logic
  const today = new Date();
  const currentWeek = useMemo(() => {
    const dates = [];
    const _d = new Date(today);
    const day = _d.getDay();
    const diff = _d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    _d.setDate(diff);
    
    for (let i = 0; i < 7; i++) {
      const iterDate = new Date(_d);
      iterDate.setDate(_d.getDate() + i);
      const isToday = iterDate.toDateString() === today.toDateString();
      
      const dateStr = iterDate.toISOString().split('T')[0];
      const hasStudied = pomodoroCalendar.some(p => p.date === dateStr && p.total_minutes > 0);
      
      dates.push({
        date: iterDate,
        dayStr: iterDate.toLocaleDateString("pt-PT", { weekday: "short" }).toUpperCase(),
        num: iterDate.getDate().toString().padStart(2, "0"),
        isToday,
        hasStudied
      });
    }
    return dates;
  }, [pomodoroCalendar]);

  const monthName = today.toLocaleDateString("pt-PT", { month: "long" });
  const formattedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1) + " " + today.getFullYear();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      if (!isBreak) {
        setIsActive(false);
        // Completed Pomodoro Work
        const earnedXp = 25;
        savePomodoroSession(
          selectedSubject ? Number(selectedSubject.id) : undefined, 
          selectedSubject ? selectedSubject.name : "Estudo Livre", 
          selectedTopic || "Sessão Foco", 
          25, 
          earnedXp
        );
        
        setIsBreak(true);
        setTimeLeft(5 * 60);
        setIsConfiguring(true); // reset
      } else {
        toast("Pausa finalizada! Pronto para voltar.", { icon: "🚀" });
        setIsBreak(false);
        setTimeLeft(25 * 60);
        setIsActive(false);
      }
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, isBreak, savePomodoroSession, selectedSubject, selectedTopic]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const finishEarly = () => {
     setIsActive(false);
     setIsConfiguring(true);
     setTimeLeft(25 * 60);
     toast("Sessão cancelada.", { icon: "🛑" });
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const bottomNavItems = [
    { title: "Início", path: "/dashboard", icon: Home },
    { title: "Cursos", path: "/dashboard/subjects", icon: BookOpen },
    { title: "Planner", path: "/dashboard/tasks", icon: Check },
    { title: "IA", path: "/dashboard/chat", icon: Bot },
    { title: "Perfil", path: "/dashboard/performance", icon: User },
  ];

  const pendingTasks = tasks.filter(t => !t.done).length;

  return (
    <div className="min-h-screen bg-[#0e1710] text-white flex flex-col font-sans pb-24 relative overflow-x-hidden">
      <div className="max-w-md mx-auto w-full px-5 py-6 animate-fade-in">
        
        {/* Header User Profile */}
        <div className="flex items-center justify-between mt-2 mb-8">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-[#1a261d] border-2 border-[#4ade80]/30 shadow-[0_0_15px_rgba(74,222,128,0.15)] flex items-center justify-center overflow-hidden">
              <span className="text-2xl mt-1">👨🏻‍💼</span>
            </div>
            <div>
              <h3 className="text-[#4ade80] text-[10px] font-black tracking-widest uppercase mb-0.5">NÍVEL {level}</h3>
              <div className="h-1.5 w-24 bg-[#1e2e26] rounded-full overflow-hidden">
                <div className="h-full bg-[#4ade80]" style={{ width: "40%" }}></div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-[#141e16] border border-slate-800 px-3 py-1.5 rounded-full">
              <Flame className="h-3.5 w-3.5 fill-[#4ade80] text-[#4ade80]" />
              <span className="text-xs font-bold text-slate-300">{xp} XP</span>
            </div>
          </div>
        </div>

        {/* Calendar Strip (Real Data) */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">{formattedMonth}</h2>
            <div className="flex gap-3 text-slate-400">
              <button className="h-8 w-8 rounded-full bg-[#141e16] border border-slate-800 flex items-center justify-center hover:text-[#4ade80] transition-colors"><ChevronLeft className="h-4 w-4" /></button>
              <button className="h-8 w-8 rounded-full bg-[#141e16] border border-slate-800 flex items-center justify-center hover:text-[#4ade80] transition-colors"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
          
          <div className="bg-[#141e16] rounded-2xl p-4 flex justify-between items-center border border-slate-800/60 shadow-lg">
            {currentWeek.map((d, i) => (
              <div 
                key={i} 
                className={`flex flex-col items-center justify-center rounded-xl py-2 px-1 w-[42px] relative transition-all duration-300 ${
                  d.isToday ? "bg-[#4ade80] text-[#0e1710] shadow-[0_4px_15px_rgba(74,222,128,0.2)]" : "text-slate-400"
                }`}
              >
                <span className="text-[9px] font-bold mb-1 uppercase">{d.dayStr}</span>
                <span className={`text-[15px] font-black ${d.isToday ? "text-[#0e1710]" : "text-slate-300"}`}>{d.num}</span>
                
                {/* Indica se estudou no dia */}
                {d.hasStudied && !d.isToday && (
                  <div className="absolute -bottom-1 h-1.5 w-1.5 bg-[#4ade80] rounded-full shadow-[0_0_5px_#4ade80]"></div>
                )}
                {d.hasStudied && d.isToday && (
                  <div className="absolute -bottom-1 h-1.5 w-1.5 bg-[#0e1710] rounded-full"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* POMODORO SYSTEM */}
        <h2 className="text-[19px] font-bold mb-4">Sessão Pomodoro <span className="text-[#4ade80] text-sm ml-2">🍅 Recompensa: 25 XP</span></h2>
        
        {isConfiguring && !isBreak ? (
           // SETUP POMODORO
           <div className="bg-[#141e16] border border-slate-800/60 rounded-3xl p-5 mb-8 shadow-lg">
             <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">1. Seleciona a Matéria</label>
             {subjects.length > 0 ? (
               <div className="flex gap-2 overflow-x-auto pb-3 mb-2 scrollbar-hide">
                 {subjects.map(s => (
                   <button 
                     key={s.id}
                     onClick={() => { setSelectedSubject(s); setSelectedTopic(""); }}
                     className={`shrink-0 px-4 py-2.5 rounded-xl text-sm font-bold border transition-colors flex items-center gap-2 ${
                       selectedSubject?.id === s.id ? "bg-[#4ade80]/10 border-[#4ade80] text-[#4ade80]" : "bg-[#0e1710] border-slate-800 text-slate-400"
                     }`}
                   >
                     <span>{s.emoji}</span> {s.name}
                   </button>
                 ))}
               </div>
             ) : (
                <div className="text-xs text-slate-500 bg-[#0e1710] p-3 rounded-xl border border-slate-800 mb-4">
                  Nenhuma disciplina encontrada. Configura o teu curso primeiro ou estuda de forma livre.
                </div>
             )}

             <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block mt-2">2. Define o Tópico (O que vais focar?)</label>
             <input
                type="text"
                placeholder="Ex: Resolução de exercícios..."
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="w-full bg-[#0e1710] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-[#4ade80] outline-none transition-colors mb-3"
             />

             {selectedSubject && (
               <div className="mb-4">
                 <p className="text-[10px] font-bold text-[#4ade80] uppercase tracking-widest mb-2 flex items-center gap-1.5 pt-1">
                   <Bot className="h-3 w-3" /> Sugestões da IA Nzila
                 </p>
                 <div className="flex flex-wrap gap-2">
                   {getSuggestionsForSubject(selectedSubject.name).map((sug, i) => (
                     <button
                       key={i}
                       onClick={() => setSelectedTopic(sug)}
                       className="bg-[#1e2e26] hover:bg-[#254238] border border-slate-700 text-slate-300 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors text-left"
                     >
                       {sug}
                     </button>
                   ))}
                 </div>
               </div>
             )}

             <button 
               onClick={() => {
                 if (!selectedSubject && subjects.length > 0 && !selectedTopic) {
                   toast("Por favor, seleciona o que vais estudar.");
                   return;
                 }
                 setIsConfiguring(false);
                 setTimeLeft(25 * 60);
                 setIsActive(true);
               }}
               className="w-full py-3.5 bg-[#4ade80] text-[#0e1710] font-black rounded-xl active:scale-95 transition-transform mt-2 flex items-center justify-center gap-2"
             >
               <Play className="h-4 w-4 fill-current" /> Iniciar Pomodoro (25m)
             </button>
           </div>
        ) : (
           // ACTIVE POMODORO OR BREAK
           <div className={`border rounded-3xl p-6 mb-8 relative overflow-hidden flex justify-between items-center group transition-colors shadow-xl ${
             isBreak ? "bg-[#1e293b] border-blue-500/30" : isActive ? "bg-[#141e16] border-[#4ade80]/40" : "bg-[#141e16] border-slate-800"
           }`}>
             
             {isActive && !isBreak && (
                <div className="absolute top-0 left-0 h-1 bg-[#4ade80] transition-all" style={{ width: `${((25*60 - timeLeft) / (25*60)) * 100}%` }}></div>
             )}
             {isBreak && (
                <div className="absolute top-0 left-0 h-1 bg-blue-500 transition-all" style={{ width: `${((5*60 - timeLeft) / (5*60)) * 100}%` }}></div>
             )}

             <div className="relative z-10 w-full">
               <div className="flex justify-between items-start mb-2">
                 <div>
                    <h3 className={`text-[10px] font-black tracking-widest uppercase mb-1 ${isBreak ? "text-blue-400" : "text-[#4ade80]"}`}>
                      {isBreak ? "Pausa Curta ☕" : "Sessão Foco 🍅"}
                    </h3>
                    <h1 className="text-4xl sm:text-5xl font-black text-white mb-2 tracking-tight tabular-nums">{formatTime(timeLeft)}</h1>
                 </div>
                 
                 <button 
                  onClick={toggleTimer}
                  className={`h-14 w-14 rounded-full flex items-center justify-center relative z-10 transition-transform active:scale-95 ${
                    isActive ? "bg-slate-800/80 hover:bg-slate-700" : isBreak ? "bg-blue-500" : "bg-[#4ade80] shadow-[0_0_20px_rgba(74,222,128,0.3)]"
                  }`}
                 >
                  {isActive ? <Pause className="h-6 w-6 text-white fill-white" /> : <Play className="h-6 w-6 text-[#0e1710] fill-current ml-1" />}
                 </button>
               </div>
               
               {!isBreak && (
                 <div className="flex items-center justify-between">
                   <p className="text-slate-400 text-xs font-bold bg-[#0e1710] border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5 overflow-hidden text-ellipsis whitespace-nowrap max-w-[70%]">
                     {selectedSubject?.emoji || "📘"} {selectedSubject?.name || "Estudo Livre"} - {selectedTopic || "Genérico"}
                   </p>
                   {!isActive && (
                      <button onClick={finishEarly} className="text-xs text-red-400 font-bold hover:underline">
                        Cancelar
                      </button>
                   )}
                 </div>
               )}
               {isBreak && (
                 <button onClick={() => { setIsBreak(false); setIsConfiguring(true); setTimeLeft(25*60); }} className="text-xs text-blue-300 font-bold hover:underline">
                    Saltar Pausa
                 </button>
               )}
             </div>
           </div>
        )}

        {/* Tasks and Pomodoro History */}
        <div className="mb-8">
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-[19px] font-bold">Resumo do Dia</h2>
            <span className="text-xs text-slate-500 font-bold bg-[#141e16] px-2.5 py-1.5 rounded-lg border border-slate-800">
              {pomodoroSessions.filter(s => new Date(s.completed_at || s.date).toDateString() === today.toDateString()).length} Pomodoros Feitos
            </span>
          </div>

          <div className="space-y-3">
             {/* Render Pomodoro Sessions for Today */}
             {pomodoroSessions.filter(s => new Date(s.completed_at || s.date).toDateString() === today.toDateString()).map(session => (
               <div key={`pom_${session.id}`} className="bg-[#141e16]/80 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-4">
                 <div className="h-10 w-10 rounded-xl bg-[#4ade80]/10 flex items-center justify-center shrink-0">
                    <Trophy className="h-5 w-5 text-[#4ade80]" />
                 </div>
                 
                 <div className="flex-1">
                   <h4 className="text-[14px] font-bold text-white mb-0.5">
                     Sessão Foco: {session.subject_name}
                   </h4>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                     {session.time || "CONCLUÍDO"} • <span className="text-[#4ade80]">+ {session.xp_earned} XP</span>
                   </p>
                 </div>
               </div>
             ))}

             {/* Render Normal Tasks */}
             {tasks.map(task => (
              <div 
                key={task.id} 
                className={`bg-[#0f172a]/40 border rounded-2xl p-4 flex items-center gap-4 transition-all ${
                  task.done 
                    ? "border-transparent opacity-60" 
                    : "border-[#1e293b] hover:border-[#334155]"
                }`}
              >
                <button 
                  onClick={() => toggleTask(task.id)}
                  className={`h-[22px] w-[22px] shrink-0 rounded-[6px] border-[2.5px] flex items-center justify-center transition-colors ${
                    task.done 
                      ? "bg-[#059669] border-[#059669]" 
                      : "border-[#334155]"
                  }`}
                >
                  {task.done && <Check className="h-3.5 w-3.5 text-white stroke-[3]" />}
                </button>
                
                <div className="flex-1">
                  <h4 className={`text-[15px] font-bold mb-1 ${task.done ? "line-through text-slate-400" : "text-slate-100"}`}>
                    {task.title}
                  </h4>
                  <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5 uppercase tracking-wider">
                    {task.date || "Tarefa Livre"} {task.done ? "" : <span className="text-yellow-500 lowercase tracking-normal">⭐ +10 XP</span>}
                  </p>
                </div>
              </div>
            ))}
            
            {tasks.length === 0 && pomodoroSessions.filter(s => new Date(s.completed_at || s.date).toDateString() === today.toDateString()).length === 0 && (
              <div className="text-center py-6 border border-slate-800 border-dashed rounded-2xl bg-[#0e1710]">
                <p className="text-sm font-bold text-slate-400">Nenhuma atividade registada hoje.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Floating Add Task Button */}
      <button className="fixed bottom-24 right-5 h-14 w-14 rounded-2xl bg-[#141e16] border border-[#254238] shadow-lg flex items-center justify-center transition-transform active:scale-90 z-40 hover:border-[#4ade80]">
        <Plus className="h-6 w-6 text-[#4ade80]" />
      </button>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#0e1710]/95 backdrop-blur-xl border-t border-[#1a261d] px-6 py-4 flex justify-between items-center z-50">
        {bottomNavItems.map((item, i) => {
          const isActive = location.pathname === item.path || (item.title === 'Planner' && true);
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

export default Tasks;
