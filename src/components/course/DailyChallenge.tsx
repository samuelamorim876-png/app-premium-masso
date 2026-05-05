import { useState, useEffect } from "react";
import { Calendar, CheckCircle2, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { dailyChallengesPool } from "@/data/quiz-data";

interface DailyChallengeProps {
  userId: string;
  onComplete: () => void;
}

function getTodayChallenge() {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  const index = dayOfYear % dailyChallengesPool.length;
  return dailyChallengesPool[index];
}

export function DailyChallenge({ userId, onComplete }: DailyChallengeProps) {
  const [completed, setCompleted] = useState(false);
  const challenge = getTodayChallenge();

  // Check if already completed today (stored in localStorage for simplicity)
  useEffect(() => {
    const key = `daily_${userId}_${new Date().toISOString().split("T")[0]}`;
    if (localStorage.getItem(key)) setCompleted(true);
  }, [userId]);

  const handleComplete = () => {
    const key = `daily_${userId}_${new Date().toISOString().split("T")[0]}`;
    localStorage.setItem(key, "1");
    setCompleted(true);
    onComplete();
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 animate-fade-up">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-destructive/15">
          <Flame className="h-5 w-5 text-destructive" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-destructive">Desafio do Dia</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
      </div>

      <h4 className="font-heading text-base font-bold text-foreground">{challenge.title}</h4>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{challenge.description}</p>

      <div className="mt-4">
        {completed ? (
          <div className="flex items-center gap-2 rounded-xl bg-success/10 px-4 py-3 text-sm font-medium text-success">
            <CheckCircle2 className="h-4 w-4" /> Desafio concluído! +25 XP
          </div>
        ) : (
          <Button onClick={handleComplete} size="sm" className="rounded-xl w-full" variant="outline">
            <CheckCircle2 className="mr-2 h-4 w-4" /> Marcar como concluído
          </Button>
        )}
      </div>
    </div>
  );
}
