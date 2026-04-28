import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

interface FillBlankProps {
  // sentence with ___ marking the blank
  sentence: string;
  correctAnswer: string;
  hints?: string[];  // optional word bank hints
  onAnswer: (correct: boolean) => void;
  disabled?: boolean;
}

const normalize = (s: string) => s.trim().toLowerCase().replace(/[.,!?;:]/g, '');

const FillBlank: React.FC<FillBlankProps> = ({ sentence, correctAnswer, hints, onAnswer, disabled }) => {
  const [value, setValue] = useState('');
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue('');
    setResult(null);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [sentence]);

  const check = () => {
    if (!value.trim() || result) return;
    const isCorrect = normalize(value) === normalize(correctAnswer);
    setResult(isCorrect ? 'correct' : 'wrong');
    onAnswer(isCorrect);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') check();
  };

  const parts = sentence.split('___');

  return (
    <div className="w-full">
      {/* Sentence with inline blank */}
      <div className="text-white font-bold text-lg mb-6 leading-relaxed flex flex-wrap items-center gap-1">
        {parts[0] && <span>{parts[0]}</span>}
        <span className={`inline-block min-w-[120px] border-b-2 px-2 py-0.5 text-center font-black transition-colors ${
          result === 'correct' ? 'border-[#4ade80] text-[#4ade80]' :
          result === 'wrong' ? 'border-red-500 text-red-400' :
          'border-[#4ade80]/50 text-[#4ade80]'
        }`}>
          {result ? (result === 'correct' ? value : correctAnswer) : (value || '?')}
        </span>
        {parts[1] && <span>{parts[1]}</span>}
      </div>

      {/* Input */}
      {!result && (
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={!!disabled}
          placeholder="Escreve a resposta..."
          className="w-full bg-[#141e16] border-2 border-[#254238] focus:border-[#4ade80] text-white placeholder-slate-500 rounded-2xl px-4 py-3 text-base font-semibold outline-none transition-colors mb-4"
        />
      )}

      {/* Hints word bank */}
      {hints && hints.length > 0 && !result && (
        <div className="flex flex-wrap gap-2 mb-4">
          {hints.map((h, i) => (
            <button
              key={i}
              onClick={() => setValue(h)}
              className="bg-[#1e2e26] border border-[#254238] text-slate-300 px-3 py-1.5 rounded-xl text-sm font-semibold hover:border-[#4ade80]/50 transition-colors"
            >
              {h}
            </button>
          ))}
        </div>
      )}

      {/* Result feedback */}
      {result && (
        <div className={`flex items-center gap-2 mb-4 px-4 py-3 rounded-xl ${result === 'correct' ? 'bg-[#4ade80]/15' : 'bg-red-500/15'}`}>
          {result === 'correct'
            ? <CheckCircle2 className="h-5 w-5 text-[#4ade80] shrink-0" />
            : <XCircle className="h-5 w-5 text-red-500 shrink-0" />}
          <span className={`text-sm font-bold ${result === 'correct' ? 'text-[#4ade80]' : 'text-red-400'}`}>
            {result === 'correct' ? 'Correto!' : `A resposta certa era: "${correctAnswer}"`}
          </span>
        </div>
      )}

      {/* Submit button */}
      {!result && (
        <button
          onClick={check}
          disabled={!value.trim()}
          className="w-full py-3 rounded-2xl font-bold text-sm bg-[#4ade80] text-[#0e1710] hover:bg-[#22c55e] transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Verificar
        </button>
      )}
    </div>
  );
};

export default FillBlank;
