import { useEffect, useState } from "react";
import { Lock, Trophy, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Badge } from "@/hooks/use-gamification";

interface Props {
  userId?: string;
  xp: number;
  badges: Badge[];
  lessonsCompleted: number;
  modulesCompleted: number;
}

interface Achievement {
  id: string;
  emoji: string;
  name: string;
  description: string;
  current: number;
  target: number;
}

export function AchievementsCarousel({ userId, xp, badges, lessonsCompleted, modulesCompleted }: Props) {
  const [streak, setStreak] = useState({ current: 0, longest: 0, total: 0 });

  useEffect(() => {
    if (!userId) return;
    supabase
      .from("daily_login_streaks" as never)
      .select("current_streak,longest_streak,total_logins")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data }) => {
        const r = data as { current_streak: number; longest_streak: number; total_logins: number } | null;
        if (r) setStreak({ current: r.current_streak, longest: r.longest_streak, total: r.total_logins });
      });
  }, [userId]);

  const hasBadge = (id: string) => badges.some((b) => b.badge_id === id);

  const achievements: Achievement[] = [
    { id: "first_login",  emoji: "🎯", name: "Primeiro Acesso",   description: "Faça seu primeiro login",        current: hasBadge("first_login") || streak.total >= 1 ? 1 : 0, target: 1 },
    { id: "first_lesson", emoji: "📖", name: "Primeira Aula",     description: "Conclua sua primeira aula",      current: Math.min(lessonsCompleted, 1),  target: 1 },
    { id: "lessons_10",   emoji: "📚", name: "Estudioso",         description: "Conclua 10 aulas",               current: Math.min(lessonsCompleted, 10), target: 10 },
    { id: "lessons_50",   emoji: "🎓", name: "Dedicado",          description: "Conclua 50 aulas",               current: Math.min(lessonsCompleted, 50), target: 50 },
    { id: "lessons_100",  emoji: "🏆", name: "Centurião",         description: "Conclua 100 aulas",              current: Math.min(lessonsCompleted, 100), target: 100 },
    { id: "module_1",     emoji: "🥉", name: "Primeiro Módulo",   description: "Complete 1 módulo",              current: Math.min(modulesCompleted, 1),  target: 1 },
    { id: "module_5",     emoji: "🥈", name: "Multidisciplinar",  description: "Complete 5 módulos",             current: Math.min(modulesCompleted, 5),  target: 5 },
    { id: "module_10",    emoji: "🥇", name: "Especialista",      description: "Complete 10 módulos",            current: Math.min(modulesCompleted, 10), target: 10 },
    { id: "streak_7",     emoji: "🔥", name: "7 Dias Seguidos",   description: "Acesse por 7 dias consecutivos", current: Math.min(streak.longest, 7),    target: 7 },
    { id: "streak_30",    emoji: "💎", name: "30 Dias Seguidos",  description: "Acesse por 30 dias consecutivos", current: Math.min(streak.longest, 30),  target: 30 },
    { id: "xp_1500",      emoji: "⚡", name: "Avançado",          description: "Acumule 1500 XP",                current: Math.min(xp, 1500), target: 1500 },
    { id: "xp_5000",      emoji: "👑", name: "Mestre",            description: "Acumule 5000 XP",                current: Math.min(xp, 5000), target: 5000 },
  ];

  const unlockedCount = achievements.filter((a) => a.current >= a.target).length;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 animate-fade-up">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-gold" />
          <h3 className="font-heading text-base font-bold text-foreground">Conquistas</h3>
          <span className="text-xs text-muted-foreground">({unlockedCount}/{achievements.length})</span>
        </div>
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
          deslize <ChevronRight className="h-3 w-3" />
        </span>
      </div>

      <div
        className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide -mx-1 px-1"
        style={{ scrollbarWidth: "none" }}
      >
        {achievements.map((a) => {
          const unlocked = a.current >= a.target;
          const percent = Math.round((a.current / a.target) * 100);
          return (
            <div
              key={a.id}
              className={`shrink-0 snap-start w-[calc((100%-2.25rem)/4)] min-w-[88px] sm:min-w-[110px] rounded-xl border p-3 text-center transition-all ${
                unlocked
                  ? "border-gold/40 bg-gold/10 shadow-[0_0_18px_-6px_oklch(0.72_0.16_85/0.6)]"
                  : "border-border bg-muted/40"
              }`}
            >
              <div className="relative mx-auto mb-2 flex h-12 w-12 items-center justify-center">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl ${
                    unlocked ? "bg-gold/20" : "bg-muted grayscale opacity-50"
                  }`}
                >
                  {a.emoji}
                </div>
                {!unlocked && (
                  <Lock className="absolute -bottom-1 -right-1 h-4 w-4 text-muted-foreground bg-card rounded-full p-0.5 border border-border" />
                )}
              </div>
              <p className={`text-[11px] font-semibold leading-tight line-clamp-2 ${unlocked ? "text-gold" : "text-muted-foreground"}`}>
                {a.name}
              </p>
              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all ${unlocked ? "bg-gold" : "bg-primary/60"}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground tabular-nums">
                {a.current}/{a.target}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
