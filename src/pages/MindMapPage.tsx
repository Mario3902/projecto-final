import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Loader2, Sparkles, PencilLine, BookOpen,
  Plus, Trash2, Check, X, ChevronRight,
} from "lucide-react";
import { generateTopicsForSubject, SkillTopic } from "@/lib/gemini";
import MindMap from "@/components/multimedia/MindMap";
import AudioReader from "@/components/multimedia/AudioReader";

// ── Helpers ───────────────────────────────────────────────────────────────────
function getEnrolledSubjects(): { name: string; emoji: string }[] {
  try {
    const cd = JSON.parse(localStorage.getItem("nzila_course_data") || "{}");
    return (cd.subjects || []).map((s: any) => ({ name: s.name, emoji: s.emoji || "📚" }));
  } catch { return []; }
}

interface CardSRS { id: string; front: string; back: string; reps: number; }
function loadSrsCards(sub: string): CardSRS[] {
  try { return JSON.parse(localStorage.getItem(`nzila_srs_${sub}`) || "[]"); }
  catch { return []; }
}
function srsToTopics(cards: CardSRS[]): SkillTopic[] {
  return cards.map((c) => {
    const sp = c.front.indexOf(" ");
    return {
      id: c.id,
      emoji: sp > -1 ? c.front.slice(0, sp) : "📌",
      name:  sp > -1 ? c.front.slice(sp + 1) : c.front,
      description: c.back,
      difficulty: c.reps >= 4 ? "avançado" : c.reps >= 2 ? "médio" : "básico",
    };
  });
}

function mapKey(sub: string) { return `nzila_mindmap_${sub}`; }
function saveCustomMap(sub: string, topics: SkillTopic[]) {
  localStorage.setItem(mapKey(sub), JSON.stringify(topics));
}
function loadCustomMap(sub: string): SkillTopic[] {
  try { return JSON.parse(localStorage.getItem(mapKey(sub)) || "[]"); }
  catch { return []; }
}

const DIFF_COLORS = {
  básico:   { ring: "border-[#72EB3A]", bg: "bg-[#72EB3A]/10", text: "text-[#72EB3A]" },
  médio:    { ring: "border-yellow-400", bg: "bg-yellow-400/10", text: "text-yellow-400" },
  avançado: { ring: "border-red-400", bg: "bg-red-400/10", text: "text-red-400" },
} as const;
type Diff = keyof typeof DIFF_COLORS;

function uid() { return Math.random().toString(36).slice(2, 10); }

// ── Component ─────────────────────────────────────────────────────────────────
type Screen = "subjects" | "mode" | "ai-preview" | "manual" | "map";

const MindMapPage: React.FC = () => {
  const navigate = useNavigate();
  const enrolledSubjects = getEnrolledSubjects();

  const [screen, setScreen]               = useState<Screen>("subjects");
  const [subject, setSubject]             = useState<string | null>(null);
  const [topics, setTopics]               = useState<SkillTopic[]>([]);
  const [activeTopic, setActiveTopic]     = useState<SkillTopic | null>(null);
  const [loading, setLoading]             = useState(false);

  // AI preview — checklist
  const [aiDraft, setAiDraft]             = useState<SkillTopic[]>([]);
  const [aiSelected, setAiSelected]       = useState<Set<string>>(new Set());

  // Manual editor
  const [form, setForm]                   = useState({ emoji: "📌", name: "", desc: "", diff: "básico" as Diff });
  const [manualList, setManualList]       = useState<SkillTopic[]>([]);

  const subjectInfo = enrolledSubjects.find((s) => s.name === subject) ?? { name: subject ?? "", emoji: "📚" };

  // ── Navigation helpers ────────────────────────────────────────────────────
  const goBack = () => {
    if (screen === "map")        { setScreen("mode"); return; }
    if (screen === "ai-preview") { setScreen("mode"); return; }
    if (screen === "manual")     { setScreen("mode"); return; }
    if (screen === "mode")       { setSubject(null); setScreen("subjects"); return; }
    navigate("/dashboard");
  };

  const selectSubject = (name: string) => {
    setSubject(name);
    setActiveTopic(null);
    setTopics([]);
    setAiDraft([]);
    setManualList(loadCustomMap(name));
    setScreen("mode");
  };

  // ── AI flow ───────────────────────────────────────────────────────────────
  const startAi = useCallback(async () => {
    if (!subject) return;
    setLoading(true);
    setScreen("ai-preview");
    try {
      const result = await generateTopicsForSubject(subject);
      setAiDraft(result);
      setAiSelected(new Set(result.map((t) => t.id)));
    } catch {
      const srs = srsToTopics(loadSrsCards(subject));
      setAiDraft(srs);
      setAiSelected(new Set(srs.map((t) => t.id)));
    } finally {
      setLoading(false);
    }
  }, [subject]);

  const confirmAi = () => {
    const chosen = aiDraft.filter((t) => aiSelected.has(t.id));
    setTopics(chosen);
    saveCustomMap(subject!, chosen);
    setScreen("map");
  };

  const toggleAi = (id: string) => {
    setAiSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  // ── SRS flow ──────────────────────────────────────────────────────────────
  const useSrs = () => {
    const converted = srsToTopics(loadSrsCards(subject!));
    setTopics(converted);
    saveCustomMap(subject!, converted);
    setScreen("map");
  };

  // ── Manual flow ───────────────────────────────────────────────────────────
  const addTopic = () => {
    if (!form.name.trim()) return;
    const t: SkillTopic = {
      id: uid(),
      emoji: form.emoji || "📌",
      name: form.name.trim(),
      description: form.desc.trim() || `Tópico de ${form.name.trim()}`,
      difficulty: form.diff,
    };
    setManualList((l) => [...l, t]);
    setForm({ emoji: "📌", name: "", desc: "", diff: "básico" });
  };

  const removeTopic = (id: string) => setManualList((l) => l.filter((t) => t.id !== id));

  const confirmManual = () => {
    if (manualList.length === 0) return;
    setTopics(manualList);
    saveCustomMap(subject!, manualList);
    setScreen("map");
  };

  // ── Screens ───────────────────────────────────────────────────────────────

  // 1. Subject picker
  if (screen === "subjects") {
    return (
      <div className="min-h-screen bg-[#1B1D24] text-white flex flex-col font-sans pb-10">
        <div className="max-w-md mx-auto w-full px-5 py-6">
          <div className="flex items-center gap-3 mb-8">
            <button onClick={() => navigate("/dashboard")} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
              <ArrowLeft className="h-5 w-5 text-slate-400" />
            </button>
            <div>
              <h1 className="text-xl font-black text-white">Mapa Mental</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Visualiza e cria</p>
            </div>
          </div>

          <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4">As Tuas Matérias</h2>
          {enrolledSubjects.length === 0 ? (
            <div className="bg-[#1C2210] border border-[#365A08] rounded-2xl p-6 text-center">
              <p className="text-slate-400 text-sm mb-3">Ainda não tens disciplinas inscritas.</p>
              <button onClick={() => navigate("/dashboard/subjects")}
                className="px-4 py-2 bg-[#72EB3A] text-[#1B1D24] font-black text-xs rounded-xl">
                Adicionar Disciplinas
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {enrolledSubjects.map((s) => {
                const custom = loadCustomMap(s.name);
                const srs    = loadSrsCards(s.name);
                return (
                  <button key={s.name} onClick={() => selectSubject(s.name)}
                    className="bg-[#1C2210] border border-[#365A08] p-4 rounded-2xl text-left hover:border-[#72EB3A]/40 transition-colors">
                    <div className="text-2xl mb-2">{s.emoji}</div>
                    <p className="font-bold text-sm text-white mb-0.5">{s.name}</p>
                    {custom.length > 0
                      ? <p className="text-[10px] font-black text-[#72EB3A]">{custom.length} tópicos guardados</p>
                      : srs.length > 0
                        ? <p className="text-[10px] text-slate-500 font-medium">{srs.length} flashcards</p>
                        : <p className="text-[10px] text-slate-600 font-medium">Criar mapa</p>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. Mode picker
  if (screen === "mode") {
    const hasSrs    = loadSrsCards(subject!).length >= 2;
    const hasCustom = loadCustomMap(subject!).length >= 1;
    return (
      <div className="min-h-screen bg-[#1B1D24] text-white flex flex-col font-sans pb-10">
        <div className="max-w-md mx-auto w-full px-5 py-6">
          <div className="flex items-center gap-3 mb-8">
            <button onClick={goBack} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
              <ArrowLeft className="h-5 w-5 text-slate-400" />
            </button>
            <div>
              <p className="text-xs text-slate-500 font-bold">{subjectInfo.emoji} {subjectInfo.name}</p>
              <h1 className="text-xl font-black text-white">Como criar o mapa?</h1>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {/* AI suggestion */}
            <button onClick={startAi}
              className="w-full bg-[#1C2210] border border-[#365A08] hover:border-[#72EB3A]/50 rounded-2xl p-5 text-left transition-colors group">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-xl bg-[#72EB3A]/10 border border-[#72EB3A]/30 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-[#72EB3A]" />
                </div>
                <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-[#72EB3A] transition-colors" />
              </div>
              <p className="font-black text-white text-sm mb-1">Sugestão da IA</p>
              <p className="text-xs text-slate-500 leading-relaxed">A IA gera tópicos relevantes para {subjectInfo.name}. Escolhes os que queres incluir.</p>
            </button>

            {/* Manual creation */}
            <button onClick={() => setScreen("manual")}
              className="w-full bg-[#1C2210] border border-[#365A08] hover:border-yellow-400/50 rounded-2xl p-5 text-left transition-colors group">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center">
                  <PencilLine className="h-5 w-5 text-yellow-400" />
                </div>
                <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-yellow-400 transition-colors" />
              </div>
              <p className="font-black text-white text-sm mb-1">Criar manualmente</p>
              <p className="text-xs text-slate-500 leading-relaxed">Adiciona os tópicos que queres — o teu próprio mapa personalizado.</p>
              {manualList.length > 0 && <p className="text-[10px] font-black text-yellow-400 mt-1">{manualList.length} tópicos em rascunho</p>}
            </button>

            {/* SRS flashcards */}
            {hasSrs && (
              <button onClick={useSrs}
                className="w-full bg-[#1C2210] border border-[#365A08] hover:border-blue-400/50 rounded-2xl p-5 text-left transition-colors group">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-400/10 border border-blue-400/20 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-blue-400" />
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-blue-400 transition-colors" />
                </div>
                <p className="font-black text-white text-sm mb-1">Usar flashcards estudados</p>
                <p className="text-xs text-slate-500 leading-relaxed">Gera o mapa com os {loadSrsCards(subject!).length} tópicos dos teus flashcards.</p>
              </button>
            )}

            {/* Reload saved map */}
            {hasCustom && (
              <button onClick={() => { setTopics(loadCustomMap(subject!)); setScreen("map"); }}
                className="w-full py-3 border border-dashed border-[#365A08] rounded-2xl text-slate-500 text-xs font-bold hover:border-[#72EB3A]/30 hover:text-[#72EB3A] transition-colors">
                Ver mapa guardado →
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 3. AI preview / checklist
  if (screen === "ai-preview") {
    return (
      <div className="min-h-screen bg-[#1B1D24] text-white flex flex-col font-sans pb-10">
        <div className="max-w-md mx-auto w-full px-5 py-6">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={goBack} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
              <ArrowLeft className="h-5 w-5 text-slate-400" />
            </button>
            <div>
              <h1 className="text-xl font-black text-white">Sugestão da IA</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{subjectInfo.emoji} {subjectInfo.name}</p>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#72EB3A]/10 border border-[#72EB3A]/20 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-[#72EB3A] animate-pulse" />
              </div>
              <p className="text-sm text-slate-400 font-bold">A IA está a pensar...</p>
            </div>
          ) : (
            <>
              <p className="text-xs text-slate-500 mb-4">
                Seleciona os tópicos a incluir no mapa ({aiSelected.size}/{aiDraft.length} selecionados)
              </p>

              <div className="flex flex-col gap-2 mb-6">
                {aiDraft.map((t) => {
                  const sel = aiSelected.has(t.id);
                  const dc  = DIFF_COLORS[t.difficulty as Diff] ?? DIFF_COLORS.básico;
                  return (
                    <button key={t.id} onClick={() => toggleAi(t.id)}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border transition-all text-left ${
                        sel ? "bg-[#1C2210] border-[#72EB3A]/40" : "bg-[#141a08] border-[#2a3a08] opacity-50"
                      }`}>
                      {/* Check circle */}
                      <div className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        sel ? "border-[#72EB3A] bg-[#72EB3A]/20" : "border-slate-700"
                      }`}>
                        {sel && <Check className="h-3 w-3 text-[#72EB3A]" />}
                      </div>
                      {/* Emoji */}
                      <span className="text-xl shrink-0">{t.emoji}</span>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-white truncate">{t.name}</p>
                        <p className="text-[10px] text-slate-500 truncate">{t.description}</p>
                      </div>
                      {/* Difficulty badge */}
                      <span className={`shrink-0 text-[9px] font-black uppercase px-2 py-0.5 rounded-lg border ${dc.ring} ${dc.bg} ${dc.text}`}>
                        {t.difficulty}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-3 sticky bottom-6">
                <button onClick={goBack}
                  className="flex-1 py-3 border border-slate-700 text-slate-400 font-bold rounded-2xl text-sm hover:border-slate-500 transition-colors">
                  Cancelar
                </button>
                <button onClick={confirmAi} disabled={aiSelected.size === 0}
                  className="flex-1 py-3 bg-[#72EB3A] text-[#1B1D24] font-black rounded-2xl text-sm disabled:opacity-40 flex items-center justify-center gap-2 active:scale-95 transition-transform">
                  <Sparkles className="h-4 w-4" /> Gerar Mapa
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // 4. Manual editor
  if (screen === "manual") {
    return (
      <div className="min-h-screen bg-[#1B1D24] text-white flex flex-col font-sans pb-10">
        <div className="max-w-md mx-auto w-full px-5 py-6">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={goBack} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
              <ArrowLeft className="h-5 w-5 text-slate-400" />
            </button>
            <div>
              <h1 className="text-xl font-black text-white">Criar Mapa</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{subjectInfo.emoji} {subjectInfo.name}</p>
            </div>
          </div>

          {/* Add topic form */}
          <div className="bg-[#1C2210] border border-[#365A08] rounded-2xl p-4 mb-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Novo Tópico</p>

            <div className="flex gap-2 mb-3">
              {/* Emoji */}
              <input value={form.emoji} onChange={(e) => setForm((f) => ({ ...f, emoji: e.target.value }))}
                placeholder="📌" maxLength={4}
                className="w-14 h-10 bg-[#141a08] border border-[#365A08] rounded-xl text-center text-xl focus:outline-none focus:border-[#72EB3A]/50" />
              {/* Name */}
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Nome do tópico"
                className="flex-1 h-10 px-3 bg-[#141a08] border border-[#365A08] rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#72EB3A]/50" />
            </div>

            {/* Description */}
            <textarea value={form.desc} onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
              placeholder="Descrição (opcional)"
              rows={2}
              className="w-full px-3 py-2 bg-[#141a08] border border-[#365A08] rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#72EB3A]/50 resize-none mb-3" />

            {/* Difficulty */}
            <div className="flex gap-2 mb-3">
              {(["básico", "médio", "avançado"] as Diff[]).map((d) => {
                const dc = DIFF_COLORS[d];
                return (
                  <button key={d} onClick={() => setForm((f) => ({ ...f, diff: d }))}
                    className={`flex-1 py-2 rounded-xl border text-[10px] font-black uppercase transition-all ${
                      form.diff === d ? `${dc.ring} ${dc.bg} ${dc.text}` : "border-[#365A08] text-slate-600"
                    }`}>
                    {d}
                  </button>
                );
              })}
            </div>

            <button onClick={addTopic} disabled={!form.name.trim()}
              className="w-full py-2.5 bg-[#72EB3A]/10 border border-[#72EB3A]/30 text-[#72EB3A] font-black text-sm rounded-xl disabled:opacity-30 flex items-center justify-center gap-2 hover:bg-[#72EB3A]/20 transition-colors active:scale-95">
              <Plus className="h-4 w-4" /> Adicionar Tópico
            </button>
          </div>

          {/* Topic list */}
          {manualList.length > 0 && (
            <>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">
                Tópicos adicionados ({manualList.length})
              </p>
              <div className="flex flex-col gap-2 mb-6">
                {manualList.map((t) => {
                  const dc = DIFF_COLORS[t.difficulty as Diff] ?? DIFF_COLORS.básico;
                  return (
                    <div key={t.id}
                      className="flex items-center gap-3 bg-[#1C2210] border border-[#365A08] rounded-xl p-3">
                      <span className="text-lg shrink-0">{t.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-white truncate">{t.name}</p>
                        <span className={`text-[9px] font-black uppercase ${dc.text}`}>{t.difficulty}</span>
                      </div>
                      <button onClick={() => removeTopic(t.id)}
                        className="shrink-0 p-1.5 rounded-lg hover:bg-red-500/10 text-slate-600 hover:text-red-400 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>

              <button onClick={confirmManual}
                className="w-full py-3.5 bg-[#72EB3A] text-[#1B1D24] font-black rounded-2xl text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform">
                Ver Mapa Mental →
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // 5. Map view
  return (
    <div className="min-h-screen bg-[#1B1D24] text-white flex flex-col font-sans pb-10">
      <div className="max-w-md mx-auto w-full px-5 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={goBack} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
            <ArrowLeft className="h-5 w-5 text-slate-400" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-black text-white">{subjectInfo.emoji} {subject}</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              Mapa mental · {topics.length} tópicos
            </p>
          </div>
          {/* Edit button */}
          <button onClick={() => setScreen("mode")}
            className="p-2 rounded-xl bg-[#1C2210] border border-[#365A08] text-slate-400 hover:text-[#72EB3A] hover:border-[#72EB3A]/40 transition-colors">
            <PencilLine className="h-4 w-4" />
          </button>
        </div>

        {topics.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-500 text-sm mb-4">Sem tópicos.</p>
            <button onClick={() => setScreen("mode")}
              className="px-4 py-2 bg-[#72EB3A]/10 text-[#72EB3A] rounded-xl text-xs font-bold">
              Criar mapa
            </button>
          </div>
        ) : (
          <>
            <MindMap
              subject={subjectInfo.name}
              topics={topics}
              onTopicClick={setActiveTopic}
            />

            {activeTopic && (
              <div className="mt-4 bg-[#1C2210] border border-[#365A08] rounded-2xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{activeTopic.emoji}</span>
                      <h3 className="font-black text-white text-sm truncate">{activeTopic.name}</h3>
                      <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md ${
                        activeTopic.difficulty === "básico"   ? "bg-[#72EB3A]/10 text-[#72EB3A]" :
                        activeTopic.difficulty === "médio"    ? "bg-yellow-500/10 text-yellow-400" :
                                                                "bg-red-500/10 text-red-400"
                      }`}>{activeTopic.difficulty}</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{activeTopic.description}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <AudioReader text={`${activeTopic.name}. ${activeTopic.description}`} size="sm" />
                    <button onClick={() => setActiveTopic(null)}
                      className="h-7 w-7 rounded-lg border border-slate-700 bg-[#141a08] text-slate-600 hover:text-slate-400 flex items-center justify-center">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/dashboard/lesson?subject=${encodeURIComponent(subject!)}&topic=${encodeURIComponent(activeTopic.name)}&n=5`)}
                  className="mt-3 w-full py-2.5 bg-[#72EB3A] text-[#1B1D24] font-black text-xs rounded-xl active:scale-95 transition-transform">
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
