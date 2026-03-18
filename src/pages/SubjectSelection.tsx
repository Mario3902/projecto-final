import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  BookOpen, Check, ChevronRight, Plus, Trash2, Home, Bot, User,
  Upload, FileText, Star, GraduationCap, ArrowLeft, X,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/api";

// ── Data ──────────────────────────────────────────────────────────────────────

const courses = [
  {
    id: "ciencias", name: "Ciências e Tecnologia", emoji: "🔬",
    desc: "Física, Química, Biologia e Matemática",
    subjects: [
      { id: "mat", name: "Matemática", emoji: "📐" },
      { id: "fis", name: "Física", emoji: "⚛️" },
      { id: "qui", name: "Química", emoji: "🧪" },
      { id: "bio", name: "Biologia", emoji: "🧬" },
      { id: "ing", name: "Inglês", emoji: "🇬🇧" },
      { id: "port", name: "Português", emoji: "📝" },
    ],
  },
  {
    id: "humanidades", name: "Humanidades", emoji: "📚",
    desc: "História, Filosofia, Sociologia e Línguas",
    subjects: [
      { id: "hist", name: "História", emoji: "📜" },
      { id: "geo", name: "Geografia", emoji: "🌍" },
      { id: "port", name: "Português", emoji: "📝" },
      { id: "fil", name: "Filosofia", emoji: "🤔" },
      { id: "soc", name: "Sociologia", emoji: "🏛️" },
      { id: "ing", name: "Inglês", emoji: "🇬🇧" },
    ],
  },
  {
    id: "gestao", name: "Gestão e Economia", emoji: "💼",
    desc: "Contabilidade, Economia e Gestão Empresarial",
    subjects: [
      { id: "eco", name: "Economia", emoji: "📊" },
      { id: "cont", name: "Contabilidade", emoji: "🧾" },
      { id: "mat", name: "Matemática", emoji: "📐" },
      { id: "port", name: "Português", emoji: "📝" },
      { id: "ing", name: "Inglês", emoji: "🇬🇧" },
      { id: "dir", name: "Direito Comercial", emoji: "⚖️" },
    ],
  },
  {
    id: "informatica", name: "Informática e TI", emoji: "💻",
    desc: "Programação, Redes e Sistemas",
    subjects: [
      { id: "prog", name: "Programação", emoji: "👨‍💻" },
      { id: "redes", name: "Redes", emoji: "🔗" },
      { id: "bd", name: "Bases de Dados", emoji: "🗄️" },
      { id: "mat", name: "Matemática", emoji: "📐" },
      { id: "ing", name: "Inglês", emoji: "🇬🇧" },
      { id: "so", name: "Sistemas Operativos", emoji: "🖥️" },
    ],
  },
  {
    id: "saude", name: "Saúde e Medicina", emoji: "🏥",
    desc: "Anatomia, Enfermagem, Farmácia e Medicina",
    subjects: [
      { id: "bio", name: "Biologia", emoji: "🧬" },
      { id: "qui", name: "Química", emoji: "🧪" },
      { id: "anat", name: "Anatomia", emoji: "🫀" },
      { id: "fis", name: "Física", emoji: "⚛️" },
      { id: "port", name: "Português", emoji: "📝" },
      { id: "ing", name: "Inglês", emoji: "🇬🇧" },
    ],
  },
  {
    id: "artes", name: "Artes e Comunicação", emoji: "🎨",
    desc: "Belas Artes, Jornalismo e Design",
    subjects: [
      { id: "art", name: "Artes Visuais", emoji: "🎨" },
      { id: "port", name: "Português", emoji: "📝" },
      { id: "hist", name: "História da Arte", emoji: "🖼️" },
      { id: "mus", name: "Música", emoji: "🎵" },
      { id: "ing", name: "Inglês", emoji: "🇬🇧" },
      { id: "soc", name: "Sociologia", emoji: "🏛️" },
    ],
  },
];

// ── Types ─────────────────────────────────────────────────────────────────────

interface Material {
  id: string;
  name: string;
  type: "proof" | "summary" | "exercises" | "other";
  content: string; // text content or file name
  grade?: number;
  addedAt: string;
  fileName?: string;
}

interface SubjectData {
  id: string;
  name: string;
  emoji: string;
  nota?: number;
  materials: Material[];
}

interface CourseData {
  courseId: string;
  courseName: string;
  subjects: SubjectData[];
  ano: string;
}

const materialTypes = [
  { id: "proof", label: "Prova / Teste", emoji: "📋" },
  { id: "summary", label: "Resumo / Apontamento", emoji: "📄" },
  { id: "exercises", label: "Lista de Exercícios", emoji: "✏️" },
  { id: "other", label: "Outro Material", emoji: "📎" },
] as const;

const anos = ["10º Ano", "11º Ano", "12º Ano", "1º Ano Univ.", "2º Ano Univ.", "3º Ano Univ."];

// ── Main Component ────────────────────────────────────────────────────────────

const STORAGE_KEY = "nzila_course_data";

const SubjectSelection = () => {
  const { toast } = useToast();
  const location = useLocation();

  const [courseData, setCourseData] = useState<CourseData | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);

  const [initialStep] = useState<"detail" | "course">("detail"); // Default to detail
  const [currentStep, setCurrentStep] = useState(initialStep);

  // Sync with Backend
  const syncWithBackend = async () => {
    if (!localStorage.getItem("nzila_token")) return;
    try {
       // Fetch both existing subjects and the user's profile
       const [dbSubjects, profile] = await Promise.all([
         api.getSubjects(),
         api.getProfile().catch(() => null)
       ]);

       let subjectsToUse = dbSubjects || [];
       let userCourseId = "custom";
       let userCourseName = profile?.course || "O meu Curso";

       // Find the matching course data from our constants based on string similarity
       const matchedCourse = courses.find(c => 
         c.name.toLowerCase() === userCourseName.toLowerCase() || 
         userCourseName.toLowerCase().includes(c.id.toLowerCase())
       );

       if (matchedCourse) {
          userCourseId = matchedCourse.id;
          userCourseName = matchedCourse.name;
       }

       // ── AUTO ENROLLMENT ──
       // If no subjects in DB, but the profile has a matched course, create them automatically
       if (subjectsToUse.length === 0 && matchedCourse) {
          toast({ title: "A configurar disciplinas do teu curso..." });
          for (const subj of matchedCourse.subjects) {
             await api.addSubject(subj.name, subj.emoji);
          }
          // Re-fetch now that they are created
          subjectsToUse = await api.getSubjects();
          toast({ title: `${subjectsToUse.length} disciplinas carregadas automaticamente!` });
       }

       if (subjectsToUse && subjectsToUse.length > 0) {
         // Convert backend format to frontend format
         const formattedSubjects: SubjectData[] = subjectsToUse.map((s: any) => ({
           id: s.id.toString(),
           name: s.name,
           emoji: s.emoji || "📚",
           nota: undefined, 
           materials: s.materials.map((m: any) => ({
             id: m.id.toString(),
             name: m.title,
             type: m.type,
             content: m.content,
             addedAt: new Date(m.created_at).toLocaleDateString("pt-PT"),
             fileName: m.is_link ? m.content : undefined
           }))
         }));
         
         const parsed: CourseData = { courseId: userCourseId, courseName: userCourseName, ano: profile?.year || anos[0], subjects: formattedSubjects };
         
         setCourseData(parsed);
         if (formattedSubjects.length > 0 && !activeSubjectId) {
            setActiveSubjectId(formattedSubjects[0].id);
         }
         if (currentStep !== "detail") setCurrentStep("detail");
       } else {
         // If still no subjects, fall back to manual course selection
         setCurrentStep("course");
       }
    } catch (e) {
      console.error(e);
      toast({ title: "Erro ao sincronizar dados", variant: "destructive" });
    }
  };

  useEffect(() => {
    syncWithBackend();
  }, []);

  const [matType, setMatType] = useState<"proof" | "summary" | "exercises" | "other">("summary");
  const [matContent, setMatContent] = useState("");
  const [matName, setMatName] = useState("");
  const [matFile, setMatFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  
  // Trimestral grades UI
  const [activeTrimester, setActiveTrimester] = useState<"T1"|"T2"|"T3">("T1");
  const [customSubName, setCustomSubName] = useState("");

  // ── Helpers ────────────────────────────────────────────────────────────────
  const activeSubject = courseData?.subjects.find((s) => s.id === activeSubjectId);

  const addExtraSubject = async () => {
    if (!customSubName.trim()) return;
    try {
      await api.addSubject(customSubName.trim(), "📝");
      setCustomSubName("");
      toast({ title: "Disciplina adicionada!" });
      syncWithBackend();
    } catch (e) {
      toast({ title: "Erro ao adicionar disciplina", variant: "destructive" });
    }
  };

  const addMaterial = async () => {
    if (!matContent.trim() && !matName.trim() && !matFile) {
      toast({ title: "Adiciona conteúdo, ficheiro ou nome do material", variant: "destructive" });
      return;
    }
    
    const finalName = matName || matFile?.name || (matType === "proof" ? "Prova sem título" : "Material sem título");
    
    try {
       await api.addMaterial(activeSubjectId!, {
         title: finalName,
         type: matType,
         content: matContent || matFile?.name || "",
         isLink: !!matFile
       });

       await syncWithBackend(); // Refresh state

       setMatContent("");
       setMatName("");
       setMatFile(null);
       if (fileRef.current) fileRef.current.value = "";
       toast({ title: "Material adicionado! 📚", description: `Disponível para Quiz e IA.` });

    } catch(e) { toast({ title: "Erro ao adicionar material ao servidor", variant: "destructive" }); }
  };

  const deleteMaterial = async (matId: string) => {
    try {
      await api.deleteMaterial(matId);
      await syncWithBackend();
      toast({ title: "Material apagado!", variant: "default" });
    } catch(e){ toast({ title: "Erro ao apagar", variant: "destructive" }); }
  };

  const saveTrimesterGrade = async (testType: "p1" | "p2", nota: number) => {
    try {
      if (isNaN(nota) || nota < 0 || nota > 20) return;
      await api.saveGrade(Number(activeSubjectId), nota, activeTrimester, testType);
      toast({ title: "Nota guardada com sucesso!", variant: "default" });
    } catch(e) {
      toast({ title: "Erro ao guardar nota", variant: "destructive" });
    }
  };

  const totalMaterials = courseData?.subjects.reduce((a, s) => a + s.materials.length, 0) ?? 0;
  const subjectsWithMaterials = courseData?.subjects.filter((s) => s.materials.length > 0).length ?? 0;

  const bottomNavItems = [
    { title: "Início", path: "/dashboard", icon: Home },
    { title: "Cursos", path: "/dashboard/subjects", icon: BookOpen },
    { title: "Planner", path: "/dashboard/tasks", icon: Check },
    { title: "IA", path: "/dashboard/chat", icon: Bot },
    { title: "Perfil", path: "/dashboard/performance", icon: User },
  ];

  const renderBottomNav = () => (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#0e1710]/95 backdrop-blur-xl border-t border-[#1a261d] px-6 py-4 flex justify-between items-center z-50">
      {bottomNavItems.map((item, i) => {
        const isActive = location.pathname === item.path || (item.title === 'Cursos' && true);
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
  );

  return (
    <div className="min-h-screen bg-[#0e1710] text-white flex flex-col font-sans pb-24 relative overflow-x-hidden">
      <div className="max-w-md mx-auto w-full px-5 py-6 animate-fade-in">

        {/* Header */}
        <div className="flex items-center gap-4 mb-6 mt-2">
          <div className="flex-1 overflow-hidden">
            <h1 className="text-lg font-bold text-white truncate">{courseData?.courseName}</h1>
            <p className="text-[11px] text-[#4ade80] font-bold uppercase tracking-wider">{courseData?.ano}</p>
          </div>
          <div className="text-right shrink-0 bg-[#1e2e26] border border-[#254238] rounded-xl px-3 py-1.5">
            <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Acervo</p>
            <p className="text-lg font-black text-[#4ade80] leading-none">{totalMaterials}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="bg-[#141e16] border border-[#254238]/60 p-4 rounded-2xl mb-6 shadow-lg">
          <div className="flex justify-between text-[11px] font-bold mb-2">
            <span className="text-slate-400">{subjectsWithMaterials} de {courseData?.subjects.length} cadeiras c/ material</span>
            <span className="text-[#4ade80]">{totalMaterials} materiais doc.</span>
          </div>
          <div className="h-2 w-full bg-[#0e1710] rounded-full overflow-hidden flex">
             <div className="h-full bg-[#4ade80] transition-all duration-500" style={{ width: `${courseData ? (subjectsWithMaterials / courseData.subjects.length) * 100 : 0}%` }}></div>
          </div>
        </div>

        {/* Subject tabs (horizontal scroll) */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-2 -mx-5 px-5 scrollbar-hide snap-x" style={{ scrollbarWidth: 'none' }}>
          {courseData?.subjects.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setActiveSubjectId(sub.id)}
              className={`shrink-0 flex flex-col items-center justify-center gap-2 w-20 p-2.5 rounded-2xl transition-all snap-start ${activeSubjectId === sub.id
                ? "bg-[#4ade80] text-[#0e1710] shadow-[0_5px_15px_rgba(74,222,128,0.2)]"
                : "bg-[#141e16] border border-slate-800 text-slate-400 hover:border-[#254238]"
                }`}
            >
              <span className="text-2xl mt-1">{sub.emoji}</span>
              <span className="text-[10px] font-bold leading-tight text-center truncate w-full px-1">{sub.name}</span>
              
              {sub.materials.length > 0 && (
                <span className={`absolute top-0 right-0 -mt-1 -mr-1 h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-black border-2 border-[#0e1710] ${
                  activeSubjectId === sub.id ? "bg-[#0e1710] text-[#4ade80]" : "bg-[#4ade80] text-[#0e1710]"
                }`}>
                  {sub.materials.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Add Custom Subject */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="Adicionar outra disciplina..."
            value={customSubName}
            onChange={(e) => setCustomSubName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addExtraSubject()}
            className="flex-1 bg-[#141e16] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-[#4ade80] transition-colors"
          />
          <button
            onClick={addExtraSubject}
            disabled={!customSubName.trim()}
            className="bg-[#4ade80] hover:bg-[#22c55e] disabled:opacity-30 disabled:cursor-not-allowed text-[#0e1710] font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4 stroke-[3]" /> Adicionar
          </button>
        </div>

        {activeSubject && (
          <div className="animate-slide-up">
            {/* Avaliação Trimestral */}
            <div className="bg-gradient-to-r from-[#141e16] to-[#1a261d] border border-[#254238]/60 p-5 rounded-3xl mb-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-black text-[#4ade80] uppercase tracking-widest flex items-center gap-1.5">
                  <Star className="h-3.5 w-3.5 fill-[#4ade80]" /> Desempenho
                </p>
                <h3 className="text-lg font-bold text-white">{activeSubject.name}</h3>
              </div>

              {/* Trimester Tabs */}
              <div className="flex gap-2 mb-5">
                {(["T1","T2","T3"] as const).map(tri => (
                  <button 
                    key={tri}
                    onClick={() => setActiveTrimester(tri)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${activeTrimester === tri ? "bg-[#4ade80] text-[#0e1710]" : "bg-[#1e2e26] text-slate-400 hover:text-slate-200"}`}
                  >
                    {tri === "T1" ? "1º Trim" : tri === "T2" ? "2º Trim" : "3º Trim"}
                  </button>
                ))}
              </div>

              {/* Grade Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#0e1710] p-3 rounded-2xl border border-slate-800 flex flex-col items-center">
                  <span className="text-[10px] text-slate-500 font-bold uppercase mb-2 text-center">Prova Prof. 1 (P1)</span>
                  <div className="flex items-end gap-1">
                    <input
                      type="number" min={0} max={20} placeholder="-"
                      onBlur={(e) => saveTrimesterGrade("p1", Number(e.target.value))}
                      className="w-12 h-10 text-center text-xl font-black text-white bg-transparent outline-none rounded-xl border-b border-transparent focus:border-[#4ade80]"
                    />
                    <span className="text-xs text-slate-500 font-bold pb-2">/20</span>
                  </div>
                </div>

                <div className="bg-[#0e1710] p-3 rounded-2xl border border-slate-800 flex flex-col items-center">
                  <span className="text-[10px] text-slate-500 font-bold uppercase mb-2 text-center">Prova Prof. 2 (P2)</span>
                  <div className="flex items-end gap-1">
                    <input
                      type="number" min={0} max={20} placeholder="-"
                      onBlur={(e) => saveTrimesterGrade("p2", Number(e.target.value))}
                      className="w-12 h-10 text-center text-xl font-black text-white bg-transparent outline-none rounded-xl border-b border-transparent focus:border-[#4ade80]"
                    />
                    <span className="text-xs text-slate-500 font-bold pb-2">/20</span>
                  </div>
                </div>
              </div>
              <p className="text-[9px] text-slate-500 text-center mt-3 font-medium">As notas são guardadas automaticamente ao saíres da caixa de texto.</p>
            </div>

            {/* AI hint */}
            <div className="bg-[#4ade80]/10 border border-[#4ade80]/20 p-4 rounded-2xl flex items-start gap-3 mb-6">
              <div className="h-8 w-8 min-w-8 bg-[#4ade80]/20 rounded-full flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-[#4ade80]" />
              </div>
              <div>
                <p className="text-xs font-bold text-white mb-0.5">Dica Nzila IA</p>
                <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                  Adiciona os teus resumos, listas de exercícios e apontamentos abaixo. Usarei essa base para gerar Quizzes e guiar-te no estudo.
                </p>
              </div>
            </div>

            {/* Materials list */}
            {activeSubject.materials.length > 0 && (
              <div className="space-y-3 mb-8">
                <div className="flex justify-between items-end mb-2">
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                     Arquivos de Estudo
                   </p>
                </div>
                {activeSubject.materials.map((mat) => {
                  const typeInfo = materialTypes.find((t) => t.id === mat.type)!;
                  return (
                    <div key={mat.id} className="bg-[#141e16] border border-slate-800/60 p-4 rounded-3xl flex flex-col gap-3 group">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-[#1e2e26] rounded-2xl flex items-center justify-center shrink-0 text-2xl border border-slate-700/50 group-hover:bg-[#4ade80]/10 transition-colors">
                          {typeInfo?.emoji ?? '📎'}
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <p className="font-bold text-white text-[15px] truncate mb-1">{mat.name}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[9px] font-bold bg-slate-800 text-slate-300 px-2 py-1 rounded">
                              {(typeInfo?.label ?? mat.type ?? 'outro').toUpperCase()}
                            </span>
                            <span className="text-[10px] font-medium text-slate-500">{mat.addedAt}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteMaterial(mat.id)}
                          className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors shrink-0"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      
                      {mat.fileName && (
                        <div className="flex items-center gap-2 bg-[#0e1710] px-3 py-2 rounded-xl border border-slate-800 mt-1 w-fit">
                          <FileText className="h-4 w-4 text-[#4ade80] shrink-0" />
                          <span className="text-xs font-bold text-slate-300 truncate max-w-[200px]">{mat.fileName}</span>
                        </div>
                      )}
                      
                      {mat.grade !== undefined && mat.grade > 0 && (
                        <div className="flex items-center gap-1.5 mt-1">
                           <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                           <span className="text-xs font-bold text-yellow-500">Nota: {mat.grade}/20</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {activeSubject.materials.length === 0 && (
              <div className="text-center py-8 bg-[#141e16] border border-slate-800/60 border-dashed rounded-3xl mb-8">
                <div className="w-16 h-16 bg-[#1e2e26] rounded-full flex items-center justify-center mx-auto mb-3">
                   <Upload className="h-6 w-6 text-slate-500" />
                </div>
                <p className="text-sm font-bold text-white">Sem ficheiros ou links</p>
                <p className="text-xs text-slate-500 mt-1 max-w-[200px] mx-auto leading-relaxed">Podes preencher ficheiros de PDFs, fotos de apontamentos ou testes passados.</p>
              </div>
            )}

            {/* Add material form */}
            <div className="bg-[#141e16] border border-[#254238]/60 p-6 rounded-3xl space-y-5">
              <p className="text-[15px] font-bold text-white flex items-center gap-2">
                <Plus className="h-5 w-5 text-[#4ade80]" /> Novo Ficheiro / Apontamento
              </p>

              {/* Type selector */}
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Categoria</p>
                <div className="grid grid-cols-2 gap-2">
                  {materialTypes.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setMatType(t.id)}
                      className={`px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-colors border ${matType === t.id
                        ? "bg-[#4ade80]/10 border-[#4ade80] text-[#4ade80]"
                        : "bg-[#0e1710] border-slate-800 text-slate-400 hover:border-slate-600"
                        }`}
                    >
                      {t.emoji} {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Título do Material</p>
                <input
                  type="text"
                  placeholder={matType === "proof" ? "Ex: Exame Nacional 2024" : "Dá um nome ao apontamento..."}
                  value={matName}
                  onChange={(e) => setMatName(e.target.value)}
                  className="w-full bg-[#0e1710] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-[#4ade80] transition-colors"
                />
              </div>

              {/* File Upload */}
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Anexo (Opcional)</p>
                <div
                  className="border-2 border-dashed border-slate-700 bg-[#0e1710] rounded-2xl p-5 text-center hover:border-[#4ade80]/50 transition-colors cursor-pointer group"
                  onClick={() => fileRef.current?.click()}
                >
                  <input
                    type="file"
                    className="hidden"
                    ref={fileRef}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setMatFile(e.target.files[0]);
                        if (!matName) setMatName(e.target.files[0].name.split('.')[0]);
                      }
                    }}
                    accept=".pdf,.doc,.docx,.txt,image/*"
                  />
                  {matFile ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-[#4ade80]/10 rounded-full flex items-center justify-center">
                        <FileText className="h-6 w-6 text-[#4ade80]" />
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-white truncate max-w-[200px]">{matFile.name}</p>
                        <p className="text-[10px] font-bold text-slate-500 mt-0.5">{(matFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMatFile(null);
                          if (fileRef.current) fileRef.current.value = '';
                        }}
                        className="text-[10px] text-red-400 font-bold mt-2 px-4 py-1.5 bg-red-500/10 rounded-full hover:bg-red-500 hover:text-white transition-colors"
                      >
                        Remover Anexo
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 bg-[#1e2e26] rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                        <Upload className="h-5 w-5 text-slate-400 group-hover:text-[#4ade80]" />
                      </div>
                      <p className="text-[13px] font-bold text-white mb-1">Clica para anexar do telemóvel</p>
                      <p className="text-[10px] font-bold text-slate-500">Documentos PDF, Word ou Imagens</p>
                    </>
                  )}
                </div>
              </div>

              {/* Content text */}
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <div className="h-px bg-slate-800 flex-1" />
                  OU COLA TEXTO ABAIXO
                  <div className="h-px bg-slate-800 flex-1" />
                </p>
                <textarea
                  rows={4}
                  placeholder={
                    matType === "proof"
                      ? "Cola aqui as perguntas do teste se não tiveres PDF..."
                      : matType === "summary"
                        ? "Digita ou cola o teu bom e velho resumo..."
                        : "Escreve aqui o texto da matéria..."
                  }
                  value={matContent}
                  onChange={(e) => setMatContent(e.target.value)}
                  className="w-full bg-[#0e1710] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-[#4ade80] transition-colors resize-none mb-1"
                />
              </div>

              {/* Submit */}
              <button
                onClick={addMaterial}
                className="w-full py-4 bg-[#4ade80] hover:bg-[#22c55e] text-[#0e1710] font-black tracking-wide text-[15px] rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                <Check className="h-5 w-5 stroke-[3]" /> Adicionar à Base de Dados
              </button>
            </div>
            
          </div>
        )}
      </div>
      {renderBottomNav()}
    </div>
  );
};

export default SubjectSelection;
