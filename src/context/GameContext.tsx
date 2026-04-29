import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";

const MAX_HEARTS = 5;
const HEART_REGEN_MS = 30 * 60 * 1000; // 30 min per heart

function checkGodMode(): boolean {
  const name = (localStorage.getItem("userName") || "").toLowerCase();
  return name.includes("fernandes") || name.includes("mario") || name.includes("mário");
}

interface Task {
    id: number;
    title: string;
    done: boolean;
    date: string;
}

interface PomodoroSession {
    id: number;
    subject_id?: number;
    subject_name: string;
    topic: string;
    duration_minutes: number;
    xp_earned: number;
    date: string;
    time: string;
}

interface PomodoroDayStat {
    date: string;
    total_minutes: number;
    sessions_count: number;
    total_xp: number;
}

interface GameContextType {
    xp: number;
    level: number;
    streak: number;
    hearts: number;
    cauris: number;
    tasks: Task[];
    quizzesCompleted: number;
    studyHours: number;
    performanceData: { materia: string; nota: number }[];
    pomodoroSessions: PomodoroSession[];
    pomodoroCalendar: PomodoroDayStat[];
    pomodoroStats: { total_sessions: number; total_minutes: number; today_sessions: number; today_minutes: number } | null;

    isGodMode: boolean;
    addXP: (amount: number, reason: string) => Promise<void>;
    loseHeart: () => void;
    restoreHearts: (n?: number) => void;
    gainCauris: (amount: number) => void;
    spendCauris: (amount: number) => boolean;
    addTask: (title: string, date?: string) => Promise<void>;
    toggleTask: (id: number) => Promise<void>;
    deleteTask: (id: number) => Promise<void>;
    completeQuiz: (score: number, total: number) => Promise<void>;
    addStudyTime: (minutes: number) => Promise<void>;
    savePomodoroSession: (subject_id: number | undefined, subject_name: string, topic: string, duration: number, xp: number) => Promise<void>;
    loadPomodoroData: (date?: string) => Promise<void>;
    reloadGameData: () => Promise<void>;
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

    // Hearts & Cauris (persisted to localStorage)
    const [hearts, setHearts] = useState<number>(() => {
        const stored = localStorage.getItem("nzila_hearts");
        if (!stored) return MAX_HEARTS;
        const { count, lastLostAt } = JSON.parse(stored);
        const regenCount = Math.floor((Date.now() - lastLostAt) / HEART_REGEN_MS);
        return Math.min(MAX_HEARTS, count + regenCount);
    });
    const [cauris, setCauris] = useState<number>(() => {
        return Number(localStorage.getItem("nzila_cauris") || "0");
    });

    const [pomodoroSessions, setPomodoroSessions] = useState<PomodoroSession[]>([]);
    const [pomodoroCalendar, setPomodoroCalendar] = useState<PomodoroDayStat[]>([]);
    const [pomodoroStats, setPomodoroStats] = useState<any>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isGodMode, setIsGodMode] = useState<boolean>(() => checkGodMode());

    // Persist hearts
    useEffect(() => {
        localStorage.setItem("nzila_hearts", JSON.stringify({ count: hearts, lastLostAt: Date.now() }));
    }, [hearts]);

    // Persist cauris
    useEffect(() => {
        localStorage.setItem("nzila_cauris", String(cauris));
    }, [cauris]);

    // Heart regen ticker
    useEffect(() => {
        if (hearts >= MAX_HEARTS) return;
        const interval = setInterval(() => {
            setHearts((h) => {
                if (h < MAX_HEARTS) {
                    toast("❤️ Ganhaste uma vida!", { duration: 2000 });
                    return h + 1;
                }
                return h;
            });
        }, HEART_REGEN_MS);
        return () => clearInterval(interval);
    }, [hearts]);

    const loseHeart = () => {
        if (isGodMode) return; // unlimited hearts for this profile
        setHearts((h) => {
            const next = Math.max(0, h - 1);
            if (next === 0) toast.error("Ficaste sem vidas! 💔 Aguarda ou usa Cauris.", { duration: 4000 });
            return next;
        });
    };

    const restoreHearts = (n = MAX_HEARTS) => {
        setHearts(Math.min(MAX_HEARTS, hearts + n));
    };

    const gainCauris = (amount: number) => {
        setCauris((c) => c + amount);
        toast(`+${amount} Cauris 🪙`, { duration: 2000 });
    };

    const spendCauris = (amount: number): boolean => {
        if (cauris < amount) {
            toast.error(`Precisas de ${amount} Cauris. Tens ${cauris}.`);
            return false;
        }
        setCauris((c) => c - amount);
        return true;
    };

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

            // Load Pomodoro data
            await loadPomodoroData();

            // Cache profile for Quizzes/Carreira/ChatAI pages
            let userProfile = null;
            try {
                userProfile = await api.getProfile();
                localStorage.setItem("nzila_profile", JSON.stringify(userProfile));
                localStorage.setItem("userName", userProfile.name || "Estudante");
                setIsGodMode(checkGodMode());
            } catch (e) { console.warn("Profile fetch failed:", e); }

            // Cache subjects for Quizzes "Para Ti" and "Matérias" sections
            try {
                const subjects = await api.getSubjects();
                if (subjects && subjects.length > 0) {
                    const formattedSubjects = subjects.map((s: any) => ({ 
                        id: s.id.toString(), 
                        name: s.name, 
                        emoji: s.emoji || "📚", 
                        materials: s.materials ? s.materials.map((m: any) => ({
                             id: m.id.toString(),
                             name: m.title,
                             type: m.type,
                             content: m.content,
                             addedAt: new Date(m.created_at).toLocaleDateString("pt-PT"),
                             fileName: m.is_link ? m.content : undefined
                        })) : []
                    }));
                    
                    const courseData = { 
                        courseId: "custom", 
                        courseName: userProfile?.course || "O meu Curso", 
                        ano: userProfile?.year || "10º Ano", 
                        subjects: formattedSubjects 
                    };
                    localStorage.setItem("nzila_course_data", JSON.stringify(courseData));
                }
            } catch (e) { console.warn("Subjects fetch failed:", e); }

        } catch (error) {
            console.error("Erro ao carregar dados do utilizador do backend", error);
        } finally {
            setIsLoading(false);
        }
    };

    const reloadGameData = async () => {
        setIsLoading(true);
        await loadData();
    };

    useEffect(() => {
        if (localStorage.getItem("nzila_token")) {
           loadData();
        } else {
           setIsLoading(false);
        }

        // Recarrega o progresso (incluindo streak) quando o utilizador volta ao tab
        const handleVisibility = () => {
            if (!document.hidden && localStorage.getItem("nzila_token")) {
                loadData();
            }
        };
        document.addEventListener("visibilitychange", handleVisibility);
        return () => document.removeEventListener("visibilitychange", handleVisibility);
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
            // Track weekly XP for leagues
            try {
                const { addWeeklyXP } = await import("@/pages/LeaguePage");
                addWeeklyXP(amount);
            } catch {}
            // Track daily XP for daily goals
            try {
                const { recordDailyXP } = await import("@/components/gamification/DailyGoal");
                recordDailyXP(amount);
            } catch {}
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
        // Save to backend and increment counter — XP is handled by LessonFlow directly
        const pct = score / total;
        const earnedXP = Math.max(5, Math.round(pct * 10));
        try {
            await api.saveQuizResult({
                subject: "Geral",
                score,
                total,
                xpEarned: earnedXP,
                isVocational: false
            });
            setQuizzesCompleted((prev) => prev + 1);
        } catch (e) { toast.error("Erro ao guardar resultado."); }
    };

    const addStudyTime = async (minutes: number) => {
        try {
            await api.addStudyTime(minutes);
            setStudyHours((prev) => Number((prev + minutes / 60).toFixed(1)));
        } catch (e) { toast.error("Erro ao guardar estudo."); }
    };

    const loadPomodoroData = async (date?: string) => {
        try {
            const sessions = await api.getPomodoroSessions(date);
            if (!date) setPomodoroSessions(sessions);
            
            const calendar = await api.getPomodoroCalendar();
            setPomodoroCalendar(calendar);
            
            const stats = await api.getPomodoroStats();
            setPomodoroStats(stats);
        } catch (e) { console.error("Erro ao carregar dados pomodoro", e); }
    };

    const savePomodoroSession = async (subject_id: number | undefined, subject_name: string, topic: string, duration: number, xp: number) => {
        try {
            await api.savePomodoroSession({
                subject_id,
                subject_name,
                topic,
                duration_minutes: duration,
                xp_earned: xp
            });
            await loadPomodoroData(); // Refresh calendar and stats
            addStudyTime(duration);
            addXP(xp, "Sessão Pomodoro Concluída!");
            toast.success("Sessão guardada com sucesso! 🍅");
        } catch (e) {
            toast.error("Erro ao guardar sessão.");
        }
    };

    return (
        <GameContext.Provider
            value={{
                xp,
                level,
                streak,
                hearts,
                cauris,
                isGodMode,
                tasks,
                quizzesCompleted,
                studyHours,
                performanceData,
                pomodoroSessions,
                pomodoroCalendar,
                pomodoroStats,
                addXP,
                loseHeart,
                restoreHearts,
                gainCauris,
                spendCauris,
                addTask,
                toggleTask,
                deleteTask,
                completeQuiz,
                addStudyTime,
                savePomodoroSession,
                loadPomodoroData,
                reloadGameData,
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
