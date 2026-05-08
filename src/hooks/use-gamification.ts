import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface GamificationData {
  points: number;
  level: string;
  xp: number;
}

export interface Badge {
  badge_id: string;
  badge_name: string;
  earned_at: string;
}

const LEVELS = [
  { name: "Iniciante", minXp: 0 },
  { name: "Intermediário", minXp: 500 },
  { name: "Avançado", minXp: 1500 },
  { name: "Especialista", minXp: 3000 },
  { name: "Mestre", minXp: 5000 },
];

export function getLevel(xp: number): string {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXp) return LEVELS[i].name;
  }
  return "Iniciante";
}

export function getNextLevel(xp: number): { name: string; xpNeeded: number; progress: number } | null {
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp < LEVELS[i].minXp) {
      const prevMin = i > 0 ? LEVELS[i - 1].minXp : 0;
      const range = LEVELS[i].minXp - prevMin;
      const progress = ((xp - prevMin) / range) * 100;
      return { name: LEVELS[i].name, xpNeeded: LEVELS[i].minXp - xp, progress };
    }
  }
  return null;
}

const MODULE_BADGES: Record<string, string> = {
  "mi-a": "🏅 Primeiros Passos",
  "mc-1": "📚 Estudioso I",
  "mc-2": "📚 Estudioso II",
  "mc-3": "📚 Estudioso III",
  "mc-4": "📚 Estudioso IV",
  "mod-5": "🧴 Mestre dos Materiais",
  "mod-6": "🦴 Anatomista",
  "mod-7": "⚖️ Ética Profissional",
  "mod-8": "💆 Relaxamento Master",
  "mod-9": "💧 Drenagem Expert",
  "mod-10": "🦶 Reflexologista",
  "mod-12": "✨ Modeladora Pro",
  "mod-13": "👂 Auriculoterapeuta",
  "mod-14": "🔥 Moxaterapia Expert",
  "mod-15": "🎓 Técnicas Avançadas I",
  "mod-16": "🎓 Técnicas Avançadas II",
  "mod-17": "🎓 Técnicas Avançadas III",
  "mod-18": "🎓 Técnicas Avançadas IV",
  "mod-19": "🎁 Conteúdo Bônus",
};

export function useGamification(userId: string | undefined) {
  const [data, setData] = useState<GamificationData>({ points: 0, level: "Iniciante", xp: 0 });
  const [badges, setBadges] = useState<Badge[]>([]);
  const [showReward, setShowReward] = useState<{ points: number; badge?: string } | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) return;
    const [gamRes, badgeRes] = await Promise.all([
      supabase.from("user_gamification").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("user_badges").select("*").eq("user_id", userId),
    ]);
    if (gamRes.data) {
      setData({ points: gamRes.data.points, level: gamRes.data.level, xp: gamRes.data.xp });
    }
    if (badgeRes.data) {
      setBadges(badgeRes.data.map((b: any) => ({ badge_id: b.badge_id, badge_name: b.badge_name, earned_at: b.earned_at })));
    }
  }, [userId]);

  useEffect(() => { refresh(); }, [refresh]);

  const awardCustomBadge = useCallback(async (badgeId: string, badgeName: string) => {
    if (!userId) return;
    if (badges.some((b) => b.badge_id === badgeId)) return;
    const newBadge = { badge_id: badgeId, badge_name: badgeName, earned_at: new Date().toISOString() };
    setBadges((prev) => [...prev, newBadge]);
    setShowReward({ points: 25, badge: badgeName });
    setTimeout(() => setShowReward(null), 3000);
    await supabase.from("user_badges").insert({ user_id: userId, badge_id: badgeId, badge_name: badgeName });
  }, [userId, badges]);

  const addPoints = useCallback(async (pts: number) => {
    if (!userId) return;
    const newXp = data.xp + pts;
    const newPoints = data.points + pts;
    const newLevel = getLevel(newXp);
    const updated = { points: newPoints, level: newLevel, xp: newXp };
    setData(updated);
    setShowReward({ points: pts });
    setTimeout(() => setShowReward(null), 2500);

    const { error } = await supabase.from("user_gamification").upsert({
      user_id: userId,
      ...updated,
    }, { onConflict: "user_id" });
  }, [userId, data]);

  const awardBadge = useCallback(async (moduleId: string) => {
    if (!userId) return;
    const badgeName = MODULE_BADGES[moduleId];
    if (!badgeName) return;
    if (badges.some((b) => b.badge_id === moduleId)) return;

    const newBadge = { badge_id: moduleId, badge_name: badgeName, earned_at: new Date().toISOString() };
    setBadges((prev) => [...prev, newBadge]);
    setShowReward({ points: 50, badge: badgeName });
    setTimeout(() => setShowReward(null), 3000);

    await supabase.from("user_badges").insert({ user_id: userId, badge_id: moduleId, badge_name: badgeName });
    await addPoints(50);
  }, [userId, badges, addPoints]);

  return { data, badges, showReward, addPoints, awardBadge, awardCustomBadge, refresh, dismissReward: () => setShowReward(null) };
}
