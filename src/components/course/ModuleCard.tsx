import type { Module } from "@/data/course-data";
import { CheckCircle2, Clock } from "lucide-react";

interface ModuleCardProps {
  module: Module;
  index: number;
  unlocked: boolean;
  progress: { completed: number; total: number; percent: number };
  onOpen: (moduleId: string) => void;
  daysLeft?: number | null;
  image?: string;
}

export function ModuleCard({ module, index, unlocked, progress, onOpen, daysLeft, image }: ModuleCardProps) {
  const isComplete = progress.percent === 100;
  const isTimeLocked = !unlocked && daysLeft != null && daysLeft > 0;
  

  return (
    <button
      onClick={() => unlocked && onOpen(module.id)}
      disabled={!unlocked}
      className={`group relative w-full overflow-hidden rounded-2xl text-left transition-all duration-300 flex-shrink-0 ${
        !unlocked
          ? "cursor-not-allowed opacity-60"
          : "hover:scale-[1.03] hover:shadow-2xl hover:shadow-primary/20"
      }`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Vertical poster card (2:3 ratio) */}
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl">
        {image ? (
          <img
            src={image}
            alt={module.title}
            className={`h-full w-full object-cover transition-transform duration-500 ${
              unlocked ? "group-hover:scale-110" : "grayscale"
            }`}
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full bg-accent" />
        )}

        {/* Full gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />

        {/* Lock overlay */}
        {!unlocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[2px]">
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 backdrop-blur-md border border-primary/30">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              {isTimeLocked && (
                <span className="rounded-full bg-primary/20 px-3 py-1 text-[10px] font-semibold text-primary backdrop-blur-md text-center max-w-[140px] leading-tight">
                  {daysLeft! >= 2
                    ? `Disponível em ${daysLeft} dias`
                    : daysLeft === 1
                      ? "Liberado em 1 dia"
                      : "Liberado em breve"}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Top badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex justify-between items-start">
          <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold backdrop-blur-md ${
            isComplete ? "bg-success/20 text-success" : "bg-black/50 text-white/80"
          }`}>
            {isComplete ? <><CheckCircle2 className="h-3 w-3" /> ✓</> : `${index + 1}`}
          </span>
        </div>

        {/* Bottom content */}
        <div className="absolute bottom-0 left-0 right-0 p-3.5">
          <h3 className="font-heading text-sm font-bold text-white leading-tight line-clamp-2 drop-shadow-lg">
            {module.title}
          </h3>
          <p className="mt-1 text-[10px] text-white/50">
            {module.lessons.length} aula{module.lessons.length > 1 ? "s" : ""}
            {unlocked && ` · ${progress.completed}/${module.lessons.length}`}
          </p>

          {/* Progress bar */}
          {unlocked && progress.percent > 0 && (
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/15">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isComplete ? "bg-success" : "bg-primary"
                }`}
                style={{ width: `${progress.percent}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
