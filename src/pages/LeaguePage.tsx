import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trophy, TrendingUp, TrendingDown, Minus, Crown, ChevronUp, ChevronDown } from "lucide-react";
import { useGame } from "@/context/GameContext";

// ─── League tiers ────────────────────────────────────────────────────────────

export interface LeagueTier {
  id: string;
  name: string;
  emoji: string;
  color: string;
  bg: string;
  border: string;
  minXP: number;
}

export const LEAGUES: LeagueTier[] = [
  { id: "caurie",    name: "Caurie",    emoji: "🐚", color: "text-slate-400",   bg: "bg-slate-800/40",   border: "border-slate-600",   minXP: 0    },
  { id: "bronze",    name: "Bronze",    emoji: "🥉", color: "text-amber-600",   bg: "bg-amber-900/20",   border: "border-amber-700",   minXP: 50   },
  { id: "prata",     name: "Prata",     emoji: "🥈", color: "text-slate-300",   bg: "bg-slate-700/20",   border: "border-slate-500",   minXP: 150  },
  { id: "ouro",      name: "Ouro",      emoji: "🥇", color: "text-yellow-400",  bg: "bg-yellow-900/20",  border: "border-yellow-600",  minXP: 350  },
  { id: "diamante",  name: "Diamante",  emoji: "💎", color: "text-cyan-400",    bg: "bg-cyan-900/20",    border: "border-cyan-600",    minXP: 700  },
  { id: "safira",    name: "Safira",    emoji: "🔷", color: "text-blue-400",    bg: "bg-blue-900/20",    border: "border-blue-600",    minXP: 1200 },
  { id: "rubi",      name: "Rubi",      emoji: "❤️", color: "text-red-400",     bg: "bg-red-900/20",     border: "border-red-600",     minXP: 2000 },
  { id: "esmeralda", name: "Esmeralda", emoji: "💚", color: "text-emerald-400", bg: "bg-emerald-900/20", border: "border-emerald-600", minXP: 3500 },
];

export function getTierByXP(weeklyXP: number): LeagueTier {
  for (let i = LEAGUES.length - 1; i >= 0; i--) {
    if (weeklyXP >= LEAGUES[i].minXP) return LEAGUES[i];
  }
  return LEAGUES[0];
}

// ─── Weekly XP tracking ───────────────────────────────────────────────────────

const WEEK_KEY = "nzila_weekly";

interface WeekData {
  weekStart: string;  // ISO date string of Monday
  xp: number;
}

function getMonday(d = new Date()): string {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split("T")[0];
}

export function getWeeklyXP(): number {
  try {
    const stored: WeekData = JSON.parse(localStorage.getItem(WEEK_KEY) || "{}");
    if (stored.weekStart !== getMonday()) return 0;
    return stored.xp || 0;
  } catch { return 0; }
}

export function addWeeklyXP(amount: number) {
  const monday = getMonday();
  let current = 0;
  try {
    const stored: WeekData = JSON.parse(localStorage.getItem(WEEK_KEY) || "{}");
    if (stored.weekStart === monday) current = stored.xp || 0;
  } catch {}
  localStorage.setItem(WEEK_KEY, JSON.stringify({ weekStart: monday, xp: current + amount }));
}

// ─── Fake opponents generator ─────────────────────────────────────────────────

const ANGOLAN_NAMES = [
  "Kiluanje M.", "Ndumba S.", "Catarina F.", "Eduardo P.", "Filomena A.",
  "Gaspar N.", "Helena C.", "Ismael K.", "Joana T.", "Lukeni B.",
  "Maria G.", "Nzinga R.", "Orlando V.", "Paula D.", "Quissama L.",
  "Rosário M.", "Simão A.", "Tânia B.", "Ulani F.", "Verônica S.",
];

function generateOpponents(userXP: number, tier: LeagueTier): { name: string; xp: number; isUser?: boolean }[] {
  const range = Math.max(30, userXP * 0.5);
  const opponents = ANGOLAN_NAMES.slice(0, 9).map((name) => ({
    name,
    xp: Math.max(0, Math.round(userXP + (Math.random() - 0.5) * range * 2)),
  }));
  return opponents;
}

// ─── Main Component ───────────────────────────────────────────────────────────

const LeaguePage = () => {
  const navigate = useNavigate();
  const { xp } = useGame();
  const weeklyXP = getWeeklyXP();
  const tier = getTierByXP(weeklyXP);
  const nextTier = LEAGUES[Math.min(LEAGUES.length - 1, LEAGUES.indexOf(tier) + 1)];
  const prevTier = LEAGUES[Math.max(0, LEAGUES.indexOf(tier) - 1)];

  const [leaderboard, setLeaderboard] = useState<{ name: string; xp: number; isUser?: boolean }[]>([]);

  useEffect(() => {
    const opponents = generateOpponents(weeklyXP, tier);
    const userName = localStorage.getItem("userName") || "Tu";
    const allPlayers = [
      ...opponents,
      { name: `${userName} (Tu)`, xp: weeklyXP, isUser: true },
    ].sort((a, b) => b.xp - a.xp);
    setLeaderboard(allPlayers);
  }, [weeklyXP]);

  const userRank = leaderboard.findIndex((p) => p.isUser) + 1;
  const daysUntilReset = (() => {
    const now = new Date();
    const day = now.getDay();
    return day === 1 ? 7 : (8 - day) % 7;
  })();

  const tierIdx = LEAGUES.indexOf(tier);
  const toPromote = nextTier.minXP - weeklyXP;
  const xpProgress = Math.min(100,
    tierIdx === LEAGUES.length - 1 ? 100 :
    ((weeklyXP - tier.minXP) / (nextTier.minXP - tier.minXP)) * 100
  );

  return (
    <div className="min-h-screen bg-[#0e1710] text-white flex flex-col font-sans pb-24">
      <div className="max-w-md mx-auto w-full px-5 py-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 mt-2">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-white/5">
            <ArrowLeft className="h-5 w-5 text-slate-400" />
          </button>
          <div>
            <p className="text-[#4ade80] text-[10px] font-black tracking-widest uppercase">Nzila</p>
            <h1 className="text-2xl font-bold">Ligas</h1>
          </div>
        </div>

        {/* Current tier card */}
        <div className={`rounded-3xl p-6 mb-6 border-2 relative overflow-hidden ${tier.bg} ${tier.border}`}>
          <div className="absolute -top-6 -right-6 text-[100px] opacity-10 select-none">{tier.emoji}</div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-16 h-16 rounded-2xl border-2 ${tier.border} flex items-center justify-center text-4xl`}>
                {tier.emoji}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Liga Actual</p>
                <h2 className={`text-2xl font-black ${tier.color}`}>{tier.name}</h2>
                <p className="text-xs text-slate-400 mt-0.5">{weeklyXP} XP esta semana</p>
              </div>
            </div>

            {/* Progress to next tier */}
            {tierIdx < LEAGUES.length - 1 && (
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-400 mb-1.5">
                  <span>{tier.name}</span>
                  <span>{nextTier.emoji} {nextTier.name}</span>
                </div>
                <div className="h-3 bg-black/30 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r from-[#4ade80] to-[#22c55e]`}
                    style={{ width: `${xpProgress}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5 font-medium">
                  Faltam <span className={`font-black ${tier.color}`}>{toPromote} XP</span> para {nextTier.name}
                </p>
              </div>
            )}
            {tierIdx === LEAGUES.length - 1 && (
              <p className="text-emerald-400 font-black text-sm">🏆 Liga Máxima Atingida!</p>
            )}
          </div>
        </div>

        {/* Reset countdown */}
        <div className="bg-[#141e16] border border-[#254238] rounded-2xl px-4 py-3 mb-6 flex items-center justify-between">
          <p className="text-xs text-slate-400 font-medium">Reset semanal em</p>
          <p className="text-sm font-black text-[#4ade80]">{daysUntilReset} dias</p>
        </div>

        {/* Tier progression ladder */}
        <h2 className="text-base font-bold mb-3 text-slate-300">Todas as Ligas</h2>
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {LEAGUES.map((l, i) => (
            <div
              key={l.id}
              className={`flex flex-col items-center shrink-0 px-3 py-2 rounded-xl border transition-all ${
                l.id === tier.id
                  ? `${l.border} ${l.bg} scale-110 shadow-lg`
                  : i < tierIdx
                  ? "border-[#254238] bg-[#141e16] opacity-70"
                  : "border-slate-800 bg-[#141e16] opacity-50"
              }`}
            >
              <span className="text-xl mb-1">{l.emoji}</span>
              <span className={`text-[9px] font-black ${l.id === tier.id ? l.color : "text-slate-500"}`}>
                {l.name}
              </span>
            </div>
          ))}
        </div>

        {/* Leaderboard */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold">Classificação Semanal</h2>
          <span className="text-[10px] text-slate-500 font-bold">{tier.emoji} Liga {tier.name}</span>
        </div>

        <div className="space-y-2">
          {leaderboard.map((player, idx) => {
            const rank = idx + 1;
            const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;
            const isPromotion = rank <= 3;
            const isDemotion = rank >= leaderboard.length - 2;

            return (
              <div
                key={player.name}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-colors ${
                  player.isUser
                    ? "border-[#4ade80]/50 bg-[#4ade80]/10"
                    : "border-[#1a261d] bg-[#141e16]"
                }`}
              >
                {/* Rank */}
                <div className="w-8 text-center">
                  {medal
                    ? <span className="text-lg">{medal}</span>
                    : <span className="text-sm font-black text-slate-500">{rank}</span>}
                </div>

                {/* Promotion/demotion indicator */}
                <div className="w-4">
                  {isPromotion && <ChevronUp className="h-4 w-4 text-[#4ade80]" />}
                  {isDemotion && !isPromotion && <ChevronDown className="h-4 w-4 text-red-500" />}
                </div>

                {/* Name */}
                <p className={`flex-1 text-sm font-bold ${player.isUser ? "text-[#4ade80]" : "text-slate-200"}`}>
                  {player.name}
                </p>

                {/* XP */}
                <div className="text-right">
                  <span className={`text-sm font-black ${player.isUser ? "text-[#4ade80]" : "text-slate-300"}`}>
                    {player.xp.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-500 ml-1">XP</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Promotion/demotion legend */}
        <div className="mt-4 flex gap-4 justify-center text-xs font-bold text-slate-500">
          <span className="flex items-center gap-1">
            <ChevronUp className="h-3.5 w-3.5 text-[#4ade80]" /> Promoção (top 3)
          </span>
          <span className="flex items-center gap-1">
            <ChevronDown className="h-3.5 w-3.5 text-red-500" /> Descida (últimos 3)
          </span>
        </div>

      </div>
    </div>
  );
};

export default LeaguePage;
