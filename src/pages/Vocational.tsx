import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Compass, ArrowRight, RotateCcw, BookOpen, Sparkles } from "lucide-react";
import { getVocationalAdvice } from "@/lib/gemini";

const quizQuestions = [
  {
    q: "Qual atividade te atrai mais?",
    options: ["Resolver problemas lógicos e programar", "Criar arte, design e comunicação", "Ajudar e cuidar de pessoas", "Investigar a natureza e fazer experiências"],
  },
  {
    q: "Como preferes aprender algo novo?",
    options: ["Construindo ou programando algo", "Desenhando, escrevendo ou criando", "Conversando e trabalhando em grupo", "Pesquisando e lendo artigos"],
  },
  {
    q: "Qual matéria te fascina mais?",
    options: ["Matemática / Física / Informática", "Artes / Literatura / Línguas", "Biologia / Saúde / Ed. Física", "História / Filosofia / Economia"],
  },
  {
    q: "Em que tipo de ambiente queres trabalhar?",
    options: ["Escritório ou laboratório de tecnologia", "Estúdio criativo ou comunicação", "Hospital, escola ou comunidade", "Natureza, campo ou laboratório de ciências"],
  },
  {
    q: "O que mais te motiva num trabalho?",
    options: ["Resolver desafios complexos", "Realizar algo criativo e bonito", "Fazer a diferença na vida das pessoas", "Descobrir e entender como o mundo funciona"],
  },
];

interface Career {
  name: string;
  desc: string;
  icon: string;
}

const fallbackCareers: Career[] = [
  { name: "Engenharia", desc: "Área focada em resolver problemas complexos usando lógica e tecnologia.", icon: "⚙️" },
  { name: "Design & Artes", desc: "Criatividade aplicada em comunicação visual, UX e produção artística.", icon: "🎨" },
  { name: "Saúde", desc: "Dedicação ao bem-estar e cuidado com pessoas em diversas especialidades.", icon: "🏥" },
  { name: "Ciências Sociais", desc: "Compreensão da sociedade, cultura e relações humanas.", icon: "📚" },
];

const Vocational = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [careers, setCareers] = useState<Career[]>([]);

  const userProfile = (() => {
    const profile = localStorage.getItem("nzila_profile");
    const courseData = localStorage.getItem("nzila_course_data");
    const p = profile ? JSON.parse(profile) : {};
    const c = courseData ? JSON.parse(courseData) : {};
    const parts = [];
    if (p.name) parts.push(`Nome: ${p.name}`);
    if (p.year) parts.push(`Ano: ${p.year}`);
    if (c.courseName) parts.push(`Curso: ${c.courseName}`);
    if (p.goal) parts.push(`Objetivo: ${p.goal}`);
    return parts.join(", ") || "Estudante sem perfil definido";
  })();

  const handleAnswer = async (optionText: string) => {
    const newAnswers = [...answers, optionText];
    setAnswers(newAnswers);

    if (step + 1 >= quizQuestions.length) {
      setFinished(true);
      setIsLoading(true);
      try {
        const result = await getVocationalAdvice(newAnswers, userProfile);
        if (result && Array.isArray(result) && result.length > 0) {
          setCareers(result);
        } else {
          setCareers(fallbackCareers);
        }
      } catch {
        setCareers(fallbackCareers);
      }
      setIsLoading(false);
    } else {
      setStep((s) => s + 1);
    }
  };

  const restart = () => {
    setStep(0);
    setAnswers([]);
    setFinished(false);
    setCareers([]);
  };

  if (finished) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto space-y-6 animate-slide-up">
          <div className="text-center">
            <div className="text-5xl mb-3">{isLoading ? "🤔" : "🎯"}</div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {isLoading ? "A analisar o teu perfil..." : "Carreiras Sugeridas pela IA"}
            </h1>
            {isLoading ? (
              <p className="text-muted-foreground">O Nzila está a processar as tuas respostas 🤖✨</p>
            ) : (
              <p className="text-muted-foreground">Com base nas tuas respostas e perfil, o Nzila sugere:</p>
            )}
          </div>

          {!isLoading && careers.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {careers.map((career, i) => (
                <Card key={i} className="glass-card hover:scale-[1.02] transition-transform">
                  <CardContent className="p-6">
                    <div className="text-4xl mb-3">{career.icon}</div>
                    <h3 className="font-bold text-foreground text-lg">{career.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{career.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button onClick={restart} variant="outline" className="gap-2">
                <RotateCcw className="h-4 w-4" /> Refazer quiz
              </Button>
              <Button onClick={() => navigate("/dashboard/subjects")} className="gradient-primary text-primary-foreground gap-2">
                <BookOpen className="h-4 w-4" /> Ver as minhas matérias
              </Button>
            </div>
          )}
        </div>
      </DashboardLayout>
    );
  }

  const question = quizQuestions[step];

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="gradient-primary rounded-xl p-2.5 text-primary-foreground">
            <Compass className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Orientação Vocacional</h1>
            <p className="text-sm text-muted-foreground">Pergunta {step + 1} de {quizQuestions.length}</p>
          </div>
          <div className="ml-auto flex items-center gap-1 text-xs text-primary font-semibold bg-primary/10 px-2.5 py-1 rounded-full">
            <Sparkles className="h-3.5 w-3.5" />
            IA Real
          </div>
        </div>

        <Card className="glass-card animate-scale-in" key={step}>
          <CardContent className="p-8">
            <h2 className="text-xl font-semibold text-foreground mb-6">{question.q}</h2>
            <div className="space-y-3">
              {question.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(opt)}
                  className="w-full text-left px-5 py-4 rounded-xl border-2 border-border hover:border-primary bg-muted/30 hover:bg-primary/5 font-medium text-sm transition-all flex items-center justify-between group"
                >
                  <span>{opt}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Vocational;
