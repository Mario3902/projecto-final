import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  BarChart3, Compass, CheckSquare, Sparkles, Brain, MessageCircle, LogOut, Menu,
} from "lucide-react";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const navItems = [
  { title: "Painel", icon: BarChart3, path: "/dashboard" },
  { title: "Orientação Vocacional", icon: Compass, path: "/dashboard/vocational" },
  { title: "Desempenho", icon: Brain, path: "/dashboard/performance" },
  { title: "Tarefas", icon: CheckSquare, path: "/dashboard/tasks" },
  { title: "Quizzes", icon: Sparkles, path: "/dashboard/quizzes" },
  { title: "Chat IA", icon: MessageCircle, path: "/dashboard/chat" },
];

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full z-40 bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 flex flex-col ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          {!collapsed && <Logo size="sm" showText />}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="text-sidebar-foreground hover:bg-sidebar-accent shrink-0"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 py-4 space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.title}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-2 border-t border-sidebar-border">
          <button
            onClick={() => navigate("/login")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent transition-all"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className={`flex-1 transition-all duration-300 ${collapsed ? "ml-16" : "ml-64"}`}>
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
