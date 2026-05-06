import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { treatmentPlans } from "@/data/simulator-data";
import { ArrowLeft, ClipboardList, ChevronRight, ChevronDown, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/protocolos")({
  head: () => ({ meta: [{ title: "Protocolos de Atendimento — Massoterapia" }] }),
  component: ProtocolosPage,
});

function ProtocolosPage() {
  const { user } = useAuth();
  const [activePlan, setActivePlan] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Faça login para acessar.</p>
      </div>
    );
  }

  const plan = treatmentPlans.find((p) => p.id === activePlan);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-4xl items-center gap-3 px-4 sm:px-6">
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Protocolos de Atendimento</span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        {!plan ? (
          <>
            <div className="mb-8 animate-fade-up">
              <h1 className="font-heading text-2xl font-bold text-foreground">📊 Protocolos de Atendimento</h1>
              <p className="mt-2 text-sm text-muted-foreground">Planos passo a passo para diferentes tipos de atendimento profissional.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {treatmentPlans.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => setActivePlan(p.id)}
                  className="group rounded-2xl border border-border bg-card p-5 text-left transition-all hover:border-primary/30 hover:bg-primary/5 animate-fade-up"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <span className="text-3xl">{p.emoji}</span>
                  <h3 className="mt-3 font-heading text-base font-bold text-foreground">{p.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{p.description}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-primary font-medium">{p.duration}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary" />
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="animate-fade-up">
            <button onClick={() => setActivePlan(null)} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-6">
              <ArrowLeft className="h-3 w-3" /> Voltar aos protocolos
            </button>

            <div className="rounded-2xl border border-border bg-card p-6 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{plan.emoji}</span>
                <div>
                  <h2 className="font-heading text-xl font-bold text-foreground">{plan.title}</h2>
                  <p className="text-xs text-primary font-medium">{plan.duration}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{plan.description}</p>
            </div>

            {/* Techniques */}
            {plan.techniques && plan.techniques.length > 0 && (
              <div className="mb-6">
                <h3 className="font-heading text-sm font-semibold text-foreground mb-3">🔧 Técnicas Utilizadas</h3>
                <div className="flex flex-wrap gap-2">
                  {plan.techniques.map((t) => (
                    <span key={t} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{t}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Steps */}
            <h3 className="font-heading text-sm font-semibold text-foreground mb-4">📋 Passo a Passo</h3>
            <div className="space-y-3 mb-8">
              {plan.steps.map((step) => (
                <div key={step.order} className="rounded-xl border border-border bg-card p-4 flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15">
                    <span className="text-xs font-bold text-primary">{step.order}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-foreground">{step.title}</h4>
                      <span className="text-[10px] text-muted-foreground">{step.duration}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Indications & Contraindications */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-success/20 bg-success/5 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <h4 className="text-sm font-semibold text-foreground">Indicações</h4>
                </div>
                <ul className="space-y-1">
                  {plan.indications.map((ind) => (
                    <li key={ind} className="text-xs text-muted-foreground flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-success" /> {ind}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <h4 className="text-sm font-semibold text-foreground">Contraindicações</h4>
                </div>
                <ul className="space-y-1">
                  {plan.contraindications.map((ci) => (
                    <li key={ci} className="text-xs text-muted-foreground flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-destructive" /> {ci}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
