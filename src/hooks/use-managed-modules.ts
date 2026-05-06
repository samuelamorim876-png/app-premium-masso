import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { LessonType, Module, Lesson } from "@/data/course-data";

interface DBModule {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  sort_order: number;
  days_to_unlock: number;
}

interface DBLesson {
  id: string;
  module_id: string;
  title: string;
  type: string;
  content_url: string | null;
  description: string;
  sort_order: number;
}

export function useManagedModules() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    const [modsRes, lessRes] = await Promise.all([
      supabase.from("managed_modules").select("*").order("sort_order"),
      supabase.from("managed_lessons").select("*").order("sort_order"),
    ]);

    const dbMods = (modsRes.data as DBModule[]) || [];
    const dbLessons = (lessRes.data as DBLesson[]) || [];

    const mapped: Module[] = dbMods.map((m) => {
      const modLessons = dbLessons.filter((l) => l.module_id === m.id);
      return {
        id: m.id,
        title: m.title,
        emoji: "🔹",
        image: m.image_url || undefined,
        unlock: m.days_to_unlock > 0
          ? { kind: "days_after_purchase" as const, days: m.days_to_unlock }
          : { kind: "immediate" as const },
        lessons: modLessons.map((l) => ({
          id: l.id,
          title: l.title,
          type: l.type as LessonType,
          url: l.content_url || undefined,
          infoContent: l.type === "info" ? l.description : undefined,
        })),
      };
    });

    setModules(mapped);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { modules, loading, refetch: fetchAll };
}
