import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Compass, ArrowRight, RotateCcw } from "lucide-react";

const quizQuestions = [
  {
    q: "Qual atividade te atrai mais?",
    options: ["Resolver problemas lógicos", "Criar arte ou design", "Ajudar pessoas", "Investigar a natureza"],
  },
  {
    q: "Em um trabalho em grupo, você prefere:",
    options: ["Planejar e organizar", "Liderar o time", "Pesquisar informações", "Apresentar o resultado"],
  },
  {
    q: "Qual matéria você mais gosta?",
    options: ["Matemática/Física", "Artes/Literatura", "Biologia/Saúde", "História/Sociologia"],
  },
];

const careerResults = [
  { name: "Engenharia", desc: "Área focada em resolver problemas complexos usando lógica e tecnologia.", icon: "⚙️" },
  { name: "Design & Artes", desc: "Criatividade aplicada em comunicação visual, UX e produção artística.", icon: "🎨" },
  { name: "Saúde", desc: "Dedicação ao bem-estar e cuidado com pessoas em diversas especialidades.", icon: "🏥" },
  { name: "Ciências Humanas", desc: "Compreensão da sociedade, cultura e relações humanas.", icon: "📚" },
];

const Vocational = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);

  const handleAnswer = (idx: number) => {
    const newAnswers = [...answers, idx];
    setAnswers(newAnswers);
    if (step + 1 >= quizQuestions.length) {
      setFinished(true);
    } else {
      setStep((s) => s + 1);
    }
  };

  const restart = () => {
    setStep(0);
    setAnswers([]);
    setFinished(false);
  };

  if (finished) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto space-y-6 animate-slide-up">
          <div className="text-center">
            <div className="text-5xl mb-3">🎯</div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Suas Carreiras Sugeridas</h1>
            <p className="text-muted-foreground">Com base nas suas respostas, aqui estão algumas áreas que combinam com você.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {careerResults.map((career) => (
              <Card key={career.name} className="glass-card hover:scale-[1.02] transition-transform">
                <CardContent className="p-6">
                  <div className="text-4xl mb-3">{career.icon}</div>
                  <h3 className="font-bold text-foreground text-lg">{career.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{career.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button onClick={restart} variant="outline" className="gap-2">
              <RotateCcw className="h-4 w-4" /> Refazer quiz
            </Button>
          </div>
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
        </div>

        <Card className="glass-card animate-scale-in" key={step}>
          <CardContent className="p-8">
            <h2 className="text-xl font-semibold text-foreground mb-6">{question.q}</h2>
            <div className="space-y-3">
              {question.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
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
