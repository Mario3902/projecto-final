import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Calendar } from "lucide-react";

interface Task {
  id: number;
  title: string;
  done: boolean;
  date: string;
}

const initialTasks: Task[] = [
  { id: 1, title: "Revisar capítulo 5 de Matemática", done: true, date: "2026-02-22" },
  { id: 2, title: "Fazer exercícios de Física", done: false, date: "2026-02-22" },
  { id: 3, title: "Ler texto de Português", done: false, date: "2026-02-23" },
  { id: 4, title: "Estudar fórmulas de Química", done: false, date: "2026-02-23" },
  { id: 5, title: "Preparar apresentação de História", done: false, date: "2026-02-24" },
];

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [newTask, setNewTask] = useState("");

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks((prev) => [
      ...prev,
      { id: Date.now(), title: newTask.trim(), done: false, date: new Date().toISOString().split("T")[0] },
    ]);
    setNewTask("");
  };

  const toggleTask = (id: number) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const deleteTask = (id: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
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
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Tarefas & Agenda 📋</h1>

        <div className="flex gap-2">
          <Input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            placeholder="Adicionar nova tarefa..."
            className="h-12 bg-muted/50"
          />
          <Button onClick={addTask} className="h-12 gradient-primary text-primary-foreground shrink-0">
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
                      className={`h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                        task.done ? "bg-primary border-primary text-primary-foreground" : "border-border hover:border-primary"
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
    </DashboardLayout>
  );
};

export default Tasks;
