import { useState, useMemo } from "react";

interface Question {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  difficulty: "fácil" | "médio" | "difícil";
}

const allQuestions: Question[] = [
  { question: "Qual é o maior planeta do Sistema Solar?", options: ["Saturno", "Júpiter", "Urano", "Netuno"], correct: 1, explanation: "Júpiter é o maior planeta, com diâmetro de 139.820 km — cabem mais de 1.300 Terras dentro dele!", difficulty: "fácil" },
  { question: "Qual planeta é conhecido como 'Planeta Vermelho'?", options: ["Vênus", "Mercúrio", "Marte", "Júpiter"], correct: 2, explanation: "Marte é chamado de Planeta Vermelho devido ao óxido de ferro (ferrugem) em sua superfície.", difficulty: "fácil" },
  { question: "Quantas luas a Terra possui?", options: ["0", "1", "2", "3"], correct: 1, explanation: "A Terra possui apenas uma lua natural, chamada simplesmente de Lua.", difficulty: "fácil" },
  { question: "Qual é o planeta mais quente do Sistema Solar?", options: ["Mercúrio", "Vênus", "Marte", "Júpiter"], correct: 1, explanation: "Apesar de Mercúrio ser mais próximo do Sol, Vênus é mais quente (462°C) por causa de seu efeito estufa extremo.", difficulty: "médio" },
  { question: "Qual planeta é famoso por seus anéis?", options: ["Júpiter", "Urano", "Saturno", "Netuno"], correct: 2, explanation: "Saturno é famoso por seus anéis espetaculares, compostos de gelo e rocha.", difficulty: "fácil" },
  { question: "Qual é o menor planeta do Sistema Solar?", options: ["Marte", "Vênus", "Terra", "Mercúrio"], correct: 3, explanation: "Mercúrio é o menor planeta, com apenas 4.879 km de diâmetro.", difficulty: "fácil" },
  { question: "Quanto tempo a luz do Sol leva para chegar à Terra?", options: ["1 minuto", "~8 minutos", "1 hora", "1 dia"], correct: 1, explanation: "A luz do Sol leva aproximadamente 8 minutos e 20 segundos para percorrer os ~150 milhões de km até a Terra.", difficulty: "médio" },
  { question: "Qual planeta gira de lado com inclinação de 98°?", options: ["Netuno", "Saturno", "Urano", "Mercúrio"], correct: 2, explanation: "Urano tem uma inclinação axial de 98°, fazendo-o girar praticamente de lado.", difficulty: "médio" },
  { question: "Qual planeta tem os ventos mais fortes do sistema solar?", options: ["Júpiter", "Saturno", "Urano", "Netuno"], correct: 3, explanation: "Netuno possui os ventos mais fortes do sistema solar, chegando a 2.100 km/h!", difficulty: "difícil" },
  { question: "Qual é a estrela mais próxima da Terra?", options: ["Alpha Centauri", "Sirius", "Sol", "Betelgeuse"], correct: 2, explanation: "O Sol é a estrela mais próxima da Terra, a cerca de 150 milhões de km.", difficulty: "fácil" },
  { question: "Qual planeta tem o dia mais curto (rotação mais rápida)?", options: ["Terra", "Marte", "Júpiter", "Saturno"], correct: 2, explanation: "Júpiter tem o dia mais curto: apenas 9 horas e 55 minutos para uma rotação completa!", difficulty: "médio" },
  { question: "Quantos planetas existem no Sistema Solar?", options: ["7", "8", "9", "10"], correct: 1, explanation: "Existem 8 planetas no Sistema Solar. Plutão foi reclassificado como planeta anão em 2006.", difficulty: "fácil" },
  { question: "Qual a composição principal do Sol?", options: ["Oxigênio e Carbono", "Ferro e Níquel", "Hidrogênio e Hélio", "Nitrogênio e Oxigênio"], correct: 2, explanation: "O Sol é composto principalmente de Hidrogênio (73%) e Hélio (25%).", difficulty: "médio" },
  { question: "Qual planeta leva mais tempo para orbitar o Sol?", options: ["Urano", "Saturno", "Netuno", "Júpiter"], correct: 2, explanation: "Netuno leva 164,8 anos terrestres para completar uma órbita ao redor do Sol.", difficulty: "médio" },
  { question: "Onde fica o maior vulcão do Sistema Solar?", options: ["Terra", "Vênus", "Marte", "Io (lua de Júpiter)"], correct: 2, explanation: "O Monte Olimpo em Marte tem 21,9 km de altura — quase 2,5 vezes o Everest!", difficulty: "difícil" },
  { question: "Qual lua de Saturno tem lagos de metano líquido?", options: ["Encélado", "Mimas", "Titã", "Réia"], correct: 2, explanation: "Titã é a única lua com atmosfera densa e possui lagos e rios de metano e etano líquidos na superfície.", difficulty: "difícil" },
  { question: "Qual sonda saiu do sistema solar primeiro?", options: ["Pioneer 10", "Voyager 1", "Voyager 2", "New Horizons"], correct: 1, explanation: "A Voyager 1, lançada em 1977, entrou no espaço interestelar em 2012, sendo o primeiro objeto humano a fazê-lo.", difficulty: "difícil" },
  { question: "Saturno flutuaria na água. Por quê?", options: ["É feito de gás", "Sua densidade é menor que a da água", "É oco por dentro", "Tem muitos anéis"], correct: 1, explanation: "A densidade média de Saturno é de 0,687 g/cm³, menor que a da água (1 g/cm³), por isso flutuaria!", difficulty: "difícil" },
];

export default function Quiz({ onClose }: { onClose: () => void }) {
  const questions = useMemo(() => {
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 10);
  }, []);

  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);

  const question = questions[currentQ];

  const handleAnswer = (index: number) => {
    if (answered) return;
    setSelected(index);
    setAnswered(true);
    if (index === question.correct) {
      setScore(s => s + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(q => q + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      setShowResult(true);
    }
  };

  const handleRestart = () => {
    setCurrentQ(0);
    setSelected(null);
    setScore(0);
    setShowResult(false);
    setAnswered(false);
    setStreak(0);
    setMaxStreak(0);
  };

  const getScoreEmoji = () => {
    const pct = score / questions.length;
    if (pct === 1) return "🏆";
    if (pct >= 0.8) return "🌟";
    if (pct >= 0.6) return "👍";
    if (pct >= 0.4) return "📚";
    return "🔭";
  };

  const getScoreMessage = () => {
    const pct = score / questions.length;
    if (pct === 1) return "Perfeito! Você é um gênio espacial!";
    if (pct >= 0.8) return "Excelente! Você sabe muito sobre o espaço!";
    if (pct >= 0.6) return "Bom trabalho! Continue explorando!";
    if (pct >= 0.4) return "Não desista! O espaço tem muito a ensinar!";
    return "Explore mais o sistema solar e tente novamente!";
  };

  const difficultyColor = { fácil: "text-emerald-400", médio: "text-yellow-400", difícil: "text-red-400" };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 solar-animate-fadeIn" style={{
      background: "radial-gradient(circle at center, rgba(30,20,60,0.98), rgba(2,0,16,0.99))"
    }}>
      <div className="relative solar-glass-strong rounded-2xl max-w-xl w-full shadow-2xl" style={{ borderColor: "rgba(99,102,241,0.2)" }}>
        <button onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-lg transition-colors z-10 cursor-pointer">
          ✕
        </button>

        <div className="p-8">
          {showResult ? (
            <div className="text-center solar-animate-fadeIn">
              <div className="text-7xl mb-4">{getScoreEmoji()}</div>
              <h2 className="text-3xl font-bold text-white mb-2">Quiz Completo!</h2>
              <p className="text-indigo-300 text-lg mb-6">{getScoreMessage()}</p>
              <div className="solar-glass rounded-2xl p-6 mb-6">
                <div className="text-5xl font-bold text-white mb-1">{score}/{questions.length}</div>
                <div className="text-indigo-300">respostas corretas</div>
                <div className="mt-4 w-full bg-gray-800 rounded-full h-3">
                  <div className="h-3 rounded-full transition-all duration-1000 ease-out" style={{
                    width: `${(score / questions.length) * 100}%`,
                    background: "linear-gradient(90deg, #6366f1, #a855f7, #ec4899)",
                  }} />
                </div>
                {maxStreak > 1 && (
                  <div className="mt-3 text-yellow-400 text-sm">🔥 Melhor sequência: {maxStreak} acertos seguidos!</div>
                )}
              </div>
              <div className="flex gap-3">
                <button onClick={handleRestart}
                  className="flex-1 py-3 px-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-colors cursor-pointer">
                  🔄 Tentar Novamente
                </button>
                <button onClick={onClose}
                  className="flex-1 py-3 px-6 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-colors cursor-pointer">
                  🪐 Voltar
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <span className="text-indigo-400 text-sm font-medium">
                  Pergunta {currentQ + 1}/{questions.length}
                </span>
                <div className="flex items-center gap-3">
                  {streak >= 2 && <span className="text-yellow-400 text-sm">🔥 {streak}x</span>}
                  <span className={`text-xs px-2 py-0.5 rounded-full border border-current ${difficultyColor[question.difficulty]}`}>
                    {question.difficulty}
                  </span>
                  <span className="text-indigo-400 text-sm font-medium">⭐ {score}</span>
                </div>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-1.5 mb-6">
                <div className="h-1.5 rounded-full transition-all duration-500" style={{
                  width: `${((currentQ + 1) / questions.length) * 100}%`,
                  background: "linear-gradient(90deg, #6366f1, #a855f7)",
                }} />
              </div>

              <h3 className="text-xl font-bold text-white mb-6">{question.question}</h3>

              <div className="space-y-2.5 mb-6">
                {question.options.map((option, i) => {
                  let classes = "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20";
                  if (answered) {
                    if (i === question.correct) classes = "bg-emerald-500/20 border-emerald-500/50";
                    else if (i === selected && i !== question.correct) classes = "bg-red-500/20 border-red-500/50";
                    else classes = "bg-white/5 border-white/5 opacity-40";
                  }
                  return (
                    <button key={i} onClick={() => handleAnswer(i)}
                      className={`w-full text-left p-4 rounded-xl border transition-all text-white ${classes} ${!answered ? "cursor-pointer" : "cursor-default"}`}>
                      <span className="font-medium text-gray-400 mr-2">{String.fromCharCode(65 + i)}.</span>
                      {option}
                      {answered && i === question.correct && <span className="ml-2">✅</span>}
                      {answered && i === selected && i !== question.correct && <span className="ml-2">❌</span>}
                    </button>
                  );
                })}
              </div>

              {answered && (
                <div className="solar-glass rounded-xl p-4 mb-4 solar-animate-fadeInUp" style={{ borderColor: "rgba(99,102,241,0.2)" }}>
                  <p className="text-indigo-200 text-sm">💡 {question.explanation}</p>
                </div>
              )}

              {answered && (
                <button onClick={handleNext}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-colors cursor-pointer">
                  {currentQ < questions.length - 1 ? "Próxima Pergunta →" : "Ver Resultado 🏆"}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
