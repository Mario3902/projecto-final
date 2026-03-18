import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface Task {
    id: number;
    title: string;
    done: boolean;
    date: string;
}

interface GameContextType {
    xp: number;
    level: number;
    streak: number;
    tasks: Task[];
    quizzesCompleted: number;
    studyHours: number;
    performanceData: { materia: string; nota: number }[];
    addXP: (amount: number, reason: string) => Promise<void>;
    addTask: (title: string, date?: string) => Promise<void>;
    toggleTask: (id: number) => Promise<void>;
    deleteTask: (id: number) => Promise<void>;
    completeQuiz: (score: number, total: number) => Promise<void>;
    addStudyTime: (minutes: number) => Promise<void>;
    isLoading: boolean;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [xp, setXp] = useState<number>(0);
    const [level, setLevel] = useState<number>(1);
    const [streak, setStreak] = useState<number>(0);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [quizzesCompleted, setQuizzesCompleted] = useState<number>(0);
    const [studyHours, setStudyHours] = useState<number>(0);
    const [performanceData, setPerformanceData] = useState<{materia: string; nota: number}[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = async () => {
        try {
            // First load progress
            const prog = await api.getProgress();
            setXp(prog.xp);
            setLevel(prog.level);
            setStreak(prog.streak);
            setQuizzesCompleted(prog.quizzes_completed);
            setStudyHours(prog.study_hours);

            // Load tasks
            const t = await api.getTasks();
            setTasks(t);

            // Load performance (simplistic adaptation for Dashboard avg)
            const perf = await api.getPerformance();
            const pData = perf.grades.map((g: any) => ({ materia: g.subject_name.substring(0,4), nota: g.grade }));
            setPerformanceData(pData);

            // Cache profile for Quizzes/Carreira/ChatAI pages
            try {
                const profile = await api.getProfile();
                localStorage.setItem("nzila_profile", JSON.stringify(profile));
                localStorage.setItem("userName", profile.name || "Estudante");
            } catch (e) { console.warn("Profile fetch failed:", e); }

            // Cache subjects for Quizzes "Para Ti" and "Matérias" sections
            try {
                const subjects = await api.getSubjects();
                if (subjects && subjects.length > 0) {
                    const courseData = { subjects: subjects.map((s: any) => ({ id: s.id, name: s.name, emoji: s.emoji || "📚", materials: [] })) };
                    localStorage.setItem("nzila_course_data", JSON.stringify(courseData));
                }
            } catch (e) { console.warn("Subjects fetch failed:", e); }

        } catch (error) {
            console.error("Erro ao carregar dados do utilizador do backend", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Simple heuristic: if we have a token, load real data
        if (localStorage.getItem("nzila_token")) {
           loadData();
        } else {
           // Wait for user to log in/register
           setIsLoading(false);
        }
    }, []);

    // Calcula o nível com base no XP (100 XP por nível)
    useEffect(() => {
        const newLevel = Math.floor(xp / 100) + 1;
        if (newLevel > level) {
            setLevel(newLevel);
            toast.success(`Subiste para o Nível ${newLevel}! 🎉`, {
                description: "Continua o excelente trabalho!",
                duration: 5000,
            });
        }
    }, [xp, level]);

    const addXP = async (amount: number, reason: string) => {
        try {
            const result = await api.addXP(amount);
            setXp(result.xp);
            setLevel(result.level);
            toast(`+${amount} XP: ${reason}`, { icon: "⭐" });
        } catch (e) { console.error(e); }
    };

    const addTask = async (title: string, date?: string) => {
        try {
            const task = await api.createTask(title, date);
            setTasks((prev) => [task, ...prev]);
        } catch (e) { toast.error("Erro ao guardar tarefa."); }
    };

    const toggleTask = async (id: number) => {
        try {
            const res = await api.toggleTask(id);
            if (res.done) {
                 setTimeout(() => addXP(10, "Tarefa concluída!"), 300);
            }
            setTasks((prev) =>
                prev.map((task) => task.id === id ? { ...task, done: res.done } : task)
            );
        } catch (e) { toast.error("Erro ao atualizar tarefa."); }
    };

    const deleteTask = async (id: number) => {
        try {
            await api.deleteTask(id);
            setTasks((prev) => prev.filter((t) => t.id !== id));
        } catch (e) { toast.error("Erro ao apagar tarefa."); }
    };

    const completeQuiz = async (score: number, total: number) => {
        // Save to backend
        const pct = score / total;
        const earnedXP = Math.max(5, Math.round(pct * 10)); // Mínimo 5, máximo 10
        try {
            await api.saveQuizResult({
                subject: "Geral", 
                score, 
                total, 
                xpEarned: earnedXP,
                isVocational: false
            });
            setQuizzesCompleted((prev) => prev + 1);
            addXP(earnedXP, `Quiz finalizado com ${Math.round(pct * 100)}% de acerto!`);
        } catch (e) { toast.error("Erro ao guardar resultado."); }
    };

    const addStudyTime = async (minutes: number) => {
        try {
            await api.addStudyTime(minutes);
            setStudyHours((prev) => Number((prev + minutes / 60).toFixed(1)));
        } catch (e) { toast.error("Erro ao guardar estudo."); }
    };

    return (
        <GameContext.Provider
            value={{
                xp,
                level,
                streak,
                tasks,
                quizzesCompleted,
                studyHours,
                performanceData,
                addXP,
                addTask,
                toggleTask,
                deleteTask,
                completeQuiz,
                addStudyTime,
                isLoading
            }}
        >
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => {
    const context = useContext(GameContext);
    if (context === undefined) {
        throw new Error("useGame must be used within a GameProvider");
    }
    return context;
};
