import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RotateCcw, Brain, CheckCircle2, Loader2, HelpCircle } from "lucide-react";
import { generateFlashcardsForSubject, FlashcardQA, SubjectMaterial } from "@/lib/gemini";
import AudioReader from "@/components/multimedia/AudioReader";

// ── Enrolled subjects & materials ──────────────────────────────────────────────
function getEnrolledSubjects(): { name: string; emoji: string }[] {
  try {
    const cd = JSON.parse(localStorage.getItem("nzila_course_data") || "{}");
    return (cd.subjects || []).map((s: any) => ({ name: s.name, emoji: s.emoji || "📚" }));
  } catch { return []; }
}

function getMaterialsForSubject(subjectName: string): SubjectMaterial[] {
  try {
    const cd = JSON.parse(localStorage.getItem("nzila_course_data") || "{}");
    const sub = (cd.subjects || []).find(
      (s: any) => s.name?.toLowerCase() === subjectName?.toLowerCase()
    );
    return (sub?.materials || []).map((m: any) => ({
      id:      m.id,
      name:    m.name || m.title || "Material",
      content: m.content || "",
      type:    m.type || "other",
    }));
  } catch { return []; }
}

// ── SRS logic ─────────────────────────────────────────────────────────────────
const DIFF_MS = { hard: 1 * 86400000, medium: 3 * 86400000, easy: 7 * 86400000 } as const;

interface CardSRS {
  id: string;
  emoji: string;
  question: string;
  answer: string;
  nextReview: number;
  interval: number;
  reps: number;
}

function qaKey(subject: string) { return `nzila_flashqa_${subject}`; }

function loadCards(subject: string): CardSRS[] {
  try { return JSON.parse(localStorage.getItem(qaKey(subject)) || "[]"); }
  catch { return []; }
}

function saveCards(subject: string, cards: CardSRS[]) {
  localStorage.setItem(qaKey(subject), JSON.stringify(cards));
}

function mergeQA(fresh: FlashcardQA[], existing: CardSRS[]): CardSRS[] {
  const existingIds = new Set(existing.map((c) => c.id));
  const newCards: CardSRS[] = fresh
    .filter((q) => !existingIds.has(q.id))
    .map((q) => ({
      id: q.id,
      emoji: q.emoji,
      question: q.question,
      answer: q.answer,
      nextReview: Date.now(),
      interval: DIFF_MS.medium,
      reps: 0,
    }));
  return [...existing, ...newCards];
}

function dueCards(cards: CardSRS[]) {
  return cards.filter((c) => c.nextReview <= Date.now());
}

// ── Main page ─────────────────────────────────────────────────────────────────
const FlashcardsPage: React.FC = () => {
  const navigate = useNavigate();
  const enrolledSubjects = getEnrolledSubjects();

  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [cards,    setCards]    = useState<CardSRS[]>([]);
  const [due,      setDue]      = useState<CardSRS[]>([]);
  const [cardIdx,  setCardIdx]  = useState(0);
  const [flipped,  setFlipped]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [done,     setDone]     = useState(0);

  const loadSubject = useCallback(async (subject: string) => {
    setLoading(true);
    setFlipped(false);
    setCardIdx(0);
    setDone(0);
    try {
      const materials = getMaterialsForSubject(subject);
      const fresh     = await generateFlashcardsForSubject(subject, materials);
      const existing  = loadCards(subject);
      const merged    = mergeQA(fresh, existing);
      saveCards(subject, merged);
      setCards(merged);
      setDue(dueCards(merged));
    } catch {
      const existing = loadCards(subject);
      setCards(existing);
      setDue(dueCards(existing));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedSubject) loadSubject(selectedSubject);
  }, [selectedSubject, loadSubject]);

  const current = due[cardIdx] ?? null;

  const rate = (rating: "hard" | "medium" | "easy") => {
    if (!current || !selectedSubject) return;
    const interval  = DIFF_MS[rating];
    const updated   = { ...current, nextReview: Date.now() + interval, interval, reps: current.reps + 1 };
    const newCards  = cards.map((c) => (c.id === updated.id ? updated : c));
    saveCards(selectedSubject, newCards);
    setCards(newCards);
    setDone((d) => d + 1);
    const next = cardIdx + 1;
    if (next >= due.length) setDue([]);
    else { setCardIdx(next); setFlipped(false); }
  };

  const totalDue = due.length;
  const allDone  = totalDue === 0 || cardIdx >= totalDue;

  // ── Subject picker ─────────────────────────────────────────────────────────
  if (!selectedSubject) {
    return (
      <div className="min-h-screen bg-[#1B1D24] text-white flex flex-col font-sans pb-10">
        <div className="max-w-md mx-auto w-full px-5 py-6">
          <div className="flex items-center gap-3 mb-8">
            <button onClick={() => navigate("/dashboard")} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
              <ArrowLeft className="h-5 w-5 text-slate-400" />
            </button>
            <div>
              <h1 className="text-xl font-black text-white">Flashcards</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Pergunta · Resposta · Repetição</p>
            </div>
          </div>

          <div className="bg-[#1C2210] border border-[#365A08] rounded-2xl p-4 mb-6 flex items-start gap-3">
            <Brain className="h-5 w-5 text-[#72EB3A] shrink-0 mt-0.5" />
            <p className="text-xs text-slate-400 leading-relaxed">
              Sistema SRS: <span className="text-white font-bold">difícil</span> volta em 1 dia ·{" "}
              <span className="text-white font-bold">médio</span> em 3 dias ·{" "}
              <span className="text-white font-bold">fácil</span> em 7 dias
            </p>
          </div>

          <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4">Escolhe a Matéria</h2>

          {enrolledSubjects.length === 0 ? (
            <div className="bg-[#1C2210] border border-[#365A08] rounded-2xl p-6 text-center">
              <p className="text-slate-400 text-sm mb-3">Ainda não tens disciplinas inscritas.</p>
              <button onClick={() => navigate("/dashboard/subjects")}
                className="px-4 py-2 bg-[#72EB3A] text-[#1B1D24] font-black text-xs rounded-xl">
                Adicionar Disciplinas
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {enrolledSubjects.map((s) => {
                const saved       = loadCards(s.name);
                const dueCount    = dueCards(saved).length;
                const matCount    = getMaterialsForSubject(s.name).filter(m => m.content?.length > 20).length;
                return (
                  <button key={s.name} onClick={() => setSelectedSubject(s.name)}
                    className="bg-[#1C2210] border border-[#365A08] p-4 rounded-2xl text-left hover:border-[#72EB3A]/40 transition-colors">
                    <div className="text-2xl mb-2">{s.emoji}</div>
                    <p className="font-bold text-sm text-white mb-0.5">{s.name}</p>
                    {dueCount > 0
                      ? <p className="text-[10px] font-black text-[#72EB3A]">{dueCount} para rever</p>
                      : saved.length > 0
                        ? <p className="text-[10px] text-slate-600 font-medium">{saved.length} perguntas</p>
                        : <p className="text-[10px] text-slate-600 font-medium">Gerar perguntas</p>}
                    {matCount > 0 && (
                      <p className="text-[10px] text-blue-400 font-bold mt-0.5">📄 {matCount} materiais</p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  const subjectInfo = enrolledSubjects.find((s) => s.name === selectedSubject) ?? { name: selectedSubject!, emoji: "📚" };

  // Loading
  const matCount = selectedSubject ? getMaterialsForSubject(selectedSubject).filter(m => m.content?.length > 20).length : 0;

  if (loading) return (
    <div className="min-h-screen bg-[#1B1D24] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 text-[#72EB3A] animate-spin" />
        <p className="text-sm text-slate-400 font-bold">A gerar perguntas...</p>
        {matCount > 0
          ? <p className="text-[10px] text-blue-400 font-bold">📄 A usar {matCount} materiais teus</p>
          : <p className="text-[10px] text-slate-600">Sem materiais — a usar base de conhecimento</p>}
      </div>
    </div>
  );

  // Session complete
  if (allDone) {
    const nextReviews = cards.filter((c) => c.nextReview > Date.now());
    const soonest     = nextReviews.length > 0 ? Math.min(...nextReviews.map((c) => c.nextReview)) : null;
    const hoursUntil  = soonest ? Math.ceil((soonest - Date.now()) / 3600000) : null;
    return (
      <div className="min-h-screen bg-[#1B1D24] text-white flex flex-col items-center justify-center p-6">
        <CheckCircle2 className="h-16 w-16 text-[#72EB3A] mb-4" />
        <h1 className="text-2xl font-black mb-2">Sessão Completa!</h1>
        {done > 0 && <p className="text-slate-400 text-sm mb-2">{done} {done === 1 ? "pergunta revista" : "perguntas revistas"}</p>}
        {hoursUntil && <p className="text-xs text-slate-500 mb-6">Próxima revisão em ~{hoursUntil}h</p>}
        {totalDue === 0 && done === 0 && <p className="text-slate-500 text-sm mb-6">Sem perguntas para rever agora.</p>}
        <div className="flex gap-3">
          <button onClick={() => setSelectedSubject(null)}
            className="px-5 py-3 border border-slate-700 text-slate-300 font-bold rounded-2xl text-sm">
            Mudar Matéria
          </button>
          <button onClick={() => loadSubject(selectedSubject)}
            className="px-5 py-3 bg-[#72EB3A] text-[#1B1D24] font-black rounded-2xl text-sm flex items-center gap-2">
            <RotateCcw className="h-4 w-4" /> Rever Todas
          </button>
        </div>
      </div>
    );
  }

  const progress = (cardIdx / totalDue) * 100;

  return (
    <div className="min-h-screen bg-[#1B1D24] text-white flex flex-col font-sans">
      <div className="max-w-md mx-auto w-full px-5 py-6 flex flex-col min-h-screen">

        {/* Header + progress */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setSelectedSubject(null)} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
            <ArrowLeft className="h-5 w-5 text-slate-400" />
          </button>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                {subjectInfo.emoji} {subjectInfo.name}
              </span>
              <span className="text-[10px] font-bold text-slate-500">{cardIdx + 1}/{totalDue}</span>
            </div>
            <div className="h-2 bg-[#253510] rounded-full overflow-hidden">
              <div className="h-full bg-[#72EB3A] rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-full relative cursor-pointer select-none" style={{ perspective: "1200px" }}
            onClick={() => setFlipped((f) => !f)}>
            <div style={{
              transition: "transform 0.55s cubic-bezier(0.4,0.2,0.2,1)",
              transformStyle: "preserve-3d",
              transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
              position: "relative",
              minHeight: "280px",
            }}>

              {/* ── FRONT — question ── */}
              <div style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
                className="absolute inset-0 bg-[#1C2210] border border-[#365A08] rounded-3xl flex flex-col items-center justify-center gap-5 p-7">
                {/* Icon */}
                <div className="w-20 h-20 rounded-2xl bg-[#253510] border border-[#365A08] flex items-center justify-center relative">
                  <span className="text-4xl">{current?.emoji ?? "❓"}</span>
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#1B1D24] border border-[#365A08] flex items-center justify-center">
                    <HelpCircle className="h-3.5 w-3.5 text-[#72EB3A]" />
                  </div>
                </div>
                {/* Label */}
                <p className="text-[10px] font-black uppercase tracking-widest text-[#72EB3A]">Pergunta</p>
                {/* Question */}
                <p className="text-lg font-black text-white text-center leading-snug">
                  {current?.question}
                </p>
                {/* Hint */}
                <div className="flex items-center gap-2 text-slate-600">
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span className="text-xs font-bold">Toca para ver a resposta</span>
                </div>
              </div>

              {/* ── BACK — answer ── */}
              <div style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                className="absolute inset-0 bg-[#253510] border border-[#72EB3A]/30 rounded-3xl p-7 flex flex-col items-center justify-center gap-4">
                {/* Icon */}
                <div className="w-10 h-10 rounded-full bg-[#72EB3A]/10 border border-[#72EB3A]/30 flex items-center justify-center">
                  <span className="text-xl">{subjectInfo.emoji}</span>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#72EB3A]">Resposta</p>
                  {/* Repeat question small */}
                  <p className="text-[10px] text-slate-500 italic">{current?.question}</p>
                  {/* Answer */}
                  <p className="text-sm text-slate-200 leading-relaxed">{current?.answer}</p>
                </div>
                {current && <AudioReader text={`${current.question} ${current.answer}`} size="sm" />}
              </div>
            </div>
          </div>

          {/* Rating buttons */}
          {flipped && (
            <div className="w-full mt-5">
              <p className="text-center text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Como foi?</p>
              <div className="grid grid-cols-3 gap-3">
                <button onClick={() => rate("hard")}
                  className="py-3 rounded-2xl border-2 border-red-500/40 bg-red-500/10 text-red-400 font-black text-sm hover:bg-red-500/20 transition-colors">
                  😓 Difícil
                  <div className="text-[9px] font-medium text-red-500/70 mt-0.5">+1 dia</div>
                </button>
                <button onClick={() => rate("medium")}
                  className="py-3 rounded-2xl border-2 border-yellow-500/40 bg-yellow-500/10 text-yellow-400 font-black text-sm hover:bg-yellow-500/20 transition-colors">
                  🤔 Médio
                  <div className="text-[9px] font-medium text-yellow-500/70 mt-0.5">+3 dias</div>
                </button>
                <button onClick={() => rate("easy")}
                  className="py-3 rounded-2xl border-2 border-[#72EB3A]/40 bg-[#72EB3A]/10 text-[#72EB3A] font-black text-sm hover:bg-[#72EB3A]/20 transition-colors">
                  😊 Fácil
                  <div className="text-[9px] font-medium text-[#72EB3A]/70 mt-0.5">+7 dias</div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlashcardsPage;
