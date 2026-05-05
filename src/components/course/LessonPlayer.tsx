import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, FileDown, Play } from "lucide-react";
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
    <div className="space-y-5 animate-fade-in">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">{moduleName}</p>
        <h2 className="mt-2 font-heading text-xl font-bold text-foreground leading-tight">{lesson.title}</h2>
      </div>

      {/* Content area */}
      {isPdf ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-10 text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
            <FileDown className="h-10 w-10 text-primary" />
          </div>
          {lesson.url ? (
            <a
              href={lesson.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all duration-200 shadow-lg shadow-primary/20"
            >
              <FileDown className="h-4 w-4" /> Baixar PDF
            </a>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">Material em PDF</p>
              <p className="mt-1 text-xs text-muted-foreground/60">O PDF será disponibilizado em breve</p>
            </>
          )}
        </div>
      ) : (
        <div className="aspect-video w-full overflow-hidden rounded-2xl bg-card border border-border shadow-xl shadow-black/20">
          {lesson.url ? (
            <iframe
              src={lesson.url}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={lesson.title}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-card to-accent">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/15 backdrop-blur-md">
                  <Play className="h-10 w-10 text-primary fill-primary" />
                </div>
                <p className="text-sm font-medium text-foreground/80">Vídeo da aula</p>
                <p className="mt-1 text-xs text-muted-foreground">O vídeo será adicionado em breve</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Description */}
      <div className="rounded-xl border border-border bg-card p-5">
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
        className={`w-full rounded-xl text-base transition-all duration-200 ${
          isCompleted
            ? "border-success/30 hover:border-success/50"
            : "shadow-lg shadow-primary/20"
        }`}
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
