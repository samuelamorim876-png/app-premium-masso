import { createFileRoute, Link } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useAdmin } from "@/hooks/use-admin";
import { supabase } from "@/integrations/supabase/client";
import { approveAccessRequest } from "@/server/approve-user.functions";
import { deleteAuthUser } from "@/server/delete-user.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  ArrowLeft,
  Users,
  BookOpen,
  ShoppingBag,
  Search,
  Trash2,
  Edit,
  Plus,
  Shield,
  Star,
  XCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Video,
  FileText,
  Clock,
  Bell,
  BellOff,
  LayoutGrid,
  StickyNote,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
} from "lucide-react";
import { usePushSubscription } from "@/hooks/use-push-subscription";
import { getAdminPushDiagnostics, markPushReceived, sendTestAdminPush } from "@/lib/push-notifications.functions";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { useAdminStudentMonitoring } from "@/hooks/use-admin-student-monitoring";
import { BuyersTab } from "@/components/admin/BuyersTab";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Painel Administrativo — Massoterapia" }] }),
  component: AdminPage,
});

type Tab = "students" | "pending" | "buyers" | "content" | "courses" | "diagnostics" | "home_layout" | "notes";

interface Profile {
  id: string;
  name: string;
  email: string | null;
  premium_access: boolean;
  is_active: boolean;
  created_at: string;
}

interface ManagedCourse {
  id: string;
  title: string;
  description: string;
  badge: string | null;
  purchase_link: string | null;
  available: boolean;
  sort_order: number;
}

interface ManagedModule {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  sort_order: number;
  days_to_unlock: number;
}

interface ManagedLesson {
  id: string;
  module_id: string;
  title: string;
  type: string;
  content_url: string | null;
  description: string;
  sort_order: number;
}

function AdminPage() {
  const { user } = useAuth();
  const { isAdmin, loading } = useAdmin(user?.id);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h1 className="text-xl font-bold text-foreground">Acesso Negado</h1>
          <p className="text-muted-foreground mt-2">Você não tem permissão para acessar esta área.</p>
          <Link to="/">
            <Button className="mt-4">Voltar ao Início</Button>
          </Link>
        </div>
      </div>
    );
  }

  return <AdminDashboard />;
}

function PushToggle({ userId }: { userId: string | undefined }) {
  const { isSubscribed, isSupported, loading, subscribe, unsubscribe } = usePushSubscription(userId);

  if (!isSupported) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => (isSubscribed ? unsubscribe() : subscribe())}
      disabled={loading}
      className={isSubscribed ? "text-amber-400 hover:text-amber-300" : "text-muted-foreground hover:text-foreground"}
      title={isSubscribed ? "Desativar notificações" : "Ativar notificações push"}
    >
      {isSubscribed ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
    </Button>
  );
}

function TestPushButton() {
  const sendTest = useServerFn(sendTestAdminPush);
  const [sending, setSending] = useState(false);
  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={sending}
      onClick={async () => {
        setSending(true);
        try {
          const result = (await sendTest()) as any;
          if (result.sent > 0) {
            toast.success(`Notificação de teste enviada (${result.sent}).`);
          } else {
            toast.error(
              `Falha ao enviar (${result.reason}). Ative as notificações no botão do sino e tente novamente.`
            );
          }
        } catch (e: any) {
          toast.error(e?.message ?? "Erro ao enviar teste.");
        } finally {
          setSending(false);
        }
      }}
      className="text-xs text-muted-foreground hover:text-foreground"
      title="Enviar notificação de teste para você"
    >
      {sending ? "Enviando..." : "Testar push"}
    </Button>
  );
}

function AdminDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("students");

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "students", label: "Alunos", icon: <Users className="h-4 w-4" /> },
    { key: "pending", label: "Aguardando Aprovação", icon: <Clock className="h-4 w-4" /> },
    { key: "buyers", label: "Compradores Oficiais", icon: <Shield className="h-4 w-4" /> },
    { key: "content", label: "Conteúdos", icon: <BookOpen className="h-4 w-4" /> },
    { key: "courses", label: "Cursos", icon: <ShoppingBag className="h-4 w-4" /> },
    { key: "home_layout", label: "Layout da Home", icon: <LayoutGrid className="h-4 w-4" /> },
    { key: "notes", label: "Anotações dos Alunos", icon: <StickyNote className="h-4 w-4" /> },
    { key: "diagnostics", label: "Diagnóstico Push", icon: <Bell className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="text-sm font-bold text-foreground">Painel Admin</span>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <ClientOnly fallback={null}>
              <TestPushButton />
              <PushToggle userId={user?.id} />
            </ClientOnly>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all whitespace-nowrap ${
                tab === t.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {tab === "students" && <StudentsTab />}
        {tab === "pending" && <PendingTab />}
        {tab === "buyers" && <BuyersTab />}
        {tab === "content" && <ContentTab />}
        {tab === "courses" && <CoursesTab />}
        {tab === "home_layout" && <HomeLayoutTab />}
        {tab === "notes" && <StudentNotesTab />}
        {tab === "diagnostics" && <PushDiagnosticsTab userId={user?.id} />}
      </main>
    </div>
  );
}

/* ==================== PUSH DIAGNOSTICS TAB ==================== */
function PushDiagnosticsTab({ userId }: { userId?: string }) {
  const fetchDiag = useServerFn(getAdminPushDiagnostics);
  const sendTest = useServerFn(sendTestAdminPush);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const describeError = async (e: unknown): Promise<string> => {
    if (e instanceof Response) {
      try {
        const txt = await e.text();
        return `${e.status} ${e.statusText}${txt ? ` — ${txt}` : ""}`;
      } catch {
        return `${e.status} ${e.statusText || "Erro de rede"}`;
      }
    }
    if (e instanceof Error) return e.message;
    return "Erro desconhecido";
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchDiag();
      setData(res);
    } catch (e: unknown) {
      const msg = await describeError(e);
      console.warn("[diagnostics] load failed:", msg, e);
      toast.error(`Não foi possível carregar o diagnóstico: ${msg}`);
      setData({ allowed: false, reason: "fetch_failed" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      load().catch((err) => console.warn("[diagnostics] unhandled:", err));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleTest = async () => {
    setSending(true);
    try {
      await sendTest();
      toast.success("Notificação de teste enviada");
      setTimeout(() => {
        load().catch((err) => console.warn("[diagnostics] unhandled:", err));
      }, 1500);
    } catch (e: unknown) {
      const msg = await describeError(e);
      toast.error(`Falha ao enviar teste: ${msg}`);
    } finally {
      setSending(false);
    }
  };

  if (loading && !data) return <div className="text-muted-foreground">Carregando diagnóstico...</div>;
  if (!data) return <div className="text-muted-foreground">Sem dados.</div>;
  if (!data.allowed) return <div className="text-destructive">Acesso restrito ao administrador principal.</div>;

  const Stat = ({ label, value, ok }: { label: string; value: string; ok?: boolean }) => (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`mt-1 text-sm font-medium ${ok === false ? "text-destructive" : ok ? "text-primary" : "text-foreground"}`}>{value}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button onClick={handleTest} disabled={sending}>
          <Bell className="mr-2 h-4 w-4" />
          {sending ? "Enviando..." : "Testar Push Notification Agora"}
        </Button>
        <Button variant="outline" onClick={load} disabled={loading}>Atualizar</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Firebase/FCM" value={data.firebaseConnected ? "Conectado" : "Não conectado"} ok={data.firebaseConnected} />
        <Stat label="Inscrições" value={String(data.subscriptionCount)} ok={data.subscriptionCount > 0} />
        <Stat label="Admin marcado" value={data.adminMarked ? "Sim" : "Não"} ok={data.adminMarked} />
        <Stat label="Permissão" value={data.latestSubscription?.permission_status ?? "—"} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground mb-1">Última enviada</div>
          <div className="text-sm">
            {data.latestSent ? `${data.latestSent.title ?? "(sem título)"} — ${data.latestSent.status} — ${new Date(data.latestSent.created_at).toLocaleString()}` : "Nenhuma"}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground mb-1">Última recebida</div>
          <div className="text-sm">
            {data.latestReceived ? `${data.latestReceived.title ?? "(sem título)"} — ${new Date(data.latestReceived.created_at).toLocaleString()}` : "Nenhuma"}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="text-sm font-medium mb-2">Logs recentes</div>
        <div className="space-y-1 max-h-80 overflow-auto text-xs">
          {(data.logs ?? []).map((log: any) => (
            <div key={log.id} className="flex justify-between gap-2 border-b border-border/50 py-1">
              <span className="truncate">{log.notification_type} · {log.title ?? "—"}</span>
              <span className={log.status === "sent" || log.status === "received" ? "text-primary" : "text-destructive"}>{log.status}</span>
              <span className="text-muted-foreground">{new Date(log.created_at).toLocaleTimeString()}</span>
            </div>
          ))}
          {(!data.logs || data.logs.length === 0) && <div className="text-muted-foreground">Sem logs ainda.</div>}
        </div>
      </div>
    </div>
  );
}

/* ==================== STUDENTS TAB ==================== */
const PRINCIPAL_ADMIN_EMAIL = "pastororxiamorim@gmail.com";

function formatDuration(totalSeconds: number) {
  if (!totalSeconds) return "0min";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}min`;
  return `${m}min`;
}

function formatDateTime(iso: string | null) {
  if (!iso) return "Nunca";
  return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function StudentsTab() {
  const { user } = useAuth();
  const { students, loading: loadingData, refetch } = useAdminStudentMonitoring();
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const isPrincipalAdmin = (user?.email || "").toLowerCase() === PRINCIPAL_ADMIN_EMAIL;

  const togglePremium = async (id: string, current: boolean) => {
    await supabase.from("profiles").update({ premium_access: !current }).eq("id", id);
    refetch();
  };
  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from("profiles").update({ is_active: !current }).eq("id", id);
    refetch();
  };
  const deleteStudent = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este aluno? Isso removerá o acesso completamente.")) return;
    try {
      await deleteAuthUser({ data: { userId: id } });
      alert("✅ Aluno excluído com sucesso.");
    } catch (err: any) {
      alert(`❌ Erro ao excluir: ${err.message}`);
    }
    refetch();
  };

  const filtered = students.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.email || "").toLowerCase().includes(search.toLowerCase())
  );

  const toneClasses: Record<string, string> = {
    online: "bg-emerald-500/20 text-emerald-400",
    recent: "bg-sky-500/20 text-sky-400",
    low: "bg-amber-500/20 text-amber-400",
    inactive: "bg-muted text-muted-foreground",
    blocked: "bg-red-500/20 text-red-400",
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap">{filtered.length} alunos</span>
      </div>

      {loadingData ? (
        <div className="text-center py-8 text-muted-foreground">Carregando...</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((p) => {
            const isOpen = expanded === p.id;
            return (
              <div key={p.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-foreground truncate">{p.name || "Sem nome"}</p>
                      <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${toneClasses[p.activityTone]}`}>
                        {p.isOnline && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                        {p.activityLabel}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{p.email}</p>
                    {isPrincipalAdmin && (
                      <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-muted-foreground">
                        <span>Último acesso: <strong className="text-foreground">{formatDateTime(p.lastSeenAt)}</strong></span>
                        <span>Tempo total: <strong className="text-foreground">{formatDuration(p.totalUsageSeconds)}</strong></span>
                        <span>Progresso: <strong className="text-foreground">{p.progressPercent}%</strong> ({p.completedLessons}/{p.totalLessons})</span>
                        <span>Dias ativos: <strong className="text-foreground">{p.activeDays}</strong></span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => togglePremium(p.id, p.premium_access)}
                      className={`flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                        p.premium_access ? "bg-amber-500/20 text-amber-400" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Star className="h-3 w-3" />
                      {p.premium_access ? "Premium" : "Básico"}
                    </button>
                    <button
                      onClick={() => toggleActive(p.id, p.is_active)}
                      className={`flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                        p.is_active ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {p.is_active ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      {p.is_active ? "Ativo" : "Inativo"}
                    </button>
                    {isPrincipalAdmin && (
                      <button
                        onClick={() => setExpanded(isOpen ? null : p.id)}
                        className="rounded-full p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        title="Ver detalhes de uso"
                      >
                        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    )}
                    <button
                      onClick={() => deleteStudent(p.id)}
                      className="rounded-full p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {isPrincipalAdmin && isOpen && (
                  <div className="mt-4 border-t border-border pt-4 space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="rounded-lg bg-muted/40 p-2">
                        <p className="text-muted-foreground">Módulos concluídos</p>
                        <p className="text-base font-bold text-foreground">{p.completedModules}</p>
                      </div>
                      <div className="rounded-lg bg-muted/40 p-2">
                        <p className="text-muted-foreground">Vídeos acessados</p>
                        <p className="text-base font-bold text-foreground flex items-center gap-1"><Video className="h-3 w-3" />{p.accessedVideos}</p>
                      </div>
                      <div className="rounded-lg bg-muted/40 p-2">
                        <p className="text-muted-foreground">PDFs acessados</p>
                        <p className="text-base font-bold text-foreground flex items-center gap-1"><FileText className="h-3 w-3" />{p.accessedPdfs}</p>
                      </div>
                      <div className="rounded-lg bg-muted/40 p-2">
                        <p className="text-muted-foreground">Tela atual</p>
                        <p className="text-xs font-mono text-foreground truncate">{p.currentPath || "—"}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2">Eventos recentes</p>
                      {p.recentEvents.length === 0 ? (
                        <p className="text-xs text-muted-foreground">Nenhuma atividade registrada ainda.</p>
                      ) : (
                        <ul className="space-y-1">
                          {p.recentEvents.map((ev) => (
                            <li key={ev.id} className="text-xs text-foreground flex items-center justify-between gap-2 border-b border-border/50 pb-1">
                              <span className="truncate">
                                <span className="text-muted-foreground">[{ev.event_type}]</span>{" "}
                                {ev.lesson_title || ev.module_title || ev.path || "—"}
                              </span>
                              <span className="text-muted-foreground whitespace-nowrap">{formatDateTime(ev.created_at)}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ==================== PENDING TAB ==================== */
interface AccessRequest {
  id: string;
  name: string;
  email: string;
  desired_password: string;
  status: string;
  created_at: string;
}

function PendingTab() {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const fetchRequests = async () => {
    setLoadingData(true);
    const { data } = await supabase
      .from("access_requests")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    setRequests((data as AccessRequest[]) || []);
    setLoadingData(false);
  };

  useEffect(() => { fetchRequests(); }, []);

  const approveRequest = async (req: AccessRequest) => {
    if (!confirm(`Aprovar acesso para ${req.name} (${req.email})?`)) return;
    try {
      await approveAccessRequest({
        data: {
          requestId: req.id,
          name: req.name,
          email: req.email,
          password: req.desired_password,
        },
      });
      alert(`✅ Usuário ${req.name} aprovado e conta criada com sucesso!`);
    } catch (err: any) {
      alert(`❌ Erro ao aprovar: ${err.message}`);
    }
    fetchRequests();
  };

  const rejectRequest = async (req: AccessRequest) => {
    if (!confirm(`Rejeitar solicitação de ${req.name}?`)) return;
    await supabase.from("access_requests").update({
      status: "rejected",
      reviewed_at: new Date().toISOString(),
    }).eq("id", req.id);
    fetchRequests();
  };

  return (
    <div>
      <h2 className="font-heading text-lg font-bold text-foreground mb-4">
        Alunos – Aguardando Aprovação
      </h2>

      {loadingData ? (
        <div className="text-center py-8 text-muted-foreground">Carregando...</div>
      ) : requests.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground">Nenhuma solicitação pendente.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground mb-2">{requests.length} solicitação(ões) pendente(s)</p>
          {requests.map((req) => (
            <div key={req.id} className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{req.name}</p>
                  <p className="text-xs text-muted-foreground">{req.email}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Senha desejada: <span className="font-mono bg-muted px-1.5 py-0.5 rounded">{req.desired_password}</span>
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Solicitado em: {new Date(req.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={() => approveRequest(req)} className="gap-1 bg-emerald-600 hover:bg-emerald-700">
                    <CheckCircle className="h-3.5 w-3.5" /> Aprovar
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => rejectRequest(req)} className="gap-1">
                    <XCircle className="h-3.5 w-3.5" /> Rejeitar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ==================== CONTENT TAB ==================== */
function ContentTab() {
  const [modules, setModules] = useState<ManagedModule[]>([]);
  const [lessons, setLessons] = useState<ManagedLesson[]>([]);
  const [expandedMod, setExpandedMod] = useState<string | null>(null);
  const [showModForm, setShowModForm] = useState(false);
  const [editMod, setEditMod] = useState<ManagedModule | null>(null);
  const [showLessonForm, setShowLessonForm] = useState<string | null>(null);
  const [editLesson, setEditLesson] = useState<ManagedLesson | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  const fetchAll = async () => {
    setLoadingData(true);
    const [mods, less] = await Promise.all([
      supabase.from("managed_modules").select("*").order("sort_order"),
      supabase.from("managed_lessons").select("*").order("sort_order"),
    ]);
    setModules((mods.data as ManagedModule[]) || []);
    setLessons((less.data as ManagedLesson[]) || []);
    setLoadingData(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const deleteMod = async (id: string) => {
    if (!confirm("Excluir módulo e todas as aulas?")) return;
    await supabase.from("managed_modules").delete().eq("id", id);
    fetchAll();
  };

  const deleteLesson = async (id: string) => {
    if (!confirm("Excluir esta aula?")) return;
    await supabase.from("managed_lessons").delete().eq("id", id);
    fetchAll();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-lg font-bold text-foreground">Módulos & Aulas</h2>
        <Button size="sm" onClick={() => { setEditMod(null); setShowModForm(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Novo Módulo
        </Button>
      </div>

      <Dialog open={showModForm} onOpenChange={(o) => { if (!o) { setShowModForm(false); setEditMod(null); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editMod ? "Editar Módulo" : "Novo Módulo"}</DialogTitle>
          </DialogHeader>
          <ModuleForm
            initial={editMod}
            nextOrder={modules.length}
            onClose={() => { setShowModForm(false); setEditMod(null); }}
            onSaved={fetchAll}
          />
        </DialogContent>
      </Dialog>

      {loadingData ? (
        <div className="text-center py-8 text-muted-foreground">Carregando...</div>
      ) : modules.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground">Nenhum módulo cadastrado.</p>
      ) : (
        <div className="space-y-2">
          {modules.map((mod) => {
            const modLessons = lessons.filter((l) => l.module_id === mod.id);
            const isOpen = expandedMod === mod.id;
            return (
              <div key={mod.id} className="rounded-xl border border-border bg-card overflow-hidden">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-primary/5 transition-colors"
                  onClick={() => setExpandedMod(isOpen ? null : mod.id)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <GraduationCap className="h-5 w-5 text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate">{mod.title}</p>
                      <p className="text-xs text-muted-foreground">{modLessons.length} aulas • Libera em {mod.days_to_unlock} dias</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditMod(mod); setShowModForm(true); }}
                      className="p-1.5 rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteMod(mod.id); }}
                      className="p-1.5 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t border-border p-4 bg-background/50">
                    {showLessonForm === mod.id && (
                      <LessonForm
                        moduleId={mod.id}
                        initial={editLesson}
                        nextOrder={modLessons.length}
                        onClose={() => { setShowLessonForm(null); setEditLesson(null); }}
                        onSaved={fetchAll}
                      />
                    )}
                    <div className="space-y-1.5">
                      {modLessons.map((les) => (
                        <div key={les.id} className="flex items-center justify-between rounded-lg bg-card border border-border/50 px-3 py-2">
                          <div className="flex items-center gap-2 min-w-0">
                            {les.type === "video" ? <Video className="h-4 w-4 text-primary shrink-0" /> : <FileText className="h-4 w-4 text-primary shrink-0" />}
                            <span className="text-sm text-foreground truncate">{les.title}</span>
                            <span className="text-[10px] uppercase text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{les.type}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => { setEditLesson(les); setShowLessonForm(mod.id); }}
                              className="p-1 rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => deleteLesson(les.id)}
                              className="p-1 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-3 w-full"
                      onClick={() => { setEditLesson(null); setShowLessonForm(mod.id); }}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Adicionar Aula
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* Module form */
function ModuleForm({ initial, nextOrder, onClose, onSaved }: {
  initial: ManagedModule | null;
  nextOrder: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [imageUrl, setImageUrl] = useState(initial?.image_url || "");
  const [daysToUnlock, setDaysToUnlock] = useState(initial?.days_to_unlock?.toString() || "0");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!title.trim()) return;
    setSaving(true);
    if (initial) {
      await supabase.from("managed_modules").update({
        title: title.trim(),
        description: description.trim(),
        image_url: imageUrl.trim() || null,
        days_to_unlock: parseInt(daysToUnlock) || 0,
      }).eq("id", initial.id);
    } else {
      await supabase.from("managed_modules").insert({
        title: title.trim(),
        description: description.trim(),
        image_url: imageUrl.trim() || null,
        sort_order: nextOrder,
        days_to_unlock: parseInt(daysToUnlock) || 0,
      });
    }
    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Título do módulo</label>
        <Input placeholder="Ex: Módulo 5 — Anatomia" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Descrição</label>
        <Textarea placeholder="Descrição do módulo" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">URL da imagem (capa)</label>
        <Input placeholder="https://..." value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Liberar após X dias da compra</label>
        <Input type="number" min="0" value={daysToUnlock} onChange={(e) => setDaysToUnlock(e.target.value)} />
        <p className="text-[11px] text-muted-foreground">
          0 = liberado imediatamente. Ex: 7 = libera 7 dias após a data da compra do aluno.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <Button size="sm" variant="outline" type="button" onClick={() => setDaysToUnlock("0")}>
            Liberar agora
          </Button>
          <Button size="sm" variant="outline" type="button" onClick={() => setDaysToUnlock("7")}>
            7 dias
          </Button>
          <Button size="sm" variant="outline" type="button" onClick={() => setDaysToUnlock("14")}>
            14 dias
          </Button>
          <Button size="sm" variant="outline" type="button" onClick={() => setDaysToUnlock("30")}>
            30 dias
          </Button>
          <Button size="sm" variant="outline" type="button" onClick={() => setDaysToUnlock("9999")}>
            Bloquear
          </Button>
        </div>
      </div>
      <DialogFooter className="gap-2 sm:gap-2">
        <Button size="sm" variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
        <Button size="sm" onClick={save} disabled={saving || !title.trim()}>
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </DialogFooter>
    </div>
  );
}

/* Lesson form */
function LessonForm({ moduleId, initial, nextOrder, onClose, onSaved }: {
  moduleId: string;
  initial: ManagedLesson | null;
  nextOrder: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(initial?.title || "");
  const [type, setType] = useState(initial?.type || "video");
  const [contentUrl, setContentUrl] = useState(initial?.content_url || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!title.trim()) return;
    setSaving(true);
    if (initial) {
      await supabase.from("managed_lessons").update({
        title: title.trim(),
        type,
        content_url: contentUrl.trim() || null,
        description: description.trim(),
      }).eq("id", initial.id);
    } else {
      await supabase.from("managed_lessons").insert({
        module_id: moduleId,
        title: title.trim(),
        type,
        content_url: contentUrl.trim() || null,
        description: description.trim(),
        sort_order: nextOrder,
      });
    }
    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <div className="rounded-xl border border-primary/30 bg-card p-4 mb-3 space-y-3">
      <h3 className="font-semibold text-foreground text-sm">{initial ? "Editar Aula" : "Nova Aula"}</h3>
      <Input placeholder="Título da aula" value={title} onChange={(e) => setTitle(e.target.value)} />
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
      >
        <option value="video">Vídeo (link)</option>
        <option value="pdf">PDF (link)</option>
        <option value="audio">Áudio</option>
        <option value="info">Informativo</option>
      </select>
      <Input
        placeholder={type === "video" ? "Link do vídeo (YouTube, Vimeo...)" : type === "pdf" ? "Link do PDF" : "URL do conteúdo"}
        value={contentUrl}
        onChange={(e) => setContentUrl(e.target.value)}
      />
      <Textarea placeholder="Descrição da aula (opcional)" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
      <div className="flex gap-2">
        <Button size="sm" onClick={save} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
        <Button size="sm" variant="outline" onClick={onClose}>Cancelar</Button>
      </div>
    </div>
  );
}

/* ==================== COURSES TAB ==================== */
function CoursesTab() {
  const [courses, setCourses] = useState<ManagedCourse[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<ManagedCourse | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  const fetchCourses = async () => {
    setLoadingData(true);
    const { data } = await supabase.from("managed_courses").select("*").order("sort_order");
    setCourses((data as ManagedCourse[]) || []);
    setLoadingData(false);
  };

  useEffect(() => { fetchCourses(); }, []);

  const deleteCourse = async (id: string) => {
    if (!confirm("Excluir este curso?")) return;
    await supabase.from("managed_courses").delete().eq("id", id);
    fetchCourses();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-lg font-bold text-foreground">Nossos Cursos</h2>
        <Button size="sm" onClick={() => { setEditItem(null); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Novo Curso
        </Button>
      </div>

      {showForm && (
        <CourseForm
          initial={editItem}
          nextOrder={courses.length}
          onClose={() => { setShowForm(false); setEditItem(null); }}
          onSaved={fetchCourses}
        />
      )}

      {loadingData ? (
        <div className="text-center py-8 text-muted-foreground">Carregando...</div>
      ) : courses.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground">Nenhum curso cadastrado.</p>
      ) : (
        <div className="space-y-2">
          {courses.map((c) => (
            <div key={c.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-foreground">{c.title}</p>
                    {c.badge && (
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        c.available ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                      }`}>{c.badge}</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{c.description}</p>
                  {c.purchase_link && <p className="text-[10px] text-primary mt-1 truncate">{c.purchase_link}</p>}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => { setEditItem(c); setShowForm(true); }} className="p-1.5 rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button onClick={() => deleteCourse(c.id)} className="p-1.5 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* Course form */
function CourseForm({ initial, nextOrder, onClose, onSaved }: {
  initial: ManagedCourse | null;
  nextOrder: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [badge, setBadge] = useState(initial?.badge || "");
  const [purchaseLink, setPurchaseLink] = useState(initial?.purchase_link || "");
  const [available, setAvailable] = useState(initial?.available ?? false);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!title.trim()) return;
    setSaving(true);
    const payload = {
      title: title.trim(),
      description: description.trim(),
      badge: badge.trim() || null,
      purchase_link: purchaseLink.trim() || null,
      available,
    };
    if (initial) {
      await supabase.from("managed_courses").update(payload).eq("id", initial.id);
    } else {
      await supabase.from("managed_courses").insert({ ...payload, sort_order: nextOrder });
    }
    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <div className="rounded-xl border border-primary/30 bg-card p-4 mb-4 space-y-3">
      <h3 className="font-semibold text-foreground">{initial ? "Editar Curso" : "Novo Curso"}</h3>
      <Input placeholder="Título do curso" value={title} onChange={(e) => setTitle(e.target.value)} />
      <Textarea placeholder="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
      <Input placeholder="Badge (ex: Ativo, Em breve)" value={badge} onChange={(e) => setBadge(e.target.value)} />
      <Input placeholder="Link de compra (opcional)" value={purchaseLink} onChange={(e) => setPurchaseLink(e.target.value)} />
      <label className="flex items-center gap-2 text-sm text-foreground">
        <input type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)} className="rounded" />
        Disponível para alunos
      </label>
      <div className="flex gap-2">
        <Button size="sm" onClick={save} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
        <Button size="sm" variant="outline" onClick={onClose}>Cancelar</Button>
      </div>
    </div>
  );
}

/* ==================== HOME LAYOUT TAB ==================== */
import { useHomeSections, persistSectionOrder, SECTION_LABELS, type HomeSection } from "@/hooks/use-home-sections";

function HomeLayoutTab() {
  const { sections, loading, reload } = useHomeSections();
  const [items, setItems] = useState<HomeSection[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setItems(sections);
  }, [sections]);

  const move = (idx: number, dir: -1 | 1) => {
    const next = [...items];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    setItems(next);
  };

  const toggleVisible = (idx: number) => {
    const next = [...items];
    next[idx] = { ...next[idx], visible: !next[idx].visible };
    setItems(next);
  };

  const save = async () => {
    setSaving(true);
    try {
      await persistSectionOrder(items);
      toast.success("Layout salvo! Os alunos verão a nova ordem.");
      reload();
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-sm text-muted-foreground">Carregando...</p>;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-foreground">Organizar Tela Inicial</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Reordene as seções da home usando as setas. Clique no olho para mostrar/esconder.
        </p>
      </div>

      <div className="space-y-2">
        {items.map((s, idx) => (
          <div
            key={s.section_key}
            className={`flex items-center gap-3 rounded-xl border border-border bg-card p-3 ${
              !s.visible ? "opacity-50" : ""
            }`}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
              {idx + 1}
            </span>
            <div className="flex-1">
              <p className="font-medium text-foreground">{SECTION_LABELS[s.section_key] ?? s.section_key}</p>
              <p className="text-xs text-muted-foreground">{s.section_key}</p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => toggleVisible(idx)} title={s.visible ? "Esconder" : "Mostrar"}>
              {s.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
            <Button size="sm" variant="outline" onClick={() => move(idx, -1)} disabled={idx === 0}>
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => move(idx, 1)} disabled={idx === items.length - 1}>
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <Button onClick={save} disabled={saving} className="w-full sm:w-auto">
        {saving ? "Salvando..." : "Salvar nova ordem"}
      </Button>
    </div>
  );
}

/* ==================== STUDENT NOTES TAB ==================== */
interface AdminNote {
  id: string;
  user_id: string;
  lesson_id: string;
  content: string;
  updated_at: string;
  profile?: { name: string; email: string | null };
  lesson?: { title: string; module_title: string | null };
}

function StudentNotesTab() {
  const [notes, setNotes] = useState<AdminNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStudent, setFilterStudent] = useState("");
  const [filterLesson, setFilterLesson] = useState("");
  const [filterDate, setFilterDate] = useState("");

  const load = async () => {
    setLoading(true);
    const { data: rawNotes } = await supabase
      .from("lesson_notes")
      .select("id, user_id, lesson_id, content, updated_at")
      .order("updated_at", { ascending: false })
      .limit(500);

    if (!rawNotes || rawNotes.length === 0) {
      setNotes([]);
      setLoading(false);
      return;
    }

    const userIds = Array.from(new Set(rawNotes.map((n) => n.user_id)));
    const lessonIds = Array.from(new Set(rawNotes.map((n) => n.lesson_id).filter(Boolean)));

    const [{ data: profiles }, { data: lessons }] = await Promise.all([
      supabase.from("profiles").select("id, name, email").in("id", userIds),
      lessonIds.length > 0
        ? supabase
            .from("managed_lessons")
            .select("id, title, module_id")
            .in("id", lessonIds.filter((id) => /^[0-9a-f-]{36}$/i.test(id)))
        : Promise.resolve({ data: [] as any[] }),
    ]);

    const moduleIds = Array.from(new Set((lessons ?? []).map((l: any) => l.module_id)));
    const { data: modules } = moduleIds.length
      ? await supabase.from("managed_modules").select("id, title").in("id", moduleIds)
      : { data: [] as any[] };

    const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));
    const moduleMap = new Map((modules ?? []).map((m: any) => [m.id, m.title]));
    const lessonMap = new Map(
      (lessons ?? []).map((l: any) => [l.id, { title: l.title, module_title: moduleMap.get(l.module_id) ?? null }]),
    );

    setNotes(
      rawNotes.map((n) => ({
        ...n,
        profile: profileMap.get(n.user_id) as any,
        lesson: lessonMap.get(n.lesson_id) as any,
      })),
    );
    setLoading(false);
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel("admin_lesson_notes")
      .on("postgres_changes", { event: "*", schema: "public", table: "lesson_notes" }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  const filtered = notes.filter((n) => {
    if (filterStudent) {
      const q = filterStudent.toLowerCase();
      const name = (n.profile?.name ?? "").toLowerCase();
      const email = (n.profile?.email ?? "").toLowerCase();
      if (!name.includes(q) && !email.includes(q)) return false;
    }
    if (filterLesson) {
      const q = filterLesson.toLowerCase();
      const lt = (n.lesson?.title ?? "").toLowerCase();
      const mt = (n.lesson?.module_title ?? "").toLowerCase();
      if (!lt.includes(q) && !mt.includes(q) && !n.lesson_id.toLowerCase().includes(q)) return false;
    }
    if (filterDate) {
      if (!n.updated_at.startsWith(filterDate)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-foreground">Anotações dos Alunos</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Visualização administrativa — atualizada em tempo real. {filtered.length} anotação(ões).
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <Input
          placeholder="Filtrar por aluno (nome ou email)"
          value={filterStudent}
          onChange={(e) => setFilterStudent(e.target.value)}
        />
        <Input
          placeholder="Filtrar por módulo ou aula"
          value={filterLesson}
          onChange={(e) => setFilterLesson(e.target.value)}
        />
        <Input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando anotações...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma anotação encontrada.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => (
            <div key={n.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                <div>
                  <p className="font-semibold text-foreground">{n.profile?.name || "Aluno"}</p>
                  <p className="text-xs text-muted-foreground">{n.profile?.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    {new Date(n.updated_at).toLocaleString("pt-BR")}
                  </p>
                  {n.lesson?.module_title && (
                    <p className="text-xs text-primary mt-1">
                      {n.lesson.module_title} • {n.lesson?.title}
                    </p>
                  )}
                  {!n.lesson?.title && (
                    <p className="text-xs text-muted-foreground mt-1">Aula: {n.lesson_id}</p>
                  )}
                </div>
              </div>
              <p className="whitespace-pre-wrap text-sm text-foreground/90 border-t border-border pt-3">
                {n.content || <span className="italic text-muted-foreground">(vazia)</span>}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
