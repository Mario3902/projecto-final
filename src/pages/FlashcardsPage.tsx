import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RotateCcw, Brain, CheckCircle2, Loader2 } from "lucide-react";
import { generateTopicsForSubject, SkillTopic } from "@/lib/gemini";
import AudioReader from "@/components/multimedia/AudioReader";

const SUBJECTS = [
  { id: "matemática", name: "Matemática", emoji: "🔢" },
  { id: "física", name: "Física", emoji: "⚡" },
  { id: "química", name: "Química", emoji: "🧪" },
  { id: "biologia", name: "Biologia", emoji: "🧬" },
  { id: "história", name: "História", emoji: "📜" },
  { id: "geografia", name: "Geografia", emoji: "🌍" },
  { id: "português", name: "Português", emoji: "📝" },
  { id: "inglês", name: "Inglês", emoji: "🇬🇧" },
];

const DIFF_MS: Record<"hard" | "medium" | "easy", number> = {
  hard:   1 * 24 * 60 * 60 * 1000,
  medium: 3 * 24 * 60 * 60 * 1000,
  easy:   7 * 24 * 60 * 60 * 1000,
};

interface CardSRS {
  id: string;
  front: string;
  back: string;
  nextReview: number; // timestamp
  interval: number;   // ms
  reps: number;
}

function srsKey(subjectId: string) {
  return `nzila_srs_${subjectId}`;
}

function loadCards(subjectId: string): CardSRS[] {
  try {
    return JSON.parse(localStorage.getItem(srsKey(subjectId)) || "[]");
  } catch {
    return [];
  }
}

function saveCards(subjectId: string, cards: CardSRS[]) {
  localStorage.setItem(srsKey(subjectId), JSON.stringify(cards));
}

function topicsToCards(topics: SkillTopic[], existing: CardSRS[]): CardSRS[] {
  const existingIds = new Set(existing.map((c) => c.id));
  const newCards: CardSRS[] = topics
    .filter((t) => !existingIds.has(t.id))
    .map((t) => ({
      id: t.id,
      front: `${t.emoji} ${t.name}`,
      back: t.description,
      nextReview: Date.now(),
      interval: DIFF_MS.medium,
      reps: 0,
    }));
  return [...existing, ...newCards];
}

function dueCards(cards: CardSRS[]): CardSRS[] {
  const now = Date.now();
  return cards.filter((c) => c.nextReview <= now);
}

const FlashcardsPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [cards, setCards] = useState<CardSRS[]>([]);
  const [due, setDue] = useState<CardSRS[]>([]);
  const [cardIdx, setCardIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionDone, setSessionDone] = useState(0);

  const loadSubject = useCallback(async (subjectId: string) => {
    setLoading(true);
    setFlipped(false);
    setCardIdx(0);
    setSessionDone(0);
    try {
      const topics = await generateTopicsForSubject(subjectId);
      const existing = loadCards(subjectId);
      const merged = topicsToCards(topics, existing);
      saveCards(subjectId, merged);
      setCards(merged);
      setDue(dueCards(merged));
    } catch {
      const existing = loadCards(subjectId);
      setCards(existing);
      setDue(dueCards(existing));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedSubject) loadSubject(selectedSubject);
  }, [selectedSubject, loadSubject]);

  const currentCard = due[cardIdx] || null;

  const rate = (rating: "hard" | "medium" | "easy") => {
    if (!currentCard || !selectedSubject) return;
    const interval = DIFF_MS[rating];
    const updated: CardSRS = {
      ...currentCard,
      nextReview: Date.now() + interval,
      interval,
      reps: currentCard.reps + 1,
    };
    const newCards = cards.map((c) => (c.id === updated.id ? updated : c));
    saveCards(selectedSubject, newCards);
    setCards(newCards);

    const nextIdx = cardIdx + 1;
    setSessionDone((d) => d + 1);
    if (nextIdx >= due.length) {
      setDue([]);
    } else {
      setCardIdx(nextIdx);
      setFlipped(false);
    }
  };

  const totalDue = due.length;
  const allDone = totalDue === 0 || cardIdx >= totalDue;

  // ── Subject picker ────────────────────────────────────────────────────────────
  if (!selectedSubject) {
    return (
      <div className="min-h-screen bg-[#0e1710] text-white flex flex-col font-sans pb-10">
        <div className="max-w-md mx-auto w-full px-5 py-6">
          <div className="flex items-center gap-3 mb-8">
            <button onClick={() => navigate("/dashboard")} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
              <ArrowLeft className="h-5 w-5 text-slate-400" />
            </button>
            <div>
              <h1 className="text-xl font-black text-white">Flashcards SRS</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Revisão espaçada</p>
            </div>
          </div>

          <div className="bg-[#141e16] border border-[#254238] rounded-2xl p-4 mb-6 flex items-start gap-3">
            <Brain className="h-5 w-5 text-[#4ade80] shrink-0 mt-0.5" />
            <p className="text-xs text-slate-400 leading-relaxed">
              Sistema SRS: cartas difíceis voltam em <span className="text-white font-bold">1 dia</span>, médias em <span className="text-white font-bold">3 dias</span>, fáceis em <span className="text-white font-bold">7 dias</span>.
            </p>
          </div>

          <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4">Escolhe a Matéria</h2>
          <div className="grid grid-cols-2 gap-3">
            {SUBJECTS.map((s) => {
              const saved = loadCards(s.id);
              const dueCount = dueCards(saved).length;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedSubject(s.id)}
                  className="bg-[#141e16] border border-[#254238] p-4 rounded-2xl text-left hover:border-[#4ade80]/40 transition-colors group"
                >
                  <div className="text-2xl mb-2">{s.emoji}</div>
                  <p className="font-bold text-sm text-white mb-0.5">{s.name}</p>
                  {dueCount > 0 ? (
                    <p className="text-[10px] font-black text-[#4ade80]">{dueCount} para rever</p>
                  ) : (
                    <p className="text-[10px] text-slate-600 font-medium">{saved.length} cartas</p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const subjectInfo = SUBJECTS.find((s) => s.id === selectedSubject)!;

  // ── Loading ───────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0e1710] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-[#4ade80] animate-spin" />
          <p className="text-sm text-slate-400 font-bold">A carregar cartas...</p>
        </div>
      </div>
    );
  }

  // ── All done ─────────────────────────────────────────────────────────────────
  if (allDone) {
    const nextReviews = cards.filter((c) => c.nextReview > Date.now());
    const soonest = nextReviews.length > 0
      ? Math.min(...nextReviews.map((c) => c.nextReview))
      : null;
    const hoursUntil = soonest ? Math.ceil((soonest - Date.now()) / 3600000) : null;

    return (
      <div className="min-h-screen bg-[#0e1710] text-white flex flex-col items-center justify-center p-6">
        <CheckCircle2 className="h-16 w-16 text-[#4ade80] mb-4" />
        <h1 className="text-2xl font-black mb-2">Sessão Completa!</h1>
        {sessionDone > 0 && (
          <p className="text-slate-400 text-sm mb-2">{sessionDone} {sessionDone === 1 ? "carta revista" : "cartas revistas"}</p>
        )}
        {hoursUntil && (
          <p className="text-xs text-slate-500 mb-6">Próxima revisão em ~{hoursUntil}h</p>
        )}
        {totalDue === 0 && sessionDone === 0 && (
          <p className="text-slate-500 text-sm mb-6">Sem cartas para rever agora. Volta mais tarde.</p>
        )}
        <div className="flex gap-3">
          <button
            onClick={() => setSelectedSubject(null)}
            className="px-5 py-3 border border-slate-700 text-slate-300 font-bold rounded-2xl text-sm"
          >
            Mudar Matéria
          </button>
          <button
            onClick={() => loadSubject(selectedSubject)}
            className="px-5 py-3 bg-[#4ade80] text-[#0e1710] font-black rounded-2xl text-sm flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" /> Rever Todas
          </button>
        </div>
      </div>
    );
  }

  // ── Active flashcard ──────────────────────────────────────────────────────────
  const progress = ((cardIdx) / totalDue) * 100;

  return (
    <div className="min-h-screen bg-[#0e1710] text-white flex flex-col font-sans">
      <div className="max-w-md mx-auto w-full px-5 py-6 flex flex-col h-screen">
        {/* Header */}
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
            <div className="h-2 bg-[#1a261d] rounded-full overflow-hidden">
              <div className="h-full bg-[#4ade80] rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div
            className="w-full relative cursor-pointer"
            style={{ perspective: "1000px" }}
            onClick={() => setFlipped((f) => !f)}
          >
            <div
              style={{
                transition: "transform 0.5s",
                transformStyle: "preserve-3d",
                transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
                position: "relative",
                minHeight: "220px",
              }}
            >
              {/* Front */}
              <div
                style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
                className="absolute inset-0 bg-[#141e16] border border-[#254238] rounded-3xl p-6 flex flex-col items-center justify-center"
              >
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">FRENTE</span>
                <p className="text-2xl font-black text-white text-center leading-snug mb-4">{currentCard?.front}</p>
                <div className="flex items-center gap-2 text-slate-600">
                  <RotateCcw className="h-4 w-4" />
                  <span className="text-xs font-bold">Toca para ver a resposta</span>
                </div>
              </div>

              {/* Back */}
              <div
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
                className="absolute inset-0 bg-[#1a261d] border border-[#4ade80]/30 rounded-3xl p-6 flex flex-col items-center justify-center"
              >
                <span className="text-[10px] font-black uppercase tracking-widest text-[#4ade80] mb-4">RESPOSTA</span>
                <p className="text-sm text-slate-200 text-center leading-relaxed mb-4">{currentCard?.back}</p>
                {currentCard && (
                  <AudioReader text={currentCard.back} size="sm" />
                )}
              </div>
            </div>
          </div>

          {/* Rating buttons (only when flipped) */}
          {flipped && (
            <div className="w-full mt-6 animate-fade-in">
              <p className="text-center text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Como foi?</p>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => rate("hard")}
                  className="py-3 rounded-2xl border-2 border-red-500/40 bg-red-500/10 text-red-400 font-black text-sm hover:bg-red-500/20 transition-colors"
                >
                  😓 Difícil
                  <div className="text-[9px] font-medium text-red-500/70 mt-0.5">+1 dia</div>
                </button>
                <button
                  onClick={() => rate("medium")}
                  className="py-3 rounded-2xl border-2 border-yellow-500/40 bg-yellow-500/10 text-yellow-400 font-black text-sm hover:bg-yellow-500/20 transition-colors"
                >
                  🤔 Médio
                  <div className="text-[9px] font-medium text-yellow-500/70 mt-0.5">+3 dias</div>
                </button>
                <button
                  onClick={() => rate("easy")}
                  className="py-3 rounded-2xl border-2 border-[#4ade80]/40 bg-[#4ade80]/10 text-[#4ade80] font-black text-sm hover:bg-[#4ade80]/20 transition-colors"
                >
                  😊 Fácil
                  <div className="text-[9px] font-medium text-[#4ade80]/70 mt-0.5">+7 dias</div>
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
