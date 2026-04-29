import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, ThumbsUp, ThumbsDown } from 'lucide-react';

interface TrueFalseProps {
  statement: string;
  isTrue: boolean;       // is the statement correct?
  explanation?: string;
  onAnswer: (correct: boolean) => void;
  disabled?: boolean;
}

const TrueFalse: React.FC<TrueFalseProps> = ({ statement, isTrue, explanation, onAnswer, disabled }) => {
  const [selected, setSelected] = useState<boolean | null>(null);
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);

  useEffect(() => {
    setSelected(null);
    setResult(null);
  }, [statement]);

  const handleSelect = (choice: boolean) => {
    if (disabled || result) return;
    setSelected(choice);
    const isCorrect = choice === isTrue;
    setResult(isCorrect ? 'correct' : 'wrong');
    onAnswer(isCorrect);
  };

  const trueStyle = () => {
    if (selected === true) {
      return result === 'correct'
        ? 'border-[#72EB3A] bg-[#72EB3A]/20 text-[#72EB3A] scale-105'
        : 'border-red-500 bg-red-500/10 text-red-400';
    }
    if (result && isTrue) return 'border-[#72EB3A] bg-[#72EB3A]/10 text-[#72EB3A]';
    return 'border-slate-700 bg-[#1C2210] text-slate-200 hover:border-[#72EB3A]/40 hover:bg-[#72EB3A]/5';
  };

  const falseStyle = () => {
    if (selected === false) {
      return result === 'correct'
        ? 'border-[#72EB3A] bg-[#72EB3A]/20 text-[#72EB3A] scale-105'
        : 'border-red-500 bg-red-500/10 text-red-400';
    }
    if (result && !isTrue) return 'border-[#72EB3A] bg-[#72EB3A]/10 text-[#72EB3A]';
    return 'border-slate-700 bg-[#1C2210] text-slate-200 hover:border-red-400/40 hover:bg-red-500/5';
  };

  return (
    <div className="w-full">
      {/* Statement */}
      <div className="bg-[#1C2210] border border-[#365A08] rounded-2xl p-5 mb-6">
        <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Afirmação</p>
        <p className="text-white font-bold text-lg leading-relaxed">{statement}</p>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          onClick={() => handleSelect(true)}
          disabled={!!result || !!disabled}
          className={`flex flex-col items-center justify-center gap-3 py-6 rounded-2xl border-2 font-bold text-base transition-all active:scale-95 disabled:cursor-not-allowed ${trueStyle()}`}
        >
          <ThumbsUp className="h-8 w-8" />
          Verdadeiro
        </button>
        <button
          onClick={() => handleSelect(false)}
          disabled={!!result || !!disabled}
          className={`flex flex-col items-center justify-center gap-3 py-6 rounded-2xl border-2 font-bold text-base transition-all active:scale-95 disabled:cursor-not-allowed ${falseStyle()}`}
        >
          <ThumbsDown className="h-8 w-8" />
          Falso
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className={`flex items-start gap-3 px-4 py-3 rounded-xl ${result === 'correct' ? 'bg-[#72EB3A]/15' : 'bg-red-500/15'}`}>
          {result === 'correct'
            ? <CheckCircle2 className="h-5 w-5 text-[#72EB3A] shrink-0 mt-0.5" />
            : <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />}
          <div>
            <p className={`text-sm font-bold ${result === 'correct' ? 'text-[#72EB3A]' : 'text-red-400'}`}>
              {result === 'correct' ? 'Correto!' : `Errado — a afirmação é ${isTrue ? 'Verdadeira' : 'Falsa'}.`}
            </p>
            {explanation && (
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{explanation}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrueFalse;
