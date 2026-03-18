import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";

const INTERESTS = [
  "Tecnologia",
  "Arte",
  "Ciência",
  "Gestão",
  "Saúde",
  "Engenharia",
];

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [grade, setGrade] = useState("10º Ano");
  const [course, setCourse] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["Tecnologia"]);
  const [isLoading, setIsLoading] = useState(false);

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !age || !course || !password || selectedInterests.length === 0) {
      toast({ title: "Preencha todos os campos obrigatórios.", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "A password deve ter no mínimo 6 caracteres.", variant: "destructive" });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "As passwords não coincidem.", variant: "destructive" });
      return;
    }
    
    setIsLoading(true);
    try {
      const resp = await api.register({
        name,
        age: parseInt(age),
        grade,
        course,
        goal: "Sucesso Académico",
        interests: selectedInterests,
        password
      });
      
      localStorage.setItem("nzila_token", resp.token);
      localStorage.setItem("userName", resp.user.name);
      
      toast({ title: "Conta criada com sucesso! 🎉", variant: "default" });
      navigate("/dashboard");
    } catch (err: any) {
      toast({ title: "Erro no registo", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1120] text-white flex flex-col font-sans relative">
      <div className="flex-1 w-full max-w-md mx-auto p-6 animate-slide-up">
        {/* Header */}
        <div className="flex items-center mt-4 mb-8">
          <button onClick={() => navigate(-1)} className="text-white bg-transparent border-0 p-1 -ml-1 hover:bg-white/10 rounded-full transition-colors mr-3 cursor-pointer">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold flex-1 text-center -ml-6">Registro Nzila</h1>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center text-xs font-semibold mb-3">
            <span className="text-[#0ea5e9] tracking-wide">PASSO 1 DE 3</span>
            <span className="text-slate-400">Informações Básicas</span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
            <div className="h-full bg-[#0ea5e9] rounded-full" style={{ width: "33.33%" }}></div>
          </div>
        </div>

        <h2 className="text-[32px] font-bold mb-4 tracking-tight">Crie sua conta</h2>
        <p className="text-slate-400 text-base mb-8 leading-relaxed">
          Conte-nos um pouco sobre você para personalizarmos sua experiência Nzila.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2.5">
            <label className="text-sm font-semibold text-slate-200">Nome Completo</label>
            <Input
              placeholder="Ex: Abel João"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-[52px] bg-[#1a233a] border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-[#0ea5e9] focus-visible:border-[#0ea5e9] rounded-xl text-base px-4"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2.5">
              <label className="text-sm font-semibold text-slate-200">Idade</label>
              <Input
                placeholder="Ex: 17"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="h-[52px] bg-[#1a233a] border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-[#0ea5e9] focus-visible:border-[#0ea5e9] rounded-xl text-base px-4"
              />
            </div>
            <div className="space-y-2.5">
              <label className="text-sm font-semibold text-slate-200">Ano Letivo</label>
              <Select value={grade} onValueChange={setGrade}>
                <SelectTrigger className="h-[52px] bg-[#1a233a] border-slate-800 text-white focus:ring-1 focus:ring-[#0ea5e9] rounded-xl text-base px-4">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent className="bg-[#1a233a] border-slate-800 text-white rounded-xl">
                  <SelectItem value="10º Ano" className="focus:bg-[#0ea5e9]/20 focus:text-white cursor-pointer">10º Ano</SelectItem>
                  <SelectItem value="11º Ano" className="focus:bg-[#0ea5e9]/20 focus:text-white cursor-pointer">11º Ano</SelectItem>
                  <SelectItem value="12º Ano" className="focus:bg-[#0ea5e9]/20 focus:text-white cursor-pointer">12º Ano</SelectItem>
                  <SelectItem value="Ensino Superior" className="focus:bg-[#0ea5e9]/20 focus:text-white cursor-pointer">Ensino Superior</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2.5">
            <label className="text-sm font-semibold text-slate-200">Curso Atual</label>
            <Input
              placeholder="Ex: Ciências Físicas e Biológicas"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="h-[52px] bg-[#1a233a] border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-[#0ea5e9] focus-visible:border-[#0ea5e9] rounded-xl text-base px-4"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2.5">
              <label className="text-sm font-semibold text-slate-200">Password</label>
              <Input
                type="password"
                placeholder="Mín. 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-[52px] bg-[#1a233a] border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-[#0ea5e9] focus-visible:border-[#0ea5e9] rounded-xl text-base px-4"
              />
            </div>
            <div className="space-y-2.5">
              <label className="text-sm font-semibold text-slate-200">Confirmar</label>
              <Input
                type="password"
                placeholder="Repete a password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`h-[52px] bg-[#1a233a] border text-white placeholder:text-slate-500 focus-visible:ring-1 rounded-xl text-base px-4 ${
                  confirmPassword && confirmPassword !== password
                    ? "border-red-500 focus-visible:ring-red-500"
                    : "border-slate-800 focus-visible:ring-[#0ea5e9] focus-visible:border-[#0ea5e9]"
                }`}
              />
            </div>
          </div>
          {confirmPassword && confirmPassword !== password && (
            <p className="text-xs text-red-400 font-medium -mt-3">As passwords não coincidem</p>
          )}

          <div className="space-y-3 pt-2">
            <label className="text-sm font-semibold text-slate-200">Interesses</label>
            <div className="flex flex-wrap gap-3">
              {INTERESTS.map((interest) => {
                const isSelected = selectedInterests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`px-5 py-2.5 rounded-full text-[15px] font-medium transition-all ${
                      isSelected
                        ? "bg-[#0ea5e9] text-white border border-[#0ea5e9] shadow-[0_0_15px_rgba(14,165,233,0.3)]"
                        : "bg-[#1a233a] border border-slate-800 text-slate-300 hover:border-slate-600"
                    }`}
                  >
                    {interest}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-8">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold text-lg rounded-[14px] transition-all"
            >
              <div className="flex items-center justify-center gap-2 w-full">
                <span>{isLoading ? "Processando..." : "Criar conta Nzila"}</span>
                {!isLoading && <ArrowRight className="h-5 w-5 ml-1" />}
              </div>
            </Button>
            <p className="text-center text-[13px] text-slate-500 mt-5 max-w-[280px] mx-auto leading-relaxed">
              Ao continuar, você concorda com nossos Termos de Uso e Política de Privacidade.
            </p>
          </div>
        </form>
      </div>


    </div>
  );
};

export default Register;
