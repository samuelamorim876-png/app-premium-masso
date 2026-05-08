import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Records daily login, updates streak, and grants +5 XP for the first login of the day.
 * Returns the streak data through onUpdate callback (optional).
 */
export function useDailyLogin(
  userId: string | undefined,
  onAwardXp: (xp: number) => void,
  onAwardBadge?: (badgeId: string, badgeName: string) => void,
) {
  const ranRef = useRef(false);

  useEffect(() => {
    if (!userId || ranRef.current) return;
    ranRef.current = true;

    const today = new Date().toISOString().slice(0, 10);

    (async () => {
      try {
        const { data } = await supabase
          .from("daily_login_streaks" as never)
          .select("current_streak,longest_streak,last_login_date,total_logins")
          .eq("user_id", userId)
          .maybeSingle();

        const row = data as
          | { current_streak: number; longest_streak: number; last_login_date: string; total_logins: number }
          | null;

        if (!row) {
          await supabase.from("daily_login_streaks" as never).insert({
            user_id: userId,
            current_streak: 1,
            longest_streak: 1,
            last_login_date: today,
            total_logins: 1,
          } as never);
          onAwardXp(5);
          onAwardBadge?.("first_login", "🎯 Primeiro Login");
          return;
        }

        if (row.last_login_date === today) return; // already counted today

        const last = new Date(row.last_login_date + "T00:00:00");
        const now = new Date(today + "T00:00:00");
        const diffDays = Math.round((now.getTime() - last.getTime()) / 86400000);

        const newStreak = diffDays === 1 ? row.current_streak + 1 : 1;
        const newLongest = Math.max(row.longest_streak, newStreak);

        await supabase
          .from("daily_login_streaks" as never)
          .update({
            current_streak: newStreak,
            longest_streak: newLongest,
            last_login_date: today,
            total_logins: row.total_logins + 1,
            updated_at: new Date().toISOString(),
          } as never)
          .eq("user_id", userId);

        onAwardXp(5);

        if (newStreak >= 7) onAwardBadge?.("streak_7", "🔥 7 Dias Seguidos");
        if (newStreak >= 30) onAwardBadge?.("streak_30", "💎 30 Dias Seguidos");
      } catch {
        // silent — never break dashboard
      }
    })();
  }, [userId, onAwardXp, onAwardBadge]);
}
