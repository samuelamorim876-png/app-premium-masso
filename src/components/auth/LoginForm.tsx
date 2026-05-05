import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<string | null>;
  onSwitchToRegister: () => void;
  onSwitchToForgot: () => void;
}

export function LoginForm({ onLogin, onSwitchToRegister, onSwitchToForgot }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const err = await onLogin(email, password);
    if (err) setError(err);
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" size="lg" disabled={submitting}>
        {submitting ? "Entrando..." : "Entrar"}
      </Button>
      <div className="flex flex-col items-center gap-2 text-sm">
        <button type="button" onClick={onSwitchToForgot} className="text-primary hover:underline">
          Esqueci minha senha
        </button>
        <button type="button" onClick={onSwitchToRegister} className="text-muted-foreground hover:text-foreground">
          Não tem conta? <span className="text-primary font-medium">Cadastre-se</span>
        </button>
      </div>
    </form>
  );
}
