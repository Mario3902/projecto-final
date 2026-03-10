import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, Minus, Edit3, Save, X, User, BookOpen, GraduationCap, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

const monthlyData = [
  { mes: "Set", nota: 65 },
  { mes: "Out", nota: 70 },
  { mes: "Nov", nota: 68 },
  { mes: "Dez", nota: 75 },
  { mes: "Jan", nota: 79 },
  { mes: "Fev", nota: 82 },
];

const subjects = [
  { name: "Biologia", score: 90, trend: "up" },
  { name: "Matemática", score: 85, trend: "up" },
  { name: "História", score: 82, trend: "stable" },
  { name: "Química", score: 78, trend: "up" },
  { name: "Português", score: 72, trend: "down" },
  { name: "Física", score: 68, trend: "down" },
];

const pieData = [
  { name: "Excelente (>85)", value: 2, color: "hsl(174, 72%, 40%)" },
  { name: "Bom (70-85)", value: 2, color: "hsl(45, 93%, 58%)" },
  { name: "Atenção (<70)", value: 2, color: "hsl(0, 72%, 56%)" },
];

const TrendIcon = ({ trend }: { trend: string }) => {
  if (trend === "up") return <TrendingUp className="h-4 w-4 text-primary" />;
  if (trend === "down") return <TrendingDown className="h-4 w-4 text-destructive" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
};

const Profile = () => {
  // User Profile State
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "Estudante",
    course: "Ciências e Tecnologias",
    year: "12º Ano",
    goal: "Entrar na Universidade de Medicina",
  });

  // Load from local storage
  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    const storedCourse = localStorage.getItem("userCourse");
    const storedYear = localStorage.getItem("userYear");
    const storedGoal = localStorage.getItem("userGoal");

    if (storedName) setProfile(prev => ({ ...prev, name: storedName }));
    if (storedCourse) setProfile(prev => ({ ...prev, course: storedCourse }));
    if (storedYear) setProfile(prev => ({ ...prev, year: storedYear }));
    if (storedGoal) setProfile(prev => ({ ...prev, goal: storedGoal }));
  }, []);

  const handleSave = () => {
    localStorage.setItem("userName", profile.name);
    localStorage.setItem("userCourse", profile.course);
    localStorage.setItem("userYear", profile.year);
    localStorage.setItem("userGoal", profile.goal);
    setIsEditing(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in pb-6">

        {/* ── PROFILE HEADER ── */}
        <div className="relative glass-card rounded-3xl p-6 overflow-hidden mt-6">
          {/* Background decoration */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/20 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-background/40 to-transparent" />

          <div className="relative z-10">
            {/* Profile Picture / Initial */}
            <div className="flex justify-between items-start mb-4">
              <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center shadow-lg border-2 border-background rotate-[-2deg]">
                <span className="text-white font-black text-4xl">{profile.name[0]?.toUpperCase() || "E"}</span>
              </div>

              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-white/10 hover:bg-white/20 text-foreground border border-border p-2 rounded-full transition-colors flex items-center justify-center backdrop-blur-md"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-destructive/10 text-destructive p-2 rounded-full hover:bg-destructive/20 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Profile Info / Edit Form */}
            {!isEditing ? (
              <div className="space-y-1">
                <h1 className="text-2xl font-black text-foreground">{profile.name}</h1>
                <div className="flex items-center gap-1.5 text-primary font-semibold text-sm">
                  <GraduationCap className="w-4 h-4" />
                  {profile.year} • {profile.course}
                </div>
                <div className="flex items-start gap-1.5 text-muted-foreground text-sm mt-3 pt-3 border-t border-border/50">
                  <Target className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="italic leading-tight">{profile.goal}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 pt-2 animate-in slide-in-from-top-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
                    <User className="w-3 h-3" /> Nome Completo
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full bg-background/50 border border-border rounded-xl px-3 py-2 text-sm focus:border-primary outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
                      <GraduationCap className="w-3 h-3" /> Ano
                    </label>
                    <input
                      type="text"
                      value={profile.year}
                      onChange={(e) => setProfile({ ...profile, year: e.target.value })}
                      className="w-full bg-background/50 border border-border rounded-xl px-3 py-2 text-sm focus:border-primary outline-none"
                      placeholder="Ex: 12º Ano"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
                      <BookOpen className="w-3 h-3" /> Curso/Área
                    </label>
                    <input
                      type="text"
                      value={profile.course}
                      onChange={(e) => setProfile({ ...profile, course: e.target.value })}
                      className="w-full bg-background/50 border border-border rounded-xl px-3 py-2 text-sm focus:border-primary outline-none"
                      placeholder="Ex: Ciências"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
                    <Target className="w-3 h-3" /> Objetivo
                  </label>
                  <textarea
                    value={profile.goal}
                    onChange={(e) => setProfile({ ...profile, goal: e.target.value })}
                    className="w-full bg-background/50 border border-border rounded-xl px-3 py-2 text-sm focus:border-primary outline-none resize-none h-16"
                    placeholder="O que pretendes alcançar?"
                  />
                </div>

                <Button onClick={handleSave} className="w-full gradient-primary text-white font-bold h-10 rounded-xl">
                  <Save className="w-4 h-4 mr-2" /> Guardar Perfil
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* ── PERFORMANCE STATS ── */}
        <div className="flex items-center gap-2 pt-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Meu Desempenho</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="glass-card border-none shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Evolução da Média Geral</CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-4">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} domain={[50, 100]} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                    itemStyle={{ color: "hsl(var(--foreground))", fontWeight: "bold" }}
                  />
                  <Line type="monotone" dataKey="nota" stroke="hsl(var(--primary))" strokeWidth={4} dot={{ fill: "hsl(var(--primary))", r: 4, strokeWidth: 2, stroke: "hsl(var(--background))" }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="glass-card border-none shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="pb-0">
              <CardTitle className="text-base">Distribuição das Notas</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col justify-center pb-6">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} dataKey="value" paddingAngle={5} stroke="none">
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "none", borderRadius: "8px" }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="grid grid-cols-3 gap-2 px-2 mt-2">
                {pieData.map((d, i) => (
                  <div key={i} className="flex flex-col items-center gap-1 text-[10px] text-center">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-muted-foreground font-medium leading-tight">{d.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <h3 className="text-lg font-bold text-foreground mt-4 mb-2 px-1">Notas por Matéria</h3>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {subjects.map((sub) => (
            <div key={sub.name} className="flex flex-col justify-between bg-muted/40 border border-border/50 rounded-2xl p-4 transition-all hover:bg-muted/60">
              <div className="flex justify-between items-start mb-2">
                <p className="font-bold text-foreground text-sm leading-tight">{sub.name}</p>
                <div className="bg-background rounded-full p-1 shadow-sm">
                  <TrendIcon trend={sub.trend} />
                </div>
              </div>
              <div className="flex items-end gap-1">
                <p className="text-3xl font-black text-foreground">{sub.score}</p>
                <span className="text-xs text-muted-foreground font-semibold mb-1 pb-0.5">/ 100</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
