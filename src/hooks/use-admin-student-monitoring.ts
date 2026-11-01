import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { createVisibilityPoller } from "@/lib/visibility-poller";

const PAGE_SIZE = 1000;

/** Lê todas as linhas em páginas de 1000 (o banco devolve no máximo 1000 por pedido). */
async function fetchAllRows<T>(
  page: (from: number, to: number) => PromiseLike<{ data: unknown; error: unknown }>,
): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await page(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    const chunk = (data as T[]) || [];
    rows.push(...chunk);
    if (chunk.length < PAGE_SIZE) break;
  }
  return rows;
}

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

  const lastFullAt = useRef(0);
  const lastProgressAt = useRef<string | null>(null);
  const fullInFlight = useRef(false);

  const fetchRecentActivity = useCallback(async () => {
    const [engagementRows, eventsRes] = await Promise.all([
      fetchAllRows<Engagement>((from, to) => supabase.from("student_engagement").select("*").order("user_id").range(from, to)),
      supabase.from("student_activity_events").select("*").order("created_at", { ascending: false }).limit(500),
    ]);
    setEngagement(engagementRows);
    setEvents((eventsRes.data as ActivityEvent[]) || []);
  }, []);

  // Recarga completa: inclui TODOS os registros de progresso (paginado de 1000 em 1000).
  const fetchAll = useCallback(async (options?: { silent?: boolean }) => {
    if (fullInFlight.current) return;
    fullInFlight.current = true;
    if (!options?.silent) setLoading(true);
    try {
      const [profileRows, progressRows, modulesRes, lessonsRes] = await Promise.all([
        fetchAllRows<Profile>((from, to) => supabase.from("profiles").select("*").order("created_at", { ascending: false }).order("id").range(from, to)),
        fetchAllRows<LessonProgress>((from, to) =>
          supabase.from("lesson_progress").select("user_id,lesson_id,completed_at").order("completed_at").order("id").range(from, to),
        ),
        supabase.from("managed_modules").select("id,title"),
        supabase.from("managed_lessons").select("id,module_id,title,type"),
        fetchRecentActivity(),
      ]);
      setProfiles(profileRows);
      setProgress(progressRows);
      lastProgressAt.current = progressRows.length ? progressRows[progressRows.length - 1].completed_at : null;
      setModules((modulesRes.data as ManagedModule[]) || []);
      setLessons((lessonsRes.data as ManagedLesson[]) || []);
      lastFullAt.current = Date.now();
    } finally {
      fullInFlight.current = false;
      setLoading(false);
    }
  }, [fetchRecentActivity]);

  // Atualização leve (a cada minuto): presença, atividades recentes e apenas as aulas concluídas desde a última leitura.
  const fetchLight = useCallback(async () => {
    const since = lastProgressAt.current;
    const newProgressQuery = since
      ? supabase.from("lesson_progress").select("user_id,lesson_id,completed_at").gte("completed_at", since).order("completed_at").limit(1000)
      : null;
    const [, newProgressRes] = await Promise.all([fetchRecentActivity(), newProgressQuery]);
    const newRows = (newProgressRes?.data as LessonProgress[] | undefined) || [];
    if (newRows.length) {
      setProgress((prev) => {
        const seen = new Set(prev.map((p) => `${p.user_id}:${p.lesson_id}`));
        const additions = newRows.filter((row) => !seen.has(`${row.user_id}:${row.lesson_id}`));
        return additions.length ? [...prev, ...additions] : prev;
      });
      lastProgressAt.current = newRows[newRows.length - 1].completed_at;
    }
  }, [fetchRecentActivity]);

  useEffect(() => {
    fetchAll();
    let debounce: number | undefined;
    let tick = 0;
    // Mudanças em alunos (bloqueio/cadastro) com o painel visível: uma única recarga agrupada.
    // Com o painel oculto não consulta nada; a recarga acontece ao voltar.
    const scheduleFetch = () => {
      if (document.visibilityState === "hidden") {
        lastFullAt.current = 0;
        return;
      }
      window.clearTimeout(debounce);
      debounce = window.setTimeout(() => fetchAll({ silent: true }), 5000);
    };
    const channel = supabase
      .channel("admin-student-monitoring")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, scheduleFetch)
      .subscribe();
    // Só atualiza com a aba do painel visível: leve a cada 1 min, completa a cada 5 min (pega aulas desmarcadas).
    const poller = createVisibilityPoller({
      intervalMs: 60000,
      onTick: () => {
        tick += 1;
        if (tick % 5 === 0) fetchAll({ silent: true });
        else fetchLight();
      },
      onResume: () => {
        tick = 0;
        if (Date.now() - lastFullAt.current > 60000) fetchAll({ silent: true });
        else fetchLight();
      },
    });
    return () => {
      poller.stop();
      window.clearTimeout(debounce);
      supabase.removeChannel(channel);
    };
  }, [fetchAll, fetchLight]);

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
