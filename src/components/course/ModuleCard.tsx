import type { Module } from "@/data/course-data";
import { Lock, CheckCircle2, ChevronRight, Clock, Play, FileText } from "lucide-react";

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
  const hasVideo = module.lessons.some((l) => l.type === "video");

  return (
    <button
      onClick={() => unlocked && onOpen(module.id)}
      disabled={!unlocked}
      className={`group relative w-full overflow-hidden rounded-2xl text-left transition-all duration-300 ${
        !unlocked
          ? "cursor-not-allowed opacity-50"
          : "hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/10"
      }`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Background image */}
      <div className="relative aspect-[16/9] sm:aspect-[2.4/1] w-full overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={module.title}
            className={`h-full w-full object-cover transition-transform duration-500 ${
              unlocked ? "group-hover:scale-110" : "grayscale"
            }`}
            loading="lazy"
            width={768}
            height={512}
          />
        ) : (
          <div className="h-full w-full bg-accent" />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        {/* Lock overlay */}
        {!unlocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted/30 backdrop-blur-md">
                <Lock className="h-6 w-6 text-foreground/80" />
              </div>
              {isTimeLocked && (
                <span className="flex items-center gap-1 rounded-full bg-primary/20 px-3 py-1 text-xs font-medium text-primary backdrop-blur-md">
                  <Clock className="h-3 w-3" /> Libera em {daysLeft} dia{daysLeft! > 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Module number badge */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold backdrop-blur-md ${
            isComplete
              ? "bg-success/20 text-success"
              : "bg-black/40 text-foreground/90"
          }`}>
            {isComplete ? (
              <><CheckCircle2 className="h-3.5 w-3.5" /> Completo</>
            ) : (
              <>Módulo {index + 1}</>
            )}
          </span>
        </div>

        {/* Type badge */}
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1 rounded-lg bg-black/40 px-2.5 py-1.5 text-[10px] font-medium text-foreground/70 uppercase tracking-wider backdrop-blur-md">
            {hasVideo ? <><Play className="h-3 w-3" /> Vídeo</> : <><FileText className="h-3 w-3" /> PDF</>}
          </span>
        </div>

        {/* Bottom content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
          <h3 className="font-heading text-base sm:text-lg font-bold text-white leading-tight line-clamp-2">
            {module.title}
          </h3>
          <div className="mt-2 flex items-center gap-4">
            <span className="text-xs text-white/60">
              {module.lessons.length} aula{module.lessons.length > 1 ? "s" : ""}
            </span>
            {unlocked && (
              <>
                <span className="text-xs text-white/60">•</span>
                <span className="text-xs text-white/60">
                  {progress.completed}/{module.lessons.length} concluídas
                </span>
              </>
            )}
          </div>

          {/* Progress bar */}
          {unlocked && (
            <div className="mt-3 flex items-center gap-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/20">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isComplete ? "bg-success" : "bg-primary"
                  }`}
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
              <span className={`text-xs font-bold ${isComplete ? "text-success" : "text-primary"}`}>
                {progress.percent}%
              </span>
            </div>
          )}
        </div>

        {/* Hover arrow */}
        {unlocked && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 translate-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
              <ChevronRight className="h-5 w-5" />
            </div>
          </div>
        )}
      </div>
    </button>
  );
}
