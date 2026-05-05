import type { Module } from "@/data/course-data";
import { Lock, CheckCircle2, ChevronRight, Clock } from "lucide-react";

interface ModuleCardProps {
  module: (typeof courseModules)[0];
  index: number;
  unlocked: boolean;
  progress: { completed: number; total: number; percent: number };
  onOpen: (moduleId: string) => void;
  daysLeft?: number | null;
}

export function ModuleCard({ module, index, unlocked, progress, onOpen, daysLeft }: ModuleCardProps) {
  const isComplete = progress.percent === 100;
  const isTimeLocked = !unlocked && daysLeft != null && daysLeft > 0;

  return (
    <button
      onClick={() => unlocked && onOpen(module.id)}
      disabled={!unlocked}
      className={`group w-full rounded-xl border p-5 text-left transition-all ${
        !unlocked
          ? "cursor-not-allowed border-border bg-muted/50 opacity-60"
          : isComplete
          ? "border-success/30 bg-success/5 hover:border-success/50 hover:shadow-md"
          : "border-border bg-card hover:border-primary/30 hover:shadow-md"
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
            !unlocked
              ? "bg-muted text-muted-foreground"
              : isComplete
              ? "bg-success text-success-foreground"
              : "bg-primary text-primary-foreground"
          }`}
        >
          {!unlocked ? <Lock className="h-4 w-4" /> : isComplete ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-heading text-base font-semibold leading-tight text-card-foreground">
            {module.title}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {module.lessons.length} aulas • {progress.completed}/{module.lessons.length} concluídas
          </p>
          {isTimeLocked && (
            <p className="mt-1 flex items-center gap-1 text-xs text-amber-600">
              <Clock className="h-3 w-3" /> Libera em {daysLeft} dia{daysLeft > 1 ? "s" : ""}
            </p>
          )}
          {unlocked && (
            <div className="mt-3 flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all ${isComplete ? "bg-success" : "bg-primary"}`}
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
              <span className={`text-xs font-semibold ${isComplete ? "text-success" : "text-primary"}`}>
                {progress.percent}%
              </span>
            </div>
          )}
        </div>
        {unlocked && (
          <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        )}
      </div>
    </button>
  );
}
