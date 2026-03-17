import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

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
    addXP: (amount: number, reason: string) => void;
    addTask: (title: string, date?: string) => void;
    toggleTask: (id: number) => void;
    deleteTask: (id: number) => void;
    completeQuiz: (score: number, total: number) => void;
    addStudyTime: (minutes: number) => void;
}

const defaultPerformance = [
    { materia: "Mat", nota: 85 },
    { materia: "Port", nota: 72 },
    { materia: "Fís", nota: 68 },
    { materia: "Quím", nota: 78 },
    { materia: "Bio", nota: 90 },
    { materia: "His", nota: 82 },
];

const defaultTasks = [
    { id: 1, title: "Revisar capítulo 5", done: true, date: new Date().toISOString().split("T")[0] },
    { id: 2, title: "Fazer exercícios", done: false, date: new Date().toISOString().split("T")[0] },
];

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Helper to get initial state from localStorage or fallback to default
    const getInitialState = <T,>(key: string, defaultValue: T): T => {
        const stored = localStorage.getItem(key);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch {
                return defaultValue;
            }
        }
        return defaultValue;
    };

    const [xp, setXp] = useState<number>(() => getInitialState("nzila_xp", 120));
    const [level, setLevel] = useState<number>(() => getInitialState("nzila_level", 1));
    const [streak, setStreak] = useState<number>(() => getInitialState("nzila_streak", 3));
    const [tasks, setTasks] = useState<Task[]>(() => getInitialState("nzila_tasks", defaultTasks));
    const [quizzesCompleted, setQuizzesCompleted] = useState<number>(() => getInitialState("nzila_quizzes_completed", 0));
    const [studyHours, setStudyHours] = useState<number>(() => getInitialState("nzila_study_hours", 0));
    const [performanceData, setPerformanceData] = useState(() => getInitialState("nzila_performance", defaultPerformance));

    // Persist changes to localStorage
    useEffect(() => { localStorage.setItem("nzila_xp", JSON.stringify(xp)); }, [xp]);
    useEffect(() => { localStorage.setItem("nzila_level", JSON.stringify(level)); }, [level]);
    useEffect(() => { localStorage.setItem("nzila_streak", JSON.stringify(streak)); }, [streak]);
    useEffect(() => { localStorage.setItem("nzila_tasks", JSON.stringify(tasks)); }, [tasks]);
    useEffect(() => { localStorage.setItem("nzila_quizzes_completed", JSON.stringify(quizzesCompleted)); }, [quizzesCompleted]);
    useEffect(() => { localStorage.setItem("nzila_study_hours", JSON.stringify(studyHours)); }, [studyHours]);
    useEffect(() => { localStorage.setItem("nzila_performance", JSON.stringify(performanceData)); }, [performanceData]);

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

    const addXP = (amount: number, reason: string) => {
        setXp((prev) => prev + amount);
        toast(`+${amount} XP: ${reason}`, {
            icon: "⭐",
        });
    };

    const addTask = (title: string, date?: string) => {
        setTasks((prev) => [
            ...prev,
            {
                id: Date.now(),
                title,
                done: false,
                date: date || new Date().toISOString().split("T")[0],
            },
        ]);
    };

    const toggleTask = (id: number) => {
        setTasks((prev) =>
            prev.map((task) => {
                if (task.id === id) {
                    const isCompleting = !task.done;
                    if (isCompleting) {
                        // Recompensar XP ao concluir tarefa
                        setTimeout(() => addXP(10, "Tarefa concluída!"), 300);
                    }
                    return { ...task, done: isCompleting };
                }
                return task;
            })
        );
    };

    const deleteTask = (id: number) => {
        setTasks((prev) => prev.filter((t) => t.id !== id));
    };

    const completeQuiz = (score: number, total: number) => {
        setQuizzesCompleted((prev) => prev + 1);

        // XP baseado na pontuação: max 10 XP
        const pct = score / total;
        const earnedXP = Math.max(5, Math.round(pct * 10)); // Mínimo 5, máximo 10

        addXP(earnedXP, `Quiz finalizado com ${Math.round(pct * 100)}% de acerto!`);
    };

    const addStudyTime = (minutes: number) => {
        // Converter minutos para horas e adicionar
        setStudyHours((prev) => Number((prev + minutes / 60).toFixed(1)));
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
