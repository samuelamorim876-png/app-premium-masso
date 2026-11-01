import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { AIChat } from "@/components/course/AIChat";
import { ArrowLeft, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/assistente")({
  head: () => ({ meta: [{ title: "Assistente do Curso — Massoterapia" }] }),
  component: AssistentePage,
});

function AssistentePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Faça login para acessar.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-4xl items-center gap-3 px-4 sm:px-6">
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Assistente do Curso</span>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-4xl flex-1 flex flex-col px-4 sm:px-6 py-6">
        <div className="mb-4 animate-fade-up">
          <h1 className="font-heading text-xl font-bold text-foreground">🤖 Assistente do Curso</h1>
          <p className="mt-1 text-sm text-muted-foreground">Tire dúvidas gerais, peça sugestão de módulos ou orientação de estudo.</p>
        </div>
        <div className="flex-1 min-h-0">
          <AIChat />
        </div>
      </div>
    </div>
  );
}
