import { api } from "./api";

// All AI calls go through the local proxy server (port 3001)
// Uses dynamic hostname so it works both on PC (localhost) and on mobile over local network (e.g. 192.168.x.x)
const PROXY_URL = import.meta.env.VITE_PROXY_URL ||
  `http://${typeof window !== "undefined" ? window.location.hostname : "localhost"}:3001`;

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
                    lines.push(`  [${ev.event_type}] ${ev.title} — ${ev.subject_name || "Geral"} — ${dateStr}`);
                });
            }
        } catch { /* skip if no calendar */ }

        return lines.join("\n");
    } catch {
        return "";
    }
};

export const chatWithNzila = async (
    message: string,
    history: { role: string; content: string }[],
    studentContext?: string
): Promise<string> => nzilaChat(message, history, studentContext ?? "");

export const nzilaChat = async (
    message: string,
    history: { role: string; content: string }[],
    studentContext: string
): Promise<string> => {
    try {
        const MAX_HISTORY = 20;
        const cleanHistory = history.slice(-MAX_HISTORY);
        while (cleanHistory.length > MAX_HISTORY) {
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

// ── Flashcard Q&A generation ────────────────────────────────────────────────────

export interface FlashcardQA {
    id: string;
    emoji: string;
    question: string;
    answer: string;
}

const FALLBACK_QA: Record<string, FlashcardQA[]> = {
    "matemática": [
        { id: "fq_eq1",  emoji: "➕", question: "O que é uma equação do 1º grau?", answer: "É uma equação da forma ax + b = 0 (a ≠ 0). Resolve-se isolando x: x = −b/a." },
        { id: "fq_func", emoji: "📈", question: "O que é uma função linear?", answer: "É uma função f(x) = mx + b cujo gráfico é uma reta com declive m e ordenada na origem b." },
        { id: "fq_pit",  emoji: "📐", question: "Enuncia o Teorema de Pitágoras.", answer: "Num triângulo retângulo, o quadrado da hipotenusa é igual à soma dos quadrados dos catetos: a² = b² + c²." },
        { id: "fq_prog", emoji: "🔢", question: "Qual a diferença entre progressão aritmética e geométrica?", answer: "Na PA, a diferença entre termos consecutivos é constante. Na PG, a razão entre termos consecutivos é constante." },
        { id: "fq_log",  emoji: "📊", question: "O que é um logaritmo?", answer: "log_b(x) = y significa que b^y = x. O logaritmo é o expoente a que se eleva a base b para obter x." },
        { id: "fq_prob", emoji: "🎲", question: "Como se calcula a probabilidade de um evento?", answer: "P(A) = número de casos favoráveis / número de casos possíveis, com 0 ≤ P(A) ≤ 1." },
        { id: "fq_mat",  emoji: "🗂️", question: "O que é o determinante de uma matriz 2×2?", answer: "Para A = [[a,b],[c,d]], det(A) = ad − bc. Indica se a matriz é invertível (det ≠ 0)." },
        { id: "fq_der",  emoji: "∫", question: "O que mede a derivada de uma função?", answer: "A derivada f'(x) mede a taxa de variação (declive) da função nesse ponto. Geometricamente, é o declive da tangente ao gráfico." },
    ],
    "física": [
        { id: "fq_new1", emoji: "⚡", question: "Enuncia a 1ª Lei de Newton.", answer: "Um corpo em repouso ou em movimento retilíneo uniforme permanece assim a menos que uma força resultante não nula atue sobre ele (Princípio da Inércia)." },
        { id: "fq_new2", emoji: "🏃", question: "O que diz a 2ª Lei de Newton?", answer: "A força resultante é igual à massa vezes a aceleração: F = ma. Quanto maior a massa, menor a aceleração para a mesma força." },
        { id: "fq_ener", emoji: "🔋", question: "O que é energia cinética?", answer: "É a energia associada ao movimento: Ec = ½mv². Depende da massa e do quadrado da velocidade." },
        { id: "fq_grav", emoji: "🌍", question: "O que é a Lei da Gravitação Universal?", answer: "Dois corpos atraem-se com uma força F = G·m₁·m₂/r², proporcional às massas e inversamente proporcional ao quadrado da distância." },
        { id: "fq_ohm",  emoji: "💡", question: "O que afirma a Lei de Ohm?", answer: "A tensão (U) é igual ao produto da corrente (I) pela resistência (R): U = R·I. A corrente é diretamente proporcional à tensão." },
        { id: "fq_ond",  emoji: "〰️", question: "Qual a relação entre frequência, comprimento de onda e velocidade?", answer: "v = f·λ. A velocidade da onda é o produto da frequência pelo comprimento de onda." },
    ],
    "química": [
        { id: "fq_tab",  emoji: "🧪", question: "O que representa o número atómico de um elemento?", answer: "O número atómico (Z) é o número de protões no núcleo. Identifica o elemento e determina a sua posição na tabela periódica." },
        { id: "fq_lig",  emoji: "🔗", question: "Qual a diferença entre ligação iónica e covalente?", answer: "Na ligação iónica há transferência de eletrões entre metais e não-metais. Na covalente há partilha de eletrões entre não-metais." },
        { id: "fq_ph",   emoji: "🧫", question: "O que mede o pH de uma solução?", answer: "O pH mede a acidez: pH < 7 é ácido, pH = 7 é neutro, pH > 7 é básico/alcalino. É a escala logarítmica da concentração de H⁺." },
        { id: "fq_reac", emoji: "⚗️", question: "O que é uma reação de oxidação-redução?", answer: "É uma reação onde há transferência de eletrões: o agente redutor oxida-se (perde e⁻) e o oxidante reduz-se (ganha e⁻)." },
        { id: "fq_mol",  emoji: "⚖️", question: "O que é um mol em química?", answer: "Um mol equivale a 6,02×10²³ partículas (Número de Avogadro). É a unidade de quantidade de matéria no SI." },
    ],
    "biologia": [
        { id: "fq_cel",  emoji: "🦠", question: "Qual a diferença entre célula procariótica e eucariótica?", answer: "Procarióticas (bactérias) não têm núcleo definido. Eucarióticas (animais, plantas) têm núcleo com membrana nuclear e organelos membranares." },
        { id: "fq_dna",  emoji: "🧬", question: "O que é o DNA e qual a sua função?", answer: "O DNA (ácido desoxirribonucleico) é a molécula que contém a informação genética, codificada em sequências de nucleótidos, que dirige todas as funções celulares." },
        { id: "fq_foto", emoji: "🌿", question: "O que é a fotossíntese?", answer: "É o processo pelo qual as plantas convertem luz solar, CO₂ e H₂O em glicose e O₂: 6CO₂ + 6H₂O + luz → C₆H₁₂O₆ + 6O₂." },
        { id: "fq_mit",  emoji: "⚡", question: "Qual o papel da mitose?", answer: "A mitose é a divisão celular que produz duas células-filhas geneticamente idênticas à célula-mãe. É responsável pelo crescimento e regeneração dos tecidos." },
        { id: "fq_evo",  emoji: "🦕", question: "O que é a seleção natural segundo Darwin?", answer: "Os organismos com características mais adaptadas ao ambiente sobrevivem e reproduzem-se mais, transmitindo essas características à descendência — motor da evolução." },
    ],
    "história": [
        { id: "fq_ind",  emoji: "🇦🇴", question: "Quando e como Angola obteve a independência?", answer: "Angola proclamou a independência a 11 de novembro de 1975, após a Revolução dos Cravos em Portugal (1974) e acordos de paz com os movimentos de libertação (MPLA, FNLA, UNITA)." },
        { id: "fq_2gm",  emoji: "🕊️", question: "Quais foram as principais causas da II Guerra Mundial?", answer: "O ascenso do nazismo na Alemanha, as políticas expansionistas de Hitler, o fracasso das políticas de apaziguamento e os conflitos económicos e territoriais pós-WWI." },
        { id: "fq_col",  emoji: "⚓", question: "O que foi o colonialismo português em Angola?", answer: "Foi o domínio político e económico exercido por Portugal em Angola desde o século XV até 1975, marcado pela exploração de recursos, trabalho forçado e subordinação cultural." },
        { id: "fq_gf",   emoji: "🌐", question: "O que foi a Guerra Fria?", answer: "Conflito geopolítico (1947–1991) entre os EUA (capitalismo) e a URSS (comunismo), travado por meios ideológicos, tecnológicos e proxy wars, sem confronto direto." },
    ],
    "geografia": [
        { id: "fq_clim", emoji: "☀️", question: "Quais os principais fatores que influenciam o clima?", answer: "Latitude, altitude, distância ao mar, correntes oceânicas, vegetação e relevo são os principais fatores determinantes do clima de uma região." },
        { id: "fq_ang",  emoji: "🗺️", question: "Descreve o relevo de Angola.", answer: "Angola tem uma faixa costeira baixa, uma planalto central elevado (1000–2000m), destacando-se a Serra da Chela e o Morro do Môco (2620m, ponto mais alto)." },
        { id: "fq_pop",  emoji: "👥", question: "O que é a taxa de natalidade?", answer: "É o número de nascimentos por cada 1000 habitantes num ano. Países em desenvolvimento têm geralmente taxas mais elevadas que os países industrializados." },
        { id: "fq_urb",  emoji: "🏙️", question: "O que é o êxodo rural?", answer: "É a migração em massa da população do campo para a cidade, geralmente em busca de emprego e melhores condições de vida, causando o crescimento urbano acelerado." },
    ],
    "português": [
        { id: "fq_gram", emoji: "📝", question: "O que é um advérbio e qual a sua função?", answer: "O advérbio é uma palavra invariável que modifica um verbo, adjetivo ou outro advérbio, indicando circunstâncias de modo, tempo, lugar, negação, entre outras." },
        { id: "fq_tex",  emoji: "📖", question: "Qual a diferença entre texto narrativo e descritivo?", answer: "O narrativo conta uma história com personagens, ações e sequência temporal. O descritivo apresenta características de pessoas, objetos ou lugares sem ação progressiva." },
        { id: "fq_fig",  emoji: "✍️", question: "O que é uma metáfora?", answer: "É uma figura de linguagem que estabelece uma comparação implícita entre dois elementos com características em comum, sem usar 'como' ou 'tal qual'." },
        { id: "fq_lit",  emoji: "📚", question: "Cita um autor da literatura angolana e a sua obra.", answer: "Pepetela é um dos maiores escritores angolanos. 'Mayombe' (1980) é a sua obra mais conhecida, ambientada na luta de libertação de Angola." },
    ],
};

export interface SubjectMaterial {
    id?: string;
    name: string;
    content: string;
    type: 'proof' | 'summary' | 'exercises' | 'other' | string;
}

export const generateFlashcardsForSubject = async (
    subject: string,
    materials: SubjectMaterial[] = []
): Promise<FlashcardQA[]> => {
    // Only use materials that have real text content (not just links/empty)
    const richMaterials = materials.filter(m => m.content && m.content.trim().length > 20);

    // If student has real materials → always call AI with that context (skip fallback)
    if (richMaterials.length > 0) {
        try {
            const res = await fetch(`${PROXY_URL}/api/generate-flashcards`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subject, materials: richMaterials }),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            if (Array.isArray(data.cards) && data.cards.length > 0) return data.cards;
        } catch { /* fall through to subject fallback */ }
    }

    // No materials or API failed → use pre-built subject fallback (instant, no API)
    const key = subject.toLowerCase().trim();
    for (const [k, cards] of Object.entries(FALLBACK_QA)) {
        if (key.includes(k) || k.includes(key)) return cards;
    }

    // Unknown subject with no materials → generic AI generation
    try {
        const res = await fetch(`${PROXY_URL}/api/generate-flashcards`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ subject, materials: [] }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (Array.isArray(data.cards) && data.cards.length > 0) return data.cards;
    } catch { /* fall through */ }

    // Last resort
    return [
        { id: "gq1", emoji: "❓", question: `O que é ${subject}?`, answer: `${subject} é uma área de estudo com conceitos e princípios fundamentais do ensino secundário.` },
        { id: "gq2", emoji: "🔑", question: `Quais são os conceitos fundamentais de ${subject}?`, answer: `Incluem os princípios básicos, terminologia específica e métodos de análise próprios de ${subject}.` },
        { id: "gq3", emoji: "📊", question: `Como se aplica ${subject} no dia-a-dia?`, answer: `${subject} tem diversas aplicações práticas no quotidiano, na ciência e na sociedade.` },
    ];
};

// ── Interactive Story Slides ────────────────────────────────────────────────────

export interface StoryQuizOption {
    text: string;
    correct: boolean;
}

export interface StorySlide {
    id: string;
    type: 'intro' | 'concept' | 'example' | 'quiz' | 'deepdive' | 'summary';
    title: string;
    body: string;
    emoji: string;
    highlight: string;
    nziExpression: 'idle' | 'hint' | 'thinking' | 'excited' | 'waving' | 'celebrate' | 'determined';
    nziSpeech: string;
    imageKeyword: string;
    funFact?: string;
    quizQuestion?: string;
    quizOptions?: StoryQuizOption[];
    keyPoints?: string[];
}

export interface StoryScript {
    subject: string;
    topic: string;
    slides: StorySlide[];
}

export const generateStoryScript = async (
    subject: string,
    topic: string,
    topicDescription?: string
): Promise<StoryScript> => {
    try {
        const res = await fetch(`${PROXY_URL}/api/generate-story-script`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ subject, topic, topicDescription }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.script?.slides?.length > 0) return data.script;
    } catch (error) {
        console.error("Story Script Error:", error);
    }

    // Fallback
    return {
        subject,
        topic,
        slides: [
            {
                id: "intro", type: "intro",
                title: topic, body: `Bem-vindo à lição de ${topic}! O Nzi vai guiar-te nesta aventura de aprendizagem.`,
                emoji: "🎯", highlight: topic,
                nziExpression: "waving", nziSpeech: "Olá! Vamos aprender juntos!",
                imageKeyword: `${topic} education concept`,
                funFact: `${topic} é um dos tópicos mais importantes de ${subject}.`,
            },
            {
                id: "concept", type: "concept",
                title: `O que é ${topic}?`,
                body: topicDescription || `${topic} é um conceito fundamental de ${subject} que todos os alunos devem dominar.`,
                emoji: "💡", highlight: topic,
                nziExpression: "hint", nziSpeech: "Esta definição é essencial!",
                imageKeyword: `${subject} education diagram`,
            },
            {
                id: "example", type: "example",
                title: "Vês isto no dia-a-dia!",
                body: `No quotidiano encontramos ${topic} em muitas situações práticas: na tecnologia, na natureza e no desporto.`,
                emoji: "🔍", highlight: topic,
                nziExpression: "excited", nziSpeech: "Olha este exemplo incrível!",
                imageKeyword: `${topic} real world practical`,
            },
            {
                id: "quiz", type: "quiz",
                title: "Testa o teu conhecimento!",
                body: "", emoji: "🧠", highlight: topic,
                nziExpression: "determined", nziSpeech: "Consegues responder?",
                imageKeyword: "",
                quizQuestion: `O que é ${topic}?`,
                quizOptions: [
                    { text: `Um conceito fundamental de ${subject}`, correct: true },
                    { text: "Uma regra gramatical", correct: false },
                    { text: "Um tipo de animal", correct: false },
                ],
            },
            {
                id: "deepdive", type: "deepdive",
                title: "Como funciona?",
                body: `O funcionamento de ${topic} envolve vários processos interligados que se complementam para produzir o resultado final.`,
                emoji: "⚙️", highlight: "processo",
                nziExpression: "thinking", nziSpeech: "Vamos analisar em detalhe...",
                imageKeyword: `${topic} process mechanism`,
            },
            {
                id: "summary", type: "summary",
                title: "Resumo da lição",
                body: "", emoji: "🏆", highlight: topic,
                nziExpression: "celebrate", nziSpeech: "Fantástico! Aprendeste muito!",
                imageKeyword: "",
                keyPoints: [
                    `${topic} é um conceito central de ${subject}`,
                    `Aplicações práticas de ${topic} no mundo real`,
                    "Dominar este tema abre portas para o teu futuro",
                ],
            },
        ],
    };
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
