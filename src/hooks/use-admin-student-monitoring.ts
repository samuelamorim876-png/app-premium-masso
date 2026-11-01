import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Profile = {
  id: string;
  name: string;
  email: string | null;
  premium_access: boolean;
  is_active: boolean;
  created_at: string;
  desired_password: string | null;
};

type Engagement = {
  user_id: string;
  last_seen_at: string | null;
  online_until: string | null;
  total_usage_seconds: number;
  current_path: string | null;
  current_module_id: string | null;
  current_lesson_id: string | null;
};

type ActivityEvent = {
  id: string;
  user_id: string;
  event_type: string;
  path: string | null;
  module_id: string | null;
  module_title: string | null;
  lesson_id: string | null;
  lesson_title: string | null;
  lesson_type: string | null;
  created_at: string;
};

type LessonProgress = { user_id: string; lesson_id: string; completed_at: string };
type ManagedModule = { id: string; title: string };
type ManagedLesson = { id: string; module_id: string; title: string; type: string };

export type StudentMonitoring = Profile & {
  statusLabel: string;
  activityLabel: string;
  activityTone: "online" | "recent" | "low" | "inactive" | "blocked";
  isOnline: boolean;
  lastSeenAt: string | null;
  currentPath: string | null;
  totalUsageSeconds: number;
  progressPercent: number;
  completedLessons: number;
  totalLessons: number;
  completedModules: number;
  accessedVideos: number;
  accessedPdfs: number;
  activeDays: number;
  daysWithoutAccess: number | null;
  recentEvents: ActivityEvent[];
};

function daysBetween(dateIso: string | null) {
  if (!dateIso) return null;
  return Math.max(0, Math.floor((Date.now() - new Date(dateIso).getTime()) / 86400000));
}

function formatActivity(p: Profile, engagement?: Engagement) {
  if (!p.is_active) return { label: "Bloqueado", tone: "blocked" as const, online: false };
  if (engagement?.online_until && new Date(engagement.online_until).getTime() > Date.now()) {
    return { label: "Acessando agora", tone: "online" as const, online: true };
  }
  const days = daysBetween(engagement?.last_seen_at ?? null);
  if (days === null) return { label: "Sem acesso registrado", tone: "inactive" as const, online: false };
  if (days === 0) return { label: "Ativo recentemente", tone: "recent" as const, online: false };
  if (days <= 7) return { label: "Pouco ativo", tone: "low" as const, online: false };
  return { label: `Inativo há ${days} dias`, tone: "inactive" as const, online: false };
}

export function useAdminStudentMonitoring() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [engagement, setEngagement] = useState<Engagement[]>([]);
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [progress, setProgress] = useState<LessonProgress[]>([]);
  const [modules, setModules] = useState<ManagedModule[]>([]);
  const [lessons, setLessons] = useState<ManagedLesson[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [profilesRes, engagementRes, eventsRes, progressRes, modulesRes, lessonsRes] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("student_engagement").select("*"),
      supabase.from("student_activity_events").select("*").order("created_at", { ascending: false }).limit(500),
      supabase.from("lesson_progress").select("user_id,lesson_id,completed_at"),
      supabase.from("managed_modules").select("id,title"),
      supabase.from("managed_lessons").select("id,module_id,title,type"),
    ]);
    setProfiles((profilesRes.data as Profile[]) || []);
    setEngagement((engagementRes.data as Engagement[]) || []);
    setEvents((eventsRes.data as ActivityEvent[]) || []);
    setProgress((progressRes.data as LessonProgress[]) || []);
    setModules((modulesRes.data as ManagedModule[]) || []);
    setLessons((lessonsRes.data as ManagedLesson[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
    // Agrupa várias mudanças seguidas numa única recarga (evita recarregar tudo a cada evento).
    let debounce: number | undefined;
    const scheduleFetch = () => {
      window.clearTimeout(debounce);
      debounce = window.setTimeout(fetchAll, 5000);
    };
    // Presença/atividade (muito frequentes) são atualizadas pelo intervalo abaixo, sem tempo real.
    const channel = supabase
      .channel("admin-student-monitoring")
      .on("postgres_changes", { event: "*", schema: "public", table: "lesson_progress" }, scheduleFetch)
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, scheduleFetch)
      .subscribe();
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") fetchAll();
    }, 60000);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(debounce);
      supabase.removeChannel(channel);
    };
  }, [fetchAll]);

  const students = useMemo<StudentMonitoring[]>(() => {
    const engagementByUser = new Map(engagement.map((e) => [e.user_id, e]));
    const eventsByUser = new Map<string, ActivityEvent[]>();
    events.forEach((event) => {
      eventsByUser.set(event.user_id, [...(eventsByUser.get(event.user_id) || []), event]);
    });
    const progressByUser = new Map<string, Set<string>>();
    progress.forEach((item) => {
      if (!progressByUser.has(item.user_id)) progressByUser.set(item.user_id, new Set());
      progressByUser.get(item.user_id)!.add(item.lesson_id);
    });

    return profiles.map((profile) => {
      const studentEngagement = engagementByUser.get(profile.id);
      const studentEvents = eventsByUser.get(profile.id) || [];
      const completedSet = progressByUser.get(profile.id) || new Set<string>();
      const completedModules = modules.filter((mod) => {
        const moduleLessons = lessons.filter((lesson) => lesson.module_id === mod.id);
        return moduleLessons.length > 0 && moduleLessons.every((lesson) => completedSet.has(lesson.id));
      }).length;
      const activity = formatActivity(profile, studentEngagement);
      const activeDays = new Set(studentEvents.map((event) => event.created_at.slice(0, 10))).size;
      const accessedVideos = new Set(studentEvents.filter((event) => event.lesson_type === "video" || event.event_type === "video_access").map((event) => event.lesson_id || event.path)).size;
      const accessedPdfs = new Set(studentEvents.filter((event) => event.lesson_type === "pdf" || event.event_type === "pdf_access").map((event) => event.lesson_id || event.path)).size;

      return {
        ...profile,
        statusLabel: profile.is_active ? "Ativo" : "Inativo/excluído",
        activityLabel: activity.label,
        activityTone: activity.tone,
        isOnline: activity.online,
        lastSeenAt: studentEngagement?.last_seen_at ?? null,
        currentPath: studentEngagement?.current_path ?? null,
        totalUsageSeconds: studentEngagement?.total_usage_seconds ?? 0,
        progressPercent: lessons.length ? Math.round((completedSet.size / lessons.length) * 100) : 0,
        completedLessons: completedSet.size,
        totalLessons: lessons.length,
        completedModules,
        accessedVideos,
        accessedPdfs,
        activeDays,
        daysWithoutAccess: daysBetween(studentEngagement?.last_seen_at ?? null),
        recentEvents: studentEvents.slice(0, 8),
      };
    });
  }, [engagement, events, lessons, modules, profiles, progress]);

  return { students, loading, refetch: fetchAll };
}
