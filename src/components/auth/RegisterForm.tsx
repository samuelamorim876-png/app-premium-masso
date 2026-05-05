import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RegisterFormProps {
  onRegister: (name: string, email: string, password: string) => Promise<string | null>;
  onSwitchToLogin: () => void;
}

export function RegisterForm({ onRegister, onSwitchToLogin }: RegisterFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { setError("A senha deve ter pelo menos 6 caracteres."); return; }
    if (password !== confirm) { setError("As senhas não coincidem."); return; }
    setSubmitting(true);
    const err = await onRegister(name, email, password);
    if (err) { setError(err); setSubmitting(false); return; }
    setSuccess(true);
    setSubmitting(false);
  };

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
          <span className="text-2xl">✉️</span>
        </div>
        <h3 className="font-heading text-lg font-semibold">Verifique seu e-mail</h3>
        <p className="text-sm text-muted-foreground">Enviamos um link de confirmação para <strong>{email}</strong>. Clique nele para ativar sua conta.</p>
        <Button variant="outline" onClick={onSwitchToLogin} className="w-full">Voltar ao login</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name">Nome completo</Label>
        <Input id="name" placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg-email">E-mail</Label>
        <Input id="reg-email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg-password">Senha</Label>
        <Input id="reg-password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm">Confirmar senha</Label>
        <Input id="confirm" type="password" placeholder="••••••••" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" size="lg" disabled={submitting}>
        {submitting ? "Criando conta..." : "Criar conta"}
      </Button>
      <div className="text-center text-sm">
        <button type="button" onClick={onSwitchToLogin} className="text-muted-foreground hover:text-foreground">
          Já tem conta? <span className="text-primary font-medium">Entrar</span>
        </button>
      </div>
    </form>
  );
}
