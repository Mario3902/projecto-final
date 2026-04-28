import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Heart, CheckCircle2, XCircle, ArrowRight, Timer, Zap } from 'lucide-react';
import { useGame } from '@/context/GameContext';
import { useNzi } from '@/context/NziContext';
import WordOrder from './WordOrder';
import FillBlank from './FillBlank';
import TrueFalse from './TrueFalse';
import AudioReader from '@/components/multimedia/AudioReader';
import BossQuestion from './BossQuestion';

interface RawQuestion {
  q: string;
  options: string[];
  correct: number;
  explanation?: string;
}

type QuestionType = 'multiple_choice' | 'true_false' | 'fill_blank' | 'word_order';

interface LessonQuestion extends RawQuestion {
  lessonType: QuestionType;
}

// Pattern: gives varied types across a lesson
const TYPE_PATTERN: QuestionType[] = [
  'multiple_choice', 'true_false', 'fill_blank',
  'multiple_choice', 'word_order', 'multiple_choice',
  'true_false', 'fill_blank', 'multiple_choice', 'word_order',
];

function assignTypes(questions: RawQuestion[]): LessonQuestion[] {
  return questions.map((q, i) => ({
    ...q,
    lessonType: TYPE_PATTERN[i % TYPE_PATTERN.length],
  }));
}

// Extract answer words (correct option split by spaces)
function getCorrectWords(q: RawQuestion): string[] {
  return q.options[q.correct].split(' ').filter(Boolean);
}

// Build fill-blank: hide last important word from question
function buildFillBlank(q: RawQuestion): { sentence: string; answer: string; hints: string[] } {
  const answer = q.options[q.correct];
  const words = answer.split(' ');
  const target = words[words.length - 1];
  const sentence = `${q.q} A resposta é: ${words.slice(0, -1).join(' ')} ___`;
  const hints = [target, ...q.options.filter((_, i) => i !== q.correct).map((o) => o.split(' ').pop() || o)].slice(0, 4);
  return { sentence, answer: target, hints };
}

interface HeartIconProps {
  filled: boolean;
}

const HeartIcon: React.FC<HeartIconProps> = ({ filled }) => (
  <Heart
    className={`h-6 w-6 transition-all ${filled ? 'text-red-500 fill-red-500 scale-110' : 'text-slate-700'}`}
  />
);

interface LessonFlowProps {
  subjectName: string;
  questions: RawQuestion[];
  onFinish: (score: number, total: number) => void;
  onExit: () => void;
}

const MAX_HEARTS = 5;

const LessonFlow: React.FC<LessonFlowProps> = ({ subjectName, questions: rawQuestions, onFinish, onExit }) => {
  const { addXP, hearts, loseHeart, isGodMode } = useGame();
  const { celebrate, encourage } = useNzi();
  const [questions] = useState<LessonQuestion[]>(() => assignTypes(rawQuestions));
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);
  const [timedOut, setTimedOut] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showBoss, setShowBoss] = useState(false);

  const currentQ = questions[current];
  const progress = ((current + (answered ? 1 : 0)) / questions.length) * 100;

  // Timer
  useEffect(() => {
    if (answered || finished || currentQ?.lessonType === 'fill_blank') return;
    setTimeLeft(45);
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          handleTimeout();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [current, answered, finished]);

  const handleTimeout = useCallback(() => {
    if (answered) return;
    setTimedOut(true);
    setAnswered(true);
    setLastCorrect(false);
    loseHeart();
    encourage("Tempo esgotado! Tenta ser mais rápido da próxima vez.");
  }, [answered, loseHeart, encourage]);

  const handleAnswer = useCallback((correct: boolean) => {
    setAnswered(true);
    setLastCorrect(correct);
    if (correct) {
      setScore((s) => s + 1);
      celebrate(correct ? undefined : undefined);
    } else {
      loseHeart();
      encourage();
    }
  }, [celebrate, encourage, loseHeart]);

  // Multiple choice selection
  const [mcSelected, setMcSelected] = useState<number | null>(null);

  const handleMCSelect = (idx: number) => {
    if (answered) return;
    setMcSelected(idx);
    setAnswered(true);
    const correct = idx === currentQ.correct;
    handleAnswer(correct);
  };

  const next = () => {
    if (current + 1 >= questions.length) {
      const finalScore = score;
      setFinished(true);
      if (finalScore / questions.length >= 0.6) {
        setShowConfetti(true);
        addXP(Math.round((finalScore / questions.length) * 50), `Lição de ${subjectName} concluída!`);
      }
      onFinish(finalScore, questions.length);
    } else {
      setCurrent((c) => c + 1);
      setAnswered(false);
      setLastCorrect(null);
      setMcSelected(null);
      setTimedOut(false);
    }
  };

  // Boss questions: 3 hardest from the pool (last 3)
  const bossQuestions = questions.slice(-3).map((q) => ({
    q: q.q,
    options: q.options,
    correct: q.correct,
    explanation: q.explanation,
  }));

  // Hearts = 0 → lesson failed (never in god mode)
  const heartsFailed = !isGodMode && hearts <= 0;

  // ── No Hearts Screen ─────────────────────────────────────────────────────────
  if (heartsFailed && !finished) {
    return (
      <div className="min-h-screen bg-[#0e1710] text-white flex flex-col items-center justify-center p-6">
        <div className="text-7xl mb-4">💔</div>
        <h1 className="text-2xl font-bold mb-2">Ficaste sem vidas!</h1>
        <p className="text-slate-400 text-center mb-8 text-sm">
          As tuas vidas recuperam com o tempo ou podes continuar noutro momento.
        </p>
        <button
          onClick={onExit}
          className="w-full max-w-xs py-3 bg-[#4ade80] text-[#0e1710] font-bold rounded-2xl active:scale-95 transition-transform"
        >
          Voltar aos Quizzes
        </button>
      </div>
    );
  }

  // ── Boss overlay ─────────────────────────────────────────────────────────────
  if (showBoss) {
    return (
      <BossQuestion
        subjectName={subjectName}
        questions={bossQuestions}
        onVictory={() => setShowBoss(false)}
        onDefeat={() => setShowBoss(false)}
        onSkip={() => setShowBoss(false)}
      />
    );
  }

  // ── Finished Screen ──────────────────────────────────────────────────────────
  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    const passed = pct >= 60;
    return (
      <div className="min-h-screen bg-[#0e1710] text-white flex flex-col items-center justify-center p-6 animate-fade-in">
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="absolute animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `-20px`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                  fontSize: '20px',
                }}
              >
                {['🌟', '✨', '🎉', '🏆', '⭐'][Math.floor(Math.random() * 5)]}
              </div>
            ))}
          </div>
        )}

        <div className="text-7xl mb-4">{passed ? '🏆' : '📚'}</div>
        <h1 className="text-3xl font-bold mb-1">{passed ? 'Parabéns!' : 'Boa tentativa!'}</h1>
        <p className="text-slate-400 mb-2 text-sm">
          {score} de {questions.length} corretas — {pct}%
        </p>

        <div className="w-full max-w-xs bg-[#141e16] border border-[#254238] rounded-3xl p-5 mb-6 mt-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Pontuação</span>
            <span className={`text-2xl font-black ${passed ? 'text-[#4ade80]' : 'text-red-400'}`}>{pct}%</span>
          </div>
          <div className="h-3 bg-[#0e1710] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${passed ? 'bg-[#4ade80]' : 'bg-red-500'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          {passed && (
            <p className="text-[#4ade80] text-xs font-bold mt-3 text-center">
              +{Math.round((score / questions.length) * 50)} XP ganhos!
            </p>
          )}
        </div>

        {passed && questions.length >= 3 && (
          <button
            onClick={() => setShowBoss(true)}
            className="w-full max-w-xs mb-3 py-3.5 bg-gradient-to-r from-red-600 to-orange-500 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform boss-pulse"
          >
            ⚔️ Enfrentar o Chefe Bónus!
          </button>
        )}

        <div className="flex gap-3 w-full max-w-xs">
          <button
            onClick={onExit}
            className="flex-1 py-3 border border-slate-700 text-slate-300 font-bold rounded-2xl text-sm hover:border-slate-600 transition-colors"
          >
            Sair
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex-1 py-3 bg-[#4ade80] text-[#0e1710] font-bold rounded-2xl text-sm active:scale-95 transition-transform"
          >
            Repetir
          </button>
        </div>
      </div>
    );
  }

  // ── Active Lesson ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0e1710] text-white flex flex-col font-sans">
      {/* Header */}
      <div className="max-w-md mx-auto w-full px-4 pt-5">
        <div className="flex items-center justify-between mb-4">
          {/* Exit */}
          <button onClick={onExit} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
            <X className="h-5 w-5 text-slate-400" />
          </button>

          {/* Progress bar */}
          <div className="flex-1 mx-4">
            <div className="h-3 bg-[#1a261d] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#4ade80] rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Hearts */}
          <div className="flex gap-1 items-center">
            {isGodMode ? (
              <span className="text-base font-black text-red-500">∞</span>
            ) : (
              Array.from({ length: MAX_HEARTS }).map((_, i) => (
                <HeartIcon key={i} filled={i < hearts} />
              ))
            )}
          </div>
        </div>

        {/* Timer + subject */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{subjectName}</span>
          {currentQ.lessonType !== 'fill_blank' && (
            <div className={`flex items-center gap-1.5 text-sm font-bold ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-slate-400'}`}>
              <Timer className="h-4 w-4" />
              {timeLeft}s
            </div>
          )}
          <span className="text-[10px] font-black text-slate-500">
            {current + 1}/{questions.length}
          </span>
        </div>

        {/* Question type badge */}
        <div className="mb-4">
          <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${
            currentQ.lessonType === 'multiple_choice' ? 'bg-[#4ade80]/10 text-[#4ade80]' :
            currentQ.lessonType === 'true_false' ? 'bg-blue-500/10 text-blue-400' :
            currentQ.lessonType === 'fill_blank' ? 'bg-purple-500/10 text-purple-400' :
            'bg-yellow-500/10 text-yellow-400'
          }`}>
            {currentQ.lessonType === 'multiple_choice' && '🎯 Escolha múltipla'}
            {currentQ.lessonType === 'true_false' && '✅ Verdadeiro ou Falso'}
            {currentQ.lessonType === 'fill_blank' && '✏️ Preencher lacuna'}
            {currentQ.lessonType === 'word_order' && '🔤 Ordenar palavras'}
          </span>
        </div>

        {/* ── Question component ── */}
        <div className="bg-[#141e16] border border-[#254238] rounded-3xl p-5 mb-4">
          {currentQ.lessonType === 'multiple_choice' && (
            <div>
              <div className="flex items-start gap-2 mb-5">
                <p className="text-white font-bold text-lg leading-relaxed flex-1">{currentQ.q}</p>
                <AudioReader text={currentQ.q} size="sm" />
              </div>
              <div className="space-y-3">
                {currentQ.options.map((opt, idx) => {
                  let style = 'border-slate-700 bg-[#0e1710] text-slate-200 hover:border-[#4ade80]/40';
                  if (answered) {
                    if (idx === currentQ.correct) style = 'border-[#4ade80] bg-[#4ade80]/15 text-[#4ade80]';
                    else if (idx === mcSelected) style = 'border-red-500 bg-red-500/10 text-red-400';
                    else style = 'border-slate-800 bg-[#0e1710] text-slate-600 opacity-50';
                  } else if (idx === mcSelected) {
                    style = 'border-[#4ade80]/50 bg-[#4ade80]/10 text-[#4ade80]';
                  }
                  return (
                    <button
                      key={idx}
                      onClick={() => handleMCSelect(idx)}
                      disabled={answered}
                      className={`w-full text-left px-4 py-3.5 rounded-xl border-2 font-semibold text-[15px] transition-all active:scale-[0.99] disabled:cursor-not-allowed ${style}`}
                    >
                      <span className="mr-3 font-black opacity-50">{String.fromCharCode(65 + idx)}.</span>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {currentQ.lessonType === 'true_false' && (
            <TrueFalse
              statement={currentQ.options[currentQ.correct]}
              isTrue={true}
              explanation={currentQ.explanation}
              onAnswer={handleAnswer}
              disabled={answered}
            />
          )}

          {currentQ.lessonType === 'fill_blank' && (() => {
            const { sentence, answer, hints } = buildFillBlank(currentQ);
            return (
              <FillBlank
                sentence={sentence}
                correctAnswer={answer}
                hints={hints}
                onAnswer={handleAnswer}
                disabled={answered}
              />
            );
          })()}

          {currentQ.lessonType === 'word_order' && (
            <WordOrder
              question={currentQ.q}
              correctWords={getCorrectWords(currentQ)}
              onAnswer={handleAnswer}
              disabled={answered}
            />
          )}
        </div>

        {/* Explanation */}
        {answered && currentQ.explanation && (
          <div className="flex items-start gap-3 bg-[#1e2e26] border border-[#4ade80]/20 px-4 py-3 rounded-2xl mb-4 animate-fade-in">
            <Zap className="h-4 w-4 text-[#4ade80] shrink-0 mt-0.5" />
            <p className="text-[13px] text-slate-300 leading-relaxed">{currentQ.explanation}</p>
          </div>
        )}

        {/* Timeout message */}
        {timedOut && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-2xl mb-4 animate-fade-in">
            <XCircle className="h-4 w-4 text-red-500 shrink-0" />
            <p className="text-[13px] text-red-400 font-semibold">Tempo esgotado!</p>
          </div>
        )}

        {/* Correct/wrong banner */}
        {answered && !timedOut && lastCorrect !== null && (
          <div className={`flex items-center gap-2 px-4 py-3 rounded-2xl mb-4 animate-fade-in ${lastCorrect ? 'bg-[#4ade80]/10 border border-[#4ade80]/20' : 'bg-red-500/10 border border-red-500/20'}`}>
            {lastCorrect
              ? <CheckCircle2 className="h-4 w-4 text-[#4ade80] shrink-0" />
              : <XCircle className="h-4 w-4 text-red-500 shrink-0" />}
            <p className={`text-[13px] font-bold ${lastCorrect ? 'text-[#4ade80]' : 'text-red-400'}`}>
              {lastCorrect ? 'Correto! +5 pontos' : `Errado. Resposta: ${currentQ.options[currentQ.correct]}`}
            </p>
          </div>
        )}

        {/* Next button */}
        {answered && (
          <button
            onClick={next}
            className="w-full py-4 bg-[#4ade80] text-[#0e1710] font-black text-base rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-[0_8px_24px_rgba(74,222,128,0.2)]"
          >
            {current + 1 >= questions.length ? 'Ver Resultado' : 'Próxima'} <ArrowRight className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default LessonFlow;
