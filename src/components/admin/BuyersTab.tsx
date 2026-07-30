import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ShieldCheck,
  ShieldAlert,
  Trash2,
  Plus,
  Upload,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Lock,
  Unlock,
} from "lucide-react";
import { toast } from "sonner";
import { deleteAuthUser } from "@/lib/delete-user.functions";

interface Buyer {
  id: string;
  email: string;
  name: string | null;
  source: string | null;
  notes: string | null;
  created_at: string;
}

interface ProfileLite {
  id: string;
  name: string;
  email: string | null;
  is_active: boolean;
  created_at: string;
}

export function BuyersTab() {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [profiles, setProfiles] = useState<ProfileLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [autoBlock, setAutoBlock] = useState(false);

  // Add form
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newSource, setNewSource] = useState("");

  // Bulk import
  const [bulk, setBulk] = useState("");
  const [importing, setImporting] = useState(false);

  const load = async () => {
    setLoading(true);
    const [buyersRes, profilesRes, settingsRes] = await Promise.all([
      supabase.from("official_buyers").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("id,name,email,is_active,created_at").order("created_at", { ascending: false }),
      supabase.from("verification_settings").select("auto_block_unverified").eq("id", 1).maybeSingle(),
    ]);
    setBuyers((buyersRes.data as Buyer[]) || []);
    setProfiles((profilesRes.data as ProfileLite[]) || []);
    setAutoBlock(!!settingsRes.data?.auto_block_unverified);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const buyersSet = useMemo(
    () => new Set(buyers.map((b) => b.email.toLowerCase().trim())),
    [buyers]
  );

  const enriched = useMemo(() => {
    return profiles.map((p) => {
      const email = (p.email || "").toLowerCase().trim();
      const verified = email && buyersSet.has(email);
      let status: "verified" | "unverified" | "blocked" = "unverified";
      if (!p.is_active) status = "blocked";
      else if (verified) status = "verified";
      return { ...p, status };
    });
  }, [profiles, buyersSet]);

  const unverified = enriched.filter((p) => p.status === "unverified");

  const filteredBuyers = buyers.filter(
    (b) =>
      b.email.toLowerCase().includes(search.toLowerCase()) ||
      (b.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const addBuyer = async () => {
    const email = newEmail.trim().toLowerCase();
    if (!email) return toast.error("Informe um e-mail");
    const { error } = await supabase.from("official_buyers").insert({
      email,
      name: newName.trim() || null,
      source: newSource.trim() || null,
    });
    if (error) return toast.error(error.message);
    toast.success("Comprador adicionado");
    setNewEmail("");
    setNewName("");
    setNewSource("");
    load();
  };

  const removeBuyer = async (id: string) => {
    if (!confirm("Remover este comprador da lista oficial?")) return;
    const { error } = await supabase.from("official_buyers").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Removido");
    load();
  };

  const importBulk = async () => {
    const lines = bulk
      .split(/[\n,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    const emails = Array.from(
      new Set(lines.map((l) => l.toLowerCase()).filter((e) => /.+@.+\..+/.test(e)))
    );
    if (emails.length === 0) return toast.error("Nenhum e-mail válido");
    setImporting(true);
    const rows = emails.map((email) => ({ email, source: "import" }));
    const { error } = await supabase
      .from("official_buyers")
      .upsert(rows, { onConflict: "email", ignoreDuplicates: true });
    setImporting(false);
    if (error) return toast.error(error.message);
    toast.success(`${emails.length} e-mails importados`);
    setBulk("");
    load();
  };

  const toggleAutoBlock = async () => {
    const next = !autoBlock;
    const { error } = await supabase
      .from("verification_settings")
      .update({ auto_block_unverified: next, updated_at: new Date().toISOString() })
      .eq("id", 1);
    if (error) return toast.error(error.message);
    setAutoBlock(next);
    toast.success(next ? "Bloqueio automático ativado" : "Bloqueio automático desativado");
  };

  const blockProfile = async (id: string, active: boolean) => {
    await supabase.from("profiles").update({ is_active: !active }).eq("id", id);
    load();
  };

  const deleteProfile = async (id: string) => {
    if (!confirm("Excluir este usuário definitivamente?")) return;
    try {
      await deleteAuthUser({ data: { userId: id } });
      toast.success("Usuário excluído");
    } catch (e: any) {
      toast.error(e.message || "Erro ao excluir");
    }
    load();
  };

  const approveAsBuyer = async (email: string | null, name: string | null) => {
    if (!email) return;
    const { error } = await supabase.from("official_buyers").upsert(
      { email: email.toLowerCase().trim(), name, source: "manual_approval" },
      { onConflict: "email", ignoreDuplicates: false }
    );
    if (error) return toast.error(error.message);
    toast.success("Marcado como verificado");
    load();
  };

  if (loading) return <div className="text-muted-foreground">Carregando...</div>;

  return (
    <div className="space-y-8">
      {/* Info banner */}
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
        <p className="font-semibold text-foreground flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Verificação de compradores
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Todos os usuários recebem acesso imediato ao solicitar. Os e-mails que <strong>não estiverem</strong> na lista oficial abaixo aparecem destacados como <strong>“não verificados”</strong>. Use os botões para bloquear, remover ou manter cada conta manualmente — nada é bloqueado automaticamente.
        </p>
      </div>

      {/* Alerts */}
      <section>
        <h3 className="font-heading text-lg font-bold text-foreground mb-3 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-400" />
          Usuários não verificados ({unverified.length})
        </h3>
        {unverified.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
            Todos os usuários ativos correspondem à lista oficial.
          </div>
        ) : (
          <div className="space-y-2">
            {unverified.map((p) => (
              <div key={p.id} className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 flex items-center justify-between gap-3 flex-wrap">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground truncate">{p.name || "Sem nome"}</p>
                  <p className="text-xs text-muted-foreground truncate">{p.email}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Cadastrado em {new Date(p.created_at).toLocaleString("pt-BR")}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button size="sm" variant="outline" onClick={() => approveAsBuyer(p.email, p.name)}>
                    <CheckCircle className="h-4 w-4 mr-1" /> Marcar verificado
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => blockProfile(p.id, p.is_active)}>
                    <XCircle className="h-4 w-4 mr-1" /> Bloquear
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => deleteProfile(p.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Add buyer */}
      <section className="rounded-xl border border-border bg-card p-4">
        <h3 className="font-heading text-base font-bold text-foreground mb-3 flex items-center gap-2">
          <Plus className="h-4 w-4" /> Adicionar comprador oficial
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <Label>E-mail</Label>
            <Input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="email@cliente.com" />
          </div>
          <div>
            <Label>Nome (opcional)</Label>
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nome do comprador" />
          </div>
          <div>
            <Label>Origem (opcional)</Label>
            <Input value={newSource} onChange={(e) => setNewSource(e.target.value)} placeholder="Hotmart, Stripe..." />
          </div>
        </div>
        <Button className="mt-3" onClick={addBuyer}>
          <Plus className="h-4 w-4 mr-2" /> Adicionar
        </Button>
      </section>

      {/* Bulk import */}
      <section className="rounded-xl border border-border bg-card p-4">
        <h3 className="font-heading text-base font-bold text-foreground mb-3 flex items-center gap-2">
          <Upload className="h-4 w-4" /> Importar lista (cole e-mails separados por vírgula ou linha)
        </h3>
        <Textarea
          value={bulk}
          onChange={(e) => setBulk(e.target.value)}
          rows={5}
          placeholder="email1@cliente.com&#10;email2@cliente.com&#10;email3@cliente.com"
        />
        <Button className="mt-3" onClick={importBulk} disabled={importing}>
          <Upload className="h-4 w-4 mr-2" /> {importing ? "Importando..." : "Importar"}
        </Button>
      </section>

      {/* Buyers list */}
      <section>
        <div className="flex items-center gap-3 mb-3">
          <h3 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Compradores oficiais ({buyers.length})
          </h3>
          <div className="relative ml-auto w-64 max-w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="pl-10"
            />
          </div>
        </div>
        <div className="space-y-2">
          {filteredBuyers.map((b) => {
            const hasProfile = profiles.some((p) => (p.email || "").toLowerCase() === b.email.toLowerCase());
            return (
              <div key={b.id} className="rounded-xl border border-border bg-card p-3 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground truncate">{b.name || b.email}</p>
                  <p className="text-xs text-muted-foreground truncate">{b.email}</p>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                    {b.source && <span className="rounded bg-muted px-1.5 py-0.5">{b.source}</span>}
                    {hasProfile ? (
                      <span className="rounded bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5">conta ativa</span>
                    ) : (
                      <span className="rounded bg-muted px-1.5 py-0.5">sem cadastro</span>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeBuyer(b.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            );
          })}
          {filteredBuyers.length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-6">Nenhum comprador na lista.</div>
          )}
        </div>
      </section>
    </div>
  );
}
