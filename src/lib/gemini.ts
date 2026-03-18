import { api } from "./api";

// All AI calls go through the local proxy server (port 3001)
// Uses dynamic hostname so it works both on PC (localhost) and on mobile over local network (e.g. 192.168.x.x)
const PROXY_URL = `http://${typeof window !== "undefined" ? window.location.hostname : "localhost"}:3001`;

// Build a rich context string from real MySQL backend so Nzila truly knows the student
export const buildStudentContext = async (): Promise<string> => {
    try {
        const [profile, progress, subjects, tasks, performance] = await Promise.all([
            api.getProfile().catch(() => ({})),
            api.getProgress().catch(() => ({})),
            api.getSubjects().catch(() => []),
            api.getTasks().catch(() => []),
            api.getPerformance().catch(() => [])
        ]);

        const lines: string[] = [];

        // Identity
        if (profile?.name) lines.push(`Nome do aluno: ${profile.name}`);
        if (profile?.year) lines.push(`Ano escolar: ${profile.year}`);
        if (profile?.course) lines.push(`Curso: ${profile.course}`);
        if (profile?.goal) lines.push(`Objetivo do aluno: ${profile.goal}`);

        // Gamification / progress
        if (progress?.xp !== undefined) lines.push(`XP acumulado: ${progress.xp} pontos`);
        if (progress?.level !== undefined) lines.push(`Nível actual: ${progress.level}`);
        if (progress?.streak !== undefined) lines.push(`Sequência de dias estudados: ${progress.streak} dias`);
        if (progress?.study_hours !== undefined) lines.push(`Horas de estudo registadas: ${progress.study_hours}h`);

        // Performance by subject (from DB)
        if (performance && performance.grades && performance.grades.length > 0) {
            lines.push("Desempenho por disciplina (pontuação 0–20):");
            performance.grades.forEach((g: any) => {
                const score20 = g.grade;
                const emoji = score20 >= 18 ? "✅" : score20 >= 10 ? "⚠️" : "❌";
                lines.push(`  ${emoji} ${g.subject_name}: ${score20}/20`);
            });
        }

        // Subjects enrolled
        if (subjects && subjects.length > 0) {
            lines.push(`Disciplinas inscritas: ${subjects.map((s: any) => s.name).join(", ")}`);
        }

        // Tasks
        if (tasks && tasks.length > 0) {
            const done = tasks.filter((t: any) => t.is_completed).length;
            lines.push(`Tarefas: ${done} concluídas de ${tasks.length} total`);
        }

        return lines.length > 0
            ? lines.join("\n")
            : "Perfil ainda não configurado — pede ao aluno para completar o perfil.";
    } catch {
        return "Erro ao carregar dados do aluno.";
    }
};

// Utility: General Chat with Nzila (with full student context)
export const chatWithNzila = async (
    message: string,
    history: { role: "user" | "model"; parts: { text: string }[] }[] = []
): Promise<string> => {
    try {
        const studentContext = await buildStudentContext();

        // Sanitize history: Gemini requires first message to be "user" role
        // and all messages must have non-empty text
        const cleanHistory = history.filter(m => m.parts?.[0]?.text?.trim());
        while (cleanHistory.length > 0 && cleanHistory[0].role === "model") {
            cleanHistory.shift();
        }

        const res = await fetch(`${PROXY_URL}/api/nzila-chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message, history: cleanHistory, studentContext }),
        });
        if (!res.ok) {
            const errBody = await res.json().catch(() => ({}));
            throw new Error(errBody.error || `HTTP ${res.status}`);
        }
        const data = await res.json();
        return data.response ?? "Erro ao obter resposta.";
    } catch (error: any) {
        console.error("Gemini Chat Error:", error);
        // Distinguish between network error (proxy down) and API error
        if (error.message?.includes("Failed to fetch") || error.message?.includes("ERR_CONNECTION")) {
            return "⚠️ O servidor proxy não está a correr. Reinicia o proxy com `node proxy.js` antes de usar o chat.";
        }
        return `⚠️ Erro temporário da IA: ${error.message || 'Tenta novamente em alguns segundos.'}`;
    }
};

// Utility: Quiz Generation
export const generateQuiz = async (
    subject: string,
    contents: string,
    numQuestions: number = 5
) => {
    try {
        const res = await fetch(`${PROXY_URL}/api/generate-quiz`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ subject, contents, numQuestions }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return data.questions ?? null;
    } catch (error: any) {
        console.error("Quiz Generation Error:", error);
        return null;
    }
};

// Utility: Generate Vocational Questions
export const generateVocationalQuestions = async (
    userProfile: string,
    numQuestions: number = 5
) => {
    try {
        const res = await fetch(`${PROXY_URL}/api/generate-vocational-questions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userProfile, numQuestions }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return data.questions ?? null;
    } catch (error: any) {
        console.error("Vocational Questions Error:", error);
        return null;
    }
};

// Utility: Vocational Advice
export const getVocationalAdvice = async (
    answers: string[],
    userProfile: string
) => {
    try {
        const res = await fetch(`${PROXY_URL}/api/vocational-advice`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ answers, userProfile }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return data.advice ?? null;
    } catch (error: any) {
        console.error("Vocational Error:", error);
        return null;
    }
};

// Utility: Generate Career Path
export const generateCareerPath = async (
    course: string
) => {
    try {
        const res = await fetch(`${PROXY_URL}/api/generate-career-path`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ course }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return data.steps ?? null;
    } catch (error: any) {
        console.error("Career Path Error:", error);
        return null;
    }
};

// Utility: Generate Personal Stats
export const generatePersonalStats = async (
    profileStats: string
) => {
    try {
        const res = await fetch(`${PROXY_URL}/api/generate-personal-stats`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ profileStats }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return data.stats ?? null;
    } catch (error: any) {
        console.error("Personal Stats Error:", error);
        return null;
    }
};
