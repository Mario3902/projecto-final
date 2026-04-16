import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Home, Check, Trophy, Briefcase, BookOpen, Paperclip, X, FileText, Loader2 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { chatWithNzila, extractTextFromFile } from "@/lib/gemini";
import { api } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
  attachment?: string; // filename of attached file
}

const suggestions = [
  "Qual é a melhor carreira para quem gosta de ciência?",
  "Como posso melhorar minha nota em matemática?",
  "Me sugira um plano de estudo semanal",
  "Quais são as melhores universidades em Angola?",
];

const getWelcomeMessage = () => {
  try {
    const profile = JSON.parse(localStorage.getItem("nzila_profile") || "{}");
    const name = profile.name && profile.name !== "Estudante" ? `, ${profile.name}` : "";
    const game = JSON.parse(localStorage.getItem("nzila_game_state") || "{}");
    const xp = game.xp ?? 0;
    const level = game.level ?? 1;
    return `Olá${name}! 👋 Sou o **Nzila**, o teu parceiro de estudos inteligente.\n\nVejo que estás no **Nível ${level}** com **${xp} XP** 🎮. Estou aqui para te acompanhar de forma contínua — podes pedir dicas de estudo, correção de exercícios, ou perguntar qualquer coisa! 📚\n\n📎 **Novidade:** Agora podes enviar fotos ou PDFs dos teus testes, apontamentos ou exercícios! Basta clicar no 📎 para anexar.`;
  } catch {
    return "Olá! 👋 Sou o Nzila, o teu parceiro de estudos! Estou aqui para te acompanhar de forma contínua com dicas, orientação e muito mais 📚\n\n📎 Podes enviar fotos ou PDFs e eu analiso o conteúdo!";
  }
};

const ChatAI = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [extractedFileText, setExtractedFileText] = useState<string>("");
  const [isExtractingFile, setIsExtractingFile] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();

  useEffect(() => {
    async function loadChat() {
      if (!localStorage.getItem("nzila_token")) return;
      try {
        const history = await api.getChatHistory();
        if (history.length > 0) {
          setMessages(history.map((m: any) => ({ 
             role: m.role === "assistant" || m.role === "model" ? "assistant" : "user", 
             content: m.content 
          })));
        } else {
          const welcome = getWelcomeMessage();
          setMessages([{ role: "assistant", content: welcome }]);
          await api.saveChatMessage({ role: "assistant", content: welcome });
        }
      } catch (error) {
        console.error("Erro ao carregar chat", error);
      }
    }
    loadChat();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Handle file attachment with OCR
  const handleFileAttach = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const isImage = file.type.startsWith("image/");
    const isPdf = file.type === "application/pdf";
    
    if (!isImage && !isPdf) {
      return;
    }

    setAttachedFile(file);
    setIsExtractingFile(true);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const base64Data = (event.target?.result as string).split(',')[1];
          if (!base64Data) throw new Error("Erro ao converter ficheiro.");
          
          const text = await extractTextFromFile(base64Data, file.type);
          setExtractedFileText(text || "");
          
          if (!text || text.trim().length < 5) {
            setExtractedFileText(`[Ficheiro anexado: ${file.name} - OCR não encontrou texto legível]`);
          }
        } catch (err) {
          console.error("OCR Error:", err);
          setExtractedFileText(`[Ficheiro anexado: ${file.name} - erro na extração]`);
        } finally {
          setIsExtractingFile(false);
        }
      };
      reader.onerror = () => {
        setIsExtractingFile(false);
        setExtractedFileText(`[Ficheiro anexado: ${file.name}]`);
      };
      reader.readAsDataURL(file);
    } catch {
      setIsExtractingFile(false);
    }
  };

  const removeAttachment = () => {
    setAttachedFile(null);
    setExtractedFileText("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() && !extractedFileText) return;
    
    // Build the full message with file context if attached
    let fullMessage = text.trim();
    const fileName = attachedFile?.name;
    
    if (extractedFileText && extractedFileText.trim().length > 0) {
      fullMessage = fullMessage 
        ? `${fullMessage}\n\n📎 Conteúdo extraído do ficheiro "${fileName}":\n"""\n${extractedFileText}\n"""`
        : `Analisa o conteúdo deste ficheiro "${fileName}":\n"""\n${extractedFileText}\n"""`;
    }
    
    const userMsg: Message = { 
      role: "user", 
      content: fullMessage,
      attachment: fileName 
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    removeAttachment();
    setIsTyping(true);

    try {
      // Save User Message to DB
      await api.saveChatMessage({ role: "user", content: fullMessage });

      // Format history for Gemini (max 10 interactions to avoid token limits)
      const recentMessages = messages.slice(-10);
      const history = recentMessages.filter(m => m.content).map(m => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }]
      })) as { role: "user" | "model", parts: { text: string }[] }[];

      // Fetch response from Gemini
      const responseText = await chatWithNzila(fullMessage, history);

      setMessages((prev) => [...prev, { role: "assistant", content: responseText }]);
      
      // Save AI Message to DB
      await api.saveChatMessage({ role: "assistant", content: responseText });

    } catch (e) {
      console.error("Erro ao comunicar com a IA", e);
    } finally {
      setIsTyping(false);
    }
  };

  const bottomNavItems = [
    { title: "Início", path: "/dashboard", icon: Home },
    { title: "Cursos", path: "/dashboard/subjects", icon: BookOpen },
    { title: "Planner", path: "/dashboard/tasks", icon: Check },
    { title: "IA", path: "/dashboard/chat", icon: Bot },
    { title: "Perfil", path: "/dashboard/performance", icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#0e1710] text-white flex flex-col font-sans pb-24 relative overflow-x-hidden">
      <div className="max-w-md mx-auto w-full px-5 py-6 flex flex-col h-screen pb-24">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6 mt-2 shrink-0">
          <div>
            <h3 className="text-[#4ade80] text-[10px] sm:text-xs font-black tracking-[0.2em] uppercase mb-0.5">TUTOR INTELIGENTE</h3>
            <h1 className="text-2xl sm:text-3xl font-bold text-white m-0">Nzila IA</h1>
          </div>
          <div className="h-10 w-10 min-w-10 rounded-full bg-[#1e2e26] border border-[#4ade80]/30 shadow-[0_0_15px_rgba(74,222,128,0.2)] flex items-center justify-center shrink-0">
            <Bot className="h-5 w-5 text-[#4ade80]" />
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-5 pb-4 scrollbar-hide">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 animate-slide-up ${msg.role === "user" ? "justify-end" : ""}`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              {msg.role === "assistant" && (
                <div className="bg-[#1e2e26] border border-[#4ade80]/30 rounded-full h-10 w-10 min-w-10 flex items-center justify-center text-[#4ade80] shrink-0 mt-1">
                  <Bot className="h-5 w-5" />
                </div>
              )}
              
              <div
                className={`max-w-[80%] rounded-2xl px-5 py-3.5 text-[15px] leading-relaxed font-medium ${
                  msg.role === "user"
                    ? "bg-[#4ade80] text-[#0e1710] rounded-br-sm shadow-[0_5px_15px_rgba(74,222,128,0.15)]"
                    : "bg-[#141e16] border border-[#254238]/60 text-slate-200 rounded-bl-sm"
                }`}
              >
                {/* Attachment indicator */}
                {msg.attachment && (
                  <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-current/20">
                    <FileText className="h-3.5 w-3.5" />
                    <span className="text-[11px] font-bold truncate">{msg.attachment}</span>
                  </div>
                )}
                {/* Basic Markdown rendering for bold text **text** */}
                {msg.content.split(/(\*\*.*?\*\*)/).map((part, index) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={index} className={msg.role === "user" ? "text-black" : "text-white"}>{part.slice(2, -2)}</strong>;
                  }
                  return part;
                })}
              </div>

              {msg.role === "user" && (
                <div className="bg-[#141e16] border border-slate-700/60 rounded-full h-10 w-10 min-w-10 flex items-center justify-center text-slate-400 shrink-0 mt-1">
                  <User className="h-5 w-5" />
                </div>
              )}
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 animate-fade-in">
              <div className="bg-[#1e2e26] border border-[#4ade80]/30 rounded-full h-10 w-10 min-w-10 flex items-center justify-center text-[#4ade80] shrink-0 mt-1">
                <Bot className="h-5 w-5" />
              </div>
              <div className="bg-[#141e16] border border-[#254238]/60 rounded-2xl rounded-bl-sm px-5 py-4 flex items-center">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-[#4ade80] rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
                  <span className="w-2 h-2 bg-[#4ade80] rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
                  <span className="w-2 h-2 bg-[#4ade80] rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && (
          <div className="flex flex-wrap gap-2 mb-4 shrink-0">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="text-xs font-bold bg-[#141e16] border border-[#254238]/60 hover:bg-[#1e2e26] text-slate-300 px-4 py-2.5 rounded-full transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Attachment Preview */}
        {attachedFile && (
          <div className="flex items-center gap-2 bg-[#141e16] border border-[#4ade80]/30 rounded-xl px-3 py-2 mb-2 shrink-0 animate-fade-in">
            {isExtractingFile ? (
              <Loader2 className="h-4 w-4 text-[#4ade80] animate-spin shrink-0" />
            ) : (
              <FileText className="h-4 w-4 text-[#4ade80] shrink-0" />
            )}
            <span className="text-xs font-bold text-slate-300 truncate flex-1">{attachedFile.name}</span>
            {isExtractingFile ? (
              <span className="text-[10px] text-[#4ade80] font-bold shrink-0">A extrair texto...</span>
            ) : (
              <span className="text-[10px] text-[#4ade80] font-bold shrink-0">
                {extractedFileText.length > 20 ? `${extractedFileText.length} chars ✓` : "Pronto ✓"}
              </span>
            )}
            <button onClick={removeAttachment} className="text-slate-500 hover:text-red-400 transition-colors shrink-0">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Input Area */}
        <div className="flex gap-2 shrink-0 bg-[#0e1710] pt-2">
          {/* File upload hidden input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileAttach}
            accept=".pdf,image/*"
            className="hidden"
          />
          
          {/* Attachment button */}
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isTyping || isExtractingFile}
            className="h-[52px] w-[52px] rounded-2xl bg-[#141e16] hover:bg-[#1e2e26] border border-[#254238]/60 hover:border-[#4ade80]/40 text-slate-400 hover:text-[#4ade80] shrink-0 transition-all disabled:opacity-50"
            variant="ghost"
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            placeholder={attachedFile ? "Pergunta sobre o ficheiro..." : "Pergunta alguma coisa..."}
            className="flex-1 bg-[#141e16] border border-[#254238]/60 rounded-2xl px-5 py-3.5 text-[15px] text-white placeholder:text-slate-500 outline-none focus:border-[#4ade80]/50 transition-colors"
          />
          <Button
            onClick={() => sendMessage(input)}
            disabled={(!input.trim() && !extractedFileText) || isTyping || isExtractingFile}
            className="h-[52px] w-[52px] rounded-2xl bg-[#4ade80] hover:bg-[#22c55e] text-[#0e1710] shrink-0 transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100"
          >
            <Send className="h-5 w-5 ml-1" />
          </Button>
        </div>
      </div>

      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#0e1710]/95 backdrop-blur-xl border-t border-[#1a261d] px-6 py-4 flex justify-between items-center z-50">
        {bottomNavItems.map((item, i) => {
          const isActive = location.pathname === item.path || (item.title === 'IA' && true);
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

export default ChatAI;

