import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, FileDown } from "lucide-react";
import type { Lesson } from "@/data/course-data";

interface LessonPlayerProps {
  lesson: Lesson;
  moduleName: string;
  isCompleted: boolean;
  onToggle: () => void;
}

export function LessonPlayer({ lesson, moduleName, isCompleted, onToggle }: LessonPlayerProps) {
  const isPdf = lesson.type === "pdf" || lesson.type === "info";

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-primary">{moduleName}</p>
        <h2 className="mt-1 font-heading text-xl font-bold text-foreground">{lesson.title}</h2>
      </div>

      {/* Content area */}
      {isPdf ? (
        /* PDF / info lesson */
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <FileDown className="h-8 w-8 text-primary" />
          </div>
          {lesson.url ? (
            <a
              href={lesson.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <FileDown className="h-4 w-4" /> Baixar PDF
            </a>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">Material em PDF</p>
              <p className="mt-1 text-xs text-muted-foreground/70">O PDF será disponibilizado em breve</p>
            </>
          )}
        </div>
      ) : (
        /* Video lesson */
        <div className="aspect-video w-full overflow-hidden rounded-xl bg-foreground/5 border border-border">
          {lesson.url ? (
            <iframe
              src={lesson.url}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={lesson.title}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <svg className="h-8 w-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <p className="text-sm text-muted-foreground">Vídeo da aula</p>
                <p className="mt-1 text-xs text-muted-foreground/70">O vídeo será adicionado em breve</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Description */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h4 className="font-heading text-sm font-semibold text-card-foreground">Sobre esta aula</h4>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {isPdf
            ? `Material complementar: ${lesson.title}. Faça o download e estude no seu ritmo.`
            : `Nesta aula você aprenderá os conceitos e técnicas de ${lesson.title}. Assista ao vídeo completo e marque como concluída quando terminar.`}
        </p>
      </div>

      {/* Complete button */}
      <Button
        onClick={onToggle}
        size="lg"
        className="w-full"
        variant={isCompleted ? "outline" : "default"}
      >
        {isCompleted ? (
          <>
            <CheckCircle2 className="mr-2 h-5 w-5 text-success" />
            Aula concluída ✓
          </>
        ) : (
          <>
            <Circle className="mr-2 h-5 w-5" />
            Marcar aula como concluída
          </>
        )}
      </Button>
    </div>
  );
}
