import { useState, useEffect, useMemo, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Calendar, Plus, Trash2, Send, ChevronLeft, ChevronRight,
  Home, BookOpen, Check, Bot, User, AlertCircle, RefreshCw,
  FileText, GraduationCap, PartyPopper, Flag, Upload, Sparkles, Loader2
} from "lucide-react";
import { api } from "@/lib/api";
import { parseCalendarFromText } from "@/lib/gemini";
import { toast } from "sonner";

interface CalendarEvent {
  id?: number;
  title: string;
  event_date: string;
  event_type: "prova" | "entrega" | "feriado" | "evento" | "outro";
  subject_name?: string;
  description?: string;
}

interface DraftEvent {
  uid: string;
  title: string;
  event_date: string;
  event_type: "prova" | "entrega" | "feriado" | "evento" | "outro";
  subject_name: string;
}

const EVENT_TYPES = [
  { value: "prova", label: "Prova", color: "#ef4444", icon: FileText, emoji: "📝" },
  { value: "entrega", label: "Entrega", color: "#f59e0b", icon: Send, emoji: "📦" },
  { value: "feriado", label: "Feriado", color: "#22c55e", icon: PartyPopper, emoji: "🎉" },
  { value: "evento", label: "Evento", color: "#3b82f6", icon: Flag, emoji: "📌" },
  { value: "outro", label: "Outro", color: "#8b5cf6", icon: AlertCircle, emoji: "📎" },
];

const getTypeConfig = (type: string) =>
  EVENT_TYPES.find(t => t.value === type) || EVENT_TYPES[3];

const WEEKDAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const MONTHS_PT = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const AcademicCalendar = () => {
  const location = useLocation();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCalendar, setHasCalendar] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [pdfFileName, setPdfFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calendar navigation
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [viewYear, setViewYear] = useState(new Date().getFullYear());

  // Draft events for bulk submission
  const [drafts, setDrafts] = useState<DraftEvent[]>([
    { uid: crypto.randomUUID(), title: "", event_date: "", event_type: "prova", subject_name: "" }
  ]);

  // Subjects from localStorage
  const [subjects, setSubjects] = useState<{ id: string; name: string; emoji: string }[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("nzila_course_data");
    if (stored) {
      const data = JSON.parse(stored);
      if (data.subjects) setSubjects(data.subjects);
    }
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const data = await api.getCalendarEvents();
      setEvents(data);
      setHasCalendar(data.length > 0);
    } catch (e) {
      console.error("Erro ao carregar calendário", e);
    } finally {
      setIsLoading(false);
    }
  };

  // PDF Upload + AI Parse
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Por favor seleciona um ficheiro PDF.");
      return;
    }

    setPdfFileName(file.name);
    setIsParsing(true);
    toast("A analisar o PDF com IA... 🤖", { icon: "📄" });

    try {
      // Extract text from PDF using pdfjs-dist
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item: any) => item.str).join(" ");
        fullText += pageText + "\n";
      }

      if (fullText.trim().length < 20) {
        toast.error("Não foi possível extrair texto suficiente do PDF. Tenta um PDF com texto seleccionável.");
        setIsParsing(false);
        return;
      }

      // Send to Gemini AI for parsing
      const parsed = await parseCalendarFromText(fullText);

      if (!parsed || parsed.length === 0) {
        toast.error("A IA não encontrou eventos no PDF. Tenta adicionar manualmente.");
        setIsParsing(false);
        return;
      }

      // Convert parsed events to drafts
      const newDrafts: DraftEvent[] = parsed.map(ev => ({
        uid: crypto.randomUUID(),
        title: ev.title || "",
        event_date: ev.event_date || "",
        event_type: (["prova", "entrega", "feriado", "evento", "outro"].includes(ev.event_type)
          ? ev.event_type
          : "evento") as DraftEvent["event_type"],
        subject_name: ev.subject_name || "",
      }));

      setDrafts(newDrafts);
      toast.success(`${newDrafts.length} eventos encontrados no PDF! Revê e submete. 🎉`);
    } catch (err) {
      console.error("PDF Parse Error:", err);
      toast.error("Erro ao processar o PDF. Verifica se o proxy está a correr.");
    } finally {
      setIsParsing(false);
    }
  };

  // Draft management
  const addDraft = () => {
    setDrafts(prev => [
      ...prev,
      { uid: crypto.randomUUID(), title: "", event_date: "", event_type: "prova", subject_name: "" }
    ]);
  };

  const removeDraft = (uid: string) => {
    if (drafts.length <= 1) return;
    setDrafts(prev => prev.filter(d => d.uid !== uid));
  };

  const updateDraft = (uid: string, field: keyof DraftEvent, value: string) => {
    setDrafts(prev => prev.map(d => d.uid === uid ? { ...d, [field]: value } : d));
  };

  const handleSubmit = async () => {
    const valid = drafts.filter(d => d.title.trim() && d.event_date);
    if (valid.length === 0) {
      toast.error("Adiciona pelo menos um evento com título e data.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.submitCalendar(
        valid.map(d => ({
          title: d.title.trim(),
          event_date: d.event_date,
          event_type: d.event_type,
          subject_name: d.subject_name || undefined,
        }))
      );
      toast.success(`${valid.length} evento(s) submetido(s) com sucesso! 📅`);
      await loadEvents();
    } catch (e) {
      toast.error("Erro ao submeter calendário.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = async () => {
    if (!confirm("Tens a certeza que queres apagar todo o calendário? Poderás resubmeter depois.")) return;
    try {
      await api.clearCalendar();
      setEvents([]);
      setHasCalendar(false);
      setDrafts([{ uid: crypto.randomUUID(), title: "", event_date: "", event_type: "prova", subject_name: "" }]);
      toast.success("Calendário limpo. Podes submeter um novo.");
    } catch (e) {
      toast.error("Erro ao limpar calendário.");
    }
  };

  // Calendar grid calculation
  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const lastDay = new Date(viewYear, viewMonth + 1, 0);
    const startDayOfWeek = (firstDay.getDay() + 6) % 7; // Monday = 0

    const days: { date: Date; isCurrentMonth: boolean; dateStr: string }[] = [];

    // Previous month padding
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(viewYear, viewMonth, -i);
      days.push({ date: d, isCurrentMonth: false, dateStr: d.toISOString().split("T")[0] });
    }

    // Current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const d = new Date(viewYear, viewMonth, i);
      days.push({ date: d, isCurrentMonth: true, dateStr: d.toISOString().split("T")[0] });
    }

    // Next month padding to fill 42 cells (6 rows)
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(viewYear, viewMonth + 1, i);
      days.push({ date: d, isCurrentMonth: false, dateStr: d.toISOString().split("T")[0] });
    }

    return days;
  }, [viewMonth, viewYear]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    events.forEach(e => {
      const dateStr = e.event_date.split("T")[0];
      if (!map.has(dateStr)) map.set(dateStr, []);
      map.get(dateStr)!.push(e);
    });
    return map;
  }, [events]);

  const todayStr = new Date().toISOString().split("T")[0];

  // Upcoming events (next events from today)
  const upcomingEvents = useMemo(() => {
    return events
      .filter(e => e.event_date.split("T")[0] >= todayStr)
      .sort((a, b) => a.event_date.localeCompare(b.event_date))
      .slice(0, 8);
  }, [events, todayStr]);

  const selectedDayEvents = selectedDay ? (eventsByDate.get(selectedDay) || []) : [];

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const bottomNavItems = [
    { title: "Início", path: "/dashboard", icon: Home },
    { title: "Cursos", path: "/dashboard/subjects", icon: BookOpen },
    { title: "Planner", path: "/dashboard/tasks", icon: Check },
    { title: "IA", path: "/dashboard/chat", icon: Bot },
    { title: "Perfil", path: "/dashboard/performance", icon: User },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0e1710] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-2 border-[#4ade80] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400 font-bold">A carregar calendário...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0e1710] text-white flex flex-col font-sans pb-24 relative overflow-x-hidden">
      <div className="max-w-md mx-auto w-full px-5 py-6 animate-fade-in">

        {/* Header */}
        <div className="flex items-center justify-between mt-2 mb-6">
          <div>
            <h3 className="text-[#4ade80] text-[10px] font-black tracking-[0.2em] uppercase mb-0.5">ANO LECTIVO</h3>
            <h1 className="text-2xl font-bold text-white">Calendário Acadêmico</h1>
          </div>
          <div className="h-11 w-11 rounded-full bg-[#1a261d] border-2 border-[#4ade80]/30 shadow-[0_0_15px_rgba(74,222,128,0.15)] flex items-center justify-center">
            <Calendar className="h-5 w-5 text-[#4ade80]" />
          </div>
        </div>

        {!hasCalendar ? (
          /* ══════════ STATE 1: SUBMIT CALENDAR ══════════ */
          <div className="space-y-5">
            {/* Instructions */}
            <div className="bg-[#141e16] border border-[#254238]/60 rounded-2xl p-5 shadow-lg">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-[#4ade80]/10 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                  <GraduationCap className="h-5 w-5 text-[#4ade80]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">Submete o teu Calendário Escolar</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Adiciona todas as provas, entregas, feriados e eventos do ano lectivo. 
                    A IA Nzila usará estes dados para te ajudar a estudar de forma inteligente.
                  </p>
                </div>
              </div>
            </div>

            {/* PDF Upload Section */}
            <div className="bg-gradient-to-br from-[#141e16] to-[#1a261d] border border-[#4ade80]/20 rounded-2xl p-5 shadow-lg relative overflow-hidden">
              <div className="absolute -top-8 -right-8 w-24 h-24 bg-[#4ade80]/5 rounded-full blur-2xl" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#4ade80]/15 rounded-xl flex items-center justify-center shrink-0">
                    <Sparkles className="h-5 w-5 text-[#4ade80]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Importar do PDF</h3>
                    <p className="text-[10px] text-slate-400">A IA Nzila analisa e extrai os eventos automaticamente</p>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handlePdfUpload}
                  className="hidden"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isParsing}
                  className={`w-full py-3.5 border-2 border-dashed rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                    isParsing
                      ? "border-[#4ade80]/30 text-[#4ade80] bg-[#4ade80]/5"
                      : pdfFileName
                      ? "border-[#4ade80]/40 text-[#4ade80] hover:bg-[#4ade80]/5"
                      : "border-slate-700 text-slate-400 hover:border-[#4ade80]/40 hover:text-[#4ade80]"
                  }`}
                >
                  {isParsing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      A analisar com IA...
                    </>
                  ) : pdfFileName ? (
                    <>
                      <Check className="h-4 w-4" />
                      {pdfFileName}
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Selecionar PDF do Calendário
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-800" />
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">ou adiciona manualmente</span>
              <div className="flex-1 h-px bg-slate-800" />
            </div>

            {/* Event type legend */}
            <div className="flex flex-wrap gap-2">
              {EVENT_TYPES.map(t => (
                <span key={t.value} className="flex items-center gap-1.5 bg-[#141e16] border border-slate-800 px-2.5 py-1.5 rounded-lg">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                  <span className="text-[10px] font-bold text-slate-400">{t.label}</span>
                </span>
              ))}
            </div>

            {/* Draft Events List */}
            <div className="space-y-3">
              {drafts.map((draft, idx) => (
                <div
                  key={draft.uid}
                  className="bg-[#141e16] border border-slate-800/60 rounded-2xl p-4 space-y-3 relative group"
                >
                  {/* Row number + delete */}
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-[#4ade80] tracking-widest uppercase">
                      Evento {idx + 1}
                    </span>
                    {drafts.length > 1 && (
                      <button
                        onClick={() => removeDraft(draft.uid)}
                        className="text-red-400/60 hover:text-red-400 transition-colors p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Title */}
                  <input
                    type="text"
                    placeholder="Ex: Prova de Matemática, Entrega de Projeto..."
                    value={draft.title}
                    onChange={e => updateDraft(draft.uid, "title", e.target.value)}
                    className="w-full bg-[#0e1710] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-[#4ade80] outline-none transition-colors"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    {/* Date */}
                    <div>
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Data</label>
                      <input
                        type="date"
                        value={draft.event_date}
                        onChange={e => updateDraft(draft.uid, "event_date", e.target.value)}
                        className="w-full bg-[#0e1710] border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:border-[#4ade80] outline-none transition-colors [color-scheme:dark]"
                      />
                    </div>

                    {/* Type */}
                    <div>
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Tipo</label>
                      <select
                        value={draft.event_type}
                        onChange={e => updateDraft(draft.uid, "event_type", e.target.value as DraftEvent["event_type"])}
                        className="w-full bg-[#0e1710] border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:border-[#4ade80] outline-none transition-colors appearance-none"
                      >
                        {EVENT_TYPES.map(t => (
                          <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Subject (optional) */}
                  {(draft.event_type === "prova" || draft.event_type === "entrega") && subjects.length > 0 && (
                    <div>
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Disciplina (opcional)</label>
                      <select
                        value={draft.subject_name}
                        onChange={e => updateDraft(draft.uid, "subject_name", e.target.value)}
                        className="w-full bg-[#0e1710] border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:border-[#4ade80] outline-none transition-colors appearance-none"
                      >
                        <option value="">Nenhuma</option>
                        {subjects.map(s => (
                          <option key={s.id} value={s.name}>{s.emoji} {s.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add more + Submit */}
            <button
              onClick={addDraft}
              className="w-full py-3 border-2 border-dashed border-[#254238] hover:border-[#4ade80]/50 rounded-2xl text-sm font-bold text-slate-400 hover:text-[#4ade80] transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" /> Adicionar Mais Eventos
            </button>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full py-4 bg-[#4ade80] text-[#0e1710] font-black text-[15px] rounded-2xl flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50 shadow-[0_5px_25px_rgba(74,222,128,0.2)]"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 border-2 border-[#0e1710] border-t-transparent rounded-full animate-spin" />
                  A submeter...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" /> Submeter Calendário Completo
                </>
              )}
            </button>
          </div>
        ) : (
          /* ══════════ STATE 2: VIEW CALENDAR ══════════ */
          <div className="space-y-5">

            {/* Month navigation */}
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">
                {MONTHS_PT[viewMonth]} {viewYear}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={prevMonth}
                  className="h-9 w-9 rounded-full bg-[#141e16] border border-slate-800 flex items-center justify-center hover:text-[#4ade80] text-slate-400 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={nextMonth}
                  className="h-9 w-9 rounded-full bg-[#141e16] border border-slate-800 flex items-center justify-center hover:text-[#4ade80] text-slate-400 transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Calendar grid */}
            <div className="bg-[#141e16] border border-[#254238]/60 rounded-3xl p-4 shadow-lg">
              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {WEEKDAYS.map(d => (
                  <div key={d} className="text-center text-[9px] font-black text-slate-500 uppercase tracking-wider py-1">
                    {d}
                  </div>
                ))}
              </div>

              {/* Days grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, i) => {
                  const dayEvents = eventsByDate.get(day.dateStr) || [];
                  const isToday = day.dateStr === todayStr;
                  const isSelected = day.dateStr === selectedDay;
                  const hasEvents = dayEvents.length > 0;

                  return (
                    <button
                      key={i}
                      onClick={() => hasEvents ? setSelectedDay(isSelected ? null : day.dateStr) : null}
                      className={`relative aspect-square rounded-xl flex flex-col items-center justify-center transition-all text-xs font-bold ${
                        !day.isCurrentMonth
                          ? "text-slate-700"
                          : isSelected
                          ? "bg-[#4ade80] text-[#0e1710] shadow-[0_0_12px_rgba(74,222,128,0.3)]"
                          : isToday
                          ? "bg-[#4ade80]/15 text-[#4ade80] ring-1 ring-[#4ade80]/40"
                          : hasEvents
                          ? "text-white hover:bg-[#1e2e26] cursor-pointer"
                          : "text-slate-400"
                      }`}
                    >
                      <span className="text-[13px]">{day.date.getDate()}</span>
                      {/* Event dots */}
                      {hasEvents && day.isCurrentMonth && (
                        <div className="flex gap-0.5 mt-0.5">
                          {dayEvents.slice(0, 3).map((ev, j) => (
                            <div
                              key={j}
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: getTypeConfig(ev.event_type).color }}
                            />
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected day events */}
            {selectedDay && selectedDayEvents.length > 0 && (
              <div className="bg-[#141e16] border border-[#254238]/60 rounded-2xl p-4 space-y-3 animate-fade-in shadow-lg">
                <h3 className="text-xs font-black text-[#4ade80] uppercase tracking-widest">
                  {new Date(selectedDay + "T00:00:00").toLocaleDateString("pt-PT", {
                    weekday: "long",
                    day: "numeric",
                    month: "long"
                  })}
                </h3>
                {selectedDayEvents.map((ev, i) => {
                  const cfg = getTypeConfig(ev.event_type);
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-3 bg-[#0e1710] rounded-xl p-3 border border-slate-800/50"
                    >
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: cfg.color + "20" }}
                      >
                        <cfg.icon className="h-4 w-4" style={{ color: cfg.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{ev.title}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          {cfg.label} {ev.subject_name ? `• ${ev.subject_name}` : ""}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Upcoming events */}
            <div>
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-[#4ade80]" /> Próximos Eventos
              </h3>
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-6 border border-slate-800 border-dashed rounded-2xl bg-[#0e1710]">
                  <p className="text-sm font-bold text-slate-400">Nenhum evento próximo 🎉</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {upcomingEvents.map((ev, i) => {
                    const cfg = getTypeConfig(ev.event_type);
                    const evDate = new Date(ev.event_date.split("T")[0] + "T00:00:00");
                    const diffDays = Math.ceil((evDate.getTime() - new Date().setHours(0,0,0,0)) / (1000 * 60 * 60 * 24));
                    const urgencyLabel =
                      diffDays === 0 ? "HOJE" :
                      diffDays === 1 ? "AMANHÃ" :
                      `Em ${diffDays} dias`;

                    return (
                      <div
                        key={i}
                        className="flex items-center gap-3 bg-[#141e16] border border-slate-800/60 rounded-2xl p-4 hover:border-[#254238] transition-colors"
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: cfg.color + "15" }}
                        >
                          <cfg.icon className="h-5 w-5" style={{ color: cfg.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-bold text-white truncate">{ev.title}</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            {evDate.toLocaleDateString("pt-PT", { day: "2-digit", month: "short" })}
                            {ev.subject_name ? ` • ${ev.subject_name}` : ""}
                          </p>
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-wide px-2.5 py-1 rounded-lg shrink-0 ${
                          diffDays <= 1
                            ? "bg-red-500/15 text-red-400"
                            : diffDays <= 3
                            ? "bg-amber-500/15 text-amber-400"
                            : "bg-[#4ade80]/10 text-[#4ade80]"
                        }`}>
                          {urgencyLabel}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Stats summary */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Provas", count: events.filter(e => e.event_type === "prova").length, color: "#ef4444" },
                { label: "Entregas", count: events.filter(e => e.event_type === "entrega").length, color: "#f59e0b" },
                { label: "Total", count: events.length, color: "#4ade80" },
              ].map((s, i) => (
                <div key={i} className="bg-[#141e16] border border-slate-800/60 rounded-2xl p-4 text-center">
                  <p className="text-2xl font-black" style={{ color: s.color }}>{s.count}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Resubmit button */}
            <button
              onClick={handleClear}
              className="w-full py-3 bg-[#141e16] border border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-500/30 font-bold text-sm rounded-2xl flex items-center justify-center gap-2 transition-colors"
            >
              <RefreshCw className="h-4 w-4" /> Resubmeter Calendário
            </button>
          </div>
        )}

      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#0e1710]/95 backdrop-blur-xl border-t border-[#1a261d] px-6 py-4 flex justify-between items-center z-50">
        {bottomNavItems.map((item, i) => {
          const isActive = location.pathname === item.path;
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

export default AcademicCalendar;
