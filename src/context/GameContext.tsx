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
    { id: 1, title: "Revisar capítulo 5 de Matemática", done: true, date: new Date().toISOString().split("T")[0] },
    { id: 2, title: "Fazer exercícios de Física", done: false, date: new Date().toISOString().split("T")[0] },
    { id: 3, title: "Ler texto de Português", done: false, date: new Date().toISOString().split("T")[0] },
    { id: 4, title: "Estudar fórmulas de Química", done: false, date: new Date().toISOString().split("T")[0] },
];

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [xp, setXp] = useState(120);
    const [level, setLevel] = useState(1);
    const [streak, setStreak] = useState(3);
    const [tasks, setTasks] = useState<Task[]>(defaultTasks);
    const [quizzesCompleted, setQuizzesCompleted] = useState(24);
    const [studyHours, setStudyHours] = useState(42);
    const [performanceData, setPerformanceData] = useState(defaultPerformance);

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
