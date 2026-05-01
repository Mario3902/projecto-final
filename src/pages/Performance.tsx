import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Tooltip, PieChart, Pie, Cell, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, Radar
} from "recharts";
import {
  TrendingUp, TrendingDown, Minus, Edit3, Save, X, User, BookOpen,
  GraduationCap, Target, Home, Check, Bot, Trophy, Flame, Star,
  Award, Zap, Crown, Medal, Shield, ChevronRight
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useGame } from "@/context/GameContext";

// ── Confetti Effect ──
const Confetti = ({ show }: { show: boolean }) => {
  if (!show) return null;
  const colors = ["#72EB3A", "#22d3ee", "#facc15", "#fb923c", "#f472b6", "#a78bfa"];
  return (
    <div className="fixed inset-0 pointer-events-none z-[100]">
      {Array.from({ length: 40 }).map((_, i) => (
        <div
          key={i}
          className="absolute animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            top: `-${Math.random() * 10}%`,
            width: `${6 + Math.random() * 6}px`,
            height: `${6 + Math.random() * 6}px`,
            backgroundColor: colors[i % colors.length],
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            animationDelay: `${Math.random() * 1.5}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
    </div>
  );
};

// ── Badge System (expanded) ──
const BADGES = [
  // XP milestones
  { id: "starter",    name: "Primeiro Passo",  desc: "Completar o registo",          icon: Star,        color: "#72EB3A", minXP: 0,     streakReq: 0,  quizReq: 0  },
  { id: "focus",      name: "Foco Inicial",    desc: "Ganhar 200 XP",                icon: Target,      color: "#22d3ee", minXP: 200,   streakReq: 0,  quizReq: 0  },
  { id: "studious",   name: "Estudioso",       desc: "Ganhar 500 XP",                icon: BookOpen,    color: "#facc15", minXP: 500,   streakReq: 0,  quizReq: 0  },
  { id: "champion",   name: "Campeão",         desc: "Ganhar 1000 XP",               icon: Trophy,      color: "#fb923c", minXP: 1000,  streakReq: 0,  quizReq: 0  },
  { id: "master",     name: "Mestre Nzila",    desc: "Ganhar 2000 XP",               icon: Crown,       color: "#f472b6", minXP: 2000,  streakReq: 0,  quizReq: 0  },
  { id: "legend",     name: "Lenda",           desc: "Ganhar 5000 XP",               icon: Shield,      color: "#a78bfa", minXP: 5000,  streakReq: 0,  quizReq: 0  },
  // Streak badges
  { id: "streak3",    name: "3 Dias Seguidos", desc: "Streak de 3 dias",             icon: Flame,       color: "#f97316", minXP: 0,     streakReq: 3,  quizReq: 0  },
  { id: "streak7",    name: "Semana Perfeita", desc: "Streak de 7 dias",             icon: Flame,       color: "#ef4444", minXP: 0,     streakReq: 7,  quizReq: 0  },
  { id: "streak30",   name: "Mês Dedicado",    desc: "Streak de 30 dias",            icon: Flame,       color: "#dc2626", minXP: 0,     streakReq: 30, quizReq: 0  },
  // Quiz badges
  { id: "quiz5",      name: "Curioso",         desc: "Completar 5 quizzes",          icon: Zap,         color: "#60a5fa", minXP: 0,     streakReq: 0,  quizReq: 5  },
  { id: "quiz20",     name: "Explorador",      desc: "Completar 20 quizzes",         icon: Zap,         color: "#3b82f6", minXP: 0,     streakReq: 0,  quizReq: 20 },
  { id: "quiz50",     name: "Veterano",        desc: "Completar 50 quizzes",         icon: Award,       color: "#2563eb", minXP: 0,     streakReq: 0,  quizReq: 50 },
  // Level badges
  { id: "level5",     name: "Crescendo",       desc: "Atingir o Nível 5",            icon: TrendingUp,  color: "#34d399", minXP: 400,   streakReq: 0,  quizReq: 0  },
  { id: "level10",    name: "Em Ascensão",     desc: "Atingir o Nível 10",           icon: TrendingUp,  color: "#10b981", minXP: 900,   streakReq: 0,  quizReq: 0  },
  { id: "nzila_star", name: "Estrela Nzila",   desc: "500 XP + 7d streak + 10 quiz", icon: Star,        color: "#fbbf24", minXP: 500,   streakReq: 7,  quizReq: 10 },
];

const TrendIcon = ({ trend }: { trend: string }) => {
  if (trend === "up") return <TrendingUp className="h-4 w-4 text-[#72EB3A]" />;
  if (trend === "down") return <TrendingDown className="h-4 w-4 text-red-500" />;
  return <Minus className="h-4 w-4 text-slate-500" />;
};

const Profile = () => {
  const location = useLocation();
  const { xp, level, streak, quizzesCompleted, studyHours, reloadGameData } = useGame();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [activeTab, setActiveTab] = useState<"stats" | "boletim" | "badges">("stats");

  // Profile data
  const [profile, setProfile] = useState({ name: "Estudante", age: "", course: "", year: "", goal: "" });
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [subjectData, setSubjectData] = useState<any[]>([]);
  const [pieData, setPieData] = useState([
    { name: "Excelente (>16)", value: 0, color: "#72EB3A" },
    { name: "Bom (10-16)", value: 0, color: "#eab308" },
    { name: "Atenção (<10)", value: 0, color: "#ef4444" },
  ]);
  // Boletim editing
  const [allGrades, setAllGrades] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const prof = await api.getProfile();
      setProfile({
        name: prof.name || "Estudante",
        age: prof.age || "",
        course: prof.course || "Não Definido",
        year: prof.grade || "12º Ano",
        goal: prof.goal || "Sucesso Académico",
      });

      const perf = await api.getPerformance();
      const grades = perf.grades || [];
      setAllGrades(grades);

      // Load subjects for boletim
      const subs = await api.getSubjects();
      setSubjects(subs || []);

      // ── TRIMESTRAL AGGREGATION ──
      const trimStats = { T1: { sum: 0, count: 0 }, T2: { sum: 0, count: 0 }, T3: { sum: 0, count: 0 } };
      grades.forEach((g: any) => {
        const t = g.trimester as "T1" | "T2" | "T3";
        if (t && trimStats[t]) {
          trimStats[t].sum += parseFloat(g.grade);
          trimStats[t].count++;
        }
      });

      const chartData = [
        { mes: "1º Trim", nota: trimStats.T1.count > 0 ? parseFloat((trimStats.T1.sum / trimStats.T1.count).toFixed(1)) : 0 },
        { mes: "2º Trim", nota: trimStats.T2.count > 0 ? parseFloat((trimStats.T2.sum / trimStats.T2.count).toFixed(1)) : 0 },
        { mes: "3º Trim", nota: trimStats.T3.count > 0 ? parseFloat((trimStats.T3.sum / trimStats.T3.count).toFixed(1)) : 0 },
      ];
      setMonthlyData(chartData);

      // Subject aggregation
      const subjsMap = new Map();
      grades.forEach((g: any) => {
        if (!subjsMap.has(g.subject_id)) {
          subjsMap.set(g.subject_id, { name: g.subject_name, sum: 0, count: 0, trend: "stable" });
        }
        const s = subjsMap.get(g.subject_id);
        s.sum += parseFloat(g.grade);
        s.count++;
      });

      const finalSubjects = Array.from(subjsMap.values()).map(s => ({
        name: s.name,
        score: parseFloat((s.sum / s.count).toFixed(1)),
        trend: "stable"
      }));
      setSubjectData(finalSubjects.length > 0 ? finalSubjects : []);

      // Pie data
      let exc = 0, bom = 0, atencao = 0;
      finalSubjects.forEach(s => {
        if (s.score > 16) exc++;
        else if (s.score >= 10) bom++;
        else atencao++;
      });
      setPieData([
        { name: "Excelente (>16)", value: exc || 0.1, color: "#72EB3A" },
        { name: "Bom (10-16)", value: bom || 0.1, color: "#eab308" },
        { name: "Atenção (<10)", value: atencao || 0.1, color: "#ef4444" },
      ]);
    } catch (e) {
      console.error("Erro a ler perfil real", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await api.updateProfile({
        name: profile.name,
        age: profile.age ? parseInt(profile.age as string) : undefined,
        course: profile.course,
        grade: profile.year,
        goal: profile.goal
      });
      setIsEditing(false);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      toast("Perfil atualizado! 🎉", { icon: "✅" });
      await reloadGameData();
    } catch (e) {
      toast.error("Erro ao guardar o perfil.");
    }
  };

  // ── Grade Save for Boletim ──
  const handleGradeSave = async (subjectId: number, trimester: "T1" | "T2" | "T3", testType: "p1" | "p2", value: number) => {
    if (isNaN(value) || value < 0 || value > 20) return;
    try {
      await api.saveGrade(subjectId, value, trimester, testType);
      toast("Nota guardada! ✅");
      await fetchData(); // Refresh all grades
    } catch (e) {
      toast.error("Erro ao guardar nota.");
    }
  };

  // ── Get grade value from allGrades ──
  const getGrade = (subjectId: number, trimester: string, testType: string): string => {
    const found = allGrades.find(
      (g: any) => g.subject_id === subjectId && g.trimester === trimester && g.test_type === testType
    );
    return found ? found.grade.toString() : "";
  };

  // ── XP progress data for chart ──
  const xpChartData = [
    { label: "Nível " + Math.max(1, level - 2), xp: Math.max(0, (level - 3) * 100) },
    { label: "Nível " + Math.max(1, level - 1), xp: Math.max(0, (level - 2) * 100) },
    { label: "Nível " + level, xp: xp },
    { label: "Nível " + (level + 1), xp: level * 100 },
  ];

  // ── Badges earned ──
  const earnedBadges = BADGES.filter(b =>
    xp >= b.minXP &&
    streak >= b.streakReq &&
    quizzesCompleted >= b.quizReq
  );
  const nextBadge = BADGES.find(b =>
    !(xp >= b.minXP && streak >= b.streakReq && quizzesCompleted >= b.quizReq)
  );

  const bottomNavItems = [
    { title: "Início", path: "/dashboard", icon: Home },
    { title: "Cursos", path: "/dashboard/subjects", icon: BookOpen },
    { title: "Planner", path: "/dashboard/tasks", icon: Check },
    { title: "IA", path: "/dashboard/chat", icon: Bot },
    { title: "Perfil", path: "/dashboard/performance", icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#1B1D24] text-white flex flex-col font-sans pb-24 relative overflow-x-hidden">
      <Confetti show={showConfetti} />
      <div className="max-w-md mx-auto w-full px-5 py-6 animate-fade-in">

        {/* ── PROFILE HEADER ── */}
        <div className="relative bg-[#1C2210] border border-slate-800/60 rounded-3xl p-6 overflow-hidden mt-2 mb-6 shadow-lg">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#72EB3A]/10 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#22d3ee]/5 rounded-full blur-2xl" />

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#72EB3A]/30 to-[#22d3ee]/20 text-[#72EB3A] flex items-center justify-center shadow-[0_0_25px_rgba(74,222,128,0.2)] border-2 border-[#72EB3A]/30 rotate-[-2deg]">
                  <span className="font-black text-3xl">{profile.name[0]?.toUpperCase() || "E"}</span>
                </div>
                <div>
                  <h1 className="text-xl font-black text-white leading-tight">{profile.name}</h1>
                  <div className="flex items-center gap-1.5 text-[#72EB3A] font-bold text-xs mt-1">
                    <GraduationCap className="w-3.5 h-3.5" />
                    {profile.year} • {profile.course}
                  </div>
                </div>
              </div>

              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-[#253510] hover:bg-[#365A08] text-white border border-[#365A08] p-2.5 rounded-full transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-red-500/10 text-red-400 p-2.5 rounded-full hover:bg-red-500 hover:text-white transition-colors border border-red-500/20"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Stats Row */}
            {!isEditing && (
              <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-slate-800/60">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Zap className="h-3 w-3 text-[#72EB3A]" />
                  </div>
                  <p className="text-lg font-black text-white leading-none">{xp}</p>
                  <p className="text-[9px] text-slate-500 font-bold mt-1">XP</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Crown className="h-3 w-3 text-yellow-500" />
                  </div>
                  <p className="text-lg font-black text-white leading-none">{level}</p>
                  <p className="text-[9px] text-slate-500 font-bold mt-1">NÍVEL</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Flame className="h-3 w-3 text-orange-500" />
                  </div>
                  <p className="text-lg font-black text-white leading-none">{streak}</p>
                  <p className="text-[9px] text-slate-500 font-bold mt-1">STREAK</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Trophy className="h-3 w-3 text-[#22d3ee]" />
                  </div>
                  <p className="text-lg font-black text-white leading-none">{quizzesCompleted}</p>
                  <p className="text-[9px] text-slate-500 font-bold mt-1">QUIZZES</p>
                </div>
              </div>
            )}

            {/* Edit Form */}
            {isEditing && (
              <div className="space-y-4 pt-2 animate-slide-up">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 tracking-widest">
                      <User className="w-3 h-3" /> Nome
                    </label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full bg-[#1B1D24] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-[#72EB3A] outline-none transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 tracking-widest">
                      Idade
                    </label>
                    <input
                      type="number"
                      value={profile.age}
                      onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                      className="w-full bg-[#1B1D24] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-[#72EB3A] outline-none transition-colors"
                      placeholder="Ex: 17"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 tracking-widest">
                      <GraduationCap className="w-3 h-3" /> Ano
                    </label>
                    <input
                      type="text"
                      value={profile.year}
                      onChange={(e) => setProfile({ ...profile, year: e.target.value })}
                      className="w-full bg-[#1B1D24] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-[#72EB3A] outline-none transition-colors"
                      placeholder="Ex: 12º Ano"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 tracking-widest">
                      <BookOpen className="w-3 h-3" /> Curso
                    </label>
                    <input
                      type="text"
                      value={profile.course}
                      onChange={(e) => setProfile({ ...profile, course: e.target.value })}
                      className="w-full bg-[#1B1D24] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-[#72EB3A] outline-none transition-colors"
                      placeholder="Ex: Ciências"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 tracking-widest">
                    <Target className="w-3 h-3" /> Objetivo
                  </label>
                  <textarea
                    value={profile.goal}
                    onChange={(e) => setProfile({ ...profile, goal: e.target.value })}
                    className="w-full bg-[#1B1D24] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-[#72EB3A] outline-none resize-none h-20 transition-colors"
                    placeholder="O que pretendes alcançar?"
                  />
                </div>

                <button
                  onClick={handleSave}
                  className="w-full bg-[#72EB3A] hover:bg-[#5D9D0B] text-[#1B1D24] font-black tracking-wide text-[15px] py-4 rounded-xl flex items-center justify-center transition-transform active:scale-95"
                >
                  <Save className="w-4 h-4 mr-2" /> Guardar Perfil
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── TAB SWITCHER ── */}
        <div className="flex gap-2 mb-6">
          {([
            { key: "stats", label: "Desempenho", icon: TrendingUp },
            { key: "boletim", label: "Boletim", icon: BookOpen },
            { key: "badges", label: "Conquistas", icon: Trophy },
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === tab.key
                  ? "bg-[#72EB3A] text-[#1B1D24] shadow-[0_4px_15px_rgba(74,222,128,0.2)]"
                  : "bg-[#1C2210] border border-slate-800 text-slate-400 hover:text-white"
                }`}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ══════════════════  TAB: STATS  ══════════════════ */}
        {activeTab === "stats" && (
          <div className="space-y-6 animate-fade-in">

            {/* XP Progress Chart */}
            <div className="bg-[#1C2210] border border-[#365A08]/60 p-5 rounded-3xl shadow-lg">
              <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                <Zap className="h-4 w-4 text-[#72EB3A]" /> Progressão de XP
              </h3>
              <p className="text-[10px] text-slate-500 font-bold mb-4">O teu crescimento ao longo dos níveis</p>
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={xpChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="xpGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#72EB3A" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#72EB3A" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#253510" />
                    <XAxis dataKey="label" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1B1D24", border: "1px solid #253510", borderRadius: "12px", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}
                      itemStyle={{ color: "#72EB3A", fontWeight: "bold" }}
                      formatter={(value: any) => [`${value} XP`, "Experiência"]}
                    />
                    <Area type="monotone" dataKey="xp" stroke="#72EB3A" strokeWidth={3} fill="url(#xpGrad)" dot={{ fill: "#72EB3A", r: 4, strokeWidth: 2, stroke: "#1B1D24" }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Evolução da Média + Pie */}
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-[#1C2210] border border-[#365A08]/60 p-5 rounded-3xl shadow-lg">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-[#22d3ee]" /> Evolução da Média Geral
                </h3>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#72EB3A" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.7} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#253510" />
                      <XAxis dataKey="mes" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#64748b" fontSize={10} domain={[0, 20]} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#1B1D24", border: "1px solid #253510", borderRadius: "12px", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}
                        itemStyle={{ color: "#fff", fontWeight: "bold" }}
                      />
                      <Bar dataKey="nota" fill="url(#barGrad)" radius={[8, 8, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-[#1C2210] border border-[#365A08]/60 p-5 rounded-3xl shadow-lg">
                <h3 className="text-sm font-bold text-white mb-2">Distribuição das Notas</h3>
                <div className="flex flex-col justify-center items-center">
                  <div className="h-[160px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value" paddingAngle={5} stroke="none">
                          {pieData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: "#1B1D24", border: "1px solid #253510", borderRadius: "12px" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3 w-full">
                    {pieData.map((d, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[10px]">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                        <span className="text-slate-400 font-bold tracking-wide">{d.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Notas por Matéria */}
            {subjectData.length > 0 && (
              <>
                <h3 className="text-lg font-bold text-white mt-2">Notas por Matéria</h3>
                <div className="grid grid-cols-2 gap-3">
                  {subjectData.map((sub, i) => (
                    <div key={i} className="flex flex-col justify-between bg-[#1C2210] border border-slate-800/60 rounded-2xl p-4 transition-all hover:bg-[#253510] hover:border-[#72EB3A]/30">
                      <div className="flex justify-between items-start mb-3">
                        <p className="font-bold text-slate-200 text-sm leading-tight">{sub.name}</p>
                        <div className="bg-[#1B1D24] rounded-full p-1 border border-slate-800 shadow-sm">
                          <TrendIcon trend={sub.trend} />
                        </div>
                      </div>
                      <div className="flex items-end gap-1">
                        <p className={`text-3xl font-black ${sub.score >= 14 ? "text-[#72EB3A]" : sub.score >= 10 ? "text-yellow-500" : "text-red-400"}`}>
                          {sub.score}
                        </p>
                        <span className="text-xs text-slate-500 font-bold mb-1 pb-0.5">/ 20</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Study Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-[#1C2210] to-[#253510] border border-[#365A08]/60 p-4 rounded-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-[#72EB3A]/10 flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-[#72EB3A]" />
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Horas de Estudo</span>
                </div>
                <p className="text-2xl font-black text-white">{studyHours}<span className="text-sm text-slate-500 ml-1">h</span></p>
              </div>
              <div className="bg-gradient-to-br from-[#1C2210] to-[#253510] border border-[#365A08]/60 p-4 rounded-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                    <Flame className="h-4 w-4 text-orange-500" />
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Dias de Streak</span>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-black text-white">{streak}</p>
                  {streak >= 3 && <span className="text-lg animate-pulse">🔥</span>}
                  {streak >= 7 && <span className="text-lg animate-pulse">🔥</span>}
                  {streak >= 14 && <span className="text-lg animate-pulse">🔥</span>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════  TAB: BOLETIM  ══════════════════ */}
        {activeTab === "boletim" && (
          <div className="space-y-5 animate-fade-in">

            {/* Header Card */}
            <div className="bg-[#1C2210] border border-[#365A08]/60 p-5 rounded-3xl shadow-lg">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-[#72EB3A]" /> Boletim Escolar
                </h3>
                <span className="text-[10px] font-bold text-slate-500 bg-[#1B1D24] border border-slate-800 px-2.5 py-1 rounded-lg">
                  {profile.year || "Ano Lectivo"}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Edita as notas diretamente — guarda automaticamente.
              </p>
            </div>

            {subjects.length === 0 ? (
              <div className="text-center py-10 border border-slate-800 border-dashed rounded-3xl bg-[#1C2210]">
                <BookOpen className="h-8 w-8 text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-400 font-bold mb-2">Nenhuma disciplina configurada.</p>
                <Link to="/dashboard/subjects" className="text-[#72EB3A] text-xs font-bold hover:underline">
                  Configurar Disciplinas →
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {subjects.map((sub: any) => {
                  const getAvg = (tri: string) => {
                    const p1 = getGrade(sub.id, tri, "p1");
                    const p2 = getGrade(sub.id, tri, "p2");
                    const vals = [p1, p2].filter(v => v !== "").map(Number);
                    if (vals.length === 0) return null;
                    return (vals.reduce((a: number, b: number) => a + b, 0) / vals.length).toFixed(1);
                  };
                  const t1Avg = getAvg("T1");
                  const t2Avg = getAvg("T2");
                  const t3Avg = getAvg("T3");
                  const allAvgs = [t1Avg, t2Avg, t3Avg].filter(v => v !== null).map(Number);
                  const finalAvg = allAvgs.length > 0
                    ? (allAvgs.reduce((a, b) => a + b, 0) / allAvgs.length).toFixed(1)
                    : null;
                  const gradeColor = (val: number | null) => {
                    if (val === null) return "text-slate-500";
                    if (val >= 14) return "text-[#72EB3A]";
                    if (val >= 10) return "text-yellow-500";
                    return "text-red-400";
                  };
                  const inputColor = (val: string) => {
                    if (!val) return "border-slate-700/50 text-slate-300";
                    const n = parseFloat(val);
                    if (n >= 14) return "border-[#72EB3A]/30 text-[#72EB3A]";
                    if (n >= 10) return "border-yellow-500/30 text-yellow-500";
                    return "border-red-500/30 text-red-400";
                  };

                  return (
                    <div key={sub.id} className="bg-[#1C2210] border border-slate-800/60 rounded-2xl overflow-hidden shadow-lg">
                      {/* Subject header */}
                      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/40">
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg">{sub.emoji}</span>
                          <span className="text-sm font-bold text-white">{sub.name}</span>
                        </div>
                        {finalAvg !== null && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Média</span>
                            <span className={`text-lg font-black ${gradeColor(Number(finalAvg))}`}>
                              {finalAvg}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Trimesters grid */}
                      <div className="grid grid-cols-3 divide-x divide-slate-800/40">
                        {(["T1", "T2", "T3"] as const).map((tri, triIdx) => {
                          const avg = [t1Avg, t2Avg, t3Avg][triIdx];
                          return (
                            <div key={tri} className="p-3">
                              <div className="flex items-center justify-between mb-2.5">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                  {triIdx + 1}º Trim
                                </span>
                                {avg !== null && (
                                  <span className={`text-[11px] font-black ${gradeColor(Number(avg))}`}>
                                    {avg}
                                  </span>
                                )}
                              </div>
                              <div className="space-y-2">
                                {(["p1", "p2"] as const).map(test => {
                                  const existing = getGrade(sub.id, tri, test);
                                  return (
                                    <div key={`${sub.id}-${tri}-${test}`} className="flex items-center gap-2">
                                      <span className="text-[9px] font-bold text-slate-600 uppercase w-5 shrink-0">
                                        {test.toUpperCase()}
                                      </span>
                                      <input
                                        type="number"
                                        min={0}
                                        max={20}
                                        defaultValue={existing}
                                        placeholder="—"
                                        onBlur={(e) => {
                                          const val = parseFloat(e.target.value);
                                          if (!isNaN(val) && val >= 0 && val <= 20) {
                                            handleGradeSave(sub.id, tri, test, val);
                                          }
                                        }}
                                        className={`w-full h-9 text-center text-sm font-black bg-[#1B1D24] border rounded-lg outline-none transition-colors focus:border-[#72EB3A] ${inputColor(existing)}`}
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Vocational */}
            <div className="bg-gradient-to-br from-[#1C2210] to-[#253510] border border-[#365A08]/80 p-6 rounded-3xl shadow-lg relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#72EB3A]/15 rounded-full blur-2xl group-hover:bg-[#72EB3A]/25 transition-colors duration-500" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[#72EB3A]/20 rounded-2xl flex items-center justify-center text-[#72EB3A] shadow-[0_0_15px_rgba(74,222,128,0.15)] border border-[#72EB3A]/30 shrink-0">
                    <Bot className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white mb-0.5">Descobre a tua vocação</h4>
                    <p className="text-[11px] font-bold text-[#72EB3A] uppercase tracking-wider">Análise de IA Especializada</p>
                  </div>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed mb-6">
                  A Inteligência Artificial acompanha o teu progresso em tempo real e sugere carreiras baseadas nos teus resultados.
                </p>
                <Link to="/dashboard/quizzes" className="w-full bg-[#1B1D24] hover:bg-[#72EB3A] text-[#72EB3A] hover:text-[#1B1D24] border border-[#72EB3A]/50 font-bold text-sm py-4 rounded-2xl flex items-center justify-center gap-2 transition-all">
                  Gerar Quiz Vocacional <Bot className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════  TAB: BADGES  ══════════════════ */}
        {activeTab === "badges" && (
          <div className="space-y-5 animate-fade-in">
            <div className="bg-[#1C2210] border border-[#365A08]/60 p-5 rounded-3xl shadow-lg">
              <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                <Award className="h-4 w-4 text-yellow-500" /> Conquistas Desbloqueadas
              </h3>
              <p className="text-[10px] text-slate-500 font-bold mb-5">
                {earnedBadges.length} de {BADGES.length} conquistas ganhas
              </p>

              {/* Progress to next badge */}
              {nextBadge && (
                <div className="bg-[#1B1D24] border border-slate-800 rounded-2xl p-4 mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-300">Próxima: {nextBadge.name}</span>
                    <span className="text-[10px] font-bold text-[#72EB3A]">{nextBadge.desc}</span>
                  </div>
                  {nextBadge.minXP > 0 && (
                    <div className="h-2 w-full bg-[#253510] rounded-full overflow-hidden mb-2">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((xp / nextBadge.minXP) * 100, 100)}%`, backgroundColor: nextBadge.color }}
                      />
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {nextBadge.minXP > 0 && (
                      <span className="text-[10px] text-slate-500 font-medium">
                        XP: {xp}/{nextBadge.minXP} {xp >= nextBadge.minXP ? "✅" : ""}
                      </span>
                    )}
                    {nextBadge.streakReq > 0 && (
                      <span className="text-[10px] text-slate-500 font-medium">
                        Streak: {streak}/{nextBadge.streakReq} {streak >= nextBadge.streakReq ? "✅" : "🔥"}
                      </span>
                    )}
                    {nextBadge.quizReq > 0 && (
                      <span className="text-[10px] text-slate-500 font-medium">
                        Quizzes: {quizzesCompleted}/{nextBadge.quizReq} {quizzesCompleted >= nextBadge.quizReq ? "✅" : "📝"}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {BADGES.map((badge, i) => {
                  const earned = xp >= badge.minXP && streak >= badge.streakReq && quizzesCompleted >= badge.quizReq;
                  const Icon = badge.icon;
                  return (
                    <div
                      key={badge.id}
                      className={`relative p-4 rounded-2xl border transition-all ${earned
                          ? "bg-gradient-to-br from-[#253510] to-[#1C2210] border-[#365A08] shadow-lg"
                          : "bg-[#1B1D24] border-slate-800/50 opacity-50"
                        }`}
                    >
                      {earned && (
                        <div
                          className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: badge.color + "30" }}
                        >
                          <Check className="h-3 w-3" style={{ color: badge.color }} />
                        </div>
                      )}
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                        style={{
                          backgroundColor: earned ? badge.color + "20" : "#253510",
                          boxShadow: earned ? `0 0 15px ${badge.color}30` : "none"
                        }}
                      >
                        <Icon className="h-5 w-5" style={{ color: earned ? badge.color : "#64748b" }} />
                      </div>
                      <p className={`text-xs font-bold mb-0.5 ${earned ? "text-white" : "text-slate-500"}`}>
                        {badge.name}
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium">{badge.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#1B1D24] border-t border-[#253510] px-6 py-4 flex justify-between items-center z-50">
        {bottomNavItems.map((item, i) => {
          const isActive = location.pathname === item.path || (item.title === 'Perfil' && true);
          return (
            <Link
              key={i}
              to={item.path}
              className={`flex flex-col items-center gap-1.5 transition-colors ${isActive ? "text-[#72EB3A]" : "text-slate-500 hover:text-slate-300"}`}
            >
              <item.icon className={`h-[22px] w-[22px] ${isActive ? "stroke-[2.5]" : "stroke-2"}`} />
              <span className={`text-[10px] font-bold tracking-wide ${isActive ? "text-[#72EB3A]" : ""}`}>
                {item.title}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Profile;
