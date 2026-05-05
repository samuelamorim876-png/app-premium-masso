import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useProgress } from "@/hooks/use-progress";
import { courseModules } from "@/data/course-data";
import { LessonRow } from "@/components/course/LessonRow";
import { LessonPlayer } from "@/components/course/LessonPlayer";
import { ArrowLeft, ChevronRight, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/modulo/$moduleId")({
  head: () => ({
    meta: [
      { title: "Módulo — Curso de Massoterapia" },
    ],
  }),
  component: ModulePage,
});

function ModulePage() {
  const { moduleId } = Route.useParams();
  const { user } = useAuth();
  const { isLessonCompleted, toggleLesson, getModuleProgress, isModuleUnlocked } = useProgress(user?.id);

  const moduleIndex = courseModules.findIndex((m) => m.id === moduleId);
  const mod = courseModules[moduleIndex];
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground">Faça login para acessar o curso.</p>
          <Link to="/" className="mt-4 inline-block text-primary hover:underline">Ir para login</Link>
        </div>
      </div>
    );
  }

  if (!mod) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground">Módulo não encontrado.</p>
          <Link to="/" className="mt-4 inline-block text-primary hover:underline">Voltar ao dashboard</Link>
        </div>
      </div>
    );
  }

  const unlocked = isModuleUnlocked(moduleIndex);
  if (!unlocked) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 bg-background">
        <div className="text-center max-w-sm animate-scale-in">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-muted">
            <span className="text-4xl">🔒</span>
          </div>
          <h2 className="font-heading text-xl font-bold text-foreground">Módulo bloqueado</h2>
          <p className="mt-2 text-sm text-muted-foreground">Conclua o módulo anterior para desbloquear este conteúdo.</p>
          <Link to="/">
            <Button variant="outline" className="mt-6 rounded-xl">Voltar ao dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const progress = getModuleProgress(moduleId);
  const activeLesson = mod.lessons.find((l) => l.id === activeLessonId);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20">
              <GraduationCap className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Módulo {moduleIndex + 1}</span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
        {/* Module info */}
        <div className="mb-6 animate-fade-up">
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-foreground">{mod.title}</h1>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-2 flex-1 max-w-xs overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progress.percent}%` }} />
            </div>
            <span className={`text-sm font-bold ${progress.percent === 100 ? "text-success" : "text-primary"}`}>{progress.percent}%</span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
          {/* Lesson list */}
          <div className="rounded-2xl border border-border bg-card p-3 animate-slide-up">
            <h3 className="px-3 pb-3 pt-1 font-heading text-sm font-semibold text-card-foreground">
              Aulas ({progress.completed}/{progress.total})
            </h3>
            <div className="space-y-1">
              {mod.lessons.map((lesson, i) => (
                <LessonRow
                  key={lesson.id}
                  lesson={lesson}
                  index={i}
                  isCompleted={isLessonCompleted(lesson.id)}
                  isActive={activeLessonId === lesson.id}
                  onClick={() => setActiveLessonId(lesson.id)}
                />
              ))}
            </div>
          </div>

          {/* Lesson content */}
          <div>
            {activeLesson ? (
              <LessonPlayer
                lesson={activeLesson}
                moduleName={mod.title}
                isCompleted={isLessonCompleted(activeLesson.id)}
                onToggle={() => toggleLesson(activeLesson.id)}
              />
            ) : (
              <div className="flex h-80 items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 animate-fade-in">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                    <GraduationCap className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-foreground/80">Selecione uma aula</p>
                  <p className="mt-1 text-xs text-muted-foreground">Clique em uma aula ao lado para começar</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Next module */}
        {moduleIndex < courseModules.length - 1 && progress.percent === 100 && (
          <div className="mt-8 animate-fade-up">
            <Link to="/modulo/$moduleId" params={{ moduleId: courseModules[moduleIndex + 1].id }}>
              <div className="flex items-center justify-between rounded-2xl border border-primary/20 bg-primary/5 p-5 transition-all hover:bg-primary/10 hover:border-primary/40">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">Próximo módulo</p>
                  <p className="mt-1 font-heading text-sm font-bold text-foreground">
                    {courseModules[moduleIndex + 1].title}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-primary" />
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
