import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { AIChat } from "@/components/course/AIChat";
import { useAuth } from "@/hooks/use-auth";
import { useAdmin } from "@/hooks/use-admin";
import { useProgress } from "@/hooks/use-progress";
import { useGamification } from "@/hooks/use-gamification";
import { useLessonNotes } from "@/hooks/use-lesson-notes";
import { useManagedModules } from "@/hooks/use-managed-modules";
import { recordStudentActivity } from "@/hooks/use-student-activity";
import { lessonCuriosities, lessonQuizzes } from "@/data/quiz-data";
import { LessonRow } from "@/components/course/LessonRow";
import { LessonPlayer } from "@/components/course/LessonPlayer";
import { LessonNotes } from "@/components/course/LessonNotes";
import { QuizBlock } from "@/components/course/QuizBlock";
import { CuriosityBlock } from "@/components/course/CuriosityBlock";
import { RewardPopup } from "@/components/course/RewardPopup";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, ChevronRight, GraduationCap, Edit, Trash2, Plus, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/modulo/$moduleId")({
  head: () => ({
    meta: [{ title: "Módulo — Curso de Massoterapia" }],
  }),
  component: ModulePage,
});

function ModulePage() {
  const { moduleId } = Route.useParams();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin } = useAdmin(user?.id);
  const { modules: courseModules, loading: modulesLoading, refetch } = useManagedModules();
  const { isLessonCompleted, toggleLesson, getModuleProgress, isModuleUnlocked } = useProgress(user?.id, courseModules);
  const { showReward, addPoints, awardBadge } = useGamification(user?.id);

  const moduleIndex = courseModules.findIndex((m) => m.id === moduleId);
  const mod = courseModules[moduleIndex];
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<string | null>(null);
  const [addingLesson, setAddingLesson] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const activeLesson = mod?.lessons.find((l) => l.id === activeLessonId);

  useEffect(() => {
    if (activeLessonId && contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [activeLessonId]);

  useEffect(() => {
    if (!user || !mod || !activeLesson) return;
    recordStudentActivity(user.id, {
      eventType: activeLesson.type === "pdf" ? "pdf_access" : activeLesson.type === "video" ? "video_access" : "lesson_access",
      moduleId: mod.id,
      moduleTitle: mod.title,
      lessonId: activeLesson.id,
      lessonTitle: activeLesson.title,
      lessonType: activeLesson.type,
    });
  }, [user, mod, activeLesson]);

  if (authLoading) {
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
          <p className="text-muted-foreground">Faça login para acessar o curso.</p>
          <Link to="/" className="mt-4 inline-block text-primary hover:underline">Ir para login</Link>
        </div>
      </div>
    );
  }

  if (modulesLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
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
  

  const handleToggleLesson = async () => {
    if (!activeLesson) return;
    const wasCompleted = isLessonCompleted(activeLesson.id);
    await toggleLesson(activeLesson.id);
    if (!wasCompleted) {
      recordStudentActivity(user.id, {
        eventType: "lesson_completed",
        moduleId: mod.id,
        moduleTitle: mod.title,
        lessonId: activeLesson.id,
        lessonTitle: activeLesson.title,
        lessonType: activeLesson.type,
      });
      await addPoints(10);
    }
    const updatedProgress = getModuleProgress(moduleId);
    if (!wasCompleted && updatedProgress.completed + 1 === updatedProgress.total) {
      setTimeout(() => awardBadge(moduleId), 500);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta aula?")) return;
    await supabase.from("managed_lessons").delete().eq("id", lessonId);
    if (activeLessonId === lessonId) setActiveLessonId(null);
    refetch();
  };

  return (
    <div className="min-h-screen bg-background">
      {showReward && <RewardPopup points={showReward.points} badge={showReward.badge} />}

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
                <div key={lesson.id} className="group relative">
                  <LessonRow
                    lesson={lesson}
                    index={i}
                    isCompleted={isLessonCompleted(lesson.id)}
                    isActive={activeLessonId === lesson.id}
                    onClick={() => setActiveLessonId(lesson.id)}
                  />
                  {/* Admin controls per lesson */}
                  {isAdmin && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingLesson(lesson.id); setActiveLessonId(lesson.id); }}
                        className="p-1 rounded-full bg-card hover:bg-primary/10 text-muted-foreground hover:text-primary border border-border"
                        title="Editar"
                      >
                        <Edit className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteLesson(lesson.id); }}
                        className="p-1 rounded-full bg-card hover:bg-destructive/10 text-muted-foreground hover:text-destructive border border-border"
                        title="Remover"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {/* Admin: Add lesson button */}
            {isAdmin && (
              <Button
                size="sm"
                variant="outline"
                className="mt-3 w-full"
                onClick={() => setAddingLesson(true)}
              >
                <Plus className="h-4 w-4 mr-1" /> Adicionar Aula
              </Button>
            )}
          </div>

          {/* Lesson content */}
          <div ref={contentRef} className="space-y-5 scroll-mt-20">
            {/* Admin: Add lesson form */}
            {isAdmin && addingLesson && (
              <InlineLessonForm
                moduleId={moduleId}
                nextOrder={mod.lessons.length}
                onClose={() => setAddingLesson(false)}
                onSaved={() => { setAddingLesson(false); refetch(); }}
              />
            )}

            {/* Admin: Edit lesson form */}
            {isAdmin && editingLesson && activeLesson && editingLesson === activeLesson.id && (
              <InlineLessonForm
                moduleId={moduleId}
                nextOrder={0}
                initial={activeLesson}
                lessonId={activeLesson.id}
                onClose={() => setEditingLesson(null)}
                onSaved={() => { setEditingLesson(null); refetch(); }}
              />
            )}

            {activeLesson && !editingLesson ? (
              <>
                <LessonPlayer
                  lesson={activeLesson}
                  moduleName={mod.title}
                  isCompleted={isLessonCompleted(activeLesson.id)}
                  onToggle={handleToggleLesson}
                />

                <AIChat
                  lessonContext={{
                    moduleName: mod.title,
                    lessonName: activeLesson.title,
                    lessonType: activeLesson.type,
                  }}
                  floating
                />

                {lessonCuriosities[activeLesson.id] && (
                  <CuriosityBlock text={lessonCuriosities[activeLesson.id].text} />
                )}

                {lessonQuizzes[activeLesson.id] && user && (
                  <QuizBlock
                    lessonId={activeLesson.id}
                    questions={lessonQuizzes[activeLesson.id]}
                    userId={user.id}
                    onCorrectAnswer={() => addPoints(15)}
                  />
                )}

                {user && (
                  <LessonNotesWrapper userId={user.id} lessonId={activeLesson.id} />
                )}
              </>
            ) : !editingLesson ? (
              <div className="flex h-80 items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 animate-fade-in">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                    <GraduationCap className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-foreground/80">Selecione uma aula</p>
                  <p className="mt-1 text-xs text-muted-foreground">Clique em uma aula ao lado para começar</p>
                </div>
              </div>
            ) : null}
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

/* Inline lesson form for admin editing/adding inside module page */
function InlineLessonForm({ moduleId, nextOrder, initial, lessonId, onClose, onSaved }: {
  moduleId: string;
  nextOrder: number;
  initial?: { title: string; type: string; url?: string; infoContent?: string };
  lessonId?: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(initial?.title || "");
  const [type, setType] = useState(initial?.type || "video");
  const [contentUrl, setContentUrl] = useState(initial?.url || "");
  const [description, setDescription] = useState(initial?.infoContent || "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!title.trim()) return;
    setSaving(true);
    if (lessonId) {
      await supabase.from("managed_lessons").update({
        title: title.trim(),
        type,
        content_url: contentUrl.trim() || null,
        description: description.trim(),
      }).eq("id", lessonId);
    } else {
      await supabase.from("managed_lessons").insert({
        module_id: moduleId,
        title: title.trim(),
        type,
        content_url: contentUrl.trim() || null,
        description: description.trim(),
        sort_order: nextOrder,
      });
    }
    setSaving(false);
    onSaved();
  };

  return (
    <div className="rounded-xl border-2 border-primary/30 bg-card p-4 space-y-3 animate-fade-in">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground text-sm">{lessonId ? "✏️ Editar Aula" : "➕ Nova Aula"}</h3>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-muted text-muted-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
      <Input placeholder="Título da aula" value={title} onChange={(e) => setTitle(e.target.value)} />
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
      >
        <option value="video">Vídeo (link)</option>
        <option value="pdf">PDF (link)</option>
        <option value="audio">Áudio</option>
        <option value="info">Informativo</option>
      </select>
      <Input
        placeholder={type === "video" ? "Link do vídeo (YouTube, Vimeo...)" : type === "pdf" ? "Link do PDF" : "URL do conteúdo"}
        value={contentUrl}
        onChange={(e) => setContentUrl(e.target.value)}
      />
      {type === "info" && (
        <Textarea placeholder="Conteúdo informativo" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
      )}
      <div className="flex gap-2">
        <Button size="sm" onClick={save} disabled={saving}>
          <Save className="h-4 w-4 mr-1" />
          {saving ? "Salvando..." : "Salvar"}
        </Button>
        <Button size="sm" variant="outline" onClick={onClose}>Cancelar</Button>
      </div>
    </div>
  );
}

function LessonNotesWrapper({ userId, lessonId }: { userId: string; lessonId: string }) {
  const { content, updateContent, saving } = useLessonNotes(userId, lessonId);
  return <LessonNotes content={content} onChange={updateContent} saving={saving} />;
}
