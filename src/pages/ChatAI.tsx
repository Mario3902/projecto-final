import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Home, Check, Trophy, Briefcase, BookOpen } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { chatWithNzila } from "@/lib/gemini";

interface Message {
  role: "user" | "assistant";
  content: string;
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
    return `Olá${name}! 👋 Sou o **Nzila**, o teu parceiro de estudos inteligente.\n\nVejo que estás no **Nível ${level}** com **${xp} XP** 🎮. Estou aqui para te acompanhar de forma contínua — podes pedir dicas de estudo, correção de exercícios, ou perguntar qualquer coisa! 📚 Como te posso ajudar hoje?`;
  } catch {
    return "Olá! 👋 Sou o Nzila, o teu parceiro de estudos! Estou aqui para te acompanhar de forma contínua com dicas, orientação e muito mais 📚";
  }
};

const ChatAI = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: getWelcomeMessage() },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Format history for Gemini
    const history = messages.slice(1).map(m => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }]
    })) as { role: "user" | "model", parts: { text: string }[] }[];

    // Fetch response from Gemini
    const responseText = await chatWithNzila(text.trim(), history);

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: responseText,
      },
    ]);
    setIsTyping(false);
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

        {/* Input Area */}
        <div className="flex gap-2 shrink-0 bg-[#0e1710] pt-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            placeholder="Pergunta alguma coisa..."
            className="flex-1 bg-[#141e16] border border-[#254238]/60 rounded-2xl px-5 py-3.5 text-[15px] text-white placeholder:text-slate-500 outline-none focus:border-[#4ade80]/50 transition-colors"
          />
          <Button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isTyping}
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
