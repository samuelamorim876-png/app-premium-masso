import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { sendAccessRequestPush } from "@/server/push-notifications.functions";
import { CheckCircle } from "lucide-react";

function createRequestId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
    (Number(c) ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (Number(c) / 4)))).toString(16)
  );
}

export function AccessRequestForm({ onBack }: { onBack: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Preencha todos os campos.");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }
    setSubmitting(true);
    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const requestId = createRequestId();
    const { error: dbError } = await supabase
      .from("access_requests")
      .insert({
        id: requestId,
        name: cleanName,
        email: cleanEmail,
        desired_password: password,
      });
    setSubmitting(false);
    if (dbError) {
      setError("Erro ao enviar solicitação. Tente novamente.");
      return;
    }
    sendAccessRequestPush({ data: { requestId, name: cleanName, email: cleanEmail } }).catch((err) => {
      console.error("Erro ao enviar notificação push:", err);
    });
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20">
          <CheckCircle className="h-7 w-7 text-emerald-400" />
        </div>
        <h2 className="font-heading text-xl font-bold text-foreground">Solicitação enviada!</h2>
        <p className="text-sm text-muted-foreground">
          Sua solicitação de acesso foi enviada com sucesso. Você receberá acesso após aprovação do administrador.
        </p>
        <Button variant="outline" onClick={onBack} className="mt-4">
          Voltar ao Login
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-heading text-2xl font-bold text-foreground mb-2">Solicitar Acesso</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Preencha seus dados para solicitar acesso ao aplicativo.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="req-name">Nome completo</Label>
          <Input id="req-name" placeholder="Seu nome completo" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="req-email">E-mail</Label>
          <Input id="req-email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="req-password">Senha desejada</Label>
          <Input id="req-password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" size="lg" disabled={submitting}>
          {submitting ? "Enviando..." : "Enviar solicitação de acesso"}
        </Button>
        <div className="flex justify-center text-sm">
          <button type="button" onClick={onBack} className="text-primary hover:underline">
            Voltar ao Login
          </button>
        </div>
      </form>
    </div>
  );
}
