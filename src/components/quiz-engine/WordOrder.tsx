import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

interface WordOrderProps {
  question: string;
  correctWords: string[];   // correct order
  onAnswer: (correct: boolean) => void;
  disabled?: boolean;
}

// Shuffle helper (Fisher-Yates)
const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const WordOrder: React.FC<WordOrderProps> = ({ question, correctWords, onAnswer, disabled }) => {
  const [bank, setBank] = useState<{ id: number; word: string }[]>([]);
  const [answer, setAnswer] = useState<{ id: number; word: string }[]>([]);
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);

  useEffect(() => {
    const shuffled = shuffle(correctWords.map((w, i) => ({ id: i, word: w })));
    setBank(shuffled);
    setAnswer([]);
    setResult(null);
  }, [question]);

  const addToAnswer = (item: { id: number; word: string }) => {
    if (disabled || result) return;
    setBank((b) => b.filter((w) => w.id !== item.id));
    setAnswer((a) => [...a, item]);
  };

  const removeFromAnswer = (item: { id: number; word: string }) => {
    if (disabled || result) return;
    setAnswer((a) => a.filter((w) => w.id !== item.id));
    setBank((b) => [...b, item]);
  };

  const checkAnswer = () => {
    if (answer.length !== correctWords.length) return;
    const isCorrect = answer.map((w) => w.word).join(' ') === correctWords.join(' ');
    setResult(isCorrect ? 'correct' : 'wrong');
    onAnswer(isCorrect);
  };

  const answerText = answer.map((w) => w.word).join(' ');
  const canCheck = answer.length === correctWords.length && !result;

  return (
    <div className="w-full">
      <p className="text-white font-bold text-lg mb-6 leading-relaxed">{question}</p>

      {/* Answer area */}
      <div
        className={`min-h-[60px] rounded-2xl border-2 p-3 mb-5 flex flex-wrap gap-2 transition-colors ${
          result === 'correct'
            ? 'border-[#4ade80] bg-[#4ade80]/10'
            : result === 'wrong'
            ? 'border-red-500 bg-red-500/10'
            : 'border-[#254238] bg-[#1a261d]'
        }`}
      >
        {answer.length === 0 && (
          <span className="text-slate-500 text-sm self-center pl-1">Toca nas palavras abaixo...</span>
        )}
        {answer.map((item) => (
          <button
            key={item.id}
            onClick={() => removeFromAnswer(item)}
            className="bg-[#0e1710] border border-[#4ade80]/30 text-[#4ade80] px-3 py-1.5 rounded-xl text-sm font-bold transition-transform active:scale-95"
            disabled={!!result}
          >
            {item.word}
          </button>
        ))}
      </div>

      {/* Result feedback */}
      {result && (
        <div className={`flex items-center gap-2 mb-4 px-4 py-3 rounded-xl ${result === 'correct' ? 'bg-[#4ade80]/15' : 'bg-red-500/15'}`}>
          {result === 'correct'
            ? <CheckCircle2 className="h-5 w-5 text-[#4ade80] shrink-0" />
            : <XCircle className="h-5 w-5 text-red-500 shrink-0" />}
          <span className={`text-sm font-bold ${result === 'correct' ? 'text-[#4ade80]' : 'text-red-400'}`}>
            {result === 'correct' ? 'Correto!' : `Errado. Correto: "${correctWords.join(' ')}"`}
          </span>
        </div>
      )}

      {/* Word bank */}
      <div className="flex flex-wrap gap-2 mb-5 min-h-[44px]">
        {bank.map((item) => (
          <button
            key={item.id}
            onClick={() => addToAnswer(item)}
            disabled={!!result}
            className="bg-[#141e16] border border-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-sm font-semibold hover:border-[#4ade80]/40 transition-all active:scale-95 disabled:opacity-50"
          >
            {item.word}
          </button>
        ))}
      </div>

      {/* Check button */}
      {!result && (
        <button
          onClick={checkAnswer}
          disabled={!canCheck}
          className="w-full py-3 rounded-2xl font-bold text-sm transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed bg-[#4ade80] text-[#0e1710] hover:bg-[#22c55e]"
        >
          Verificar
        </button>
      )}
    </div>
  );
};

export default WordOrder;
