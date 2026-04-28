import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Lock, Crown, Star, ChevronRight, Sparkles } from "lucide-react";
import { generateTopicsForSubject, SkillTopic } from "@/lib/gemini";
import { useNzi } from "@/context/NziContext";

// ─── Crown persistence ────────────────────────────────────────────────────────

function getCrownsKey(subjectId: string) {
  return `nzila_crowns_${subjectId.replace(/\s+/g, "_").toLowerCase()}`;
}

function loadCrowns(subjectId: string): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(getCrownsKey(subjectId)) || "{}");
  } catch { return {}; }
}

function saveCrowns(subjectId: string, data: Record<string, number>) {
  localStorage.setItem(getCrownsKey(subjectId), JSON.stringify(data));
}

export function grantCrowns(subjectId: string, topicId: string, score: number, total: number) {
  const data = loadCrowns(subjectId);
  const pct = score / total;
  const earned = pct >= 0.95 ? 5 : pct >= 0.8 ? 4 : pct >= 0.6 ? 3 : pct >= 0.4 ? 2 : 1;
  data[topicId] = Math.max(data[topicId] || 0, earned);
  saveCrowns(subjectId, data);
}

// ─── Crown display ────────────────────────────────────────────────────────────

const CrownRow: React.FC<{ count: number }> = ({ count }) => (
  <div className="flex gap-0.5 justify-center mt-1">
    {Array.from({ length: 5 }).map((_, i) => (
      <Crown
        key={i}
        className={`h-3 w-3 ${i < count ? "text-yellow-400 fill-yellow-400" : "text-slate-700"}`}
      />
    ))}
  </div>
);

// ─── Difficulty color ─────────────────────────────────────────────────────────

const difficultyColor = (d: string) => {
  if (d === "básico") return "text-[#4ade80]";
  if (d === "médio") return "text-yellow-400";
  return "text-red-400";
};

// ─── Node status helpers ──────────────────────────────────────────────────────

type NodeStatus = "locked" | "available" | "in_progress" | "mastered";

function getStatus(idx: number, crowns: Record<string, number>, topicId: string): NodeStatus {
  const c = crowns[topicId] || 0;
  if (c === 5) return "mastered";
  if (c > 0) return "in_progress";
  if (idx === 0) return "available";
  // Unlock if previous has at least 1 crown
  return "available"; // All unlocked for better UX (Duolingo locks per section, not per node)
}

// ─── Subject Picker ───────────────────────────────────────────────────────────

const QUICK_SUBJECTS = [
  { name: "Matemática", emoji: "➗" },
  { name: "Física", emoji: "⚡" },
  { name: "Química", emoji: "🧪" },
  { name: "Biologia", emoji: "🧬" },
  { name: "História", emoji: "📜" },
  { name: "Geografia", emoji: "🌍" },
  { name: "Português", emoji: "📝" },
];

// ─── Main Component ───────────────────────────────────────────────────────────

const SkillTreePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showMessage } = useNzi();

  const urlSubject = searchParams.get("subject") || "";
  const [subject, setSubject] = useState(urlSubject);
  const [topics, setTopics] = useState<SkillTopic[]>([]);
  const [loading, setLoading] = useState(false);
  const [crowns, setCrowns] = useState<Record<string, number>>({});

  // Load subjects from localStorage (user's enrolled subjects)
  const enrolledSubjects: { id: string; name: string; emoji: string }[] = (() => {
    try {
      const cd = JSON.parse(localStorage.getItem("nzila_course_data") || "{}");
      return cd.subjects?.map((s: any) => ({ id: s.id, name: s.name, emoji: s.emoji || "📚" })) || [];
    } catch { return []; }
  })();

  const allSubjectOptions = [
    ...enrolledSubjects.map((s) => ({ name: s.name, emoji: s.emoji })),
    ...QUICK_SUBJECTS.filter((q) => !enrolledSubjects.some((e) => e.name.toLowerCase() === q.name.toLowerCase())),
  ];

  useEffect(() => {
    if (subject) loadTopics(subject);
  }, []);

  const loadTopics = async (sub: string) => {
    setSubject(sub);
    setLoading(true);
    const result = await generateTopicsForSubject(sub);
    setTopics(result);
    setCrowns(loadCrowns(sub));
    setLoading(false);
    showMessage(`Árvore de ${sub} carregada! Começa pelo primeiro nó. 🌳`, "hint", 4000);
  };

  const startLesson = (topic: SkillTopic) => {
    navigate(
      `/dashboard/lesson?subject=${encodeURIComponent(subject)}&context=${encodeURIComponent(topic.description + ". Tópico: " + topic.name)}&n=8&topic=${encodeURIComponent(topic.id)}`
    );
  };

  // ── Subject picker ──
  if (!subject) {
    return (
      <div className="min-h-screen bg-[#0e1710] text-white flex flex-col font-sans pb-24">
        <div className="max-w-md mx-auto w-full px-5 py-6">
          <div className="flex items-center gap-3 mb-8 mt-2">
            <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
              <ArrowLeft className="h-5 w-5 text-slate-400" />
            </button>
            <div>
              <p className="text-[#4ade80] text-[10px] font-black tracking-widest uppercase">Nzila</p>
              <h1 className="text-2xl font-bold">Árvore de Habilidades</h1>
            </div>
          </div>

          <p className="text-slate-400 text-sm mb-6">Escolhe uma disciplina para ver o teu percurso de aprendizagem.</p>

          <div className="grid grid-cols-2 gap-3">
            {allSubjectOptions.map((sub) => (
              <button
                key={sub.name}
                onClick={() => loadTopics(sub.name)}
                className="bg-[#141e16] border border-[#254238] rounded-2xl p-4 text-left hover:border-[#4ade80]/50 transition-colors group active:scale-95"
              >
                <div className="text-3xl mb-2">{sub.emoji}</div>
                <p className="font-bold text-sm text-white group-hover:text-[#4ade80] transition-colors">{sub.name}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Ver tópicos →</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0e1710] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-[#4ade80] border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 font-medium">A carregar árvore de {subject}...</p>
        </div>
      </div>
    );
  }

  // Calculate mastered and available counts
  const masteredCount = topics.filter((t) => (crowns[t.id] || 0) === 5).length;
  const inProgressCount = topics.filter((t) => (crowns[t.id] || 0) > 0 && (crowns[t.id] || 0) < 5).length;
  const totalCrowns = topics.reduce((acc, t) => acc + (crowns[t.id] || 0), 0);
  const maxCrowns = topics.length * 5;

  // ── Skill tree ──
  return (
    <div className="min-h-screen bg-[#0e1710] text-white flex flex-col font-sans pb-24">
      <div className="max-w-md mx-auto w-full px-5 py-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 mt-2">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
            <ArrowLeft className="h-5 w-5 text-slate-400" />
          </button>
          <div className="flex-1">
            <p className="text-[#4ade80] text-[10px] font-black tracking-widest uppercase">Árvore de Habilidades</p>
            <h1 className="text-2xl font-bold">{subject}</h1>
          </div>
          <button
            onClick={() => { setSubject(""); setTopics([]); }}
            className="text-xs text-[#4ade80] bg-[#4ade80]/10 px-3 py-1.5 rounded-xl font-bold"
          >
            Trocar
          </button>
        </div>

        {/* Progress summary */}
        <div className="bg-[#141e16] border border-[#254238] rounded-2xl p-4 mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Progresso Geral</span>
            <span className="text-[#4ade80] font-black text-sm">{totalCrowns}/{maxCrowns} 👑</span>
          </div>
          <div className="h-2.5 bg-[#0e1710] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#4ade80] to-[#22c55e] rounded-full transition-all duration-700"
              style={{ width: `${maxCrowns > 0 ? (totalCrowns / maxCrowns) * 100 : 0}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-500">
            <span>✅ {masteredCount} dominados</span>
            <span>🔄 {inProgressCount} em progresso</span>
            <span>🔒 {topics.length - masteredCount - inProgressCount} por fazer</span>
          </div>
        </div>

        {/* Path / Tree */}
        <div className="relative">
          {topics.map((topic, idx) => {
            const c = crowns[topic.id] || 0;
            const status = getStatus(idx, crowns, topic.id);
            const isMastered = c === 5;
            const isLeft = idx % 2 === 0;

            return (
              <div key={topic.id} className="relative">
                {/* Connector line */}
                {idx > 0 && (
                  <div
                    className={`absolute w-0.5 h-8 left-1/2 -translate-x-1/2 -top-8 ${c > 0 ? "bg-[#4ade80]/50" : "bg-slate-800"}`}
                  />
                )}

                {/* Node row */}
                <div
                  className={`flex items-center gap-4 mb-10 ${isLeft ? "flex-row" : "flex-row-reverse"}`}
                >
                  {/* Difficulty label side */}
                  <div className={`flex-1 ${isLeft ? "text-right" : "text-left"}`}>
                    <span className={`text-[10px] font-black uppercase tracking-wider ${difficultyColor(topic.difficulty)}`}>
                      {topic.difficulty}
                    </span>
                    <p className={`text-xs text-slate-500 mt-0.5 ${isLeft ? "ml-auto" : ""} max-w-[100px] ${isLeft ? "text-right" : "text-left"}`}>
                      {topic.description.split(" ").slice(0, 4).join(" ")}...
                    </p>
                  </div>

                  {/* Node circle */}
                  <button
                    onClick={() => startLesson(topic)}
                    className={`relative flex flex-col items-center shrink-0 group transition-transform active:scale-95 ${status === "locked" ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={status === "locked"}
                  >
                    {/* Outer glow ring for available */}
                    {status === "available" && c === 0 && (
                      <div className="absolute inset-0 rounded-full bg-[#4ade80]/20 animate-pulse scale-150" />
                    )}

                    <div
                      className={`w-[72px] h-[72px] rounded-full flex flex-col items-center justify-center border-4 relative z-10 shadow-lg transition-all
                        ${isMastered ? "border-yellow-400 bg-gradient-to-br from-yellow-500/20 to-yellow-900/20 shadow-yellow-500/20" :
                          c > 0 ? "border-[#4ade80] bg-[#1a261d] shadow-[#4ade80]/20" :
                          status === "available" ? "border-[#4ade80]/60 bg-[#141e16] group-hover:border-[#4ade80]" :
                          "border-slate-700 bg-[#141e16]"
                        }`}
                    >
                      {status === "locked"
                        ? <Lock className="h-7 w-7 text-slate-600" />
                        : <span className="text-2xl">{topic.emoji}</span>
                      }
                    </div>
                    <CrownRow count={c} />
                  </button>

                  {/* Topic name side */}
                  <div className={`flex-1 ${isLeft ? "text-left" : "text-right"}`}>
                    <p className={`text-sm font-bold leading-tight ${isMastered ? "text-yellow-400" : c > 0 ? "text-[#4ade80]" : "text-white"}`}>
                      {topic.name}
                    </p>
                    {isMastered && (
                      <span className="text-[10px] text-yellow-500 font-black">DOMINADO ✨</span>
                    )}
                    {c > 0 && !isMastered && (
                      <span className="text-[10px] text-[#4ade80]/70 font-bold">{c}/5 coroas</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* End node */}
          <div className="flex flex-col items-center mt-4 mb-8">
            <div className="w-0.5 h-8 bg-slate-800 mb-2" />
            <div className={`w-20 h-20 rounded-full border-4 flex flex-col items-center justify-center
              ${masteredCount === topics.length
                ? "border-yellow-400 bg-yellow-500/10 shadow-[0_0_30px_rgba(234,179,8,0.3)]"
                : "border-slate-700 bg-[#141e16] opacity-50"
              }`}
            >
              <Crown className={`h-8 w-8 ${masteredCount === topics.length ? "text-yellow-400 fill-yellow-400" : "text-slate-600"}`} />
              <span className="text-[9px] font-black mt-0.5 text-slate-500">FIM</span>
            </div>
            {masteredCount === topics.length && (
              <p className="text-yellow-400 font-black text-sm mt-2 animate-bounce">🏆 Disciplina Dominada!</p>
            )}
          </div>
        </div>

      </div>

      {/* Fixed bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#0e1710]/95 backdrop-blur-xl border-t border-[#1a261d] px-6 py-4 z-50">
        <button
          onClick={() => navigate("/dashboard/quizzes")}
          className="w-full py-3 bg-[#1a261d] border border-[#4ade80]/20 text-[#4ade80] font-bold rounded-2xl text-sm flex items-center justify-center gap-2"
        >
          <Sparkles className="h-4 w-4" /> Ver Quizzes
        </button>
      </div>
    </div>
  );
};

export default SkillTreePage;
