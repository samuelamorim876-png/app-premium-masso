import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { courseModules } from "@/data/course-data";

export function useProgress(userId: string | undefined) {
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Load progress from database
  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    
    supabase
      .from("lesson_progress")
      .select("lesson_id")
      .eq("user_id", userId)
      .then(({ data, error }) => {
        if (!error && data) {
          setCompleted(new Set(data.map((r) => r.lesson_id)));
        }
        setLoading(false);
      });
  }, [userId]);

  const toggleLesson = useCallback(async (lessonId: string) => {
    if (!userId) return;

    const isCompleted = completed.has(lessonId);

    if (isCompleted) {
      // Remove
      setCompleted((prev) => { const n = new Set(prev); n.delete(lessonId); return n; });
      await supabase.from("lesson_progress").delete().eq("user_id", userId).eq("lesson_id", lessonId);
    } else {
      // Add
      setCompleted((prev) => new Set(prev).add(lessonId));
      await supabase.from("lesson_progress").insert({ user_id: userId, lesson_id: lessonId });
    }
  }, [userId, completed]);

  const isLessonCompleted = useCallback(
    (lessonId: string) => completed.has(lessonId),
    [completed]
  );

  const getModuleProgress = useCallback(
    (moduleId: string) => {
      const mod = courseModules.find((m) => m.id === moduleId);
      if (!mod) return { completed: 0, total: 0, percent: 0 };
      const done = mod.lessons.filter((l) => completed.has(l.id)).length;
      return { completed: done, total: mod.lessons.length, percent: Math.round((done / mod.lessons.length) * 100) };
    },
    [completed]
  );

  const isModuleUnlocked = useCallback(
    (moduleIndex: number) => {
      if (moduleIndex === 0) return true;
      const prevModule = courseModules[moduleIndex - 1];
      return prevModule.lessons.every((l) => completed.has(l.id));
    },
    [completed]
  );

  const overallProgress = (() => {
    const totalLessons = courseModules.reduce((a, m) => a + m.lessons.length, 0);
    const percent = totalLessons === 0 ? 0 : Math.round((completed.size / totalLessons) * 100);
    return { completed: completed.size, total: totalLessons, percent };
  })();

  return { completed, loading, toggleLesson, isLessonCompleted, getModuleProgress, isModuleUnlocked, overallProgress };
}
