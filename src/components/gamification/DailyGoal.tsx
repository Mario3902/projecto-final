import React, { useState, useEffect } from "react";
import { Zap, CheckCircle2, ChevronRight } from "lucide-react";
import { useGame } from "@/context/GameContext";
import { useNavigate } from "react-router-dom";

const GOAL_LEVELS = [
  { label: "Casual", xp: 10, emoji: "🐢", color: "text-slate-400" },
  { label: "Normal", xp: 30, emoji: "🏃", color: "text-[#72EB3A]" },
  { label: "Intenso", xp: 80, emoji: "🚀", color: "text-yellow-400" },
];

const TODAY_KEY = "nzila_daily_xp";
const GOAL_KEY = "nzila_daily_goal";

function getTodayKey(): string {
  return new Date().toISOString().split("T")[0];
}

function loadTodayXP(): number {
  try {
    const stored = JSON.parse(localStorage.getItem(TODAY_KEY) || "{}");
    if (stored.date !== getTodayKey()) return 0;
    return stored.xp || 0;
  } catch { return 0; }
}

export function recordDailyXP(amount: number) {
  const today = getTodayKey();
  let current = 0;
  try {
    const stored = JSON.parse(localStorage.getItem(TODAY_KEY) || "{}");
    if (stored.date === today) current = stored.xp || 0;
  } catch {}
  localStorage.setItem(TODAY_KEY, JSON.stringify({ date: today, xp: current + amount }));
}

const DailyGoal: React.FC = () => {
  const navigate = useNavigate();
  const { gainCauris } = useGame();

  const [goalIdx, setGoalIdx] = useState<number>(() =>
    Number(localStorage.getItem(GOAL_KEY) || "1")
  );
  const [todayXP, setTodayXP] = useState<number>(loadTodayXP);
  const [rewardGiven, setRewardGiven] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const goal = GOAL_LEVELS[goalIdx];
  const progress = Math.min(100, (todayXP / goal.xp) * 100);
  const completed = todayXP >= goal.xp;

  // Refresh every 30s
  useEffect(() => {
    const interval = setInterval(() => setTodayXP(loadTodayXP()), 30000);
    return () => clearInterval(interval);
  }, []);

  // Give reward on first completion
  useEffect(() => {
    if (completed && !rewardGiven) {
      const rewardKey = `nzila_goal_reward_${getTodayKey()}`;
      if (!localStorage.getItem(rewardKey)) {
        gainCauris(goal.xp);
        localStorage.setItem(rewardKey, "1");
        setRewardGiven(true);
      }
    }
  }, [completed, rewardGiven, goal.xp, gainCauris]);

  const changeGoal = (idx: number) => {
    setGoalIdx(idx);
    localStorage.setItem(GOAL_KEY, String(idx));
    setShowPicker(false);
  };

  return (
    <div className="bg-[#1C2210] border border-[#365A08] rounded-2xl p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{goal.emoji}</span>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Meta Diária</p>
            <p className={`text-sm font-bold ${goal.color}`}>{goal.label} — {goal.xp} XP</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {completed && <CheckCircle2 className="h-5 w-5 text-[#72EB3A]" />}
          <button
            onClick={() => setShowPicker((v) => !v)}
            className="text-[10px] font-bold text-slate-500 hover:text-slate-300 transition-colors border border-slate-700 rounded-lg px-2 py-1"
          >
            Mudar
          </button>
        </div>
      </div>

      {/* Goal picker */}
      {showPicker && (
        <div className="flex gap-2 mb-3 animate-fade-in">
          {GOAL_LEVELS.map((g, i) => (
            <button
              key={g.label}
              onClick={() => changeGoal(i)}
              className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all ${
                i === goalIdx
                  ? "border-[#72EB3A] bg-[#72EB3A]/10 text-[#72EB3A]"
                  : "border-slate-700 bg-[#1B1D24] text-slate-400 hover:border-slate-600"
              }`}
            >
              {g.emoji} {g.label}
            </button>
          ))}
        </div>
      )}

      {/* Progress bar */}
      <div className="h-2.5 bg-[#1B1D24] rounded-full overflow-hidden mb-2">
        <div
          className={`h-full rounded-full transition-all duration-700 ${completed ? "bg-[#72EB3A]" : "bg-[#72EB3A]/60"}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex justify-between items-center">
        <span className="text-[11px] font-bold text-slate-400">
          {todayXP}/{goal.xp} XP hoje
        </span>
        {completed
          ? <span className="text-[11px] font-black text-[#72EB3A]">Meta atingida! +{goal.xp} 🪙</span>
          : (
            <button
              onClick={() => navigate("/dashboard/quizzes")}
              className="text-[11px] font-bold text-[#72EB3A] flex items-center gap-0.5"
            >
              Ganhar XP <ChevronRight className="h-3 w-3" />
            </button>
          )
        }
      </div>
    </div>
  );
};

export default DailyGoal;
