import { useState, useRef, useEffect } from "react";
import { Send, Bot, User } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const suggestions = [
  "Qual é a melhor carreira para quem gosta de ciência?",
  "Como posso melhorar minha nota em matemática?",
  "Me sugira um plano de estudo semanal",
  "Quais são as melhores universidades do Brasil?",
];

const ChatAI = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Olá! 👋 Sou seu assistente de aprendizado. Posso ajudar com dúvidas acadêmicas, sugestões de carreira e dicas de estudo. Como posso ajudar?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulated response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Ótima pergunta! Para fornecer respostas personalizadas com IA, conecte o Lovable Cloud. Por enquanto, posso dizer que a consistência nos estudos é a chave do sucesso! 📚 Tente criar uma rotina diária e use a aba de Tarefas para se organizar.",
        },
      ]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col" style={{ height: "calc(100dvh - 136px)" }}>
        <h1 className="text-2xl font-bold text-foreground mb-4">Chat com IA 🤖</h1>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 pb-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 animate-slide-up ${msg.role === "user" ? "justify-end" : ""}`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              {msg.role === "assistant" && (
                <div className="gradient-primary rounded-full p-2 h-9 w-9 shrink-0 flex items-center justify-center text-primary-foreground">
                  <Bot className="h-5 w-5" />
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === "user"
                    ? "gradient-primary text-primary-foreground rounded-br-md"
                    : "bg-muted text-foreground rounded-bl-md"
                  }`}
              >
                {msg.content}
              </div>
              {msg.role === "user" && (
                <div className="bg-muted rounded-full p-2 h-9 w-9 shrink-0 flex items-center justify-center text-foreground">
                  <User className="h-5 w-5" />
                </div>
              )}
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-3">
              <div className="gradient-primary rounded-full p-2 h-9 w-9 shrink-0 flex items-center justify-center text-primary-foreground">
                <Bot className="h-5 w-5" />
              </div>
              <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="text-xs bg-muted hover:bg-muted/80 text-foreground px-3 py-2 rounded-full transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            placeholder="Digite sua mensagem..."
            className="h-12 bg-muted/50"
          />
          <Button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isTyping}
            className="h-12 w-12 gradient-primary text-primary-foreground shrink-0"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ChatAI;
