import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Compass, CheckSquare, Sparkles, Brain, MessageCircle, BookOpen, User,
} from "lucide-react";
import { useGame } from "@/context/GameContext";

const navItems = [
  { title: "Início", icon: LayoutDashboard, path: "/dashboard" },
  { title: "Planner", icon: CheckSquare, path: "/dashboard/tasks" },
  { title: "IA", icon: Brain, path: "/dashboard/chat" },
  { title: "Cursos", icon: BookOpen, path: "/dashboard/subjects" },
  { title: "Perfil", icon: User, path: "/dashboard/performance" },
];

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { xp, level, streak } = useGame();

  return (
    <div className="flex flex-col min-h-screen w-full bg-background max-w-md mx-auto relative">
      {/* Top Header */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between px-4 border-b border-border bg-background">
        <div className="flex items-center gap-1.5">
          {/* Logo */}
          <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
            <span className="text-white text-xs font-black">N</span>
          </div>
          <span className="font-bold text-foreground text-sm">Nzila</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-muted/60 px-2.5 py-1 rounded-full border border-border/50">
            <span className="text-orange-500 text-xs font-bold">🔥{streak}</span>
            <div className="w-px h-3 bg-border" />
            <span className="text-yellow-500 text-xs font-bold">⭐Lv{level}</span>
            <div className="w-px h-3 bg-border" />
            <span className="text-primary text-xs font-bold">✨{xp}XP</span>
          </div>
        </div>
      </header>

      {/* Main content – padded so content clears the fixed bottom nav */}
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="p-4">
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 bg-background border-t border-border">
        <div className="flex items-center justify-around py-2 px-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${isActive
                    ? "text-primary"
                    : "text-muted-foreground/60 hover:text-muted-foreground"
                  }`}
              >
                <div className={`p-1.5 rounded-lg transition-all ${isActive ? "bg-primary/10" : ""}`}>
                  <item.icon className={`h-5 w-5 ${isActive ? "stroke-[2.5]" : "stroke-[1.5]"}`} />
                </div>
                <span className={`text-[10px] font-semibold tracking-tight ${isActive ? "text-primary" : ""}`}>
                  {item.title}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default DashboardLayout;
