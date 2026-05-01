import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Home, Check, BookOpen, Paperclip, X, FileText, Loader2, Plus, MessageSquare, Trash2, Menu, ChevronLeft } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { chatWithNzila, extractTextFromFile } from "@/lib/gemini";
import { api } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
  attachment?: string;
}

interface ChatSession {
  id: number;
  title: string;
  created_at: string;
  updated_at?: string;
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

  // Session state
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);

  // Load sessions on mount
  useEffect(() => {
    if (!localStorage.getItem("nzila_token")) return;
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const data = await api.getChatSessions();
      setSessions(data);
      if (data.length > 0 && !activeSessionId) {
        // Open the most recent session
        const mostRecent = data[0];
        setActiveSessionId(mostRecent.id);
        await loadSessionMessages(mostRecent.id);
      } else if (data.length === 0) {
        // No sessions — auto-create the first one
        await createNewChat();
      }
    } catch (error) {
      console.error("Erro ao carregar sessões", error);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const loadSessionMessages = async (sessionId: number) => {
    try {
      const history = await api.getSessionMessages(sessionId);
      if (history.length > 0) {
        setMessages(history.map((m: any) => ({
          role: m.role === "assistant" || m.role === "model" ? "assistant" : "user",
          content: m.content
        })));
      } else {
        // New empty session — show welcome
        const welcome = getWelcomeMessage();
        setMessages([{ role: "assistant", content: welcome }]);
        await api.saveSessionMessage(sessionId, { role: "assistant", content: welcome });
      }
    } catch (error) {
      console.error("Erro ao carregar mensagens", error);
    }
  };

  const switchSession = async (sessionId: number) => {
    setActiveSessionId(sessionId);
    setMessages([]);
    await loadSessionMessages(sessionId);
    setSidebarOpen(false);
  };

  const createNewChat = async () => {
    try {
      const session = await api.createChatSession("Novo Chat");
      setSessions(prev => [session, ...prev]);
      setActiveSessionId(session.id);
      const welcome = getWelcomeMessage();
      setMessages([{ role: "assistant", content: welcome }]);
      await api.saveSessionMessage(session.id, { role: "assistant", content: welcome });
      setSidebarOpen(false);
    } catch (error) {
      console.error("Erro ao criar chat", error);
    }
  };

  const deleteSession = async (sessionId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Apagar esta conversa?")) return;
    try {
      await api.deleteChatSession(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (activeSessionId === sessionId) {
        const remaining = sessions.filter(s => s.id !== sessionId);
        if (remaining.length > 0) {
          await switchSession(remaining[0].id);
        } else {
          await createNewChat();
        }
      }
    } catch (error) {
      console.error("Erro ao apagar chat", error);
    }
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Handle file attachment with OCR
  const handleFileAttach = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isImage = file.type.startsWith("image/");
    const isPdf = file.type === "application/pdf";
    if (!isImage && !isPdf) return;

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
    if (!activeSessionId) return;

    let fullMessage = text.trim();
    const fileName = attachedFile?.name;
    if (extractedFileText && extractedFileText.trim().length > 0) {
      fullMessage = fullMessage
        ? `${fullMessage}\n\n📎 Conteúdo extraído do ficheiro "${fileName}":\n"""\n${extractedFileText}\n"""`
        : `Analisa o conteúdo deste ficheiro "${fileName}":\n"""\n${extractedFileText}\n"""`;
    }

    const userMsg: Message = { role: "user", content: fullMessage, attachment: fileName };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    removeAttachment();
    setIsTyping(true);

    try {
      await api.saveSessionMessage(activeSessionId, { role: "user", content: fullMessage });

      // Update session title in sidebar if it's the first message
      const currentSession = sessions.find(s => s.id === activeSessionId);
      if (currentSession && currentSession.title === "Novo Chat") {
        const shortTitle = text.trim().length > 35 ? text.trim().substring(0, 35) + "..." : text.trim();
        setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, title: shortTitle } : s));
      }

      const recentMessages = messages.slice(-10);
      const history = recentMessages.filter(m => m.content).map(m => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }]
      })) as { role: "user" | "model", parts: { text: string }[] }[];

      const responseText = await chatWithNzila(fullMessage, history);
      setMessages((prev) => [...prev, { role: "assistant", content: responseText }]);
      await api.saveSessionMessage(activeSessionId, { role: "assistant", content: responseText });
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

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Agora";
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    return d.toLocaleDateString("pt-PT", { day: "2-digit", month: "short" });
  };

  return (
    <div className="min-h-screen bg-[#1B1D24] text-white flex flex-col font-sans pb-24 relative overflow-x-hidden">
      
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-[280px] bg-[#0c120e] border-r border-[#253510] z-50 flex flex-col transition-transform duration-300 ease-out ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-[#253510] flex items-center justify-between shrink-0">
          <h2 className="text-sm font-black text-white tracking-wide">Conversas</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="h-8 w-8 rounded-lg bg-[#1C2210] border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3 shrink-0">
          <button
            onClick={createNewChat}
            className="w-full flex items-center gap-2.5 py-3 px-4 rounded-xl bg-[#72EB3A] text-[#1B1D24] font-bold text-sm transition-transform active:scale-95 shadow-[0_4px_15px_rgba(74,222,128,0.2)]"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            Novo Chat
          </button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1 scrollbar-hide">
          {isLoadingSessions ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 text-[#72EB3A] animate-spin" />
            </div>
          ) : sessions.length === 0 ? (
            <p className="text-center text-slate-600 text-xs py-8">Nenhuma conversa ainda</p>
          ) : (
            sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => switchSession(session.id)}
                className={`w-full flex items-center gap-3 py-3 px-3.5 rounded-xl text-left transition-all group ${
                  activeSessionId === session.id
                    ? "bg-[#72EB3A]/10 border border-[#72EB3A]/30"
                    : "hover:bg-[#1C2210] border border-transparent"
                }`}
              >
                <MessageSquare className={`h-4 w-4 shrink-0 ${
                  activeSessionId === session.id ? "text-[#72EB3A]" : "text-slate-600"
                }`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-bold truncate ${
                    activeSessionId === session.id ? "text-white" : "text-slate-300"
                  }`}>
                    {session.title}
                  </p>
                  <p className="text-[10px] text-slate-600 mt-0.5">
                    {formatDate(session.updated_at || session.created_at)}
                  </p>
                </div>
                <button
                  onClick={(e) => deleteSession(session.id, e)}
                  className="opacity-0 group-hover:opacity-100 h-7 w-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-red-400 hover:bg-red-400/10 transition-all shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="max-w-md mx-auto w-full px-5 py-6 flex flex-col h-screen pb-24">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6 mt-2 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="h-10 w-10 min-w-10 rounded-xl bg-[#1C2210] border border-[#365A08]/60 flex items-center justify-center text-slate-400 hover:text-[#72EB3A] hover:border-[#72EB3A]/40 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h3 className="text-[#72EB3A] text-[10px] sm:text-xs font-black tracking-[0.2em] uppercase mb-0.5">TUTOR INTELIGENTE</h3>
              <h1 className="text-2xl sm:text-3xl font-bold text-white m-0">Nzila IA</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={createNewChat}
              className="h-10 w-10 min-w-10 rounded-xl bg-[#1C2210] border border-[#365A08]/60 flex items-center justify-center text-slate-400 hover:text-[#72EB3A] hover:border-[#72EB3A]/40 transition-colors"
              title="Novo Chat"
            >
              <Plus className="h-5 w-5" />
            </button>
            <div className="h-10 w-10 min-w-10 rounded-full bg-[#253510] border border-[#72EB3A]/30 shadow-[0_0_15px_rgba(74,222,128,0.2)] flex items-center justify-center shrink-0">
              <Bot className="h-5 w-5 text-[#72EB3A]" />
            </div>
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
                <div className="bg-[#253510] border border-[#72EB3A]/30 rounded-full h-10 w-10 min-w-10 flex items-center justify-center text-[#72EB3A] shrink-0 mt-1">
                  <Bot className="h-5 w-5" />
                </div>
              )}
              
              <div
                className={`max-w-[80%] rounded-2xl px-5 py-3.5 text-[15px] leading-relaxed font-medium ${
                  msg.role === "user"
                    ? "bg-[#72EB3A] text-[#1B1D24] rounded-br-sm shadow-[0_5px_15px_rgba(74,222,128,0.15)]"
                    : "bg-[#1C2210] border border-[#365A08]/60 text-slate-200 rounded-bl-sm"
                }`}
              >
                {msg.attachment && (
                  <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-current/20">
                    <FileText className="h-3.5 w-3.5" />
                    <span className="text-[11px] font-bold truncate">{msg.attachment}</span>
                  </div>
                )}
                {msg.content.split(/(\*\*.*?\*\*)/).map((part, index) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={index} className={msg.role === "user" ? "text-black" : "text-white"}>{part.slice(2, -2)}</strong>;
                  }
                  return part;
                })}
              </div>

              {msg.role === "user" && (
                <div className="bg-[#1C2210] border border-slate-700/60 rounded-full h-10 w-10 min-w-10 flex items-center justify-center text-slate-400 shrink-0 mt-1">
                  <User className="h-5 w-5" />
                </div>
              )}
            </div>
          ))}
          
          {isTyping && (
            <div className="flex gap-3 animate-fade-in">
              <div className="bg-[#253510] border border-[#72EB3A]/30 rounded-full h-10 w-10 min-w-10 flex items-center justify-center text-[#72EB3A] shrink-0 mt-1">
                <Bot className="h-5 w-5" />
              </div>
              <div className="bg-[#1C2210] border border-[#365A08]/60 rounded-2xl rounded-bl-sm px-5 py-4 flex items-center">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-[#72EB3A] rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
                  <span className="w-2 h-2 bg-[#72EB3A] rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
                  <span className="w-2 h-2 bg-[#72EB3A] rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
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
                className="text-xs font-bold bg-[#1C2210] border border-[#365A08]/60 hover:bg-[#253510] text-slate-300 px-4 py-2.5 rounded-full transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Attachment Preview */}
        {attachedFile && (
          <div className="flex items-center gap-2 bg-[#1C2210] border border-[#72EB3A]/30 rounded-xl px-3 py-2 mb-2 shrink-0 animate-fade-in">
            {isExtractingFile ? (
              <Loader2 className="h-4 w-4 text-[#72EB3A] animate-spin shrink-0" />
            ) : (
              <FileText className="h-4 w-4 text-[#72EB3A] shrink-0" />
            )}
            <span className="text-xs font-bold text-slate-300 truncate flex-1">{attachedFile.name}</span>
            {isExtractingFile ? (
              <span className="text-[10px] text-[#72EB3A] font-bold shrink-0">A extrair texto...</span>
            ) : (
              <span className="text-[10px] text-[#72EB3A] font-bold shrink-0">
                {extractedFileText.length > 20 ? `${extractedFileText.length} chars ✓` : "Pronto ✓"}
              </span>
            )}
            <button onClick={removeAttachment} className="text-slate-500 hover:text-red-400 transition-colors shrink-0">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Input Area */}
        <div className="flex gap-2 shrink-0 bg-[#1B1D24] pt-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileAttach}
            accept=".pdf,image/*"
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isTyping || isExtractingFile}
            className="h-[52px] w-[52px] rounded-2xl bg-[#1C2210] hover:bg-[#253510] border border-[#365A08]/60 hover:border-[#72EB3A]/40 text-slate-400 hover:text-[#72EB3A] shrink-0 transition-all disabled:opacity-50"
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
            className="flex-1 bg-[#1C2210] border border-[#365A08]/60 rounded-2xl px-5 py-3.5 text-[15px] text-white placeholder:text-slate-500 outline-none focus:border-[#72EB3A]/50 transition-colors"
          />
          <Button
            onClick={() => sendMessage(input)}
            disabled={(!input.trim() && !extractedFileText) || isTyping || isExtractingFile}
            className="h-[52px] w-[52px] rounded-2xl bg-[#72EB3A] hover:bg-[#5D9D0B] text-[#1B1D24] shrink-0 transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100"
          >
            <Send className="h-5 w-5 ml-1" />
          </Button>
        </div>
      </div>

      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#1B1D24] border-t border-[#253510] px-6 py-4 flex justify-between items-center z-50">
        {bottomNavItems.map((item, i) => {
          const isActive = location.pathname === item.path || (item.title === 'IA' && true);
          return (
            <Link 
              key={i} 
              to={item.path} 
              className={`flex flex-col items-center gap-1.5 transition-colors ${isActive ? "text-[#72EB3A]" : "text-slate-500 hover:text-slate-300"}`}
            >
              <item.icon className={`h-[22px] w-[22px] ${isActive ? "stroke-[2.5]" : "stroke-2"}`} />
              <span className={`text-[10px] font-bold tracking-wide ${isActive ? "text-[#72EB3A]" : ""}`}>
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
