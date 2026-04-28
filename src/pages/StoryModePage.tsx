import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, CheckCircle2, BookOpen, Star, X } from "lucide-react";
import { useNzi } from "@/context/NziContext";
import NziCharacter from "@/components/nzi/NziCharacter";

interface Chapter {
  id: string;
  title: string;
  description: string;
  topic: string;
  emoji: string;
  nziDialogue: string;
}

interface StoryArc {
  subjectId: string;
  subjectName: string;
  emoji: string;
  color: string;
  intro: string;
  chapters: Chapter[];
}

const STORIES: StoryArc[] = [
  {
    subjectId: "matematica",
    subjectName: "Matemática",
    emoji: "🔢",
    color: "#4ade80",
    intro: "Bem-vindo ao Reino dos Números! Junta-te ao Nzi para dominar os segredos da Matemática.",
    chapters: [
      { id: "mat_1", title: "Os Algarismos Mágicos", description: "Descobre o poder dos números inteiros e decimais.", topic: "Números Inteiros", emoji: "1️⃣", nziDialogue: "Os números são a linguagem do universo! Vamos aprender juntos! 🔢" },
      { id: "mat_2", title: "A Floresta das Frações", description: "Navega pela selva das frações e proporções.", topic: "Frações", emoji: "½", nziDialogue: "Uma fração é como partilhar um bolo — todos ficam satisfeitos! 🎂" },
      { id: "mat_3", title: "O Castelo das Equações", description: "Resolve o mistério das equações de 1º grau.", topic: "Equações", emoji: "📐", nziDialogue: "Equações são puzzles. Encontra o valor de x e vence! 🧩" },
      { id: "mat_4", title: "As Montanhas dos Triângulos", description: "Escala os picos da geometria e trigonometria.", topic: "Geometria", emoji: "📏", nziDialogue: "Triângulos, círculos, polígonos — a geometria está em todo o lado! 🏔️" },
      { id: "mat_5", title: "O Oceano das Probabilidades", description: "Mergulha nas profundezas da estatística.", topic: "Estatística", emoji: "📊", nziDialogue: "Probabilidade é a arte de prever o futuro com matemática! 🌊" },
    ],
  },
  {
    subjectId: "fisica",
    subjectName: "Física",
    emoji: "⚡",
    color: "#60a5fa",
    intro: "O universo guarda segredos incríveis. Explora as leis que governam tudo!",
    chapters: [
      { id: "fis_1", title: "A Queda de Newton", description: "Descobre a gravidade e as leis do movimento.", topic: "Mecânica Clássica", emoji: "🍎", nziDialogue: "Uma maçã caiu e Newton mudou o mundo! O que vais descobrir tu? 🍎" },
      { id: "fis_2", title: "O Calor da Savana", description: "Explora termodinâmica e calor.", topic: "Termodinâmica", emoji: "🌡️", nziDialogue: "O calor move máquinas, cozinha comida e alimenta estrelas! 🌡️" },
      { id: "fis_3", title: "Ondas do Atlântico", description: "Mergulha na física das ondas e do som.", topic: "Ondas e Som", emoji: "🌊", nziDialogue: "O som que ouves é física em ação — vibrações no ar! 🎵" },
      { id: "fis_4", title: "A Tempestade Elétrica", description: "Domina eletricidade e magnetismo.", topic: "Eletromagnetismo", emoji: "⚡", nziDialogue: "Eletricidade ilumina Angola! Vamos entender como funciona! ⚡" },
    ],
  },
  {
    subjectId: "biologia",
    subjectName: "Biologia",
    emoji: "🧬",
    color: "#34d399",
    intro: "A vida é um mistério fascinante. Explora as maravilhas dos seres vivos!",
    chapters: [
      { id: "bio_1", title: "A Célula Secreta", description: "Descobre o mundo microscópico das células.", topic: "Célula", emoji: "🔬", nziDialogue: "Trilhões de células formam o teu corpo. Cada uma é uma cidade viva! 🔬" },
      { id: "bio_2", title: "A Floresta Tropical", description: "Explora os ecossistemas de Angola.", topic: "Ecossistemas", emoji: "🌿", nziDialogue: "Angola tem uma biodiversidade incrível! Vamos protegê-la! 🌿" },
      { id: "bio_3", title: "O Código da Vida", description: "Desvenda os segredos do DNA e genética.", topic: "Genética e DNA", emoji: "🧬", nziDialogue: "O teu DNA é único no mundo. Aprende a lê-lo! 🧬" },
      { id: "bio_4", title: "A Aventura do Corpo Humano", description: "Explora os sistemas do corpo humano.", topic: "Corpo Humano", emoji: "🫀", nziDialogue: "O teu coração bate 100 mil vezes por dia. Conheces-te? 🫀" },
    ],
  },
  {
    subjectId: "historia",
    subjectName: "História",
    emoji: "📜",
    color: "#fb923c",
    intro: "Angola tem uma história rica e poderosa. Descobre as raízes da nossa nação!",
    chapters: [
      { id: "hist_1", title: "Os Reinos Antigos", description: "Descobre os grandes reinos do Congo e de Angola.", topic: "Reinos Africanos", emoji: "👑", nziDialogue: "O Reino do Congo foi um dos mais poderosos de África! Orgulho nosso! 👑" },
      { id: "hist_2", title: "A Era Colonial", description: "Entende o período colonial e as suas consequências.", topic: "Colonialismo", emoji: "⚓", nziDialogue: "Conhecer o passado ajuda-nos a construir um futuro melhor! 📚" },
      { id: "hist_3", title: "A Luta pela Liberdade", description: "A independência de Angola a 11 de Novembro de 1975.", topic: "Independência", emoji: "🇦🇴", nziDialogue: "11 de Novembro de 1975 — um dia que mudou tudo! 🇦🇴" },
      { id: "hist_4", title: "Angola Moderna", description: "O desenvolvimento e crescimento da Angola contemporânea.", topic: "Angola Contemporânea", emoji: "🏙️", nziDialogue: "Somos construtores do futuro! Aprende para contribuir! 🏗️" },
    ],
  },
  {
    subjectId: "quimica",
    subjectName: "Química",
    emoji: "🧪",
    color: "#a78bfa",
    intro: "Tudo ao teu redor é química! Descobre os elementos do universo.",
    chapters: [
      { id: "qui_1", title: "A Mesa Periódica", description: "Explora os elementos químicos e as suas propriedades.", topic: "Tabela Periódica", emoji: "🧪", nziDialogue: "118 elementos constroem todo o universo. Vamos conhecê-los! ⚗️" },
      { id: "qui_2", title: "Ligações Mágicas", description: "Como os átomos se unem para formar moléculas.", topic: "Ligações Químicas", emoji: "🔗", nziDialogue: "Átomos de mão dada formam toda a matéria! Que belo! 🔗" },
      { id: "qui_3", title: "A Alquimia das Reações", description: "Reações químicas e balanceamento de equações.", topic: "Reações Químicas", emoji: "🔥", nziDialogue: "Quando misturamos substâncias corretas, acontece magia! 🔥" },
    ],
  },
];

function completedKey(chapterId: string) {
  return `nzila_story_${chapterId}`;
}

function isCompleted(chapterId: string) {
  return localStorage.getItem(completedKey(chapterId)) === "1";
}

function isUnlocked(arc: StoryArc, chapterIdx: number): boolean {
  if (chapterIdx === 0) return true;
  return isCompleted(arc.chapters[chapterIdx - 1].id);
}

const StoryModePage: React.FC = () => {
  const navigate = useNavigate();
  const { showMessage } = useNzi();
  const [selectedArc, setSelectedArc] = useState<StoryArc | null>(null);
  const [activeChapter, setActiveChapter] = useState<Chapter | null>(null);

  const handleArcSelect = (arc: StoryArc) => {
    setSelectedArc(arc);
    setActiveChapter(null);
    setTimeout(() => showMessage(arc.intro, "thinking", 5000), 300);
  };

  const handleChapterClick = (arc: StoryArc, chapter: Chapter, idx: number) => {
    if (!isUnlocked(arc, idx)) {
      showMessage("Completa o capítulo anterior para desbloquear este! 🔒", "sad", 3000);
      return;
    }
    setActiveChapter(chapter);
    setTimeout(() => showMessage(chapter.nziDialogue, "hint", 5000), 200);
  };

  const startChapter = (arc: StoryArc, chapter: Chapter) => {
    navigate(
      `/dashboard/lesson?subject=${encodeURIComponent(arc.subjectName)}&topic=${encodeURIComponent(chapter.topic)}&n=5&storyChapter=${chapter.id}`
    );
  };

  // ── Arc picker ────────────────────────────────────────────────────────────────
  if (!selectedArc) {
    return (
      <div className="min-h-screen bg-[#0e1710] text-white flex flex-col font-sans pb-10">
        <div className="max-w-md mx-auto w-full px-5 py-6">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => navigate("/dashboard")} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
              <ArrowLeft className="h-5 w-5 text-slate-400" />
            </button>
            <div>
              <h1 className="text-xl font-black text-white">Modo História</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Aprende através de aventuras</p>
            </div>
          </div>

          {/* Nzi intro */}
          <div className="flex items-center gap-4 bg-[#141e16] border border-[#254238] rounded-2xl p-4 mb-6">
            <NziCharacter expression="hint" size={60} />
            <div>
              <p className="text-sm font-bold text-white mb-1">Olá, aventureiro!</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Cada matéria é uma jornada épica. Escolhe a tua aventura e conquista o conhecimento!
              </p>
            </div>
          </div>

          <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4">Escolhe a tua Aventura</h2>
          <div className="space-y-3">
            {STORIES.map((arc) => {
              const completedCount = arc.chapters.filter((c) => isCompleted(c.id)).length;
              const pct = Math.round((completedCount / arc.chapters.length) * 100);
              return (
                <button
                  key={arc.subjectId}
                  onClick={() => handleArcSelect(arc)}
                  className="w-full bg-[#141e16] border border-[#254238] p-4 rounded-2xl text-left hover:border-[#4ade80]/30 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{arc.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-black text-white">{arc.subjectName}</p>
                        <span className="text-[10px] font-black" style={{ color: arc.color }}>
                          {completedCount}/{arc.chapters.length} cap.
                        </span>
                      </div>
                      <div className="h-1.5 bg-[#0e1710] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: arc.color }}
                        />
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── Chapter list ──────────────────────────────────────────────────────────────
  const completedCount = selectedArc.chapters.filter((c) => isCompleted(c.id)).length;

  return (
    <div className="min-h-screen bg-[#0e1710] text-white flex flex-col font-sans pb-10">
      <div className="max-w-md mx-auto w-full px-5 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setSelectedArc(null)} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
            <ArrowLeft className="h-5 w-5 text-slate-400" />
          </button>
          <div>
            <h1 className="text-xl font-black text-white">
              {selectedArc.emoji} {selectedArc.subjectName}
            </h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              {completedCount}/{selectedArc.chapters.length} capítulos completos
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-[#1a261d] rounded-full overflow-hidden mb-6">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${(completedCount / selectedArc.chapters.length) * 100}%`,
              backgroundColor: selectedArc.color,
            }}
          />
        </div>

        {/* Chapters */}
        <div className="relative">
          {/* Vertical path line */}
          <div className="absolute left-[27px] top-8 bottom-8 w-0.5 bg-[#254238]" />

          <div className="space-y-4">
            {selectedArc.chapters.map((chapter, idx) => {
              const done = isCompleted(chapter.id);
              const unlocked = isUnlocked(selectedArc, idx);
              const isActive = activeChapter?.id === chapter.id;

              return (
                <div key={chapter.id}>
                  <button
                    onClick={() => handleChapterClick(selectedArc, chapter, idx)}
                    className={`w-full flex items-center gap-4 group transition-all ${unlocked ? "opacity-100" : "opacity-50"}`}
                  >
                    {/* Node */}
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-2xl border-2 z-10 transition-all ${
                        done
                          ? "bg-[#4ade80]/10 border-[#4ade80]"
                          : unlocked
                          ? "bg-[#141e16] border-[#254238] group-hover:border-[#4ade80]/40"
                          : "bg-[#0e1710] border-[#1a261d]"
                      }`}
                    >
                      {done ? (
                        <CheckCircle2 className="h-6 w-6 text-[#4ade80]" />
                      ) : unlocked ? (
                        chapter.emoji
                      ) : (
                        <Lock className="h-5 w-5 text-slate-700" />
                      )}
                    </div>

                    {/* Text */}
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className={`font-black text-sm ${done ? "text-[#4ade80]" : unlocked ? "text-white" : "text-slate-600"}`}>
                          {chapter.title}
                        </p>
                        {done && (
                          <div className="flex">
                            {[...Array(3)].map((_, i) => (
                              <Star key={i} className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">{chapter.description}</p>
                    </div>
                  </button>

                  {/* Expanded panel */}
                  {isActive && unlocked && (
                    <div className="ml-[72px] mt-2 bg-[#141e16] border border-[#254238] rounded-xl p-4 animate-fade-in">
                      <p className="text-xs text-slate-400 mb-3 leading-relaxed">{chapter.nziDialogue}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startChapter(selectedArc, chapter)}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#4ade80] text-[#0e1710] font-black text-xs rounded-xl active:scale-95 transition-transform"
                        >
                          <BookOpen className="h-3.5 w-3.5" />
                          {done ? "Repetir Capítulo" : "Iniciar Capítulo"}
                        </button>
                        <button
                          onClick={() => setActiveChapter(null)}
                          className="px-3 py-2.5 border border-slate-700 text-slate-400 rounded-xl text-xs"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* All done */}
        {completedCount === selectedArc.chapters.length && (
          <div className="mt-6 bg-[#4ade80]/10 border border-[#4ade80]/30 rounded-2xl p-4 text-center animate-fade-in">
            <div className="text-3xl mb-2">🏆</div>
            <p className="font-black text-[#4ade80] mb-1">Aventura Completa!</p>
            <p className="text-xs text-slate-400">Dominaste toda a jornada de {selectedArc.subjectName}!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryModePage;

// Export for LessonPage to mark chapter complete after lesson
export { completedKey };
