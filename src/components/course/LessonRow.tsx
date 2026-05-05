import { CheckCircle2, Circle, Play, FileText } from "lucide-react";
import type { Lesson } from "@/data/course-data";

interface LessonRowProps {
  lesson: Lesson;
  index: number;
  isCompleted: boolean;
  isActive: boolean;
  onClick: () => void;
}

export function LessonRow({ lesson, index, isCompleted, isActive, onClick }: LessonRowProps) {
  const isPdf = lesson.type === "pdf" || lesson.type === "info";

  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left transition-all duration-200 ${
        isActive
          ? "bg-primary/10 border border-primary/20 shadow-sm shadow-primary/5"
          : "hover:bg-accent/50"
      }`}
    >
      <div className="shrink-0">
        {isCompleted ? (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success/15">
            <CheckCircle2 className="h-4 w-4 text-success" />
          </div>
        ) : isActive ? (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15">
            {isPdf ? <FileText className="h-4 w-4 text-primary" /> : <Play className="h-4 w-4 text-primary fill-primary" />}
          </div>
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
            <span className="text-xs font-medium text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <span className={`text-sm block truncate ${isCompleted ? "text-muted-foreground line-through" : "text-foreground"} ${isActive ? "font-medium text-primary" : ""}`}>
          {lesson.title}
        </span>
        <span className={`text-[10px] uppercase tracking-wider ${isActive ? "text-primary/60" : "text-muted-foreground/50"}`}>
          {isPdf ? "PDF" : "Vídeo aula"}
        </span>
      </div>
    </button>
  );
}
