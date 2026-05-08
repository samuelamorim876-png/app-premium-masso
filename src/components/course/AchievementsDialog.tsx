import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trophy } from "lucide-react";
import type { Badge } from "@/hooks/use-gamification";

interface Props {
  badges: Badge[];
  trigger: React.ReactNode;
}

export function AchievementsDialog({ badges, trigger }: Props) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-gold" />
            Suas Conquistas ({badges.length})
          </DialogTitle>
        </DialogHeader>
        {badges.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            Nenhuma conquista ainda. Continue estudando para desbloquear!
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto">
            {badges.map((b) => (
              <div
                key={b.badge_id}
                className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-center"
              >
                <p className="text-2xl mb-1">{b.badge_name.split(" ")[0]}</p>
                <p className="text-xs font-semibold text-foreground line-clamp-2">
                  {b.badge_name.split(" ").slice(1).join(" ")}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {new Date(b.earned_at).toLocaleDateString("pt-BR")}
                </p>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
