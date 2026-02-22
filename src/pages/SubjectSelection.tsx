import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Check, ArrowLeft, Send } from "lucide-react";

const availableSubjects = [
  { id: "math", name: "Matemática", icon: "📐", area: "Exatas" },
  { id: "physics", name: "Física", icon: "⚛️", area: "Exatas" },
  { id: "chemistry", name: "Química", icon: "🧪", area: "Exatas" },
  { id: "biology", name: "Biologia", icon: "🧬", area: "Naturais" },
  { id: "portuguese", name: "Português", icon: "📝", area: "Humanas" },
  { id: "history", name: "História", icon: "📜", area: "Humanas" },
  { id: "geography", name: "Geografia", icon: "🌍", area: "Humanas" },
  { id: "english", name: "Inglês", icon: "🇬🇧", area: "Línguas" },
  { id: "art", name: "Artes", icon: "🎨", area: "Humanas" },
  { id: "sociology", name: "Sociologia", icon: "🏛️", area: "Humanas" },
  { id: "philosophy", name: "Filosofia", icon: "🤔", area: "Humanas" },
  { id: "cs", name: "Computação", icon: "💻", area: "Exatas" },
  { id: "pe", name: "Ed. Física", icon: "⚽", area: "Saúde" },
  { id: "music", name: "Música", icon: "🎵", area: "Artes" },
];

const areas = [...new Set(availableSubjects.map((s) => s.area))];

const SubjectSelection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    if (selected.length === 0) {
      toast({ title: "Selecione pelo menos uma matéria", variant: "destructive" });
      return;
    }
    toast({
      title: "Matérias salvas! ✅",
      description: `${selected.length} matéria(s) adicionada(s) ao seu perfil.`,
    });
    setTimeout(() => navigate("/dashboard"), 1000);
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/vocational")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              Selecione suas Matérias
            </h1>
            <p className="text-sm text-muted-foreground">
              Escolha as matérias que deseja acompanhar com base na sua orientação vocacional
            </p>
          </div>
        </div>

        {selected.length > 0 && (
          <div className="flex flex-wrap gap-2 p-4 bg-primary/5 rounded-xl border border-primary/20 animate-fade-in">
            <span className="text-sm font-medium text-primary mr-1">Selecionadas:</span>
            {selected.map((id) => {
              const sub = availableSubjects.find((s) => s.id === id)!;
              return (
                <button
                  key={id}
                  onClick={() => toggle(id)}
                  className="flex items-center gap-1 text-xs font-medium bg-primary text-primary-foreground px-2.5 py-1 rounded-full hover:opacity-80 transition-opacity"
                >
                  {sub.icon} {sub.name} ✕
                </button>
              );
            })}
          </div>
        )}

        {areas.map((area) => (
          <div key={area}>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              {area}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {availableSubjects
                .filter((s) => s.area === area)
                .map((sub) => {
                  const isSelected = selected.includes(sub.id);
                  return (
                    <button
                      key={sub.id}
                      onClick={() => toggle(sub.id)}
                      className={`relative p-4 rounded-xl border-2 text-left transition-all hover:scale-[1.02] ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border bg-muted/30 hover:border-primary/50"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-0.5">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                      <span className="text-2xl">{sub.icon}</span>
                      <p className="font-semibold text-foreground text-sm mt-2">{sub.name}</p>
                    </button>
                  );
                })}
            </div>
          </div>
        ))}

        <div className="flex justify-between items-center pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            {selected.length} matéria(s) selecionada(s)
          </p>
          <Button
            onClick={handleSubmit}
            disabled={selected.length === 0}
            className="gradient-primary text-primary-foreground gap-2"
          >
            <Send className="h-4 w-4" /> Confirmar matérias
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SubjectSelection;
