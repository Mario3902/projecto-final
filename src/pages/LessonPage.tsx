import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { generateQuiz } from "@/lib/gemini";
import LessonFlow from "@/components/quiz-engine/LessonFlow";
import { useGame } from "@/context/GameContext";

interface RawQuestion {
  q: string;
  options: string[];
  correct: number;
  explanation?: string;
}

const LessonPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { completeQuiz, gainCauris } = useGame();

  const subject = searchParams.get("subject") || "Geral";
  const context = searchParams.get("context") || `Questões sobre ${subject}`;
  const numStr = searchParams.get("n") || "8";
  const numQuestions = Math.min(12, Math.max(4, parseInt(numStr)));

  const [questions, setQuestions] = useState<RawQuestion[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startLesson = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateQuiz(subject, context, numQuestions);
      if (result && result.length > 0) {
        setQuestions(result);
      } else {
        setError("A IA não conseguiu gerar a lição. Tenta novamente.");
      }
    } catch {
      setError("Erro de ligação. Verifica a tua conexão.");
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async (score: number, total: number) => {
    await completeQuiz(score, total);
    const earnedCauris = Math.round((score / total) * 20);
    if (earnedCauris > 0) gainCauris(earnedCauris);
  };

  const handleExit = () => navigate(-1);

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-[#1B1D24] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center px-6">
          <div className="w-20 h-20 bg-[#253510] border border-[#72EB3A]/30 rounded-2xl flex items-center justify-center animate-pulse">
            <Sparkles className="h-10 w-10 text-[#72EB3A]" />
          </div>
          <h2 className="text-2xl font-bold">A preparar a lição...</h2>
          <p className="text-slate-400 text-sm">Gerando {numQuestions} perguntas sobre {subject}</p>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div className="min-h-screen bg-[#1B1D24] text-white flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-2">Erro ao gerar lição</h2>
          <p className="text-slate-400 text-sm mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-[#72EB3A] text-[#1B1D24] font-bold rounded-2xl"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  // ── Active lesson ──
  if (questions) {
    return (
      <LessonFlow
        subjectName={subject}
        questions={questions}
        onFinish={handleFinish}
        onExit={handleExit}
      />
    );
  }

  // ── Start screen ──
  return (
    <div className="min-h-screen bg-[#1B1D24] text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-sm w-full text-center">
        <div className="w-24 h-24 bg-[#253510] border-2 border-[#72EB3A]/40 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(74,222,128,0.15)]">
          <span className="text-4xl">🎯</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">Lição: {subject}</h1>
        <p className="text-slate-400 text-sm mb-2">
          {numQuestions} perguntas • Tipos variados • Vidas ❤️
        </p>
        <p className="text-slate-500 text-xs mb-8">
          Responde correctamente para ganhar Cauris 🪙
        </p>

        <div className="grid grid-cols-3 gap-3 mb-8">
          {['Múltipla escolha', 'V ou F', 'Ordenar'].map((t) => (
            <div key={t} className="bg-[#1C2210] border border-[#365A08] rounded-2xl px-3 py-3 text-center">
              <p className="text-[11px] font-bold text-[#72EB3A]">{t}</p>
            </div>
          ))}
        </div>

        <button
          onClick={startLesson}
          className="w-full py-4 bg-[#72EB3A] text-[#1B1D24] font-black text-lg rounded-2xl active:scale-95 transition-transform shadow-[0_10px_30px_rgba(74,222,128,0.2)]"
        >
          Iniciar Lição
        </button>
        <button
          onClick={handleExit}
          className="w-full mt-3 py-3 border border-slate-700 text-slate-400 font-medium rounded-2xl text-sm"
        >
          Voltar
        </button>
      </div>
    </div>
  );
};

export default LessonPage;
