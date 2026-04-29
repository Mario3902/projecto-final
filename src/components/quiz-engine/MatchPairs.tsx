import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

interface MatchPairsProps {
  question: string;
  pairs: [string, string][];  // [left, right]
  onAnswer: (correct: boolean) => void;
  disabled?: boolean;
}

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const MatchPairs: React.FC<MatchPairsProps> = ({ question, pairs, onAnswer, disabled }) => {
  const [leftItems, setLeftItems] = useState<{ id: number; text: string }[]>([]);
  const [rightItems, setRightItems] = useState<{ id: number; text: string }[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matched, setMatched] = useState<Map<number, number>>(new Map()); // left.id → right.id
  const [wrongPair, setWrongPair] = useState<[number, number] | null>(null);
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);

  useEffect(() => {
    const left = pairs.map((p, i) => ({ id: i, text: p[0] }));
    const right = shuffle(pairs.map((p, i) => ({ id: i, text: p[1] })));
    setLeftItems(left);
    setRightItems(right);
    setSelectedLeft(null);
    setMatched(new Map());
    setWrongPair(null);
    setResult(null);
  }, [question]);

  const isLeftMatched = (id: number) => matched.has(id);
  const isRightMatched = (id: number) => [...matched.values()].includes(id);

  const handleLeft = (id: number) => {
    if (disabled || result || isLeftMatched(id)) return;
    setSelectedLeft(id === selectedLeft ? null : id);
    setWrongPair(null);
  };

  const handleRight = (rightId: number) => {
    if (disabled || result || isRightMatched(rightId) || selectedLeft === null) return;

    if (rightId === selectedLeft) {
      // Correct match (ids correspond since both map from pairs index)
      const newMatched = new Map(matched);
      newMatched.set(selectedLeft, rightId);
      setMatched(newMatched);
      setSelectedLeft(null);
      setWrongPair(null);

      if (newMatched.size === pairs.length) {
        setResult('correct');
        onAnswer(true);
      }
    } else {
      setWrongPair([selectedLeft, rightId]);
      setSelectedLeft(null);
      setTimeout(() => setWrongPair(null), 800);
    }
  };

  const leftStyle = (id: number) => {
    if (isLeftMatched(id)) return 'border-[#72EB3A] bg-[#72EB3A]/15 text-[#72EB3A]';
    if (selectedLeft === id) return 'border-[#72EB3A] bg-[#72EB3A]/10 text-white scale-105';
    if (wrongPair && wrongPair[0] === id) return 'border-red-500 bg-red-500/10 text-red-400 animate-shake';
    return 'border-slate-700 bg-[#1C2210] text-slate-200 hover:border-[#72EB3A]/40';
  };

  const rightStyle = (id: number) => {
    if (isRightMatched(id)) return 'border-[#72EB3A] bg-[#72EB3A]/15 text-[#72EB3A]';
    if (wrongPair && wrongPair[1] === id) return 'border-red-500 bg-red-500/10 text-red-400 animate-shake';
    if (selectedLeft !== null && !isRightMatched(id)) return 'border-[#60a5fa]/40 bg-[#60a5fa]/5 hover:border-[#60a5fa] text-slate-200';
    return 'border-slate-700 bg-[#1C2210] text-slate-500';
  };

  const handleGiveUp = () => {
    setResult('wrong');
    onAnswer(false);
  };

  return (
    <div className="w-full">
      <p className="text-white font-bold text-lg mb-6 leading-relaxed">{question}</p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="space-y-2">
          {leftItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleLeft(item.id)}
              disabled={!!result}
              className={`w-full text-left px-3 py-3 rounded-xl border-2 text-sm font-semibold transition-all active:scale-95 ${leftStyle(item.id)}`}
            >
              {item.text}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {rightItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleRight(item.id)}
              disabled={!!result || selectedLeft === null}
              className={`w-full text-left px-3 py-3 rounded-xl border-2 text-sm font-semibold transition-all active:scale-95 ${rightStyle(item.id)}`}
            >
              {item.text}
            </button>
          ))}
        </div>
      </div>

      {result && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl ${result === 'correct' ? 'bg-[#72EB3A]/15' : 'bg-red-500/15'}`}>
          {result === 'correct'
            ? <CheckCircle2 className="h-5 w-5 text-[#72EB3A] shrink-0" />
            : <XCircle className="h-5 w-5 text-red-500 shrink-0" />}
          <span className={`text-sm font-bold ${result === 'correct' ? 'text-[#72EB3A]' : 'text-red-400'}`}>
            {result === 'correct' ? 'Todos os pares corretos! 🎉' : 'Nem todos os pares estavam certos.'}
          </span>
        </div>
      )}

      {!result && matched.size < pairs.length && (
        <p className="text-center text-xs text-slate-500 font-medium mt-2">
          Seleciona esquerda depois direita para ligar • {matched.size}/{pairs.length} ligados
        </p>
      )}

      {!result && (
        <button
          onClick={handleGiveUp}
          className="w-full mt-4 py-2.5 rounded-xl border border-slate-700 text-slate-400 text-sm font-medium hover:border-slate-600 transition-colors"
        >
          Desistir desta pergunta
        </button>
      )}
    </div>
  );
};

export default MatchPairs;
