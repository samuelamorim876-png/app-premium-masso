interface OverallProgressProps {
  completed: number;
  total: number;
  percent: number;
}

export function OverallProgress({ completed, total, percent }: OverallProgressProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Progresso geral</p>
          <p className="mt-1 font-heading text-2xl font-bold text-foreground">{percent}%</p>
        </div>
        <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-primary/20">
          <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-muted/50" />
            <circle
              cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4"
              className="text-primary"
              strokeDasharray={`${(percent / 100) * 175.9} 175.9`}
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{completed} de {total} aulas concluídas</p>
    </div>
  );
}
