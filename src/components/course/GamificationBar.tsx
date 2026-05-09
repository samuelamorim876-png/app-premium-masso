import { Star, Trophy, Zap, Sparkles } from "lucide-react";
import type { GamificationData, Badge } from "@/hooks/use-gamification";
import { getNextLevel } from "@/hooks/use-gamification";

interface GamificationBarProps {
  data: GamificationData;
  badges: Badge[];
}

export function GamificationBar({ data, badges }: GamificationBarProps) {
  const next = getNextLevel(data.xp);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 animate-fade-up">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Level */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15">
            <Zap className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Nível</p>
            <p className="font-heading text-lg font-bold text-foreground">{data.level}</p>
          </div>
        </div>

        {/* XP Progress + benefit message */}
        <div className="flex-1 w-full sm:w-auto">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Star className="h-3 w-3 text-primary" /> {data.xp} XP
            </span>
            {next && (
              <span className="text-xs text-muted-foreground">
                Nível {next.name}
              </span>
            )}
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-success transition-all duration-700"
              style={{ width: `${next ? next.progress : 100}%` }}
            />
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-amber-500">
            <Sparkles className="h-3.5 w-3.5" />
            Acumule XP e desbloqueie emblemas e conquistas
          </p>
        </div>

        {/* Badges count */}
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/15">
            <Trophy className="h-5 w-5 text-gold" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">{badges.length}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Badges</p>
          </div>
        </div>
      </div>

    </div>
  );
}
