import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { generateTopicsForSubject, SkillTopic } from "@/lib/gemini";
import MindMap from "@/components/multimedia/MindMap";
import AudioReader from "@/components/multimedia/AudioReader";

const SUBJECTS = [
  { id: "matemática", name: "Matemática", emoji: "🔢" },
  { id: "física", name: "Física", emoji: "⚡" },
  { id: "química", name: "Química", emoji: "🧪" },
  { id: "biologia", name: "Biologia", emoji: "🧬" },
  { id: "história", name: "História", emoji: "📜" },
  { id: "geografia", name: "Geografia", emoji: "🌍" },
  { id: "português", name: "Português", emoji: "📝" },
  { id: "inglês", name: "Inglês", emoji: "🇬🇧" },
];

const MindMapPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [topics, setTopics] = useState<SkillTopic[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTopic, setActiveTopic] = useState<SkillTopic | null>(null);

  const loadTopics = useCallback(async (subjectId: string) => {
    setLoading(true);
    setActiveTopic(null);
    setTopics([]);
    try {
      const result = await generateTopicsForSubject(subjectId);
      setTopics(result);
    } catch {
      setTopics([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubjectSelect = (subjectId: string) => {
    setSelectedSubject(subjectId);
    loadTopics(subjectId);
  };

  const subjectInfo = SUBJECTS.find((s) => s.id === selectedSubject);

  // ── Subject picker ────────────────────────────────────────────────────────────
  if (!selectedSubject) {
    return (
      <div className="min-h-screen bg-[#0e1710] text-white flex flex-col font-sans pb-10">
        <div className="max-w-md mx-auto w-full px-5 py-6">
          <div className="flex items-center gap-3 mb-8">
            <button onClick={() => navigate("/dashboard")} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
              <ArrowLeft className="h-5 w-5 text-slate-400" />
            </button>
            <div>
              <h1 className="text-xl font-black text-white">Mapa Mental</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Visão geral dos tópicos</p>
            </div>
          </div>

          <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4">Escolhe a Matéria</h2>
          <div className="grid grid-cols-2 gap-3">
            {SUBJECTS.map((s) => (
              <button
                key={s.id}
                onClick={() => handleSubjectSelect(s.id)}
                className="bg-[#141e16] border border-[#254238] p-4 rounded-2xl text-left hover:border-[#4ade80]/40 transition-colors group"
              >
                <div className="text-2xl mb-2">{s.emoji}</div>
                <p className="font-bold text-sm text-white">{s.name}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0e1710] text-white flex flex-col font-sans pb-10">
      <div className="max-w-md mx-auto w-full px-5 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setSelectedSubject(null)} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
            <ArrowLeft className="h-5 w-5 text-slate-400" />
          </button>
          <div>
            <h1 className="text-xl font-black text-white">
              {subjectInfo?.emoji} {subjectInfo?.name}
            </h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Mapa mental · {topics.length} tópicos</p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 text-[#4ade80] animate-spin" />
            <p className="text-sm text-slate-400 font-bold">A gerar mapa mental...</p>
          </div>
        ) : topics.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-500 text-sm">Sem tópicos disponíveis.</p>
            <button
              onClick={() => loadTopics(selectedSubject)}
              className="mt-4 px-4 py-2 bg-[#4ade80]/10 text-[#4ade80] rounded-xl text-xs font-bold"
            >
              Tentar novamente
            </button>
          </div>
        ) : (
          <>
            <MindMap
              subject={subjectInfo?.name || selectedSubject}
              topics={topics}
              onTopicClick={setActiveTopic}
            />

            {/* Active topic detail panel */}
            {activeTopic && (
              <div className="mt-4 bg-[#141e16] border border-[#254238] rounded-2xl p-4 animate-fade-in">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{activeTopic.emoji}</span>
                      <h3 className="font-black text-white text-sm truncate">{activeTopic.name}</h3>
                      <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md ${
                        activeTopic.difficulty === "básico" ? "bg-[#4ade80]/10 text-[#4ade80]" :
                        activeTopic.difficulty === "médio" ? "bg-yellow-500/10 text-yellow-400" :
                        "bg-red-500/10 text-red-400"
                      }`}>
                        {activeTopic.difficulty}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{activeTopic.description}</p>
                  </div>
                  <AudioReader text={`${activeTopic.name}. ${activeTopic.description}`} size="sm" />
                </div>
                <button
                  onClick={() => navigate(`/dashboard/lesson?subject=${encodeURIComponent(subjectInfo?.name || selectedSubject)}&topic=${encodeURIComponent(activeTopic.name)}&n=5`)}
                  className="mt-3 w-full py-2.5 bg-[#4ade80] text-[#0e1710] font-black text-xs rounded-xl active:scale-95 transition-transform"
                >
                  🎯 Fazer Quiz sobre este Tópico
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MindMapPage;
