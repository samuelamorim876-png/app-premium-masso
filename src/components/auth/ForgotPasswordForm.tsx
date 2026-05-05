import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ForgotPasswordFormProps {
  onReset: (email: string) => Promise<string | null>;
  onSwitchToLogin: () => void;
}

export function ForgotPasswordForm({ onReset, onSwitchToLogin }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const err = await onReset(email);
    if (err) { setError(err); setSubmitting(false); return; }
    setSent(true);
    setSubmitting(false);
  };

  if (sent) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
          <span className="text-2xl">✉️</span>
        </div>
        <h3 className="font-heading text-lg font-semibold">E-mail enviado!</h3>
        <p className="text-sm text-muted-foreground">Verifique sua caixa de entrada para redefinir a senha.</p>
        <Button variant="outline" onClick={onSwitchToLogin} className="w-full">Voltar ao login</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <p className="text-sm text-muted-foreground">Informe seu e-mail para receber o link de recuperação.</p>
      <div className="space-y-2">
        <Label htmlFor="forgot-email">E-mail</Label>
        <Input id="forgot-email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" size="lg" disabled={submitting}>
        {submitting ? "Enviando..." : "Enviar link"}
      </Button>
      <div className="text-center">
        <button type="button" onClick={onSwitchToLogin} className="text-sm text-primary hover:underline">Voltar ao login</button>
      </div>
    </form>
  );
}
