import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Play, Pause, BookOpen, Brain, Briefcase, Trophy, Home, User, Check, Plus, Medal, Flame, Bot } from "lucide-react";
import { useGame } from "@/context/GameContext";
import { toast } from "sonner";

interface Task {
  id: number;
  title: string;
  done: boolean;
  time: string;
  xp: number;
  icon: string;
}

const Tasks = () => {
  const { xp, level, addXP, addStudyTime, tasks, toggleTask } = useGame();
  const location = useLocation();

  // Pomodoro State
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  // Filter State
  const [activeFilter, setActiveFilter] = useState("Tudo");
  const filters = ["Tudo", "Estudos", "Vocacional", "Rotina"];

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      if (!isBreak) {
        addXP(25, "Pomodoro de estudo concluído!");
        addStudyTime(25);
        toast.success("Tempo de estudo finalizado! Hora de uma pausa.", { icon: "☕" });
        setIsBreak(true);
        setTimeLeft(5 * 60);
      } else {
        toast("Pausa finalizada! Pronto para voltar.", { icon: "🚀" });
        setIsBreak(false);
        setTimeLeft(25 * 60);
        setIsActive(false);
      }
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, isBreak, addXP, addStudyTime]);

  const toggleTimer = () => setIsActive(!isActive);
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Map backend tasks to match expected UI layout visually  
  const formattedTasks = tasks.map(t => ({
    ...t,
    time: t.date || "HOJE • 14:00",
    xp: 50, // default if no XP stored on task table
    icon: "BookOpen" 
  }));

  const bottomNavItems = [
    { title: "Início", path: "/dashboard", icon: Home },
    { title: "Cursos", path: "/dashboard/subjects", icon: BookOpen },
    { title: "Planner", path: "/dashboard/tasks", icon: Check },
    { title: "IA", path: "/dashboard/chat", icon: Bot },
    { title: "Perfil", path: "/dashboard/performance", icon: User },
  ];

  // Calendar dates mock
  const DATES = [
    { day: "SEG", num: "03", active: false },
    { day: "TER", num: "04", active: false },
    { day: "QUA", num: "05", active: true },
    { day: "QUI", num: "06", active: false },
    { day: "SEX", num: "07", active: false },
    { day: "SÁB", num: "08", active: false },
    { day: "DOM", num: "09", active: false },
  ];

  const pendingTasks = formattedTasks.filter(t => !t.done).length;

  return (
    <div className="min-h-screen bg-[#0e1710] text-white flex flex-col font-sans pb-24 relative overflow-x-hidden">
      <div className="max-w-md mx-auto w-full px-5 py-6">
        
        {/* Header User Profile */}
        <div className="flex items-center justify-between mt-2 mb-8">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-[#fae8d4] border-2 border-[#1e2e26] flex items-center justify-center overflow-hidden">
              <span className="text-2xl mt-2">👨🏻‍💼</span>
            </div>
            <div>
              <h3 className="text-[#4ade80] text-[10px] font-black tracking-widest uppercase mb-0.5">NÍVEL {level}</h3>
              <div className="h-1.5 w-24 bg-[#1e2e26] rounded-full overflow-hidden">
                <div className="h-full bg-[#4ade80]" style={{ width: "40%" }}></div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/20 px-3 py-1.5 rounded-full">
              <Flame className="h-3.5 w-3.5 fill-[#4ade80]" />
              <span className="text-xs font-bold">{xp} XP</span>
            </div>
            <div className="h-10 w-10 rounded-full bg-[#1a261d] border border-slate-700 flex items-center justify-center">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4ade80] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#4ade80]"></span>
              </span>
            </div>
          </div>
        </div>

        {/* Calendar Strip */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Junho 2024</h2>
            <div className="flex gap-3 text-slate-400">
              <span className="text-sm font-bold">&lt;</span>
              <span className="text-sm font-bold">&gt;</span>
            </div>
          </div>
          
          <div className="bg-[#141e16] rounded-2xl p-4 flex justify-between items-center border border-slate-800/60">
            {DATES.map((d, i) => (
              <div 
                key={i} 
                className={`flex flex-col items-center justify-center rounded-xl py-2 px-1 w-[42px] ${
                  d.active ? "bg-[#4ade80] text-[#0e1710] shadow-[0_4px_15px_rgba(74,222,128,0.2)]" : "text-slate-400"
                }`}
              >
                <span className="text-[9px] font-bold mb-1 uppercase">{d.day}</span>
                <span className={`text-[15px] font-black ${d.active ? "text-[#0e1710]" : "text-slate-300"}`}>{d.num}</span>
                {d.active && <div className="h-1 w-1 bg-[#0e1710] rounded-full mt-1"></div>}
              </div>
            ))}
          </div>
        </div>

        {/* Pomodoro Focus Card */}
        <div className="bg-[#141e16] border border-[#254238]/50 rounded-3xl p-6 mb-6 relative overflow-hidden flex justify-between items-center group transition-colors hover:border-[#4ade80]/30 shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-[#4ade80]/5 to-transparent pointer-events-none"></div>
          <div className="relative z-10">
            <h3 className="text-[#4ade80] text-[10px] font-black tracking-widest uppercase mb-1">{isBreak ? "PAUSA NZILA" : "POMODORO NZILA"}</h3>
            <h1 className="text-4xl font-black text-white mb-2 tracking-tight tabular-nums">{formatTime(timeLeft)}</h1>
            <p className="text-slate-400 text-xs font-medium">Sessão de Foco: Estudo de Álgebra</p>
          </div>
          <button 
            onClick={toggleTimer}
            className={`h-[60px] w-[60px] rounded-full flex items-center justify-center relative z-10 transition-transform active:scale-95 shadow-[0_0_20px_rgba(74,222,128,0.3)] ${
              isActive ? "bg-red-500" : "bg-[#10b981]"
            }`}
          >
            {isActive ? <Pause className="h-7 w-7 text-white fill-white" /> : <Play className="h-7 w-7 text-white fill-white ml-1" />}
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide -mx-5 px-5">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
                activeFilter === f 
                  ? "bg-[#059669] text-white" 
                  : "bg-[#1e293b] text-slate-300 border border-slate-700 hover:bg-[#334155]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Tasks List */}
        <div className="mb-8">
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-[19px] font-bold">Tarefas de Hoje</h2>
            <span className="text-xs text-slate-500 font-medium">{pendingTasks} pendentes</span>
          </div>

          <div className="space-y-3">
            {formattedTasks.map(task => (
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
                    {task.time} {task.done ? "" : <span className="text-[#10b981] lowercase tracking-normal">⚡ +{task.xp} XP</span>}
                  </p>
                </div>

                {!task.done && (
                  <div className="h-10 w-10 rounded-xl bg-[#1e293b] flex items-center justify-center shrink-0">
                     {task.title.toLowerCase().includes('vocacional') ? <Brain className="h-5 w-5 text-[#10b981]" /> : <BookOpen className="h-5 w-5 text-[#10b981]" />}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Next Achievements */}
        <div className="mb-6">
          <h2 className="text-[19px] font-bold mb-4">Próximas Conquistas</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-4 flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-[#f59e0b]/10 flex items-center justify-center mb-3">
                <Medal className="h-6 w-6 text-[#f59e0b]" />
              </div>
              <h4 className="text-[13px] font-bold text-white mb-1">Foco Inabalável</h4>
              <p className="text-[10px] text-slate-500 mb-4">Complete 5 Pomodoros</p>
              <div className="h-1 w-full bg-[#1e293b] rounded-full overflow-hidden">
                <div className="h-full bg-[#f59e0b]" style={{ width: "80%" }}></div>
              </div>
            </div>
            
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-4 flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-[#10b981]/10 flex items-center justify-center mb-3">
                <Trophy className="h-6 w-6 text-[#10b981]" />
              </div>
              <h4 className="text-[13px] font-bold text-white mb-1">Mestre do Planeamento</h4>
              <p className="text-[10px] text-slate-500 mb-4">Planeie sua semana</p>
              <div className="h-1 w-full bg-[#1e293b] rounded-full overflow-hidden">
                <div className="h-full bg-[#10b981]" style={{ width: "40%" }}></div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Floating Add Task Button */}
      <button className="fixed bottom-24 right-5 h-14 w-14 rounded-2xl bg-[#10b981] shadow-[0_10px_25px_rgba(16,185,129,0.4)] flex items-center justify-center transition-transform active:scale-90 z-40">
        <Plus className="h-8 w-8 text-white" />
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
