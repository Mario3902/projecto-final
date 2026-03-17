import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle2, XCircle, ArrowRight, SkipForward, RotateCcw, Timer, Sparkles, BookOpen,
  Flame, User, Zap, Play, Calculator, FlaskConical, BookA, Home, Trophy, Briefcase, Bot
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { generateQuiz, generateVocationalQuestions, getVocationalAdvice } from "@/lib/gemini";

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

interface Question {
  q: string;
  options: string[];
  correct: number;
}

const Quizzes = () => {
  const { completeQuiz, level } = useGame();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isVocational, setIsVocational] = useState(false);
  const [vocationalResult, setVocationalResult] = useState<any>(null);

  // Read user course data from localStorage
  const courseData = (() => {
    const stored = localStorage.getItem("nzila_course_data");
    return stored ? JSON.parse(stored) : null;
  })();
  
  const userProfile = (() => {
    const stored = localStorage.getItem("nzila_profile");
    return stored ? JSON.parse(stored) : { course: "Geral", year: "N/A", goal: "Descobrir a vocação" };
  })();

  const subjects = courseData?.subjects.map((s: any) => ({
    id: s.id,
    name: s.name,
    emoji: s.emoji ?? "📚",
    promptContext: s.materials?.map((m: any) => m.content).filter(Boolean).join("\n\n") || `Matéria: ${s.name}`,
    color: "bg-[#1e2e26]", // default fallback
    iconColor: "text-[#4ade80]"
  })) ?? [];

  // Specific "Para Ti" quizzes
  const PARA_TI = [
    { id: "p1", title: "Lógica e Raciocínio", questions: 15, time: 10, xp: 150, color: "bg-[#254238]", icon: "Σ", iconColor: "text-[#4ade80]", context: "Desafios de lógica matemática e raciocínio abstrato" },
    { id: "p2", title: "Física Aplicada", questions: 10, time: 12, xp: 200, color: "bg-[#283854]", icon: "◿", iconColor: "text-[#60a5fa]", context: "Física aplicada ao mundo real, mecânica e termodinâmica" },
    { id: "p3", title: "Geografia de Angola", questions: 20, time: 15, xp: 300, color: "bg-[#453e36]", icon: "🌍", iconColor: "text-[#fbbf24]", context: "Geografia física, política e económica de Angola" },
  ];

  const startSpecificQuiz = async (title: string, context: string, numQuestions: number) => {
    setSelectedSubject(title);
    setIsLoadingQuiz(true);
    setLoadError(null);
    try {
      const result = await generateQuiz(title, context, numQuestions);
      if (result && Array.isArray(result) && result.length > 0) {
        setQuestions(result);
        setIsVocational(false);
        setVocationalResult(null);
        setCurrent(0);
        setSelected(null);
        setAnswered(false);
        setScore(0);
        setFinished(false);
        setAnswers([]);
        setTimeLeft(30);
      } else {
        setLoadError("A IA não conseguiu gerar o quiz. Tente novamente.");
      }
    } catch {
      setLoadError("Erro ao gerar o quiz. Verifica a tua conexão.");
    }
    setIsLoadingQuiz(false);
  };

  const startVocationalQuiz = async () => {
    setIsLoadingQuiz(true);
    setLoadError(null);
    setSelectedSubject("Teste Vocacional");
    try {
      const contextString = `Área: ${userProfile.course || 'Geral'}, Ano: ${userProfile.year || '12º'}, Objetivo: ${userProfile.goal || 'Carreira'}`;
      const result = await generateVocationalQuestions(contextString, 7);
      if (result && Array.isArray(result) && result.length > 0) {
        setQuestions(result);
        setIsVocational(true);
        setVocationalResult(null);
        setCurrent(0);
        setSelected(null);
        setAnswered(false);
        setScore(0);
        setFinished(false);
        setAnswers([]);
        setTimeLeft(30);
      } else {
        setLoadError("A IA não conseguiu gerar o teste vocacional. Tente novamente.");
      }
    } catch {
      setLoadError("Erro ao processar as questões vocacionais.");
    }
    setIsLoadingQuiz(false);
  };

  // Timer
  useEffect(() => {
    if (questions.length === 0 || finished || answered) return;
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
  }, [current, answered, finished, questions]);

  const handleTimeOut = () => {
    if (answered) return;
    setAnswered(true);
    setAnswers((a) => [...a, null]);
    playTone(200, "sawtooth", 0.5);
  };

  const handleSelect = (idx: number) => {
    if (answered || questions.length === 0) return;
    const question = questions[current];
    setSelected(idx);
    setAnswered(true);
    if (!isVocational) {
      if (idx === question.correct) {
        setScore((s) => s + 1);
        playTone(600, "sine", 0.3);
      } else {
        playTone(200, "sawtooth", 0.4);
      }
    } else {
      playTone(400, "sine", 0.1);
    }
    setAnswers((a) => [...a, idx]);
  };

  const next = async () => {
    const question = questions[current];
    if (current + 1 >= questions.length) {
      if (!isVocational) {
        const finalScore = score + (selected === question.correct ? 1 : 0);
        setFinished(true);
        completeQuiz(finalScore, questions.length);
      } else {
        setIsLoadingQuiz(true);
        try {
          // Extrair respostas selecionadas (os textos) para enviar
          const finalAnswers = [...answers].map((ansIdx, i) => 
            ansIdx !== null ? questions[i].options[ansIdx as number] : "Sem resposta"
          );
          const contextString = `Área: ${userProfile.course || 'Geral'}, Ano: ${userProfile.year || '12º Ano'}`;
          const advice = await getVocationalAdvice(finalAnswers, contextString);
          setVocationalResult(advice);
          setFinished(true);
        } catch {
          setLoadError("A IA não conseguiu analisar o perfil vocacional nesta ocasião.");
        }
        setIsLoadingQuiz(false);
      }
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setAnswered(false);
      setTimeLeft(30);
    }
  };

  const skip = () => {
    setAnswers((a) => [...a, null]);
    next();
  };

  const restart = () => {
    setSelectedSubject(null);
    setQuestions([]);
    setCurrent(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setFinished(false);
    setAnswers([]);
    setTimeLeft(30);
    setIsVocational(false);
    setVocationalResult(null);
  };

  const bottomNavItems = [
    { title: "Início", path: "/dashboard", icon: Home },
    { title: "Quizzes", path: "/dashboard/quizzes", icon: BookOpen },
    { title: "Ranking", path: "/dashboard/ranking", icon: Trophy },
    { title: "Carreira", path: "/dashboard/carreira", icon: Briefcase },
    { title: "Perfil", path: "/dashboard/performance", icon: User },
  ];

  // ── Finished Screen (Vocational) ─────────────────────────────────────────────
  if (finished && isVocational && vocationalResult) {
    return (
      <div className="min-h-screen bg-[#0e1710] text-white flex flex-col font-sans pb-20">
        <div className="max-w-md mx-auto w-full p-6 animate-slide-up mt-6 relative z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[250px] h-[150px] bg-[#60a5fa]/20 blur-[80px] -z-10 rounded-full" />
          
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-[#1a261d] to-[#1e2e26] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#60a5fa]/30 shadow-[0_0_40px_rgba(96,165,250,0.25)]">
               <Sparkles className="h-10 w-10 text-[#60a5fa]" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Relatório Vocacional</h1>
            <p className="text-[13px] text-slate-300 leading-relaxed font-medium">
              Com base nas tuas respostas e perfil, a IA determinou a tua verdadeira inclinação.
            </p>
          </div>

          <div className="bg-[#141e16] border border-[#283854] rounded-[24px] p-6 mb-6 shadow-xl shadow-[#0e1710]">
            <h2 className="text-sm font-bold text-[#60a5fa] mb-3 flex items-center gap-2">
               <User className="h-4 w-4" /> A tua Inclinação Principal
            </h2>
            <p className="text-[14px] font-medium text-slate-200 leading-relaxed mb-6">
              {vocationalResult.inclination}
            </p>

            <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
               <BookOpen className="h-3.5 w-3.5" /> O teu Foco de Estudo Ideal
            </h2>
            <div className="flex flex-wrap gap-2">
              {vocationalResult.focusSubjects?.map((sub: string, i: number) => (
                <span key={i} className="bg-[#1e2e26] border border-[#254238] text-[#4ade80] px-3.5 py-1.5 rounded-full text-xs font-bold">
                  {sub}
                </span>
              ))}
            </div>
          </div>

          <h2 className="text-lg font-bold text-white mb-4 ml-2">Caminhos a Seguir</h2>
          <div className="space-y-3 mb-8">
            {vocationalResult.careers?.map((car: any, i: number) => (
              <div key={i} className="bg-gradient-to-r from-[#141e16] to-[#1e2e26] border border-[#254238]/60 p-5 rounded-3xl flex items-start gap-4 shadow-lg hover:border-[#60a5fa]/40 transition-colors">
                 <div className="text-3xl shrink-0 drop-shadow-md">{car.icon || "🎓"}</div>
                 <div className="flex-1 min-w-0">
                    <h4 className="text-[15px] font-bold text-white leading-tight mb-1">{car.name}</h4>
                    <p className="text-[12px] text-slate-400 leading-relaxed font-medium">{car.desc}</p>
                 </div>
              </div>
            ))}
          </div>

          <Button onClick={restart} className="w-full bg-[#60a5fa] hover:bg-[#3b82f6] text-[#0e1710] font-black text-base h-14 rounded-[20px] transition-transform active:scale-95 shadow-[0_10px_30px_rgba(96,165,250,0.2)]">
            <Home className="h-5 w-5 mr-2" /> Voltar aos Quizzes
          </Button>
        </div>
      </div>
    );
  }

  // ── Finished Screen (Standard) ──────────────────────────────────────────────
  if (finished && !isVocational && questions.length > 0) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="min-h-screen bg-[#0e1710] text-white flex flex-col font-sans pb-20">
        <div className="max-w-md mx-auto w-full p-6 text-center animate-slide-up mt-10">
          <div className="text-7xl mb-4">{pct >= 70 ? "🎉" : "📚"}</div>
          <h1 className="text-3xl font-bold text-white mb-2">Quiz Finalizado!</h1>
          <p className="text-slate-400 mb-6">
            Acertaste <span className="font-bold text-[#4ade80]">{score}</span> de {questions.length} perguntas ({pct}%)
          </p>
          <Card className="bg-[#1a261d] border-slate-800/80 mb-6">
            <CardContent className="p-6 space-y-3">
              {questions.map((q, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-left">
                  {answers[i] === q.correct ? (
                    <CheckCircle2 className="h-5 w-5 text-[#4ade80] shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  )}
                  <span className="text-slate-200">{q.q}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Button onClick={restart} className="w-full bg-[#4ade80] hover:bg-[#22c55e] text-[#0e1710] font-bold text-base h-12 rounded-xl">
            <RotateCcw className="h-4 w-4 mr-2" /> Escolher outro Quiz
          </Button>
        </div>
      </div>
    );
  }

  // ── Loading Screen ───────────────────────────────────────────────────────────
  if (isLoadingQuiz) {
    return (
      <div className="min-h-screen bg-[#0e1710] text-white flex items-center justify-center font-sans">
        <div className="flex flex-col items-center justify-center h-64 gap-4 animate-fade-in px-6 text-center">
          <div className="w-20 h-20 bg-[#1a261d] border border-[#22c55e]/30 rounded-2xl flex items-center justify-center animate-pulse">
            <Sparkles className="h-10 w-10 text-[#4ade80]" />
          </div>
          <h2 className="text-2xl font-bold text-white mt-4">{finished ? "A avaliar o teu futuro..." : "A gerar com IA..."}</h2>
          <p className="text-base text-slate-400">{finished ? "Criando o teu relatório vocacional minucioso 🧠" : `Criando perguntas exclusivas sobre ${selectedSubject} 🤖`}</p>
        </div>
      </div>
    );
  }

  // ── Active Quiz ──────────────────────────────────────────────────────────────
  if (selectedSubject && questions.length > 0) {
    const question = questions[current];
    const progress = ((current + (answered ? 1 : 0)) / questions.length) * 100;

    return (
      <div className="min-h-screen bg-[#0e1710] text-white flex flex-col font-sans pb-20">
        <div className="max-w-md mx-auto w-full p-6 animate-slide-up">
          <div className="mb-6 mt-4">
            <div className="flex justify-between items-center text-sm text-slate-400 mb-3">
              <span className="font-medium text-slate-300">Pergunta {current + 1} de {questions.length}</span>
              <div className={`flex items-center gap-1.5 font-bold ${timeLeft <= 5 ? "text-red-500 animate-pulse" : "text-white"}`}>
                <Timer className="h-4 w-4" />
                <span>00:{timeLeft.toString().padStart(2, "0")}</span>
              </div>
              <span className="text-[#4ade80] font-bold">{Math.round(progress)}%</span>
            </div>
            <div className="h-2.5 w-full bg-[#1a261d] rounded-full overflow-hidden flex">
              <div className="h-full bg-[#4ade80] transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>
          </div>

          <Card className="bg-[#1a261d] border-[#254238] rounded-2xl" key={current}>
            <CardContent className="p-6 sm:p-8">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-6 leading-relaxed">{question.q}</h2>
              <div className="space-y-3.5">
                {question.options.map((opt, idx) => {
                  let style = "bg-[#0e1710] border-slate-800 hover:border-[#4ade80]/50 text-slate-200";
                  if (answered) {
                    if (isVocational) {
                      if (idx === selected) style = "bg-[#60a5fa]/20 border-[#60a5fa] text-[#60a5fa] shadow-[0_5px_15px_rgba(96,165,250,0.1)]";
                      else style = "bg-[#0e1710] border-slate-800 text-slate-500 opacity-50";
                    } else {
                      if (idx === question.correct) style = "bg-[#4ade80]/20 border-[#4ade80] text-[#4ade80]";
                      else if (idx === selected) style = "bg-red-500/10 border-red-500 text-red-500";
                      else style = "bg-[#0e1710] border-slate-800 text-slate-500 opacity-50";
                    }
                  } else if (idx === selected) {
                    style = isVocational
                      ? "bg-[#60a5fa]/10 border-[#60a5fa]/50 text-[#60a5fa]"
                      : "bg-[#4ade80]/10 border-[#4ade80]/50 text-[#4ade80]";
                  }
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelect(idx)}
                      disabled={answered}
                      className={`w-full text-left px-5 py-4 rounded-xl border-2 font-semibold text-[15px] transition-all ${style}`}
                    >
                      {!isVocational && <span className="mr-3 font-bold opacity-60">{String.fromCharCode(65 + idx)}.</span>}
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-between mt-8">
                <Button variant="ghost" onClick={skip} disabled={answered} className="text-slate-400 hover:text-white hover:bg-white/5 gap-1.5">
                  <SkipForward className="h-4 w-4" /> Pular
                </Button>
                {answered && (
                  <Button onClick={next} className={`${isVocational ? "bg-[#60a5fa] hover:bg-[#3b82f6]" : "bg-[#4ade80] hover:bg-[#22c55e]"} text-[#0e1710] font-bold px-6 rounded-xl gap-1.5 transition-transform active:scale-95`}>
                    {current + 1 >= questions.length ? "Ver resultado" : "Próxima"} <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ── Main Dashboard Screen (from the image) ───────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0e1710] text-white flex flex-col font-sans pb-24 relative overflow-x-hidden">
      <div className="max-w-md mx-auto w-full px-5 py-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mt-2 mb-6">
          <div>
            <h3 className="text-[#4ade80] text-[10px] sm:text-xs font-black tracking-[0.2em] uppercase mb-0.5">Nzila AI</h3>
            <h1 className="text-3xl sm:text-[34px] font-bold text-white m-0">Quizzes</h1>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/20 px-3 py-1.5 rounded-full">
              <Flame className="h-3.5 w-3.5 fill-[#4ade80]" />
              <span className="text-xs sm:text-sm font-bold">7 Dias</span>
            </div>
            <div className="h-10 w-10 min-w-10 rounded-full bg-[#1a261d] border border-slate-700 flex items-center justify-center shrink-0 ml-1">
              <User className="h-5 w-5 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Level Progress */}
        <div className="bg-[#1a261d] border border-[#254238] rounded-[20px] p-5 mb-8">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[15px] font-semibold text-slate-300">Progresso do Nível</span>
            <span className="text-[15px] font-bold text-[#4ade80]">Nível {level || 12}</span>
          </div>
          <div className="h-3.5 w-full bg-[#1e2e26] rounded-full overflow-hidden flex">
            <div className="h-full bg-[#4ade80] rounded-full" style={{ width: "65%" }}></div>
          </div>
        </div>

        {/* Desafio Adaptativo */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-6 w-6 rounded border border-[#4ade80] flex items-center justify-center">
              <Zap className="h-3.5 w-3.5 text-[#4ade80] fill-[#4ade80]" />
            </div>
            <h2 className="text-xl font-bold">Desafio Adaptativo</h2>
          </div>
          
          <div className="bg-[#4ade80] rounded-[32px] p-6 relative overflow-hidden shadow-[0_10px_40px_rgba(74,222,128,0.15)]">
            <div className="pr-12">
              <h3 className="text-[#0e1710] text-[22px] font-black leading-tight mb-3">Preparação para Engenharia</h3>
              <div className="flex items-center gap-2.5 text-[#0e1710] font-bold text-[11px] mb-6 flex-wrap">
                <span className="bg-[#0e1710]/10 px-2.5 py-1 rounded tracking-wider uppercase">Nível Médio</span>
                <span className="flex items-center gap-1 opacity-70">
                  <Timer className="h-3 w-3" /> Expira em 04:52
                </span>
              </div>
            </div>
            
            <div className="absolute top-6 right-6 h-10 w-10 rounded-full bg-[#0e1710]/10 flex items-center justify-center">
              <Zap className="h-5 w-5 text-[#0e1710]" />
            </div>

            <div className="flex items-center justify-between mt-2">
              <div className="flex -space-x-3">
                <div className="h-10 w-10 rounded-full bg-[#0e1710] border-2 border-[#4ade80]"></div>
                <div className="h-10 w-10 rounded-full bg-[#1a261d] border-2 border-[#4ade80]"></div>
                <div className="h-10 w-10 rounded-full bg-[#94a3b8] border-2 border-[#4ade80] flex items-center justify-center">
                  <span className="text-[10px] font-bold text-[#0e1710]">+12</span>
                </div>
              </div>
              <button 
                onClick={() => startSpecificQuiz("Desafio: Engenharia", "Matemática e Física aplicadas à Engenharia", 10)}
                className="bg-[#0e1710] text-white px-5 py-3 rounded-2xl font-bold text-sm transition-transform active:scale-95"
              >
                Iniciar Quiz
              </button>
            </div>
          </div>
        </div>

        {/* AI Vocational Assessment */}
        <div className="mb-8 group cursor-pointer" onClick={startVocationalQuiz}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded border border-[#60a5fa] flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 text-[#60a5fa]" />
              </div>
              <h2 className="text-xl font-bold">Orientação Vocacional</h2>
            </div>
          </div>
          
          <div className="bg-[#141e16] border border-[#283854] hover:border-[#60a5fa]/50 rounded-[32px] p-6 relative overflow-hidden transition-all duration-300">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#60a5fa]/10 rounded-full blur-2xl group-hover:bg-[#60a5fa]/20 transition-colors" />
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-[#60a5fa]/10 flex items-center justify-center shrink-0 border border-[#60a5fa]/20">
                  <Bot className="h-7 w-7 text-[#60a5fa]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-0.5">Teste a Tua Inclinação</h3>
                  <p className="text-[12px] text-slate-400">Análise de IA baseada no teu curso ({userProfile.course})</p>
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-[#1e2e26] group-hover:bg-[#60a5fa] flex items-center justify-center transition-colors">
                <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-[#0e1710]" />
              </div>
            </div>
          </div>
        </div>

        {/* Matérias Horizontal Scroll */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Matérias</h2>
          {subjects.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto pb-4 pt-1 px-1 -mx-5 px-5 snap-x scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {subjects.map((sub: any, idx: number) => {
                const colors = [
                  { bg: "bg-[#714115]", icon: "text-[#f97316]" },
                  { bg: "bg-[#1e3a5f]", icon: "text-[#3b82f6]" },
                  { bg: "bg-[#554a10]", icon: "text-[#eab308]" },
                  { bg: "bg-[#4c2d5f]", icon: "text-[#a855f7]" },
                  { bg: "bg-[#254238]", icon: "text-[#4ade80]" },
                ];
                const theme = colors[idx % colors.length];

                return (
                  <button 
                    key={sub.id}
                    onClick={() => startSpecificQuiz(sub.name, sub.promptContext, 5)}
                    className="flex flex-col items-center gap-3 shrink-0 snap-start transition-transform active:scale-95 w-[80px]"
                  >
                    <div className={`h-[72px] w-[72px] rounded-2xl ${theme.bg} flex items-center justify-center shadow-lg border border-white/5 text-3xl`}>
                      {sub.emoji}
                    </div>
                    <span className="text-[12px] font-bold text-slate-200 text-center leading-tight truncate w-full px-1">{sub.name}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="bg-[#141e16] border border-[#254238]/60 rounded-3xl p-6 text-center">
              <BookOpen className="h-10 w-10 text-[#4ade80]/40 mx-auto mb-3" />
              <p className="text-slate-400 font-medium text-sm">Sem disciplinas configuradas.</p>
              <p className="text-xs text-slate-500 mt-1">Vai a "Cursos" para adicionar matérias e criar quizzes sobre elas.</p>
            </div>
          )}
        </div>

        {/* Para Ti List */}
        <div>
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-xl font-bold">Para Ti</h2>
            <button className="text-[13px] font-bold text-[#4ade80]">Ver Tudo</button>
          </div>
          
          <div className="space-y-3.5">
            {PARA_TI.map((quiz) => (
              <div 
                key={quiz.id} 
                className="bg-[#141e16] border border-[#254238]/60 rounded-3xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className={`h-[68px] w-[68px] rounded-full ${quiz.color} flex items-center justify-center shrink-0 text-2xl`}>
                    <span className={quiz.iconColor}>{quiz.icon}</span>
                  </div>
                  <div>
                    <h4 className="text-[16px] font-bold text-white mb-1.5 leading-tight">{quiz.title}</h4>
                    <p className="text-[12px] text-slate-400 mb-1.5">{quiz.questions} Questões • {quiz.time} min</p>
                    <p className="text-[11px] font-bold text-[#4ade80] flex items-center gap-1">
                      ⭐ +{quiz.xp} XP
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => startSpecificQuiz(quiz.title, quiz.context, quiz.questions)}
                  className="h-[42px] w-[42px] rounded-2xl bg-[#1e2e26] hover:bg-[#254238] flex items-center justify-center shrink-0 transition-colors ml-2 border border-[#4ade80]/10"
                >
                  <Play className="h-5 w-5 text-[#4ade80] fill-[#4ade80] ml-0.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Custom Bottom Navigation mapping the image */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#0e1710]/95 backdrop-blur-xl border-t border-[#1a261d] px-6 py-4 flex justify-between items-center z-50">
        {bottomNavItems.map((item, i) => {
          const isActive = location.pathname === item.path || (item.title === 'Quizzes' && true);
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

export default Quizzes;
