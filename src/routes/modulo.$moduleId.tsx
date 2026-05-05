import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useProgress } from "@/hooks/use-progress";
import { courseModules } from "@/data/course-data";
import { LessonRow } from "@/components/course/LessonRow";
import { LessonPlayer } from "@/components/course/LessonPlayer";
import { ArrowLeft, ChevronRight } from "lucide-react";
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
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Faça login para acessar o curso.</p>
          <Link to="/" className="mt-4 inline-block text-primary hover:underline">Ir para login</Link>
        </div>
      </div>
    );
  }

  if (!mod) {
    return (
      <div className="flex min-h-screen items-center justify-center">
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
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <span className="text-3xl">🔒</span>
          </div>
          <h2 className="font-heading text-xl font-bold text-foreground">Módulo bloqueado</h2>
          <p className="mt-2 text-sm text-muted-foreground">Conclua o módulo anterior para desbloquear este conteúdo.</p>
          <Link to="/">
            <Button variant="outline" className="mt-6">Voltar ao dashboard</Button>
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
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
            </Button>
          </Link>
          <span className="text-sm text-muted-foreground">Módulo {moduleIndex + 1}</span>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-6">
        {/* Module info */}
        <div className="mb-6">
          <h1 className="font-heading text-xl font-bold text-foreground">{mod.title}</h1>
          <div className="mt-2 flex items-center gap-3">
            <div className="h-2 flex-1 max-w-xs overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress.percent}%` }} />
            </div>
            <span className="text-sm font-medium text-primary">{progress.percent}%</span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          {/* Lesson list */}
          <div className="rounded-xl border border-border bg-card p-3">
            <h3 className="px-3 pb-2 font-heading text-sm font-semibold text-card-foreground">
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
              <div className="flex h-80 items-center justify-center rounded-xl border border-dashed border-border">
                <div className="text-center">
                  <span className="text-4xl">📚</span>
                  <p className="mt-3 text-sm text-muted-foreground">Selecione uma aula para começar</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Next module */}
        {moduleIndex < courseModules.length - 1 && progress.percent === 100 && (
          <div className="mt-8">
            <Link to="/modulo/$moduleId" params={{ moduleId: courseModules[moduleIndex + 1].id }}>
              <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 p-4 transition-colors hover:bg-primary/10">
                <div>
                  <p className="text-xs font-medium uppercase text-primary">Próximo módulo</p>
                  <p className="mt-1 font-heading text-sm font-semibold text-foreground">
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
