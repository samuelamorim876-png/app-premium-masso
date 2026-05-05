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
      className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-all ${
        isActive
          ? "bg-primary/10 border border-primary/20"
          : "hover:bg-muted/60"
      }`}
    >
      <div className="shrink-0">
        {isCompleted ? (
          <CheckCircle2 className="h-5 w-5 text-success" />
        ) : isActive ? (
          isPdf ? <FileText className="h-5 w-5 text-primary" /> : <Play className="h-5 w-5 text-primary fill-primary" />
        ) : (
          <Circle className="h-5 w-5 text-muted-foreground/50" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <span className={`text-sm block truncate ${isCompleted ? "text-muted-foreground line-through" : "text-foreground"} ${isActive ? "font-medium text-primary" : ""}`}>
          {lesson.title}
        </span>
        <span className="text-[10px] uppercase text-muted-foreground/60">{isPdf ? "PDF" : "Vídeo"}</span>
      </div>
      <span className="text-xs text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
    </button>
  );
}
