import { useState, useCallback } from "react";
import { courseModules } from "@/data/course-data";

const STORAGE_KEY = "massoterapia-progress";

function loadProgress(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveProgress(completed: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...completed]));
}

export function useProgress() {
  const [completed, setCompleted] = useState<Set<string>>(loadProgress);

  const toggleLesson = useCallback((lessonId: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(lessonId)) {
        next.delete(lessonId);
      } else {
        next.add(lessonId);
      }
      saveProgress(next);
      return next;
    });
  }, []);

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

  return { completed, toggleLesson, isLessonCompleted, getModuleProgress, isModuleUnlocked, overallProgress };
}
