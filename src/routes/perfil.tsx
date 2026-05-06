import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useProgress } from "@/hooks/use-progress";
import { useGamification } from "@/hooks/use-gamification";
import { courseModules } from "@/data/course-data";
import { ArrowLeft, User, Trophy, BookOpen, Star, Target, Notebook } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/perfil")({
  head: () => ({ meta: [{ title: "Meu Perfil — Massoterapia" }] }),
  component: PerfilPage,
});

function PerfilPage() {
  const { user } = useAuth();
  const { isLessonCompleted, overallProgress, loading } = useProgress(user?.id);
  const { data: gamData, badges } = useGamification(user?.id);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Faça login para acessar.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Build lesson history
  const completedLessons: { moduleTitle: string; lessonTitle: string }[] = [];
  courseModules.forEach((mod) => {
    mod.lessons.forEach((lesson) => {
      if (isLessonCompleted(lesson.id)) {
        completedLessons.push({ moduleTitle: mod.title, lessonTitle: lesson.title });
      }
    });
  });

  const levelEmoji: Record<string, string> = {
    iniciante: "🌱",
    aprendiz: "📖",
    praticante: "💪",
    avançado: "⭐",
    mestre: "👑",
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
            <User className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Meu Perfil</span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        {/* Profile header */}
        <div className="rounded-2xl border border-border bg-card p-6 mb-6 animate-fade-up">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="font-heading text-xl font-bold text-foreground">{user.name || "Aluno"}</h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="rounded-xl border border-border bg-card p-4 text-center animate-fade-up" style={{ animationDelay: "50ms" }}>
            <Target className="h-5 w-5 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{overallProgress.percent}%</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Progresso</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 text-center animate-fade-up" style={{ animationDelay: "100ms" }}>
            <BookOpen className="h-5 w-5 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{overallProgress.completed}/{overallProgress.total}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Aulas</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 text-center animate-fade-up" style={{ animationDelay: "150ms" }}>
            <Star className="h-5 w-5 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{gamData?.xp ?? 0}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">XP</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 text-center animate-fade-up" style={{ animationDelay: "200ms" }}>
            <Trophy className="h-5 w-5 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{levelEmoji[gamData?.level ?? "iniciante"]} {gamData?.level ?? "Iniciante"}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Nível</p>
          </div>
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div className="rounded-2xl border border-border bg-card p-5 mb-6 animate-fade-up" style={{ animationDelay: "250ms" }}>
            <h3 className="font-heading text-sm font-semibold text-card-foreground mb-3 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary" /> Conquistas ({badges.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {badges.map((b) => (
                <span key={b.badge_id} className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
                  🏆 {b.badge_name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Lesson history */}
        <div className="rounded-2xl border border-border bg-card p-5 animate-fade-up" style={{ animationDelay: "300ms" }}>
          <h3 className="font-heading text-sm font-semibold text-card-foreground mb-3 flex items-center gap-2">
            <Notebook className="h-4 w-4 text-primary" /> Histórico de Aulas Concluídas ({completedLessons.length})
          </h3>
          {completedLessons.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma aula concluída ainda. Comece agora!</p>
          ) : (
            <div className="max-h-80 overflow-y-auto space-y-2 pr-2">
              {completedLessons.map((cl, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg bg-success/5 px-3 py-2">
                  <div className="h-2 w-2 rounded-full bg-success shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{cl.lessonTitle}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{cl.moduleTitle}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
