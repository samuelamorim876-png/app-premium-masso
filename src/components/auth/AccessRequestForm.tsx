import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitAccessRequestAndNotify } from "@/lib/access-request.functions";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle } from "lucide-react";

export function AccessRequestForm({ onBack }: { onBack: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const submitAccessRequest = useServerFn(submitAccessRequestAndNotify);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // Catch-all: garante que NADA possa subir até o ErrorBoundary global
    try {
      await doSubmit();
    } catch (err) {
      console.error("[access-request] erro capturado no boundary local:", err);
      setSubmitting(false);
      setError("Não foi possível enviar agora. Tente novamente em instantes.");
    }
  };

  const doSubmit = async () => {
    if (submitting) return; // prevent double-submit
    setError("");
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Preencha todos os campos.");
      return;
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!emailOk) {
      setError("Informe um e-mail válido.");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }
    setSubmitting(true);
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    // Salvar solicitação no backend — leve, com timeout e retry local
    const callWithTimeout = async () => {
      return await Promise.race([
        submitAccessRequest({ data: { name: cleanName, email: cleanEmail, password } }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("timeout")), 15000)
        ),
      ]);
    };

    let result: any = null;
    let lastErr: any = null;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        result = await callWithTimeout();
        break;
      } catch (err) {
        lastErr = err;
        console.warn(`[access-request] tentativa ${attempt} falhou`, err);
        if (attempt < 2) await new Promise((r) => setTimeout(r, 600));
      }
    }

    if (!result) {
      console.error("[access-request] Falha definitiva:", lastErr);
      setSubmitting(false);
      setError("Falha de conexão. Verifique sua internet e tente novamente.");
      return;
    }

    if (!result.ok) {
      setSubmitting(false);
      const reason = result.reason ?? "";
      if (reason === "insert_failed") {
        setError("Não foi possível salvar sua solicitação agora. Tente novamente em instantes.");
      } else if (reason === "unexpected") {
        setError("Servidor temporariamente ocupado. Tente novamente em instantes.");
      } else {
        setError(result.error || "Não foi possível enviar a solicitação. Tente novamente.");
      }
      return;
    }

    setSubmitting(false);
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
      <p className="text-sm text-muted-foreground mb-4">
        Preencha seus dados para solicitar acesso ao aplicativo.
      </p>
      <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
        ⚠️ <strong>Importante:</strong> utilize o <strong>mesmo e-mail usado na compra</strong> para evitar perda de acesso ao aplicativo.
      </div>
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
