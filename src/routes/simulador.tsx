import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { simulatorScenarios } from "@/data/simulator-data";
import { ArrowLeft, Stethoscope, CheckCircle2, XCircle, ChevronRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/simulador")({
  head: () => ({ meta: [{ title: "Simulador de Atendimento — Massoterapia" }] }),
  component: SimuladorPage,
});

function SimuladorPage() {
  const { user } = useAuth();
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Faça login para acessar.</p>
      </div>
    );
  }

  const scenario = simulatorScenarios.find((s) => s.id === activeScenario);

  const handleAnswer = (idx: number) => {
    setSelectedOption(idx);
    setAnswered(true);
  };

  const reset = () => {
    setSelectedOption(null);
    setAnswered(false);
    setActiveScenario(null);
  };

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
            <Stethoscope className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Simulador de Atendimento</span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        {!scenario ? (
          <>
            <div className="mb-8 animate-fade-up">
              <h1 className="font-heading text-2xl font-bold text-foreground">🧑‍⚕️ Simulador de Atendimento</h1>
              <p className="mt-2 text-sm text-muted-foreground">Pratique suas habilidades com cenários reais. Escolha a técnica correta para cada paciente.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {simulatorScenarios.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => { setActiveScenario(s.id); setSelectedOption(null); setAnswered(false); }}
                  className="group rounded-2xl border border-border bg-card p-5 text-left transition-all hover:border-primary/30 hover:bg-primary/5 animate-fade-up"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">Cenário {i + 1}</p>
                      <h3 className="font-heading text-base font-bold text-foreground">{s.title}</h3>
                      <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{s.description}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground/30 group-hover:text-primary transition-colors shrink-0 mt-1" />
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="animate-fade-up">
            <button onClick={reset} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-6">
              <ArrowLeft className="h-3 w-3" /> Voltar aos cenários
            </button>

            <div className="rounded-2xl border border-border bg-card p-6 mb-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">Cenário</p>
              <h2 className="font-heading text-xl font-bold text-foreground">{scenario.title}</h2>
              <p className="mt-3 text-sm text-muted-foreground">{scenario.description}</p>
              <div className="mt-4 rounded-xl bg-primary/5 border border-primary/10 p-4">
                <p className="text-xs font-semibold text-primary mb-1">💬 Queixa do paciente:</p>
                <p className="text-sm italic text-foreground/80">"{scenario.patientComplaint}"</p>
              </div>
            </div>

            <h3 className="font-heading text-sm font-semibold text-foreground mb-3">Qual técnica você indicaria?</h3>
            <div className="space-y-3">
              {scenario.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const showResult = answered && isSelected;
                return (
                  <button
                    key={idx}
                    onClick={() => !answered && handleAnswer(idx)}
                    disabled={answered}
                    className={`w-full rounded-xl border p-4 text-left transition-all ${
                      showResult && opt.correct
                        ? "border-success bg-success/10"
                        : showResult && !opt.correct
                          ? "border-destructive bg-destructive/10"
                          : answered && opt.correct
                            ? "border-success/50 bg-success/5"
                            : "border-border bg-card hover:border-primary/30 hover:bg-primary/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {showResult && opt.correct && <CheckCircle2 className="h-5 w-5 text-success shrink-0" />}
                      {showResult && !opt.correct && <XCircle className="h-5 w-5 text-destructive shrink-0" />}
                      {!showResult && answered && opt.correct && <CheckCircle2 className="h-5 w-5 text-success/50 shrink-0" />}
                      {!showResult && !answered && <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 shrink-0" />}
                      <span className="text-sm font-medium text-foreground">{opt.label}</span>
                    </div>
                    {answered && (isSelected || opt.correct) && (
                      <p className="mt-2 text-xs text-muted-foreground ml-8">{opt.explanation}</p>
                    )}
                  </button>
                );
              })}
            </div>

            {answered && (
              <div className="mt-6 flex gap-3">
                <Button onClick={reset} variant="outline" className="rounded-xl">
                  <RotateCcw className="h-4 w-4 mr-2" /> Próximo cenário
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
