import { Star, Award } from "lucide-react";

interface RewardPopupProps {
  points: number;
  badge?: string;
}

export function RewardPopup({ points, badge }: RewardPopupProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 animate-scale-in">
      <div className="flex items-center gap-3 rounded-2xl border border-primary/30 bg-card px-5 py-4 shadow-2xl shadow-primary/20 backdrop-blur-xl">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
          {badge ? <Award className="h-6 w-6 text-primary" /> : <Star className="h-6 w-6 text-primary" />}
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">+{points} XP</p>
          {badge && <p className="text-xs text-primary font-medium">{badge}</p>}
          {!badge && <p className="text-xs text-muted-foreground">Continue assim!</p>}
        </div>
      </div>
    </div>
  );
}
