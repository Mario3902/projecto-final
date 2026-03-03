import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Calendar, Play, Pause, RotateCcw, Coffee } from "lucide-react";
import { useGame } from "@/context/GameContext";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface Task {
  id: number;
  title: string;
  done: boolean;
  date: string;
}

const Tasks = () => {
  const { tasks, addTask, toggleTask, deleteTask, addXP, addStudyTime } = useGame();
  const [newTask, setNewTask] = useState("");

  // Pomodoro State
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      if (!isBreak) {
        // Complete Pomodoro
        addXP(25, "Pomodoro de estudo concluído!");
        addStudyTime(25);
        toast.success("Tempo de estudo finalizado! Hora de uma pausa.", { icon: "☕" });
        setIsBreak(true);
        setTimeLeft(5 * 60);
      } else {
        // Complete Break
        toast("Pausa finalizada! Pronto para voltar ao estudo?", { icon: "🚀" });
        setIsBreak(false);
        setTimeLeft(25 * 60);
        setIsActive(false);
      }
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, isBreak, addXP, addStudyTime]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    setTimeLeft(25 * 60);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const timerProgress = ((isBreak ? 5 * 60 : 25 * 60) - timeLeft) / (isBreak ? 5 * 60 : 25 * 60) * 100;

  const handleAddTask = () => {
    if (!newTask.trim()) return;
    addTask(newTask);
    setNewTask("");
  };



  const groupedByDate = tasks.reduce<Record<string, Task[]>>((acc, task) => {
    (acc[task.date] = acc[task.date] || []).push(task);
    return acc;
  }, {});

  const formatDate = (d: string) => {
    const date = new Date(d + "T12:00:00");
    return date.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Planeador & Pomodoro 📋</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sessão Pomodoro */}
          <Card className="glass-card md:sticky md:top-24 h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isBreak ? <Coffee className="h-5 w-5 text-warm" /> : <Calendar className="h-5 w-5 text-primary" />}
                Pomodoro Timer
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center py-6">
              <div className="relative w-48 h-48 flex items-center justify-center rounded-full border-4 border-muted">
                <div
                  className="absolute inset-0 rounded-full border-4 transition-all duration-1000"
                  style={{
                    borderColor: isBreak ? "hsl(var(--warm))" : "hsl(var(--primary))",
                    clipPath: `polygon(50% 50%, 50% 0%, ${timerProgress >= 25 ? '100% 0%,' : ''} ${timerProgress >= 50 ? '100% 100%,' : ''} ${timerProgress >= 75 ? '0% 100%,' : ''} 0% 0%, 50% 0%)`,
                    // (A simple pure CSS approximation is hard without conic-gradient, so we'll just use a circular Progress bar logic below instead)
                  }}
                />

                {/* Visual Progress ring alternative */}
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle
                    cx="96" cy="96" r="90"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-muted/20"
                  />
                  <circle
                    cx="96" cy="96" r="90"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeDasharray={565.48}
                    strokeDashoffset={565.48 - (timerProgress / 100) * 565.48}
                    strokeLinecap="round"
                    className={`transition-all duration-1000 ${isBreak ? "text-orange-500" : "text-primary"}`}
                  />
                </svg>

                <div className="text-center z-10 flex flex-col items-center">
                  <span className="text-5xl font-bold tabular-nums">
                    {formatTime(timeLeft)}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground mt-2">
                    {isBreak ? "Pausa Curta" : "Foco"}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 mt-8 w-full justify-center">
                <Button
                  onClick={toggleTimer}
                  className={`gap-2 w-32 ${isBreak ? "bg-orange-500 hover:bg-orange-600 text-white" : "gradient-primary text-primary-foreground"}`}
                >
                  {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {isActive ? "Pausar" : "Iniciar"}
                </Button>
                <Button onClick={resetTimer} variant="outline" size="icon">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-6">
                Completa um Pomodoro (25m) para ganhares <span className="text-primary font-bold">+25 XP</span>.
              </p>
            </CardContent>
          </Card>

          {/* Sessão Tarefas */}
          <div className="space-y-6">
            <div className="flex gap-2">
              <Input
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                placeholder="Adicionar nova tarefa..."
                className="h-12 bg-muted/50"
              />
              <Button onClick={handleAddTask} className="h-12 gradient-primary text-primary-foreground shrink-0">
                <Plus className="h-5 w-5" />
              </Button>
            </div>

            {Object.entries(groupedByDate)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([date, dateTasks]) => (
                <Card key={date} className="glass-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {formatDate(date)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {dateTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-3 group p-2 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <button
                          onClick={() => toggleTask(task.id)}
                          className={`h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${task.done ? "bg-primary border-primary text-primary-foreground" : "border-border hover:border-primary"
                            }`}
                        >
                          {task.done && (
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </button>
                        <span className={`flex-1 text-sm ${task.done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                          {task.title}
                        </span>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Tasks;
