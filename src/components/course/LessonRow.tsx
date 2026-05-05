import { CheckCircle2, Circle, Play } from "lucide-react";
import type { Lesson } from "@/data/course-data";

interface LessonRowProps {
  lesson: Lesson;
  index: number;
  isCompleted: boolean;
  isActive: boolean;
  onClick: () => void;
}

export function LessonRow({ lesson, index, isCompleted, isActive, onClick }: LessonRowProps) {
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
          <Play className="h-5 w-5 text-primary fill-primary" />
        ) : (
          <Circle className="h-5 w-5 text-muted-foreground/50" />
        )}
      </div>
      <span className={`flex-1 text-sm ${isCompleted ? "text-muted-foreground line-through" : "text-foreground"} ${isActive ? "font-medium text-primary" : ""}`}>
        {lesson.title}
      </span>
      <span className="text-xs text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
    </button>
  );
}
