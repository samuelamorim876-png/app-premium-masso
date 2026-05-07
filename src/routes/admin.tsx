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
} from "lucide-react";
import { usePushSubscription } from "@/hooks/use-push-subscription";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Painel Administrativo — Massoterapia" }] }),
  component: AdminPage,
});

type Tab = "students" | "pending" | "content" | "courses";

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

function AdminDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("students");

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "students", label: "Alunos", icon: <Users className="h-4 w-4" /> },
    { key: "pending", label: "Aguardando Aprovação", icon: <Clock className="h-4 w-4" /> },
    { key: "content", label: "Conteúdos", icon: <BookOpen className="h-4 w-4" /> },
    { key: "courses", label: "Cursos", icon: <ShoppingBag className="h-4 w-4" /> },
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
          <div className="ml-auto">
            <ClientOnly fallback={null}>
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
        {tab === "content" && <ContentTab />}
        {tab === "courses" && <CoursesTab />}
      </main>
    </div>
  );
}

/* ==================== STUDENTS TAB ==================== */
function StudentsTab() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");
  const [loadingData, setLoadingData] = useState(true);

  const fetchProfiles = async () => {
    setLoadingData(true);
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    setProfiles((data as Profile[]) || []);
    setLoadingData(false);
  };

  useEffect(() => { fetchProfiles(); }, []);

  const togglePremium = async (id: string, current: boolean) => {
    await supabase.from("profiles").update({ premium_access: !current }).eq("id", id);
    fetchProfiles();
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from("profiles").update({ is_active: !current }).eq("id", id);
    fetchProfiles();
  };

  const deleteStudent = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este aluno? Isso removerá o acesso completamente.")) return;
    try {
      await deleteAuthUser({ data: { userId: id } });
      alert("✅ Aluno excluído com sucesso.");
    } catch (err: any) {
      alert(`❌ Erro ao excluir: ${err.message}`);
    }
    fetchProfiles();
  };

  const filtered = profiles.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.email || "").toLowerCase().includes(search.toLowerCase())
  );

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
          {filtered.map((p) => (
            <div key={p.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <p className="font-semibold text-foreground truncate">{p.name || "Sem nome"}</p>
                  <p className="text-xs text-muted-foreground truncate">{p.email}</p>
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
                  <button
                    onClick={() => deleteStudent(p.id)}
                    className="rounded-full p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
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

      {showModForm && (
        <ModuleForm
          initial={editMod}
          nextOrder={modules.length}
          onClose={() => { setShowModForm(false); setEditMod(null); }}
          onSaved={fetchAll}
        />
      )}

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
    <div className="rounded-xl border border-primary/30 bg-card p-4 mb-4 space-y-3">
      <h3 className="font-semibold text-foreground">{initial ? "Editar Módulo" : "Novo Módulo"}</h3>
      <Input placeholder="Título do módulo" value={title} onChange={(e) => setTitle(e.target.value)} />
      <Textarea placeholder="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
      <Input placeholder="URL da imagem (opcional)" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
      <Input placeholder="Dias para liberar" type="number" value={daysToUnlock} onChange={(e) => setDaysToUnlock(e.target.value)} />
      <div className="flex gap-2">
        <Button size="sm" onClick={save} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
        <Button size="sm" variant="outline" onClick={onClose}>Cancelar</Button>
      </div>
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
            <div key={c.id} className="rounded-xl border border-border bg-card p-4 flex items-center justify-between gap-3">
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
