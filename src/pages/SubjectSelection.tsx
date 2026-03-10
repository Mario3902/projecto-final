import { useState, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import {
  BookOpen, Check, ChevronRight, ChevronDown, Plus, Trash2,
  Upload, FileText, ClipboardList, Star, GraduationCap, ArrowLeft, X,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

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
  type: "prova" | "resumo" | "exercicio" | "outro";
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
  { id: "prova", label: "Prova / Teste", emoji: "📋" },
  { id: "resumo", label: "Resumo / Apontamento", emoji: "📄" },
  { id: "exercicio", label: "Lista de Exercícios", emoji: "✏️" },
  { id: "outro", label: "Outro Material", emoji: "📎" },
] as const;

const anos = ["10º Ano", "11º Ano", "12º Ano", "1º Ano Universitário", "2º Ano Universitário", "3º Ano Universitário"];

// ── Main Component ────────────────────────────────────────────────────────────

const SubjectSelection = () => {
  const { toast } = useToast();
  const [step, setStep] = useState<"course" | "subjects" | "detail">("course");
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [selectedAno, setSelectedAno] = useState(anos[0]);
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);

  // Material form
  const [matType, setMatType] = useState<"prova" | "resumo" | "exercicio" | "outro">("resumo");
  const [matContent, setMatContent] = useState("");
  const [matGrade, setMatGrade] = useState<string>("");
  const [matName, setMatName] = useState("");
  const [matFile, setMatFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);

  const toggleSubject = (id: string) =>
    setSelectedSubjectIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );

  const handleConfirmCourse = () => {
    if (!selectedCourseId) return;
    setStep("subjects");
    setSelectedSubjectIds(selectedCourse?.subjects.map((s) => s.id) ?? []);
  };

  const handleConfirmSubjects = () => {
    if (selectedSubjectIds.length === 0) {
      toast({ title: "Seleciona pelo menos uma disciplina", variant: "destructive" });
      return;
    }
    const subjectsData: SubjectData[] = selectedCourse!.subjects
      .filter((s) => selectedSubjectIds.includes(s.id))
      .map((s) => ({ ...s, materials: [] }));

    setCourseData({
      courseId: selectedCourseId!,
      courseName: selectedCourse!.name,
      subjects: subjectsData,
      ano: selectedAno,
    });
    setActiveSubjectId(subjectsData[0]?.id ?? null);
    setStep("detail");
    toast({ title: `Curso configurado! ✅`, description: `${subjectsData.length} disciplinas adicionadas.` });
  };

  const activeSubject = courseData?.subjects.find((s) => s.id === activeSubjectId);

  const addMaterial = () => {
    if (!matContent.trim() && !matName.trim() && !matFile) {
      toast({ title: "Adiciona conteúdo, ficheiro ou nome do material", variant: "destructive" });
      return;
    }
    const newMat: Material = {
      id: Date.now().toString(),
      name: matName || matFile?.name || (matType === "prova" ? "Prova sem título" : "Material sem título"),
      type: matType,
      content: matContent,
      grade: matGrade ? Number(matGrade) : undefined,
      addedAt: new Date().toLocaleDateString("pt-AO"),
      fileName: matFile?.name,
    };
    setCourseData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        subjects: prev.subjects.map((s) =>
          s.id === activeSubjectId
            ? { ...s, materials: [...s.materials, newMat] }
            : s
        ),
      };
    });
    setMatContent("");
    setMatName("");
    setMatGrade("");
    setMatFile(null);
    if (fileRef.current) fileRef.current.value = "";
    toast({ title: "Material adicionado! 📚", description: `Disponível para Quiz e IA.` });
  };

  const deleteMaterial = (matId: string) => {
    setCourseData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        subjects: prev.subjects.map((s) =>
          s.id === activeSubjectId
            ? { ...s, materials: s.materials.filter((m) => m.id !== matId) }
            : s
        ),
      };
    });
  };

  const updateNota = (nota: number) => {
    setCourseData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        subjects: prev.subjects.map((s) =>
          s.id === activeSubjectId ? { ...s, nota } : s
        ),
      };
    });
  };

  const totalMaterials = courseData?.subjects.reduce((a, s) => a + s.materials.length, 0) ?? 0;
  const subjectsWithMaterials = courseData?.subjects.filter((s) => s.materials.length > 0).length ?? 0;

  // ── STEP 1: Course Selection ───────────────────────────────────────────────
  if (step === "course") {
    return (
      <DashboardLayout>
        <div className="space-y-4 animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Meus Cursos 🎓</h1>
            <p className="text-sm text-muted-foreground mt-1">Escolhe o teu curso para personalizar o estudo</p>
          </div>

          {/* Ano letivo */}
          <div className="glass-card p-4 rounded-2xl">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Ano Letivo</p>
            <div className="flex flex-wrap gap-2">
              {anos.map((ano) => (
                <button
                  key={ano}
                  onClick={() => setSelectedAno(ano)}
                  className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all ${selectedAno === ano
                    ? "gradient-primary text-white"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {ano}
                </button>
              ))}
            </div>
          </div>

          {/* Course cards */}
          <div className="space-y-3">
            {courses.map((course) => (
              <button
                key={course.id}
                onClick={() => setSelectedCourseId(course.id)}
                className={`w-full glass-card p-4 rounded-2xl flex items-center gap-4 text-left transition-all active:scale-[0.98] ${selectedCourseId === course.id
                  ? "border-2 border-primary bg-primary/5"
                  : "border border-border/50 hover:border-primary/40"
                  }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${selectedCourseId === course.id ? "gradient-primary" : "bg-muted"
                  }`}>
                  {course.emoji}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-foreground">{course.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{course.desc}</p>
                  <p className="text-xs text-primary mt-1 font-medium">{course.subjects.length} disciplinas</p>
                </div>
                {selectedCourseId === course.id && (
                  <div className="w-6 h-6 gradient-primary rounded-full flex items-center justify-center shrink-0">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>

          <button
            onClick={handleConfirmCourse}
            disabled={!selectedCourseId}
            className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all ${selectedCourseId
              ? "gradient-primary text-white shadow-lg active:scale-[0.98]"
              : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
          >
            Continuar <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // ── STEP 2: Select Subjects ────────────────────────────────────────────────
  if (step === "subjects") {
    return (
      <DashboardLayout>
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setStep("course")}
              className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Disciplinas</h1>
              <p className="text-xs text-muted-foreground">{selectedCourse?.name} · {selectedAno}</p>
            </div>
          </div>

          {/* Selected pills */}
          {selectedSubjectIds.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 bg-primary/5 rounded-xl border border-primary/20">
              {selectedSubjectIds.map((id) => {
                const sub = selectedCourse?.subjects.find((s) => s.id === id);
                return sub ? (
                  <button
                    key={id}
                    onClick={() => toggleSubject(id)}
                    className="flex items-center gap-1 text-xs font-semibold bg-primary text-white px-2.5 py-1 rounded-full"
                  >
                    {sub.emoji} {sub.name} <X className="h-3 w-3 ml-0.5" />
                  </button>
                ) : null;
              })}
            </div>
          )}

          {/* Subjects grid */}
          <div className="grid grid-cols-2 gap-3">
            {selectedCourse?.subjects.map((sub) => {
              const isSelected = selectedSubjectIds.includes(sub.id);
              return (
                <button
                  key={sub.id}
                  onClick={() => toggleSubject(sub.id)}
                  className={`relative p-4 rounded-2xl border-2 text-left transition-all active:scale-[0.97] ${isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border bg-muted/30 hover:border-primary/40"
                    }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 gradient-primary rounded-full flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                  <span className="text-2xl">{sub.emoji}</span>
                  <p className="font-semibold text-foreground text-sm mt-2">{sub.name}</p>
                </button>
              );
            })}
          </div>

          {/* Custom subject */}
          <div className="glass-card p-4 rounded-2xl">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              ➕ Queres adicionar outra disciplina?
            </p>
            <p className="text-xs text-muted-foreground">Podes adicionar materiais personalizados na próxima etapa.</p>
          </div>

          <button
            onClick={handleConfirmSubjects}
            disabled={selectedSubjectIds.length === 0}
            className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all ${selectedSubjectIds.length > 0
              ? "gradient-primary text-white shadow-lg active:scale-[0.98]"
              : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
          >
            Confirmar {selectedSubjectIds.length} disciplina(s) <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // ── STEP 3: Detail – manage materials per subject ─────────────────────────
  return (
    <DashboardLayout>
      <div className="space-y-4 animate-fade-in">

        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setStep("subjects")}
            className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">{courseData?.courseName}</h1>
            <p className="text-xs text-muted-foreground">{courseData?.ano}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Materiais</p>
            <p className="text-lg font-black text-primary">{totalMaterials}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="glass-card p-3 rounded-2xl">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">{subjectsWithMaterials} de {courseData?.subjects.length} disciplinas com materiais</span>
            <span className="text-primary font-bold">{totalMaterials} itens</span>
          </div>
          <Progress
            value={courseData ? (subjectsWithMaterials / courseData.subjects.length) * 100 : 0}
            className="h-2"
          />
        </div>

        {/* Subject tabs (horizontal scroll) */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
          {courseData?.subjects.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setActiveSubjectId(sub.id)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${activeSubjectId === sub.id
                ? "gradient-primary text-white"
                : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
            >
              {sub.emoji} {sub.name}
              {sub.materials.length > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${activeSubjectId === sub.id ? "bg-white/20 text-white" : "bg-primary/15 text-primary"
                  }`}>
                  {sub.materials.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeSubject && (
          <>
            {/* Nota atual */}
            <div className="glass-card p-4 rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {activeSubject.emoji} {activeSubject.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">Nota de classificação atual</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={20}
                    placeholder="—"
                    value={activeSubject.nota ?? ""}
                    onChange={(e) => updateNota(Number(e.target.value))}
                    className="w-16 text-center text-xl font-black text-primary bg-primary/10 border border-primary/30 rounded-xl px-2 py-1 outline-none"
                  />
                  <span className="text-sm text-muted-foreground font-semibold">/ 20</span>
                </div>
              </div>
              {activeSubject.nota !== undefined && (
                <div className="mt-2">
                  <Progress value={(activeSubject.nota / 20) * 100} className="h-1.5" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {activeSubject.nota >= 14 ? "✅ Aprovado" : activeSubject.nota >= 10 ? "⚠️ Suficiente" : "❌ Negativo"}
                  </p>
                </div>
              )}
            </div>

            {/* Add material form */}
            <div className="glass-card p-4 rounded-2xl space-y-3">
              <p className="text-sm font-bold text-foreground flex items-center gap-2">
                <Plus className="h-4 w-4 text-primary" /> Adicionar Material
              </p>

              {/* Type selector */}
              <div className="grid grid-cols-2 gap-2">
                {materialTypes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setMatType(t.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all ${matType === t.id
                      ? "gradient-primary text-white"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    {t.emoji} {t.label}
                  </button>
                ))}
              </div>

              {/* Name */}
              <input
                type="text"
                placeholder={matType === "prova" ? "Ex: Prova de Maio 2025" : "Nome do material"}
                value={matName}
                onChange={(e) => setMatName(e.target.value)}
                className="w-full bg-muted/60 border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
              />

              {/* File Upload */}
              <div
                className="border-2 border-dashed border-border rounded-xl p-4 text-center hover:border-primary/50 transition-colors cursor-pointer"
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
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{matFile.name}</p>
                      <p className="text-xs text-muted-foreground">{(matFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMatFile(null);
                        if (fileRef.current) fileRef.current.value = '';
                      }}
                      className="text-xs text-destructive font-semibold mt-1 px-3 py-1 bg-destructive/10 rounded-full hover:bg-destructive/20"
                    >
                      Remover ficheiro
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center mx-auto mb-2">
                      <Upload className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">Clica para anexar ficheiro</p>
                    <p className="text-xs text-muted-foreground mt-1">PDF, Word, Imagens ou Texto</p>
                  </>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="h-px bg-border flex-1" />
                <span className="text-xs text-muted-foreground font-semibold">OU</span>
                <div className="h-px bg-border flex-1" />
              </div>

              {/* Content */}
              <textarea
                rows={4}
                placeholder={
                  matType === "prova"
                    ? "Cola aqui as perguntas ou conteúdo da prova..."
                    : matType === "resumo"
                      ? "Escreve ou cola o teu resumo/apontamento..."
                      : "Descreve ou cola o conteúdo aqui..."
                }
                value={matContent}
                onChange={(e) => setMatContent(e.target.value)}
                className="w-full bg-muted/60 border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary resize-none"
              />

              {/* Grade (for provas) */}
              {matType === "prova" && (
                <div className="flex items-center gap-3">
                  <Star className="h-4 w-4 text-yellow-500 shrink-0" />
                  <input
                    type="number"
                    min={0}
                    max={20}
                    placeholder="Nota obtida (0-20)"
                    value={matGrade}
                    onChange={(e) => setMatGrade(e.target.value)}
                    className="flex-1 bg-muted/60 border border-border rounded-xl px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                  />
                  <span className="text-sm text-muted-foreground">/ 20</span>
                </div>
              )}

              {/* Submit */}
              <button
                onClick={addMaterial}
                className="w-full py-3 gradient-primary text-white font-bold rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
              >
                <Upload className="h-4 w-4" /> Guardar Material
              </button>
              <p className="text-[10px] text-muted-foreground text-center">
                Este material será usado para gerar Quizzes e auxiliar a IA no estudo
              </p>
            </div>

            {/* Materials list */}
            {activeSubject.materials.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Materiais guardados ({activeSubject.materials.length})
                </p>
                {activeSubject.materials.map((mat) => {
                  const typeInfo = materialTypes.find((t) => t.id === mat.type)!;
                  return (
                    <div key={mat.id} className="glass-card p-3 rounded-xl flex items-start gap-3">
                      <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center shrink-0 text-base">
                        {typeInfo.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-foreground text-sm truncate">{mat.name}</p>
                          <button
                            onClick={() => deleteMaterial(mat.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
                            {typeInfo.label}
                          </span>
                          {mat.grade !== undefined && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${mat.grade >= 14 ? "bg-primary/15 text-primary" :
                              mat.grade >= 10 ? "bg-yellow-500/15 text-yellow-600" :
                                "bg-destructive/15 text-destructive"
                              }`}>
                              ⭐ {mat.grade}/20
                            </span>
                          )}
                          <span className="text-[10px] text-muted-foreground">{mat.addedAt}</span>
                        </div>
                        {mat.fileName && (
                          <div className="flex items-center gap-1.5 mt-2 bg-muted/60 px-2.5 py-1.5 rounded-lg w-fit border border-border">
                            <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
                            <span className="text-xs font-medium text-foreground truncate max-w-[200px]">{mat.fileName}</span>
                          </div>
                        )}
                        {mat.content && (
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{mat.content}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeSubject.materials.length === 0 && (
              <div className="text-center py-6">
                <FileText className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Sem materiais ainda</p>
                <p className="text-xs text-muted-foreground mt-1">Adiciona provas, resumos ou exercícios acima</p>
              </div>
            )}
          </>
        )}

        {/* AI hint */}
        <div className="glass-card p-3 rounded-2xl flex items-start gap-3 border-l-4 border-primary">
          <GraduationCap className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-foreground">💡 Dica Nzila IA</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Quanto mais materiais adicionares, mais personalizados serão os teus quizzes e as respostas da IA.
            </p>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default SubjectSelection;
