import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

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

const Performance = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Desempenho Acadêmico 📊</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="glass-card lg:col-span-2">
            <CardHeader>
              <CardTitle>Evolução da Média</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[50, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Line type="monotone" dataKey="nota" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ fill: "hsl(var(--primary))", r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Distribuição</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={4}>
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
            <div className="px-6 pb-4 space-y-2">
              {pieData.map((d, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-muted-foreground">{d.name}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Notas por Matéria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((sub) => (
                <div key={sub.name} className="flex items-center justify-between bg-muted/40 rounded-xl p-4">
                  <div>
                    <p className="font-semibold text-foreground text-sm">{sub.name}</p>
                    <p className="text-2xl font-bold text-foreground">{sub.score}</p>
                  </div>
                  <TrendIcon trend={sub.trend} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Performance;
