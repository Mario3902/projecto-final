import { BarChart3, Compass, CheckSquare, Sparkles, Brain, MessageCircle, TrendingUp, Clock, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";

import { useGame } from "@/context/GameContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { xp, level, tasks, quizzesCompleted, studyHours, performanceData, toggleTask } = useGame();

  const averageAvg = performanceData.length > 0
    ? (performanceData.reduce((acc, curr) => acc + curr.nota, 0) / performanceData.length).toFixed(1)
    : "0.0";

  const nextLevelXP = level * 100;
  const currentLevelXP = xp - ((level - 1) * 100);
  const xpProgress = (currentLevelXP / 100) * 100;

  const quickActions = [
    { title: "Orientação Vocacional", desc: "Descubra sua carreira ideal", icon: Compass, path: "/dashboard/vocational", color: "gradient-warm" },
    { title: "Desempenho", desc: "Veja seu progresso", icon: Brain, path: "/dashboard/performance", color: "gradient-primary" },
    { title: "Tarefas", desc: "Organize seus estudos", icon: CheckSquare, path: "/dashboard/tasks", color: "gradient-cool" },
    { title: "Quizzes", desc: "Teste seus conhecimentos", icon: Sparkles, path: "/dashboard/quizzes", color: "gradient-primary" },
    { title: "Chat IA", desc: "Tire suas dúvidas", icon: MessageCircle, path: "/dashboard/chat", color: "gradient-warm" },
  ];

  const todayTasks = tasks.slice(0, 4);
  const completedTasksCount = todayTasks.filter((t) => t.done).length;
  const taskProgress = todayTasks.length > 0 ? (completedTasksCount / todayTasks.length) * 100 : 0;

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header with Level Progress */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Olá, Estudante! 👋</h1>
            <p className="text-muted-foreground mt-1">Veja seu progresso e continue aprendendo.</p>
          </div>

          <div className="bg-muted/50 p-4 rounded-xl border border-border w-full md:w-72">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-foreground">Nível {level}</span>
              <span className="text-xs text-muted-foreground">{currentLevelXP} / 100 XP</span>
            </div>
            <Progress value={xpProgress} className="h-2 bg-muted-foreground/20" />
            <p className="text-xs text-muted-foreground mt-2 text-right">Faltam {100 - currentLevelXP} XP para o próximo nível</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="glass-card">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="gradient-primary rounded-xl p-3 text-primary-foreground">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Média Geral</p>
                <p className="text-2xl font-bold text-foreground">{averageAvg}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="gradient-warm rounded-xl p-3 text-primary-foreground">
                <Target className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Quizzes Feitos</p>
                <p className="text-2xl font-bold text-foreground">{quizzesCompleted}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="gradient-cool rounded-xl p-3 text-primary-foreground">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Horas de Estudo</p>
                <p className="text-2xl font-bold text-foreground">{studyHours}h</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Performance Chart */}
          <Card className="glass-card lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Desempenho por Matéria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="materia" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="nota" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Today's Tasks */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-primary" />
                Hoje
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {todayTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Não há tarefas criadas.</p>
              ) : (
                todayTasks.map((task) => (
                  <label key={task.id} className="flex items-center gap-3 cursor-pointer group">
                    <button
                      onClick={() => toggleTask(task.id)}
                      className={`h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${task.done
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-border group-hover:border-primary"
                        }`}
                    >
                      {task.done && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                    <span onClick={() => toggleTask(task.id)} className={`text-sm select-none flex-1 ${task.done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                      {task.title}
                    </span>
                  </label>
                ))
              )}
              {todayTasks.length > 0 && (
                <div className="pt-2">
                  <Progress value={taskProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {completedTasksCount} de {todayTasks.length} concluídas
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Acesso Rápido</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                className="glass-card p-5 text-left hover:scale-[1.02] transition-transform group"
              >
                <div className={`${action.color} rounded-xl p-3 text-primary-foreground w-fit mb-3`}>
                  <action.icon className="h-6 w-6" />
                </div>
                <p className="font-semibold text-foreground text-sm">{action.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{action.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
