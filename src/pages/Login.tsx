import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Logo from "@/components/Logo";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !password) {
      toast({ title: "Preencha todos os campos obrígatórios.", variant: "destructive" });
      return;
    }
    
    setIsLoading(true);
    try {
      // In this version the "email" field serves as the user's name for login
      // as our simplistic backend uses "name" to identify users.
      const resp = await api.login({ name, password });
      
      localStorage.setItem("nzila_token", resp.token);
      localStorage.setItem("userName", resp.user.name);

      // Fetch and cache the full profile (course, goal, etc.) for other pages
      try {
        const profile = await api.getProfile();
        localStorage.setItem("nzila_profile", JSON.stringify(profile));
      } catch (e) {
        console.warn("Perfil não carregado após login:", e);
      }
      
      toast({ title: "Bem-vindo de volta! 👋", variant: "default" });
      navigate("/dashboard");
    } catch (err: any) {
      toast({ title: "Acesso negado", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-60 h-60 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-1/3 right-10 w-40 h-40 rounded-full bg-accent/15 blur-2xl" />
        <div className="relative z-10 text-center px-12 animate-slide-up">
          <div className="flex justify-center mb-8">
            <div className="gradient-primary rounded-3xl p-5 text-primary-foreground animate-float">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-primary-foreground mb-4">
            Transforme seu<br />aprendizado
          </h2>
          <p className="text-primary-foreground/60 text-lg max-w-sm mx-auto">
            Inteligência artificial e ferramentas modernas para impulsionar sua jornada acadêmica.
          </p>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="lg:hidden flex justify-center mb-8">
            <Logo size="lg" />
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-2">Entrar</h1>
          <p className="text-muted-foreground mb-8">
            Acesse sua conta para continuar aprendendo
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="O teu nome de utilizador"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-11 h-12 bg-muted/50 border-border"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-11 pr-11 h-12 bg-muted/50 border-border"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <div className="flex justify-end">
              <button type="button" className="text-sm text-primary hover:underline font-medium">
                Esqueci minha senha
              </button>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 gradient-primary text-primary-foreground font-semibold text-base hover:opacity-90 transition-opacity"
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-sm text-muted-foreground">ou continue com</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-12 font-medium">
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </Button>
            <Button variant="outline" className="h-12 font-medium">
              <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </Button>
          </div>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Não tem uma conta?{" "}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
