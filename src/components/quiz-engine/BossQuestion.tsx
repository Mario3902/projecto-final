import React, { useState, useCallback } from "react";
import { Shield, Zap, X, CheckCircle2, XCircle } from "lucide-react";
import { useGame } from "@/context/GameContext";
import { useNzi } from "@/context/NziContext";

interface BossQ {
  q: string;
  options: string[];
  correct: number;
  explanation?: string;
}

interface BossQuestionProps {
  subjectName: string;
  questions: BossQ[]; // 3 questions expected
  onVictory: () => void;
  onDefeat: () => void;
  onSkip: () => void;
}

const BOSS_HP = 3;

const BossQuestion: React.FC<BossQuestionProps> = ({
  subjectName,
  questions,
  onVictory,
  onDefeat,
  onSkip,
}) => {
  const { addXP, loseHeart } = useGame();
  const { celebrate, encourage } = useNzi();

  const [step, setStep] = useState(0); // 0..2
  const [bossHp, setBossHp] = useState(BOSS_HP);
  const [playerHp, setPlayerHp] = useState(3);
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [phase, setPhase] = useState<"fight" | "victory" | "defeat">("fight");
  const [bossShake, setBossShake] = useState(false);
  const [playerShake, setPlayerShake] = useState(false);

  const q = questions[step];

  const handleSelect = useCallback(
    (idx: number) => {
      if (answered) return;
      setSelected(idx);
      setAnswered(true);

      if (idx === q.correct) {
        // Hit boss
        celebrate("Acerto certeiro! O chefe perdeu vida! ⚔️");
        setBossShake(true);
        setTimeout(() => setBossShake(false), 700);
        const newBossHp = bossHp - 1;
        setBossHp(newBossHp);
        if (newBossHp <= 0) {
          setTimeout(() => {
            addXP(100, `Chefe derrotado em ${subjectName}!`);
            setPhase("victory");
          }, 900);
          return;
        }
        setTimeout(() => {
          setStep((s) => s + 1);
          setAnswered(false);
          setSelected(null);
        }, 1000);
      } else {
        // Boss attacks player
        encourage("O chefe atacou! Não desistas! 🛡️");
        setPlayerShake(true);
        setTimeout(() => setPlayerShake(false), 700);
        loseHeart();
        const newPlayerHp = playerHp - 1;
        setPlayerHp(newPlayerHp);
        if (newPlayerHp <= 0) {
          setTimeout(() => setPhase("defeat"), 900);
          return;
        }
        setTimeout(() => {
          setStep((s) => Math.min(s + 1, questions.length - 1));
          setAnswered(false);
          setSelected(null);
        }, 1000);
      }
    },
    [answered, q, bossHp, playerHp, celebrate, encourage, addXP, loseHeart, subjectName, questions.length]
  );

  // ── Victory ──
  if (phase === "victory") {
    return (
      <div className="fixed inset-0 bg-[#0e1710]/95 z-50 flex flex-col items-center justify-center p-6 animate-fade-in">
        <div className="text-6xl mb-4 animate-bounce">🏆</div>
        <h1 className="text-3xl font-black text-[#4ade80] mb-2">Chefe Derrotado!</h1>
        <p className="text-slate-400 text-sm mb-1">Dominaste {subjectName}!</p>
        <p className="text-[#4ade80] font-black text-lg mb-8">+100 XP Bónus!</p>
        <div className="flex gap-3">
          {Array.from({ length: BOSS_HP }).map((_, i) => (
            <div key={i} className="text-3xl">⭐</div>
          ))}
        </div>
        <button
          onClick={onVictory}
          className="mt-8 px-8 py-4 bg-[#4ade80] text-[#0e1710] font-black rounded-2xl text-lg active:scale-95 transition-transform"
        >
          Continuar →
        </button>
      </div>
    );
  }

  // ── Defeat ──
  if (phase === "defeat") {
    return (
      <div className="fixed inset-0 bg-[#0e1710]/95 z-50 flex flex-col items-center justify-center p-6 animate-fade-in">
        <div className="text-6xl mb-4">💀</div>
        <h1 className="text-2xl font-black text-red-400 mb-2">Foste derrotado!</h1>
        <p className="text-slate-400 text-sm mb-8 text-center">
          O chefe de {subjectName} foi demasiado forte desta vez. Estuda mais e volta!
        </p>
        <div className="flex gap-3">
          <button
            onClick={onDefeat}
            className="px-5 py-3 border border-slate-700 text-slate-300 font-bold rounded-2xl text-sm"
          >
            Sair
          </button>
          <button
            onClick={() => {
              setStep(0);
              setBossHp(BOSS_HP);
              setPlayerHp(3);
              setAnswered(false);
              setSelected(null);
              setPhase("fight");
            }}
            className="px-5 py-3 bg-red-500 text-white font-black rounded-2xl text-sm active:scale-95 transition-transform"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  // ── Fight ──
  const bossHpPct = (bossHp / BOSS_HP) * 100;
  const playerHpPct = (playerHp / 3) * 100;

  return (
    <div className="fixed inset-0 bg-[#0a0f0b] z-50 flex flex-col font-sans overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-red-900/10 via-transparent to-[#4ade80]/5 pointer-events-none" />

      {/* Header */}
      <div className="relative px-5 pt-5 pb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-red-400">⚔️ Batalha Final</span>
          <button onClick={onSkip} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
            <X className="h-4 w-4 text-slate-600" />
          </button>
        </div>
        <p className="text-xs text-slate-500">Questão {step + 1} de {questions.length}</p>
      </div>

      {/* Combatants */}
      <div className="relative px-5 py-2 flex items-end justify-between gap-4">
        {/* Player (Nzi) */}
        <div className={`flex flex-col items-center gap-2 ${playerShake ? "nzi-shake" : ""}`}>
          <div className="text-5xl">🧑🏾‍🎓</div>
          <div className="w-24">
            <div className="flex justify-between items-center mb-0.5">
              <span className="text-[9px] font-black text-[#4ade80] uppercase">Nzi</span>
              <span className="text-[9px] text-[#4ade80]">{playerHp}/3</span>
            </div>
            <div className="h-2 bg-[#1a261d] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#4ade80] rounded-full transition-all duration-500"
                style={{ width: `${playerHpPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* VS */}
        <div className="flex flex-col items-center gap-1">
          <Zap className="h-5 w-5 text-yellow-400" />
          <span className="text-[10px] font-black text-slate-500">VS</span>
        </div>

        {/* Boss */}
        <div className={`flex flex-col items-center gap-2 ${bossShake ? "nzi-shake" : ""}`}>
          <div className="text-5xl">👨‍🏫</div>
          <div className="w-24">
            <div className="flex justify-between items-center mb-0.5">
              <span className="text-[9px] font-black text-red-400 uppercase">Prof. Boss</span>
              <span className="text-[9px] text-red-400">{bossHp}/{BOSS_HP}</span>
            </div>
            <div className="h-2 bg-[#2a1010] rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 rounded-full transition-all duration-500"
                style={{ width: `${bossHpPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* HP damage indicators */}
      <div className="flex items-center justify-center gap-2 px-5 py-1">
        {Array.from({ length: BOSS_HP }).map((_, i) => (
          <Shield
            key={i}
            className={`h-4 w-4 ${i < bossHp ? "text-red-500 fill-red-500" : "text-slate-800"}`}
          />
        ))}
      </div>

      {/* Divider */}
      <div className="mx-5 my-2 h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />

      {/* Question */}
      <div className="flex-1 overflow-y-auto px-5 pb-5">
        <div className="bg-[#141e16] border border-red-500/20 rounded-2xl p-4 mb-4">
          <p className="text-white font-bold text-base leading-relaxed">{q?.q}</p>
        </div>

        <div className="space-y-2.5">
          {q?.options.map((opt, idx) => {
            let style = "border-slate-700 bg-[#0e1710] text-slate-200 hover:border-red-500/30";
            if (answered) {
              if (idx === q.correct) style = "border-[#4ade80] bg-[#4ade80]/10 text-[#4ade80]";
              else if (idx === selected) style = "border-red-500 bg-red-500/10 text-red-400";
              else style = "border-slate-800 bg-[#0e1710] text-slate-600 opacity-40";
            }
            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={answered}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 font-semibold text-sm transition-all active:scale-[0.99] disabled:cursor-not-allowed flex items-center gap-3 ${style}`}
              >
                {answered && idx === q.correct && <CheckCircle2 className="h-4 w-4 shrink-0" />}
                {answered && idx === selected && idx !== q.correct && <XCircle className="h-4 w-4 shrink-0" />}
                {(!answered || (idx !== q.correct && idx !== selected)) && (
                  <span className="font-black opacity-50 text-xs shrink-0">{String.fromCharCode(65 + idx)}</span>
                )}
                {opt}
              </button>
            );
          })}
        </div>

        {answered && q?.explanation && (
          <div className="mt-3 flex items-start gap-2 bg-[#1a261d] border border-[#4ade80]/20 px-4 py-3 rounded-xl animate-fade-in">
            <Zap className="h-4 w-4 text-[#4ade80] shrink-0 mt-0.5" />
            <p className="text-xs text-slate-300 leading-relaxed">{q.explanation}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BossQuestion;
