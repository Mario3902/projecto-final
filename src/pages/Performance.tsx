import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, Minus, Edit3, Save, X, User, BookOpen, GraduationCap, Target, Home, Check, Bot } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

const TrendIcon = ({ trend }: { trend: string }) => {
  if (trend === "up") return <TrendingUp className="h-4 w-4 text-[#4ade80]" />;
  if (trend === "down") return <TrendingDown className="h-4 w-4 text-red-500" />;
  return <Minus className="h-4 w-4 text-slate-500" />;
};


const Profile = () => {
  const location = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Data from backend
  const [profile, setProfile] = useState({ name: "Estudante", course: "", year: "", goal: "" });
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [subjectData, setSubjectData] = useState<any[]>([]);
  const [pieData, setPieData] = useState([
    { name: "Excelente (>16)", value: 0, color: "#4ade80" },
    { name: "Bom (10-16)", value: 0, color: "#eab308" },
    { name: "Atenção (<10)", value: 0, color: "#ef4444" },
  ]);

  useEffect(() => {
    async function fetchData() {
      try {
        const prof = await api.getProfile();
        setProfile({
          name: prof.name || "Estudante",
          course: prof.course || "Não Definido",
          year: prof.grade || "12º Ano",
          goal: prof.goal || "Sucesso Académico",
        });

        const perf = await api.getPerformance();
        const grades = perf.grades || [];
        
        // ── TRIMESTRAL AGGREGATION ──
        const trimStats = { T1: { sum: 0, count: 0 }, T2: { sum: 0, count: 0 }, T3: { sum: 0, count: 0 } };
        grades.forEach((g: any) => {
           const t = g.trimester as "T1"|"T2"|"T3";
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
        
        // Only show up to the lowest trimester that exists, or just all 3. Showing all 3 gives a nice fixed X Axis.
        setMonthlyData(chartData);

        // ── SUBJECT AGGREGATION ──
        const subjsMap = new Map();
        grades.forEach((g: any) => {
          if (!subjsMap.has(g.subject_id)) {
            subjsMap.set(g.subject_id, {
              name: g.subject_name,
              sum: 0,
              count: 0,
              trend: "stable"
            });
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
        setSubjectData(finalSubjects.length > 0 ? finalSubjects : [{ name: "Sem Dados", score: 0, trend: "stable" }]);

        // Build Pie metrics
        let exc = 0, bom = 0, atencao = 0;
        finalSubjects.forEach(s => {
          if (s.score > 16) exc++;
          else if (s.score >= 10) bom++;
          else atencao++;
        });
        
        setPieData([
          { name: "Excelente (>16)", value: exc || 0.1, color: "#4ade80" }, // 0.1 prevents empty render visually
          { name: "Bom (10-16)", value: bom || 0.1, color: "#eab308" },
          { name: "Atenção (<10)", value: atencao || 0.1, color: "#ef4444" },
        ]);

      } catch (e) {
        console.error("Erro a ler perfil real", e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSave = async () => {
    try {
      await api.updateProfile({
        course: profile.course,
        grade: profile.year,
        goal: profile.goal
      });
      setIsEditing(false);
      toast("Perfil atualizado! 🎉", { icon: "✅" });
    } catch (e) {
      toast.error("Erro ao guardar o perfil.");
    }
  };

  const bottomNavItems = [
    { title: "Início", path: "/dashboard", icon: Home },
    { title: "Cursos", path: "/dashboard/subjects", icon: BookOpen },
    { title: "Planner", path: "/dashboard/tasks", icon: Check },
    { title: "IA", path: "/dashboard/chat", icon: Bot },
    { title: "Perfil", path: "/dashboard/performance", icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#0e1710] text-white flex flex-col font-sans pb-24 relative overflow-x-hidden">
      <div className="max-w-md mx-auto w-full px-5 py-6 animate-fade-in">

        {/* ── PROFILE HEADER ── */}
        <div className="relative bg-[#141e16] border border-slate-800/60 rounded-3xl p-6 overflow-hidden mt-6 mb-8 shadow-lg">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#4ade80]/10 rounded-full blur-2xl" />
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="w-20 h-20 rounded-2xl bg-[#4ade80]/20 text-[#4ade80] flex items-center justify-center shadow-[0_0_20px_rgba(74,222,128,0.15)] border-2 border-[#1a261d] rotate-[-2deg]">
                <span className="font-black text-4xl">{profile.name[0]?.toUpperCase() || "E"}</span>
              </div>

              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-[#1e2e26] hover:bg-[#254238] text-white border border-[#254238] p-2.5 rounded-full transition-colors flex items-center justify-center"
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

            {!isEditing ? (
              <div className="space-y-1.5 pt-1">
                <h1 className="text-2xl font-black text-white">{profile.name}</h1>
                <div className="flex items-center gap-1.5 text-[#4ade80] font-bold text-sm">
                  <GraduationCap className="w-4 h-4" />
                  {profile.year} • {profile.course}
                </div>
                <div className="flex items-start gap-2 text-slate-400 text-sm mt-4 pt-4 border-t border-slate-800/60">
                  <Target className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="italic leading-relaxed">{profile.goal}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 pt-2 animate-slide-up">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 tracking-widest">
                    <User className="w-3 h-3" /> Nome Completo
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full bg-[#0e1710] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-[#4ade80] outline-none transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 tracking-widest">
                      <GraduationCap className="w-3 h-3" /> Ano Letivo
                    </label>
                    <input
                      type="text"
                      value={profile.year}
                      onChange={(e) => setProfile({ ...profile, year: e.target.value })}
                      className="w-full bg-[#0e1710] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-[#4ade80] outline-none transition-colors"
                      placeholder="Ex: 12º Ano"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 tracking-widest">
                      <BookOpen className="w-3 h-3" /> Área
                    </label>
                    <input
                      type="text"
                      value={profile.course}
                      onChange={(e) => setProfile({ ...profile, course: e.target.value })}
                      className="w-full bg-[#0e1710] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-[#4ade80] outline-none transition-colors"
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
                    className="w-full bg-[#0e1710] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-[#4ade80] outline-none resize-none h-20 transition-colors"
                    placeholder="O que pretendes alcançar?"
                  />
                </div>

                <button 
                  onClick={handleSave} 
                  className="w-full bg-[#4ade80] hover:bg-[#22c55e] text-[#0e1710] font-black tracking-wide text-[15px] py-4 rounded-xl flex items-center justify-center transition-transform active:scale-95"
                >
                  <Save className="w-4 h-4 mr-2" /> Guardar Perfil
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── PERFORMANCE STATS ── */}
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-[#4ade80]" />
          <h2 className="text-xl font-bold text-white">Meu Desempenho</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-[#141e16] border border-[#254238]/60 p-5 rounded-3xl shadow-lg">
            <h3 className="text-sm font-bold text-white mb-4">Evolução da Média Geral</h3>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e2e26" />
                  <XAxis dataKey="mes" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} domain={[0, 20]} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0e1710", border: "1px solid #1e2e26", borderRadius: "12px", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}
                    itemStyle={{ color: "#fff", fontWeight: "bold" }}
                  />
                  <Line type="monotone" dataKey="nota" stroke="#4ade80" strokeWidth={4} dot={{ fill: "#4ade80", r: 4, strokeWidth: 2, stroke: "#0e1710" }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[#141e16] border border-[#254238]/60 p-5 rounded-3xl shadow-lg">
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
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0e1710", border: "1px solid #1e2e26", borderRadius: "12px" }}
                    />
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

        <h3 className="text-lg font-bold text-white mb-4">Notas por Matéria</h3>
        <div className="grid grid-cols-2 gap-3">
          {subjectData.map((sub, i) => (
            <div key={i} className="flex flex-col justify-between bg-[#141e16] border border-slate-800/60 rounded-2xl p-4 transition-all hover:bg-[#1e2e26]">
              <div className="flex justify-between items-start mb-3">
                <p className="font-bold text-slate-200 text-sm leading-tight">{sub.name}</p>
                <div className="bg-[#0e1710] rounded-full p-1 border border-slate-800 shadow-sm">
                  <TrendIcon trend={sub.trend} />
                </div>
              </div>
              <div className="flex items-end gap-1">
                <p className="text-3xl font-black text-white">{sub.score}</p>
                <span className="text-xs text-slate-500 font-bold mb-1 pb-0.5">/ 20</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── VOCATIONAL AI ── */}
        <h3 className="text-lg font-bold text-white mt-8 mb-4">Orientação Vocacional IA</h3>
        <div className="bg-gradient-to-br from-[#141e16] to-[#1e2e26] border border-[#254238]/80 p-6 rounded-3xl shadow-lg relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#4ade80]/15 rounded-full blur-2xl group-hover:bg-[#4ade80]/25 transition-colors duration-500" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[#4ade80]/20 rounded-2xl flex items-center justify-center text-[#4ade80] shadow-[0_0_15px_rgba(74,222,128,0.15)] border border-[#4ade80]/30 shrink-0">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white mb-0.5">Descobre a tua vocação</h4>
                <p className="text-[11px] font-bold text-[#4ade80] uppercase tracking-wider">Análise de IA Especializada</p>
              </div>
            </div>
            
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              A Inteligência Artificial acompanha o teu progresso em tempo real e através de Quizzes Inteligentes avalia a tua inclinação para diferentes áreas profissionais com base no teu perfil e resultados.
            </p>
            
            <Link to="/dashboard/quizzes" className="w-full bg-[#0e1710] hover:bg-[#4ade80] text-[#4ade80] hover:text-[#0e1710] border border-[#4ade80]/50 font-bold text-sm py-4 rounded-2xl flex items-center justify-center gap-2 transition-all group/btn">
              Gerar Quiz Vocacional 
              <Bot className="h-4 w-4 opacity-70 group-hover/btn:opacity-100 transition-opacity" />
            </Link>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#0e1710]/95 backdrop-blur-xl border-t border-[#1a261d] px-6 py-4 flex justify-between items-center z-50">
        {bottomNavItems.map((item, i) => {
          const isActive = location.pathname === item.path || (item.title === 'Perfil' && true);
          return (
            <Link 
              key={i} 
              to={item.path} 
              className={`flex flex-col items-center gap-1.5 transition-colors ${isActive ? "text-[#4ade80]" : "text-slate-500 hover:text-slate-300"}`}
            >
              <item.icon className={`h-[22px] w-[22px] ${isActive ? "stroke-[2.5]" : "stroke-2"}`} />
              <span className={`text-[10px] font-bold tracking-wide ${isActive ? "text-[#4ade80]" : ""}`}>
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
