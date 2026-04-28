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

        // Academic Calendar — full calendar so Nzila knows all activities and exams
        try {
            const calendarEvents = await api.getCalendarEvents();
            if (calendarEvents && calendarEvents.length > 0) {
                lines.push("\nCalendário Académico (Atividades, Provas, Feriados):");
                calendarEvents.forEach((ev: any) => {
                    const d = new Date(ev.event_date.split("T")[0] + "T00:00:00");
                    const dateStr = d.toLocaleDateString("pt-PT");
                    const subj = ev.subject_name ? ` (${ev.subject_name})` : "";
                    lines.push(`  📅 ${dateStr}: ${ev.title}${subj} - ${ev.event_type}`);
                });
            }
        } catch { /* calendar not available yet */ }

        // Weekly Schedule — full schedule
        try {
            const schedule = await api.getSchedule();
            if (schedule && schedule.length > 0) {
                lines.push(`\nHorário Semanal de Aulas:`);
                schedule.forEach((c: any) => {
                    lines.push(`  ⏰ ${c.day_of_week}: ${c.start_time} às ${c.end_time} - ${c.subject_name}`);
                });
            }
        } catch { /* schedule not available yet */ }

        lines.push("\nIMPORTANTE: cruza a informação das aulas de hoje com as provas que se aproximam para sugerir ao aluno o que ele deve estudar no Planner (método Pomodoro).");

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

// Utility: Generate Study Suggestions based on Context
export const generateStudySuggestions = async (contextText: string) => {
    try {
        const res = await fetch(`${PROXY_URL}/api/generate-study-suggestions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ context: contextText }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return data.suggestions ?? [];
    } catch (error: any) {
        console.error("Study Suggestions Error:", error);
        return [];
    }
};

// Utility: OCR Text Extraction from images and PDFs via OCR.space
export const extractTextFromFile = async (
    base64Data: string,
    mimeType: string
): Promise<string> => {
    try {
        const res = await fetch(`${PROXY_URL}/api/ocr-extract`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ base64Data, mimeType }),
        });
        if (!res.ok) {
            const errBody = await res.json().catch(() => ({}));
            throw new Error(errBody.error || `HTTP ${res.status}`);
        }
        const data = await res.json();
        return data.text || "";
    } catch (error: any) {
        console.error("OCR Extract Error:", error);
        if (error.message?.includes("Failed to fetch") || error.message?.includes("ERR_CONNECTION")) {
            throw new Error("Proxy não disponível. Reinicia com `node proxy.js`.");
        }
        throw error;
    }
};

// Utility: Parse Academic Calendar from PDF text
export const parseCalendarFromText = async (
    text: string | null,
    pdfBase64?: string
): Promise<{ title: string; event_date: string; event_type: string; subject_name: string }[] | null> => {
    try {
        const payload = Object.assign({}, text ? { text } : null, pdfBase64 ? { pdfBase64 } : null);
        const res = await fetch(`${PROXY_URL}/api/parse-calendar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return data.events ?? null;
    } catch (error: any) {
        console.error("Parse Calendar Error:", error);
        return null;
    }
};

// Utility: Generate Skill Tree topics for a subject
export interface SkillTopic {
    id: string;
    name: string;
    emoji: string;
    description: string;
    difficulty: 'básico' | 'médio' | 'avançado';
}

// Fallback topic trees for common Angolan secondary school subjects
const FALLBACK_TOPICS: Record<string, SkillTopic[]> = {
    "matemática": [
        { id: "conjuntos", name: "Conjuntos Numéricos", emoji: "🔢", description: "Naturais, inteiros, racionais e reais", difficulty: "básico" },
        { id: "algebra", name: "Álgebra", emoji: "✏️", description: "Expressões e equações algébricas", difficulty: "básico" },
        { id: "funcoes", name: "Funções", emoji: "📈", description: "Funções lineares, quadráticas e exponenciais", difficulty: "médio" },
        { id: "geometria", name: "Geometria", emoji: "📐", description: "Figuras planas e sólidos geométricos", difficulty: "médio" },
        { id: "trigonometria", name: "Trigonometria", emoji: "🔺", description: "Seno, cosseno e tangente", difficulty: "médio" },
        { id: "estatistica", name: "Estatística", emoji: "📊", description: "Média, mediana, moda e desvio padrão", difficulty: "avançado" },
        { id: "calculos", name: "Cálculo Diferencial", emoji: "∫", description: "Derivadas e aplicações", difficulty: "avançado" },
        { id: "matrizes", name: "Matrizes", emoji: "🗂️", description: "Operações com matrizes e determinantes", difficulty: "avançado" },
    ],
    "física": [
        { id: "cinematica", name: "Cinemática", emoji: "🏃", description: "Movimento, velocidade e aceleração", difficulty: "básico" },
        { id: "dinamica", name: "Dinâmica", emoji: "⚡", description: "Leis de Newton e forças", difficulty: "básico" },
        { id: "energia", name: "Energia e Trabalho", emoji: "🔋", description: "Energia cinética, potencial e conservação", difficulty: "médio" },
        { id: "ondas", name: "Ondas", emoji: "〰️", description: "Propriedades e tipos de ondas", difficulty: "médio" },
        { id: "eletricidade", name: "Eletricidade", emoji: "💡", description: "Corrente elétrica, resistência e circuitos", difficulty: "médio" },
        { id: "termodinamica", name: "Termodinâmica", emoji: "🌡️", description: "Calor, temperatura e leis da termodinâmica", difficulty: "avançado" },
        { id: "optica", name: "Óptica", emoji: "🔭", description: "Reflexão, refração e lentes", difficulty: "avançado" },
        { id: "moderna", name: "Física Moderna", emoji: "⚛️", description: "Relatividade e física quântica", difficulty: "avançado" },
    ],
    "química": [
        { id: "tabela", name: "Tabela Periódica", emoji: "🧪", description: "Elementos e suas propriedades", difficulty: "básico" },
        { id: "ligacoes", name: "Ligações Químicas", emoji: "🔗", description: "Iónica, covalente e metálica", difficulty: "básico" },
        { id: "reacoes", name: "Reações Químicas", emoji: "⚗️", description: "Tipos e equações químicas", difficulty: "médio" },
        { id: "solucoes", name: "Soluções", emoji: "🧫", description: "Concentração, solubilidade e pH", difficulty: "médio" },
        { id: "organica", name: "Química Orgânica", emoji: "🌿", description: "Hidrocarbonetos e grupos funcionais", difficulty: "avançado" },
        { id: "termoquimica", name: "Termoquímica", emoji: "🔥", description: "Entalpia, entropia e energia livre", difficulty: "avançado" },
    ],
    "biologia": [
        { id: "celula", name: "Célula", emoji: "🦠", description: "Estrutura e funções celulares", difficulty: "básico" },
        { id: "genetica", name: "Genética", emoji: "🧬", description: "DNA, RNA e hereditariedade", difficulty: "médio" },
        { id: "ecologia", name: "Ecologia", emoji: "🌍", description: "Ecossistemas e cadeias alimentares", difficulty: "básico" },
        { id: "evolucao", name: "Evolução", emoji: "🦕", description: "Darwin e seleção natural", difficulty: "médio" },
        { id: "fisiologia", name: "Fisiologia Humana", emoji: "🫀", description: "Sistemas do corpo humano", difficulty: "médio" },
        { id: "botanica", name: "Botânica", emoji: "🌱", description: "Estrutura e fisiologia vegetal", difficulty: "avançado" },
        { id: "microbiologia", name: "Microbiologia", emoji: "🔬", description: "Vírus, bactérias e fungos", difficulty: "avançado" },
    ],
    "história": [
        { id: "africa_precolonial", name: "África Pré-Colonial", emoji: "🌍", description: "Reinos e sociedades africanas", difficulty: "básico" },
        { id: "colonialismo", name: "Colonialismo em Angola", emoji: "⚓", description: "Período colonial português", difficulty: "básico" },
        { id: "resistencia", name: "Resistência Nacional", emoji: "✊", description: "Movimentos de libertação em Angola", difficulty: "médio" },
        { id: "independencia", name: "Independência de Angola", emoji: "🇦🇴", description: "11 de Novembro de 1975", difficulty: "médio" },
        { id: "guerra_mundial", name: "II Guerra Mundial", emoji: "🕊️", description: "Causas, desenvolvimento e consequências", difficulty: "médio" },
        { id: "guerra_fria", name: "Guerra Fria", emoji: "🌐", description: "EUA vs URSS e o mundo bipolar", difficulty: "avançado" },
    ],
    "geografia": [
        { id: "angola_fisica", name: "Angola Física", emoji: "🗺️", description: "Relevo, clima e hidrografia de Angola", difficulty: "básico" },
        { id: "clima", name: "Climas do Mundo", emoji: "☀️", description: "Tipos de clima e fatores climáticos", difficulty: "básico" },
        { id: "hidrografia", name: "Hidrografia", emoji: "💧", description: "Rios, lagos e recursos hídricos", difficulty: "médio" },
        { id: "populacao", name: "População Mundial", emoji: "👥", description: "Crescimento, distribuição e migrações", difficulty: "médio" },
        { id: "economia", name: "Economia de Angola", emoji: "💰", description: "Petróleo, agricultura e indústria", difficulty: "avançado" },
        { id: "urbanizacao", name: "Urbanização", emoji: "🏙️", description: "Cidades, urbanização e problemas urbanos", difficulty: "avançado" },
    ],
    "português": [
        { id: "gramatica", name: "Gramática", emoji: "📝", description: "Classes de palavras e análise sintática", difficulty: "básico" },
        { id: "ortografia", name: "Ortografia", emoji: "🔤", description: "Regras ortográficas e acentuação", difficulty: "básico" },
        { id: "leitura", name: "Compreensão Leitora", emoji: "📖", description: "Interpretação e análise de textos", difficulty: "médio" },
        { id: "escrita", name: "Produção Escrita", emoji: "✍️", description: "Redação, dissertação e narração", difficulty: "médio" },
        { id: "literatura", name: "Literatura Angolana", emoji: "📚", description: "Autores e obras da literatura angolana", difficulty: "avançado" },
        { id: "comunicacao", name: "Comunicação Oral", emoji: "🎤", description: "Debate, argumentação e retórica", difficulty: "avançado" },
    ],
};

export const generateTopicsForSubject = async (subject: string): Promise<SkillTopic[]> => {
    // Try the fallback first (instant, no API call needed)
    const key = subject.toLowerCase().trim();
    for (const [k, topics] of Object.entries(FALLBACK_TOPICS)) {
        if (key.includes(k) || k.includes(key)) return topics;
    }

    // For unknown subjects, generate via AI
    try {
        const res = await fetch(`${PROXY_URL}/api/generate-topics`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ subject }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.topics && data.topics.length > 0) return data.topics;
    } catch { /* fall through to generic */ }

    // Generic fallback
    return [
        { id: "intro", name: `Introdução a ${subject}`, emoji: "📚", description: `Conceitos básicos de ${subject}`, difficulty: "básico" },
        { id: "basico", name: "Conceitos Fundamentais", emoji: "🔑", description: "Fundamentos essenciais", difficulty: "básico" },
        { id: "intermedio", name: "Tópicos Intermédios", emoji: "📊", description: "Aprofundamento dos conceitos", difficulty: "médio" },
        { id: "avancado", name: "Conteúdos Avançados", emoji: "🚀", description: "Tópicos de maior complexidade", difficulty: "avançado" },
        { id: "pratica", name: "Prática e Exercícios", emoji: "✏️", description: "Aplicação prática dos conhecimentos", difficulty: "médio" },
        { id: "revisao", name: "Revisão Geral", emoji: "🔄", description: "Consolidação de todos os tópicos", difficulty: "básico" },
    ];
};

// Utility: Parse Weekly Schedule from PDF text
export const parseScheduleFromText = async (
    text: string | null,
    pdfBase64?: string
): Promise<{ day_of_week: string; start_time: string; end_time: string; subject_name: string }[] | null> => {
    try {
        const payload = Object.assign({}, text ? { text } : null, pdfBase64 ? { pdfBase64 } : null);
        const res = await fetch(`${PROXY_URL}/api/parse-schedule`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return data.classes ?? null;
    } catch (error: any) {
        console.error("Parse Schedule Error:", error);
        return null;
    }
};
