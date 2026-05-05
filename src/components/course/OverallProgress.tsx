import { Trophy, Flame, Target } from "lucide-react";

interface OverallProgressProps {
  completed: number;
  total: number;
  percent: number;
}

export function OverallProgress({ completed, total, percent }: OverallProgressProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6">
      {/* Decorative glow */}
      <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-success/10 blur-3xl" />

      <div className="relative flex flex-col sm:flex-row items-center gap-6">
        {/* Circular progress */}
        <div className="relative flex-shrink-0">
          <svg className="h-24 w-24 -rotate-90" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r="40" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted" />
            <circle
              cx="48" cy="48" r="40" fill="none" stroke="currentColor" strokeWidth="6"
              className="text-primary transition-all duration-1000"
              strokeDasharray={`${(percent / 100) * 251.3} 251.3`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-heading text-2xl font-bold text-foreground">{percent}%</span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 text-center sm:text-left">
          <h3 className="font-heading text-lg font-bold text-foreground">Seu Progresso</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {completed} de {total} aulas concluídas
          </p>

          {/* Stats row */}
          <div className="mt-4 flex justify-center sm:justify-start gap-6">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Target className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{total}</p>
                <p>Total</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10">
                <Trophy className="h-4 w-4 text-success" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{completed}</p>
                <p>Feitas</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10">
                <Flame className="h-4 w-4 text-destructive" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{total - completed}</p>
                <p>Restam</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
