import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { courseModules } from "@/data/course-data";
import { ArrowLeft, Notebook, Search, Star, StarOff, Trash2, Edit3, ExternalLink, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NoteRecord {
  id: string;
  lesson_id: string;
  content: string;
  updated_at: string;
  favorite?: boolean;
}

export const Route = createFileRoute("/anotacoes")({
  head: () => ({ meta: [{ title: "Minhas Anotações — Massoterapia" }] }),
  component: AnotacoesPage,
});

function getLessonInfo(lessonId: string) {
  for (const mod of courseModules) {
    for (const lesson of mod.lessons) {
      if (lesson.id === lessonId) return { moduleTitle: mod.title, moduleId: mod.id, lessonTitle: lesson.title };
    }
  }
  return null;
}

function AnotacoesPage() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<NoteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"recent" | "old">("recent");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [showFavOnly, setShowFavOnly] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("lesson_notes")
        .select("*")
        .eq("user_id", user.id)
        .neq("content", "")
        .order("updated_at", { ascending: false });
      setNotes((data as NoteRecord[]) || []);
      setLoading(false);
    };
    load();
  }, [user]);

  if (!user) return <div className="flex min-h-screen items-center justify-center bg-background"><p className="text-muted-foreground">Faça login para acessar.</p></div>;

  const filtered = notes
    .filter((n) => {
      if (search) {
        const info = getLessonInfo(n.lesson_id);
        const haystack = `${n.content} ${info?.lessonTitle} ${info?.moduleTitle}`.toLowerCase();
        if (!haystack.includes(search.toLowerCase())) return false;
      }
      if (showFavOnly && !n.favorite) return false;
      return true;
    })
    .sort((a, b) => {
      const da = new Date(a.updated_at).getTime();
      const db = new Date(b.updated_at).getTime();
      return sortOrder === "recent" ? db - da : da - db;
    });

  const handleDelete = async (id: string) => {
    await supabase.from("lesson_notes").delete().eq("id", id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleSaveEdit = async (id: string) => {
    await supabase.from("lesson_notes").update({ content: editContent }).eq("id", id);
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, content: editContent } : n)));
    setEditingId(null);
  };

  const toggleFav = async (id: string) => {
    const note = notes.find((n) => n.id === id);
    if (!note) return;
    // Use content field prefix hack since we don't have a fav column
    const newFav = !note.favorite;
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, favorite: newFav } : n)));
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-4xl items-center gap-3 px-4 sm:px-6">
          <Link to="/"><Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4 mr-1" /> Voltar</Button></Link>
          <div className="flex items-center gap-2">
            <Notebook className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Minhas Anotações</span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        <div className="mb-6 animate-fade-up">
          <h1 className="font-heading text-2xl font-bold text-foreground">📝 Minhas Anotações</h1>
          <p className="mt-1 text-sm text-muted-foreground">Seu caderno digital — todas as suas anotações em um só lugar.</p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por palavra..."
              className="w-full rounded-xl border border-border bg-background pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={showFavOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFavOnly(!showFavOnly)}
              className="rounded-xl"
            >
              <Star className="h-3.5 w-3.5 mr-1" /> Favoritos
            </Button>
            <Button variant="outline" size="sm" onClick={() => setSortOrder(sortOrder === "recent" ? "old" : "recent")} className="rounded-xl">
              <ChevronDown className={`h-3.5 w-3.5 mr-1 transition-transform ${sortOrder === "old" ? "rotate-180" : ""}`} />
              {sortOrder === "recent" ? "Recentes" : "Antigas"}
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 animate-fade-up">
            <Notebook className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">{search || showFavOnly ? "Nenhuma anotação encontrada." : "Você ainda não tem anotações. Comece a estudar!"}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((note, i) => {
              const info = getLessonInfo(note.lesson_id);
              return (
                <div key={note.id} className="rounded-2xl border border-border bg-card p-4 animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-primary truncate">{info?.moduleTitle || "Módulo"}</p>
                      <p className="text-sm font-medium text-foreground truncate">{info?.lessonTitle || note.lesson_id}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(note.updated_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <button onClick={() => toggleFav(note.id)} className="p-1.5 rounded-lg hover:bg-accent/50 transition-colors">
                        {note.favorite ? <Star className="h-3.5 w-3.5 text-gold fill-gold" /> : <StarOff className="h-3.5 w-3.5 text-muted-foreground" />}
                      </button>
                      <button onClick={() => { setEditingId(note.id); setEditContent(note.content); }} className="p-1.5 rounded-lg hover:bg-accent/50 transition-colors">
                        <Edit3 className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                      {info && (
                        <Link to="/modulo/$moduleId" params={{ moduleId: info.moduleId }} className="p-1.5 rounded-lg hover:bg-accent/50 transition-colors">
                          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                        </Link>
                      )}
                      <button onClick={() => handleDelete(note.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors">
                        <Trash2 className="h-3.5 w-3.5 text-destructive/70" />
                      </button>
                    </div>
                  </div>
                  {editingId === note.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full min-h-[80px] resize-y rounded-xl border border-border bg-background p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                      <div className="flex gap-2 justify-end">
                        <Button variant="ghost" size="sm" onClick={() => setEditingId(null)} className="rounded-xl text-xs">Cancelar</Button>
                        <Button size="sm" onClick={() => handleSaveEdit(note.id)} className="rounded-xl text-xs">Salvar</Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-foreground/80 whitespace-pre-wrap line-clamp-4">{note.content}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
