import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useProgress } from "@/hooks/use-progress";
import { useManagedModules } from "@/hooks/use-managed-modules";
import { ModuleCard } from "@/components/course/ModuleCard";
import { OverallProgress } from "@/components/course/OverallProgress";
import { ArrowLeft, GraduationCap, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

import modIntroImg from "@/assets/hero-massage-dark.jpg";
import modStudyImg from "@/assets/mod-study.jpg";
import modProductsImg from "@/assets/mod-products.jpg";
import modAnatomyImg from "@/assets/mod-anatomy.jpg";
import modRelaxanteImg from "@/assets/mod-relaxante.jpg";
import modDrenagemImg from "@/assets/mod-drenagem.jpg";
import modReflexoImg from "@/assets/mod-reflexo.jpg";
import modModeladoraImg from "@/assets/mod-modeladora.jpg";
import modAuriculoImg from "@/assets/mod-auriculo.jpg";
import modMoxaImg from "@/assets/mod-moxa.jpg";
import modAvancadoImg from "@/assets/mod-avancado.jpg";
import modBonusImg from "@/assets/mod-bonus.jpg";

const imageKeywords: [string, string][] = [
  ["Apresentação", modIntroImg],
  ["Complementares", modStudyImg],
  ["Áudios", modRelaxanteImg],
  ["Início do Curso", modProductsImg],
  ["Anatomia", modAnatomyImg],
  ["Ética", modIntroImg],
  ["Relaxante", modRelaxanteImg],
  ["Drenagem", modDrenagemImg],
  ["Reflexologia", modReflexoImg],
  ["Modeladora", modModeladoraImg],
  ["Auriculoterapia", modAuriculoImg],
  ["Moxabustão", modMoxaImg],
  ["Avançad", modAvancadoImg],
  ["Bônus", modBonusImg],
  ["Certificado", modBonusImg],
  ["Avisos", modStudyImg],
];

function getModuleImage(title: string): string {
  for (const [k, img] of imageKeywords) if (title.includes(k)) return img;
  return modStudyImg;
}

export const Route = createFileRoute("/estudar")({
  head: () => ({
    meta: [
      { title: "Modo Estudo — Curso de Massoterapia" },
      { name: "description", content: "Acesse seus módulos, vídeoaulas e materiais." },
    ],
  }),
  component: StudyMode,
});

function StudyMode() {
  const { user, loading: authLoading } = useAuth();
  const { modules, loading: modulesLoading } = useManagedModules();
  const { getModuleProgress, isModuleUnlocked, daysUntilUnlock, overallProgress, completed, loading } =
    useProgress(user?.id, modules);

  if (authLoading || loading || modulesLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground">Faça login para acessar.</p>
          <Link to="/" className="mt-4 inline-block text-primary hover:underline">Ir para login</Link>
        </div>
      </div>
    );
  }

  // "Continue assistindo": last incomplete module that has at least one progress
  const continueModule = (() => {
    for (let i = 0; i < modules.length; i++) {
      const m = modules[i];
      if (!isModuleUnlocked(i)) continue;
      const done = m.lessons.filter((l) => completed.has(l.id)).length;
      if (done > 0 && done < m.lessons.length) return { mod: m, index: i };
    }
    return null;
  })();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-1" /> Início
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20">
              <GraduationCap className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-semibold text-foreground">Modo Estudo</span>
          </div>
          <div className="w-16" />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-6 space-y-6">
        <div className="animate-fade-up">
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">Suas aulas</h1>
          <p className="mt-1 text-sm text-muted-foreground">Foco total no aprendizado.</p>
        </div>

        {continueModule && (
          <Link
            to="/modulo/$moduleId"
            params={{ moduleId: continueModule.mod.id }}
            className="block rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/15 to-primary/5 p-5 hover:border-primary/50 transition-all animate-fade-up"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Continuar assistindo</p>
            <p className="mt-1 font-heading text-lg font-bold text-foreground">{continueModule.mod.title}</p>
            <div className="mt-3 flex items-center gap-3">
              <Button size="sm" className="rounded-xl">
                <PlayCircle className="h-4 w-4 mr-1" /> Retomar
              </Button>
              <span className="text-xs text-muted-foreground">
                {getModuleProgress(continueModule.mod.id).percent}% concluído
              </span>
            </div>
          </Link>
        )}

        <div className="animate-fade-up">
          <OverallProgress {...overallProgress} />
        </div>

        <div className="animate-fade-up">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <h2 className="font-heading text-xl font-bold text-foreground">Módulos do curso</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">{modules.length} módulos disponíveis</p>
            </div>
          </div>
          <div className="-mx-4 sm:-mx-6">
            <div
              className="flex gap-4 overflow-x-auto px-4 sm:px-6 pb-4 snap-x snap-mandatory scrollbar-hide"
              style={{ scrollbarWidth: "none" }}
            >
              {modules.map((mod, i) => {
                const unlocked = isModuleUnlocked(i);
                const card = (
                  <ModuleCard
                    module={mod}
                    index={i}
                    unlocked={unlocked}
                    progress={getModuleProgress(mod.id)}
                    onOpen={() => {}}
                    daysLeft={daysUntilUnlock(i)}
                    image={getModuleImage(mod.title)}
                  />
                );
                return (
                  <div
                    key={mod.id}
                    className="w-[170px] sm:w-[190px] md:w-[210px] flex-shrink-0 snap-start animate-fade-up"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    {unlocked ? (
                      <Link to="/modulo/$moduleId" params={{ moduleId: mod.id }} className="block">
                        {card}
                      </Link>
                    ) : (
                      card
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
