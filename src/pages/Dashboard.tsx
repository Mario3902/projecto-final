import { Compass, CheckSquare, Sparkles, MessageCircle, TrendingUp, ChevronRight, Zap, Target, Clock, BookOpen, Bot, View } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Progress } from "@/components/ui/progress";
import { useGame } from "@/context/GameContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { xp, level, tasks, streak, quizzesCompleted, studyHours, performanceData, toggleTask } = useGame();

  const averageAvg = performanceData.length > 0
    ? (performanceData.reduce((acc, curr) => acc + curr.nota, 0) / performanceData.length).toFixed(1)
    : "0.0";

  const nextLevelXP = level * 100;
  const currentLevelXP = xp - ((level - 1) * 100);
  const xpProgress = Math.min((currentLevelXP / 100) * 100, 100);

  const todayTasks = tasks.slice(0, 3);
  const completedCount = todayTasks.filter((t) => t.done).length;
  const taskProgress = todayTasks.length > 0 ? (completedCount / todayTasks.length) * 100 : 0;

  // Get user name from localStorage if available
  const userName = localStorage.getItem("userName") || "Estudante";

  return (
    <DashboardLayout>
      <div className="space-y-4 animate-fade-in">

        {/* ── Greeting ── */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Bem-vindo</p>
            <h1 className="text-2xl font-bold text-foreground">Olá, {userName}! 👋</h1>
          </div>
          <button className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center shadow-lg">
            <span className="text-white font-black text-sm">{userName[0]?.toUpperCase() || "E"}</span>
          </button>
        </div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card p-4 rounded-2xl">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-4 w-4 text-orange-500" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ofensiva</span>
            </div>
            <p className="text-3xl font-black text-foreground">{streak} dias</p>
            <p className="text-xs text-primary mt-0.5">+1 hoje</p>
          </div>
          <div className="glass-card p-4 rounded-2xl">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pontos XP</span>
            </div>
            <p className="text-3xl font-black text-foreground">{xp.toLocaleString()}</p>
            <p className="text-xs text-primary mt-0.5">Nível {level}</p>
          </div>
        </div>

        {/* ── XP Progress ── */}
        <div className="glass-card p-4 rounded-2xl">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold">Progresso Nível {level}</span>
            <span className="text-xs text-muted-foreground">{currentLevelXP} / {nextLevelXP} XP</span>
          </div>
          <Progress value={xpProgress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1.5">Faltam {Math.max(0, 100 - currentLevelXP)} XP para o próximo nível</p>
        </div>

        {/* ── Quiz Diário Banner ── */}
        <button
          onClick={() => navigate("/dashboard/quizzes")}
          className="w-full text-left gradient-primary p-5 rounded-2xl shadow-lg relative overflow-hidden"
        >
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full" />
          <div className="absolute -bottom-6 -right-8 w-32 h-32 bg-white/5 rounded-full" />
          <div className="relative">
            <p className="text-white/80 text-xs font-semibold uppercase tracking-wider mb-1">✨ Desafio Diário</p>
            <h2 className="text-white text-xl font-black mb-1">Quiz Diário</h2>
            <p className="text-white/70 text-sm mb-4">Testa os teus conhecimentos e ganha XP.</p>
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <span className="bg-white/20 text-white text-xs px-2.5 py-1 rounded-full font-semibold">🎯 {quizzesCompleted} feitos</span>
              </div>
              <span className="bg-white text-primary font-bold text-sm px-4 py-2 rounded-xl shadow">Começar</span>
            </div>
          </div>
        </button>

        {/* ── Quick Actions Grid ── */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate("/dashboard/chat")}
            className="glass-card p-4 rounded-2xl text-left hover:scale-[1.02] active:scale-[0.98] transition-transform"
          >
            <div className="w-10 h-10 gradient-cool rounded-xl flex items-center justify-center mb-3">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <p className="font-bold text-sm text-foreground">Falar com Nzila</p>
            <p className="text-xs text-muted-foreground mt-0.5">Orientação por IA</p>
          </button>

          <button
            onClick={() => navigate("/dashboard/performance")}
            className="glass-card p-4 rounded-2xl text-left hover:scale-[1.02] active:scale-[0.98] transition-transform"
          >
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center mb-3">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <p className="font-bold text-sm text-foreground">Meu Progresso</p>
            <p className="text-xs text-muted-foreground mt-0.5">Ver estatísticas</p>
          </button>

          <button
            onClick={() => navigate("/dashboard/sala-ia")}
            className="glass-card p-4 rounded-2xl text-left hover:scale-[1.02] active:scale-[0.98] transition-transform col-span-1"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: "linear-gradient(135deg, hsl(174,72%,40%), hsl(45,93%,58%))" }}>
              <Bot className="h-5 w-5 text-white" />
            </div>
            <p className="font-bold text-sm text-foreground">Sala IA</p>
            <p className="text-xs text-muted-foreground mt-0.5">Professor virtual 3D</p>
          </button>

          <button
            onClick={() => navigate("/dashboard/ar")}
            className="glass-card p-4 rounded-2xl text-left hover:scale-[1.02] active:scale-[0.98] transition-transform col-span-1"
          >
            <div className="w-10 h-10 gradient-cool rounded-xl flex items-center justify-center mb-3">
              <View className="h-5 w-5 text-white" />
            </div>
            <p className="font-bold text-sm text-foreground">Ambientes 3D</p>
            <p className="text-xs text-muted-foreground mt-0.5">Realidade aumentada</p>
          </button>
        </div>

        {/* ── Explorar Carreiras ── */}
        <button
          onClick={() => navigate("/dashboard/vocational")}
          className="w-full glass-card p-4 rounded-2xl flex items-center gap-4 hover:scale-[1.01] active:scale-[0.99] transition-transform text-left"
        >
          <div className="w-12 h-12 gradient-warm rounded-xl flex items-center justify-center shrink-0">
            <Compass className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-foreground">Explorar Carreiras</p>
            <p className="text-xs text-muted-foreground mt-0.5">Descobre caminhos para o teu futuro</p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
        </button>

        {/* ── Performance Académica ── */}
        <div className="glass-card p-4 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-foreground">Performance Académica</h3>
            <span className="text-xs bg-primary/15 text-primary px-2.5 py-1 rounded-full font-bold">
              {Number(averageAvg) >= 85 ? "Excelente" : Number(averageAvg) >= 70 ? "Bom" : "A melhorar"}
            </span>
          </div>
          <Progress value={Number(averageAvg)} className="h-2.5 mb-2" />
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">Média geral das disciplinas</p>
            <p className="text-lg font-black text-foreground">{averageAvg}%</p>
          </div>
        </div>

        {/* ── Tarefas de Hoje ── */}
        <div className="glass-card p-4 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-primary" />
              <h3 className="font-bold text-foreground">Tarefas de Hoje</h3>
            </div>
            <button
              onClick={() => navigate("/dashboard/tasks")}
              className="text-xs text-primary font-semibold"
            >
              Ver tudo
            </button>
          </div>
          {todayTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-3">Sem tarefas criadas.</p>
          ) : (
            <div className="space-y-2">
              {todayTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${task.done ? "bg-primary border-primary text-white" : "border-border"
                      }`}
                  >
                    {task.done && (
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                  <span className={`text-sm flex-1 ${task.done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                    {task.title}
                  </span>
                </div>
              ))}
              <div className="pt-2">
                <Progress value={taskProgress} className="h-1.5" />
                <p className="text-xs text-muted-foreground mt-1">{completedCount} de {todayTasks.length} concluídas</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Quick stats row ── */}
        <div className="grid grid-cols-3 gap-2 pb-2">
          <div className="glass-card p-3 rounded-xl text-center">
            <Clock className="h-4 w-4 text-primary mx-auto mb-1" />
            <p className="text-lg font-black text-foreground">{studyHours}h</p>
            <p className="text-[10px] text-muted-foreground">Estudo</p>
          </div>
          <div className="glass-card p-3 rounded-xl text-center">
            <Sparkles className="h-4 w-4 text-yellow-500 mx-auto mb-1" />
            <p className="text-lg font-black text-foreground">{quizzesCompleted}</p>
            <p className="text-[10px] text-muted-foreground">Quizzes</p>
          </div>
          <div className="glass-card p-3 rounded-xl text-center">
            <BookOpen className="h-4 w-4 text-accent mx-auto mb-1" />
            <p className="text-lg font-black text-foreground">{performanceData.length}</p>
            <p className="text-[10px] text-muted-foreground">Matérias</p>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
