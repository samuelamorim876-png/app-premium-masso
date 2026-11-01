import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import { buildLocalAnswer } from "@/data/knowledge-base";

type Msg = { role: "user" | "assistant"; content: string };

interface AIChatProps {
  lessonContext?: {
    moduleName: string;
    lessonName: string;
    lessonType: string;
  };
  floating?: boolean;
}

export function AIChat({ lessonContext, floating = false }: AIChatProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const userMsg: Msg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    // Resposta local (sem IA, sem custo): pesquisa na base de conhecimento do curso.
    const answer = buildLocalAnswer(text, lessonContext);
    window.setTimeout(() => {
      setMessages((prev) => [...prev, { role: "assistant", content: answer }]);
      setLoading(false);
    }, 250);
  };

  const [showTooltip, setShowTooltip] = useState(true);

  useEffect(() => {
    if (!floating) return;
    const timer = setTimeout(() => setShowTooltip(false), 10000);
    return () => clearTimeout(timer);
  }, [floating]);

  if (floating && !open) {
    return (
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 animate-scale-in">
        {showTooltip && (
          <div className="rounded-xl bg-card border border-border shadow-lg px-4 py-2.5 text-sm font-medium text-foreground animate-fade-in max-w-[200px]">
            Faça uma pergunta sobre a aula
          </div>
        )}
        <button
          onClick={() => setOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      </div>
    );
  }

  const chatContent = (
    <div className={`flex flex-col ${floating ? "h-[480px] w-[360px]" : "h-full"}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-semibold text-foreground">Assistente do Curso</p>
            {lessonContext && (
              <p className="text-[10px] text-muted-foreground truncate max-w-[200px]">{lessonContext.lessonName}</p>
            )}
          </div>
        </div>
        {floating && (
          <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <Bot className="h-10 w-10 text-primary/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {lessonContext
                ? `Pergunte sobre "${lessonContext.lessonName}"`
                : "Tire suas dúvidas sobre o curso de massoterapia!"}
            </p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "assistant" && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15">
                <Bot className="h-3.5 w-3.5 text-primary" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}
            >
              {m.role === "assistant" ? (
                <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:mb-2 [&>ul]:mb-2 [&>ol]:mb-2">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              ) : (
                <p>{m.content}</p>
              )}
            </div>
            {m.role === "user" && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/30">
                <User className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
            )}
          </div>
        ))}
        {loading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15">
              <Bot className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="rounded-2xl bg-muted px-3.5 py-2.5">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card px-3 py-3">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
            placeholder="Digite sua dúvida..."
            className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <Button onClick={send} size="sm" disabled={loading || !input.trim()} className="rounded-xl h-9 w-9 p-0">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  if (floating) {
    return (
      <div className="fixed bottom-6 right-6 z-50 rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-scale-in">
        {chatContent}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {chatContent}
    </div>
  );
}
