// All AI calls go through the local proxy server (port 3001)
// Uses dynamic hostname so it works both on PC (localhost) and on mobile over local network (e.g. 192.168.x.x)
const PROXY_URL = `http://${typeof window !== "undefined" ? window.location.hostname : "localhost"}:3001`;

// Build a rich context string from localStorage so Nzila truly knows the student
export const buildStudentContext = (): string => {
    try {
        const profile = JSON.parse(localStorage.getItem("nzila_profile") || "{}");
        const courseData = JSON.parse(localStorage.getItem("nzila_course_data") || "{}");
        const gameRaw = localStorage.getItem("nzila_game_state");
        const game = gameRaw ? JSON.parse(gameRaw) : {};

        const lines: string[] = [];

        // Identity
        if (profile.name) lines.push(`Nome do aluno: ${profile.name}`);
        if (courseData.ano || profile.year) lines.push(`Ano escolar: ${courseData.ano || profile.year}`);
        if (courseData.courseName || profile.course) lines.push(`Curso: ${courseData.courseName || profile.course}`);
        if (profile.goal) lines.push(`Objetivo do aluno: ${profile.goal}`);

        // Gamification / progress
        if (game.xp !== undefined) lines.push(`XP acumulado: ${game.xp} pontos`);
        if (game.level !== undefined) lines.push(`Nível actual: ${game.level}`);
        if (game.streak !== undefined) lines.push(`Sequência de dias estudados: ${game.streak} dias`);
        if (game.quizzesCompleted !== undefined) lines.push(`Quizzes completados: ${game.quizzesCompleted}`);
        if (game.studyHours !== undefined) lines.push(`Horas de estudo registadas: ${game.studyHours}h`);

        // Performance by subject (Angolan 0-20 scale)
        if (game.subjectPerformance) {
            const perf = game.subjectPerformance as Record<string, number>;
            const entries = Object.entries(perf);
            if (entries.length > 0) {
                lines.push("Desempenho por disciplina (pontuação 0–20):");
                entries.forEach(([subj, score]) => {
                    // Assuming stored score might be 0-100 if generated from quizzes, so we convert it to 0-20 scale:
                    let score20 = score;
                    if (score > 20) {
                        score20 = Math.round((score / 100) * 20);
                    }
                    const emoji = score20 >= 18 ? "✅" : score20 >= 10 ? "⚠️" : "❌";
                    lines.push(`  ${emoji} ${subj}: ${score20}/20`);
                });
            }
        }

        // Subjects enrolled
        if (courseData.subjects?.length > 0) {
            lines.push(`Disciplinas inscritas: ${courseData.subjects.map((s: any) => s.name).join(", ")}`);
        }

        // Tasks
        if (game.tasks?.length > 0) {
            const done = game.tasks.filter((t: any) => t.completed).length;
            lines.push(`Tarefas: ${done} concluídas de ${game.tasks.length} total`);
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
        const studentContext = buildStudentContext();
        const res = await fetch(`${PROXY_URL}/api/nzila-chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message, history, studentContext }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return data.response ?? "Erro ao obter resposta.";
    } catch (error: any) {
        console.error("Gemini Chat Error:", error);
        return "⚠️ O servidor proxy não está a correr. Reinicia o proxy com `node proxy.js` antes de usar o chat.";
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
