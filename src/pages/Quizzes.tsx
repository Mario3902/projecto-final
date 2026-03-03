import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, ArrowRight, SkipForward, RotateCcw, Timer } from "lucide-react";
import { useGame } from "@/context/GameContext";

// Simple web audio beep generator
const playTone = (freq: number, type: OscillatorType, duration: number) => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);

    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
  } catch (e) {
    console.log("Audio not supported or disabled");
  }
};

const questions = [
  {
    q: "Qual é a fórmula da velocidade média?",
    options: ["v = d/t", "v = d×t", "v = t/d", "v = d²/t"],
    correct: 0,
  },
  {
    q: "Quem escreveu 'Dom Casmurro'?",
    options: ["José de Alencar", "Machado de Assis", "Graciliano Ramos", "Carlos Drummond"],
    correct: 1,
  },
  {
    q: "Qual é o elemento químico com símbolo 'Fe'?",
    options: ["Fósforo", "Flúor", "Ferro", "Fermio"],
    correct: 2,
  },
  {
    q: "Em que ano o Brasil se tornou independente?",
    options: ["1808", "1822", "1889", "1500"],
    correct: 1,
  },
  {
    q: "Qual é a raiz quadrada de 144?",
    options: ["11", "12", "13", "14"],
    correct: 1,
  },
];

const Quizzes = () => {
  const { completeQuiz } = useGame();
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>([]);

  // Timer state
  const [timeLeft, setTimeLeft] = useState(30);

  const question = questions[current];
  const progress = ((current + (answered ? 1 : 0)) / questions.length) * 100;

  // Question Timer
  useEffect(() => {
    if (finished || answered) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [current, answered, finished]);

  const handleTimeOut = () => {
    if (answered) return;
    setAnswered(true);
    setAnswers((a) => [...a, null]);
    playTone(200, "sawtooth", 0.5); // Wrong sound
  };

  const handleSelect = (idx: number) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);

    if (idx === question.correct) {
      setScore((s) => s + 1);
      playTone(600, "sine", 0.3); // Success sound
    } else {
      playTone(200, "sawtooth", 0.4); // Wrong sound
    }

    setAnswers((a) => [...a, idx]);
  };

  const next = () => {
    if (current + 1 >= questions.length) {
      setFinished(true);
      completeQuiz(score + (selected === question.correct ? 1 : 0), questions.length);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setAnswered(false);
      setTimeLeft(30); // reset timer
    }
  };

  const skip = () => {
    setAnswers((a) => [...a, null]);
    next();
  };

  const restart = () => {
    setCurrent(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setFinished(false);
    setAnswers([]);
    setTimeLeft(30);
  };

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <DashboardLayout>
        <div className="max-w-lg mx-auto text-center animate-slide-up">
          <div className={`text-7xl mb-4 ${pct >= 70 ? "" : ""}`}>{pct >= 70 ? "🎉" : "📚"}</div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Quiz Finalizado!</h1>
          <p className="text-muted-foreground mb-6">
            Você acertou <span className="font-bold text-primary">{score}</span> de {questions.length} perguntas ({pct}%)
          </p>
          <Card className="glass-card mb-6">
            <CardContent className="p-6 space-y-3">
              {questions.map((q, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-left">
                  {answers[i] === q.correct ? (
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  )}
                  <span className="text-foreground">{q.q}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Button onClick={restart} className="gradient-primary text-primary-foreground gap-2">
            <RotateCcw className="h-4 w-4" /> Tentar novamente
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <div className="flex justify-between items-center text-sm text-muted-foreground mb-2">
            <span>Pergunta {current + 1} de {questions.length}</span>
            <div className={`flex items-center gap-1 font-bold ${timeLeft <= 5 ? "text-destructive animate-pulse" : "text-foreground"}`}>
              <Timer className="h-4 w-4" />
              <span>00:{timeLeft.toString().padStart(2, "0")}</span>
            </div>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="glass-card animate-scale-in" key={current}>
          <CardContent className="p-8">
            <h2 className="text-xl font-semibold text-foreground mb-6">{question.q}</h2>

            <div className="space-y-3">
              {question.options.map((opt, idx) => {
                let style = "bg-muted/50 border-border hover:border-primary/50";
                if (answered) {
                  if (idx === question.correct) style = "bg-primary/10 border-primary text-primary";
                  else if (idx === selected) style = "bg-destructive/10 border-destructive text-destructive";
                  else style = "bg-muted/30 border-border opacity-50";
                } else if (idx === selected) {
                  style = "bg-primary/10 border-primary";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    disabled={answered}
                    className={`w-full text-left px-5 py-4 rounded-xl border-2 font-medium text-sm transition-all ${style}`}
                  >
                    <span className="mr-3 text-muted-foreground">{String.fromCharCode(65 + idx)}.</span>
                    {opt}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between mt-8">
              <Button variant="ghost" onClick={skip} disabled={answered} className="text-muted-foreground gap-1">
                <SkipForward className="h-4 w-4" /> Pular
              </Button>
              {answered && (
                <Button onClick={next} className="gradient-primary text-primary-foreground gap-1">
                  {current + 1 >= questions.length ? "Ver resultado" : "Próxima"} <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Quizzes;
